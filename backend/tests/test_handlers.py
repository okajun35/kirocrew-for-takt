"""Backend handler tests via aiohttp.test_utils.make_mocked_request."""

import json
import os
import unittest
from pathlib import Path

from helper import (
    BackendTestCase,
    FakeCtx,
    call,
    denied_403,
    get_req,
    load_app_module,
    no_gate_ctx,
    post_req,
)

from takt_core import goals, projects
from takt_core.util import ToolError

handlers = load_app_module("backend.handlers")
routes_mod = load_app_module("backend.routes")


class RouteRegistrationTests(BackendTestCase):
    def test_register_routes_shape(self):
        routes = routes_mod.register_routes(self.ctx)
        self.assertEqual(len(routes), 19)
        for r in routes:
            self.assertIn(
                r.method, {"GET", "POST", "PUT", "DELETE", "PATCH"}
            )
            self.assertTrue(r.path.startswith("/"))
            self.assertTrue(callable(r.handler))
        self.assertIn(
            ("GET", "/takt/run/log"),
            {(r.method, r.path) for r in routes},
        )

    def test_low_sdk_level_marks_degraded(self):
        class Health:
            def __init__(self):
                self.messages = []

            def mark_degraded(self, msg):
                self.messages.append(msg)

        ctx = FakeCtx()
        ctx.health = Health()
        ctx.sdk_level = 0
        routes_mod.register_routes(ctx)
        self.assertTrue(ctx.health.messages)


class ProjectTests(BackendTestCase):
    async def test_add_list_remove_project(self):
        ctx = self.ctx
        resp, body = await call(
            handlers.add_project, post_req("/x", {"path": self.repo}), ctx
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(
            [p["path"] for p in body["projects"]],
            [os.path.realpath(self.repo)],
        )
        self.assertEqual(ctx.owner_calls, ["project_add"])

        resp, body = await call(handlers.list_projects, get_req("/x"), ctx)
        self.assertEqual(resp.status, 200)
        self.assertEqual(len(body["projects"]), 1)
        self.assertFalse(body["projects"][0]["hasTakt"])

        resp, body = await call(
            handlers.remove_project,
            post_req("/x", {"path": self.repo}),
            ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["projects"], [])

    async def test_add_project_rejects_relative(self):
        resp, body = await call(
            handlers.add_project,
            post_req("/x", {"path": "relative/dir"}),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)
        self.assertEqual(body["code"], "bad_request")

    async def test_unregistered_project_is_400(self):
        resp, body = await call(
            handlers.takt_tasks,
            get_req(f"/x?project={self.repo}"),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)
        self.assertEqual(body["code"], "bad_request")

    async def test_registered_project_tasks(self):
        projects.add_project(self.repo)
        resp, body = await call(
            handlers.takt_tasks,
            get_req(f"/x?project={self.repo}"),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["tasks"], [])
        self.assertFalse(body["hasTakt"])


class OwnerGateTests(BackendTestCase):
    async def test_denied_response_passes_through(self):
        resp_obj = denied_403()
        ctx = FakeCtx(owner_response=resp_obj)
        resp, _ = await call(
            handlers.add_project,
            post_req("/x", {"path": self.repo}),
            ctx,
        )
        self.assertIs(resp, resp_obj)
        self.assertEqual(resp.status, 403)

    async def test_missing_require_owner_fails_closed(self):
        resp, body = await call(
            handlers.add_project,
            post_req("/x", {"path": self.repo}),
            no_gate_ctx(),
        )
        self.assertEqual(resp.status, 403)
        self.assertEqual(body["code"], "owner_only")

    async def test_get_needs_no_owner(self):
        resp, body = await call(
            handlers.list_projects, get_req("/x"), no_gate_ctx()
        )
        self.assertEqual(resp.status, 200)


class GoalHandlerTests(BackendTestCase):
    def _make_goal(self, status="draft"):
        g = goals.create_goal(
            self.repo, "obj", ["ac"], [], [], "main", "main"
        )
        if status == "draft":
            return g

        def mut(goal):
            goal["status"] = status

        return goals.update_goal(g["id"], None, mut)

    async def test_get_goal_404(self):
        resp, body = await call(
            handlers.get_goal,
            get_req("/x?id=12345678-1234-1234-1234-123456789abc"),
            self.ctx,
        )
        self.assertEqual(resp.status, 404)
        self.assertEqual(body["code"], "not_found")

    async def test_goal_status_aborted_rejected_400(self):
        g = self._make_goal(status="active")
        resp, body = await call(
            handlers.set_goal_status,
            post_req(
                "/x",
                {"id": g["id"], "status": "aborted", "reason": "nope"},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)

    async def test_goal_status_revision_conflict_409(self):
        g = self._make_goal(status="active")
        resp, body = await call(
            handlers.set_goal_status,
            post_req(
                "/x",
                {
                    "id": g["id"],
                    "status": "paused",
                    "reason": "hold on",
                    "expectedRevision": g["revision"] + 5,
                },
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 409)
        self.assertEqual(body["code"], "conflict")
        self.assertEqual(goals.load_goal(g["id"])["status"], "active")

    async def test_goal_pause_and_resume(self):
        g = self._make_goal(status="active")
        resp, body = await call(
            handlers.set_goal_status,
            post_req(
                "/x",
                {
                    "id": g["id"],
                    "status": "paused",
                    "reason": "休止",
                    "expectedRevision": g["revision"],
                },
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["status"], "paused")

        resp, body = await call(
            handlers.set_goal_status,
            post_req(
                "/x",
                {
                    "id": g["id"],
                    "status": "active",
                    "reason": "再開",
                    "expectedRevision": body["revision"],
                },
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["status"], "active")

    async def test_goal_transition_violation_409(self):
        g = self._make_goal(status="draft")
        resp, body = await call(
            handlers.set_goal_status,
            post_req(
                "/x",
                {"id": g["id"], "status": "paused", "reason": "x"},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 409)

    async def test_goal_answer(self):
        g = self._make_goal(status="active")

        def mut(goal):
            goal["questions"] = [
                {
                    "id": "q1",
                    "at": "now",
                    "body": "which?",
                    "options": ["a", "b"],
                    "status": "pending",
                    "answer": None,
                    "answeredAt": None,
                }
            ]

        g = goals.update_goal(g["id"], None, mut)
        resp, body = await call(
            handlers.answer_question,
            post_req(
                "/x",
                {
                    "id": g["id"],
                    "questionId": "q1",
                    "answer": "a",
                    "expectedRevision": g["revision"],
                },
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        q = body["questions"][0]
        self.assertEqual(q["status"], "answered")
        self.assertEqual(q["answer"], "a")

    async def test_goal_answer_non_pending_conflict(self):
        g = self._make_goal(status="active")
        resp, body = await call(
            handlers.answer_question,
            post_req(
                "/x",
                {"id": g["id"], "questionId": "nope", "answer": "a"},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 404)

    async def test_list_goals_filter(self):
        self._make_goal(status="active")
        self._make_goal(status="draft")
        resp, body = await call(
            handlers.list_goals,
            get_req(f"/x?project={self.repo}"),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)  # unregistered project

        projects.add_project(self.repo)
        resp, body = await call(
            handlers.list_goals,
            get_req(f"/x?project={self.repo}&status=active"),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(len(body["goals"]), 1)
        self.assertEqual(body["goals"][0]["status"], "active")


class SettingsTests(BackendTestCase):
    async def test_settings_get_and_pin(self):
        resp, body = await call(
            handlers.get_settings, get_req("/x"), self.ctx
        )
        self.assertEqual(resp.status, 200)
        self.assertIn("taktMcp", body)

        # pin to a real executable
        import stat as _stat

        fake = Path(self.tmp.name) / "fake-takt-mcp"
        fake.write_text("#!/bin/sh\n")
        fake.chmod(fake.stat().st_mode | _stat.S_IXUSR)

        resp, body = await call(
            handlers.set_takt_mcp,
            post_req("/x", {"path": str(fake)}),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["taktMcp"]["path"], str(fake))
        self.assertEqual(body["taktMcp"]["source"], "settings")

        # clear
        resp, body = await call(
            handlers.set_takt_mcp,
            post_req("/x", {"path": None}),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertIsNone(body["taktMcp"]["pinned"])

    async def test_settings_pin_rejects_nonexistent(self):
        resp, body = await call(
            handlers.set_takt_mcp,
            post_req("/x", {"path": "/no/such/takt-mcp"}),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)

    async def test_settings_pin_rejects_missing_key(self):
        resp, body = await call(
            handlers.set_takt_mcp, post_req("/x", {}), self.ctx
        )
        self.assertEqual(resp.status, 400)


class BrowseTests(BackendTestCase):
    async def test_browse_lists_dirs_with_hints(self):
        repo = Path(self.tmp.name) / "repo1"
        repo.mkdir()
        (repo / ".git").mkdir()
        (repo / ".takt").mkdir()
        (Path(self.tmp.name) / ".hidden").mkdir()
        (Path(self.tmp.name) / "afile.txt").write_text("x")

        resp, body = await call(
            handlers.browse_directories,
            post_req("/x", {"path": self.tmp.name}),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        names = [e["name"] for e in body["directories"]]
        self.assertEqual(names, ["repo", "repo1"])
        hints = {e["name"]: e for e in body["directories"]}
        self.assertTrue(hints["repo1"]["hasGit"])
        self.assertTrue(hints["repo1"]["hasTakt"])

    async def test_browse_rejects_file_and_relative(self):
        f = Path(self.tmp.name) / "f"
        f.write_text("x")
        resp, _ = await call(
            handlers.browse_directories,
            post_req("/x", {"path": str(f)}),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)


class CloneTests(BackendTestCase):
    async def test_clone_local_path_registers(self):
        src = Path(self.tmp.name) / "src"
        src.mkdir()
        import subprocess as _sp

        _sp.run(
            ["git", "init", "-q", str(src)], check=True,
        )
        _sp.run(
            [
                "git",
                "-C",
                str(src),
                "-c",
                "user.email=t@t",
                "-c",
                "user.name=t",
                "commit",
                "-qm",
                "init",
                "--allow-empty",
            ],
            check=True,
        )
        dest_parent = Path(self.tmp.name) / "out"
        dest_parent.mkdir()
        resp, body = await call(
            handlers.clone_project,
            post_req(
                "/x",
                {"url": str(src), "parent": str(dest_parent)},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["path"], str(dest_parent / "src"))
        self.assertIn(
            str(dest_parent / "src"),
            [p["path"] for p in body["projects"]],
        )

    async def test_clone_rejects_bad_url_and_existing_dest(self):
        resp, _ = await call(
            handlers.clone_project,
            post_req(
                "/x",
                {"url": "ftp://x/repo", "parent": self.tmp.name},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)
        resp, _ = await call(
            handlers.clone_project,
            post_req(
                "/x",
                {
                    "url": "https://example.com/r.git",
                    "parent": self.tmp.name,
                    "name": "repo",  # already exists from setUp
                },
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)


class TaktConfigTests(BackendTestCase):
    def setUp(self):
        super().setUp()
        import os as _os

        self._home = _os.environ.get("HOME")
        _os.environ["HOME"] = self.tmp.name
        takt_dir = Path(self.tmp.name) / ".takt"
        takt_dir.mkdir()
        (takt_dir / "config.yaml").write_text(
            "provider: copilot\nmodel: gpt-5.4\n"
        )

    def tearDown(self):
        import os as _os

        if self._home is None:
            _os.environ.pop("HOME", None)
        else:
            _os.environ["HOME"] = self._home
        super().tearDown()

    async def test_config_view(self):
        resp, body = await call(
            handlers.get_takt_config, get_req("/x"), self.ctx
        )
        self.assertEqual(resp.status, 200)
        self.assertTrue(body["global"]["exists"])
        self.assertEqual(body["global"]["config"]["provider"], "copilot")
        self.assertIn("provider", body["writableKeys"])

    async def test_config_write_whitelist_and_revision(self):
        _, body = await call(
            handlers.get_takt_config, get_req("/x"), self.ctx
        )
        rev = body["revision"]
        resp, out = await call(
            handlers.set_takt_config,
            post_req("/x", {"changes": {"model": "gpt-5.5"}, "revision": rev}),
            self.ctx,
        )
        self.assertEqual(resp.status, 200)
        self.assertEqual(out["global"]["model"], "gpt-5.5")
        # stale revision -> conflict
        resp, _ = await call(
            handlers.set_takt_config,
            post_req("/x", {"changes": {"model": "x"}, "revision": rev}),
            self.ctx,
        )
        self.assertEqual(resp.status, 409)
        # non-whitelisted key -> 400
        resp, _ = await call(
            handlers.set_takt_config,
            post_req(
                "/x",
                {"changes": {"persona_providers": {}}, "revision": "0:0"},
            ),
            self.ctx,
        )
        self.assertEqual(resp.status, 400)


class HardeningTests(BackendTestCase):
    async def test_get_without_user_is_401(self):
        resp, body = await call(
            handlers.list_projects, get_req("/x", user=None), self.ctx
        )
        self.assertEqual(resp.status, 401)
        self.assertEqual(body["code"], "unauthorized")

    async def test_post_app_token_is_403(self):
        resp, body = await call(
            handlers.add_project,
            post_req("/x", {"path": self.repo}, app="for-takt"),
            self.ctx,
        )
        self.assertEqual(resp.status, 403)
        self.assertEqual(body["code"], "app_token_forbidden")
        self.assertEqual(self.ctx.owner_calls, [])

    async def test_post_oversized_body_is_400(self):
        from unittest import mock
        from aiohttp.test_utils import make_mocked_request

        req = make_mocked_request(
            "POST", "/x", headers={"Content-Length": str(1 << 21)}
        )
        req["user"] = "test-user"
        req["app"] = ""
        with mock.patch.object(handlers, "MAX_BODY_BYTES", 16):
            resp, body = await call(handlers.add_project, req, self.ctx)
        self.assertEqual(resp.status, 400)

    async def test_add_project_sensitive_path_is_403(self):
        from unittest import mock

        hostsec = load_app_module("takt_core.hostsec")
        with mock.patch.object(hostsec, "is_sensitive", return_value=True):
            resp, body = await call(
                handlers.add_project,
                post_req("/x", {"path": self.repo}),
                self.ctx,
            )
        self.assertEqual(resp.status, 403)
        self.assertEqual(body["code"], "sensitive_path")
        self.assertNotIn(
            self.repo,
            [p["path"] for p in projects.list_projects()],
        )

    async def test_health(self):
        resp, body = await call(handlers.health, get_req("/x"), self.ctx)
        self.assertEqual(resp.status, 200)
        self.assertEqual(body["name"], "for-takt")
        self.assertTrue(body["ok"])
        self.assertIn("taktMcp", body)

    def test_route_auth_attributes(self):
        ctx = FakeCtx()
        table = routes_mod.register_routes(ctx)
        self.assertTrue(table)
        for route in table:
            h = route.handler
            self.assertTrue(
                getattr(h, "__kirocrew_authenticated__", False),
                f"{route.method} {route.path} lacks authenticated attr",
            )
            owner = getattr(h, "__kirocrew_owner_only__", None)
            if route.method == "GET":
                self.assertFalse(owner, f"{route.path} marked owner-only")
            else:
                self.assertTrue(
                    owner, f"{route.method} {route.path} not owner-only"
                )


if __name__ == "__main__":
    unittest.main()
