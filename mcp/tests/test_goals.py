"""Goal store tests: creation, transitions, revisions, caps, questions."""

import os

from helper import ForTaktTestCase, git, mcp_call, sha

from takt_core import goals as ft_goals
from takt_core.util import ToolError


class GoalCreateTests(ForTaktTestCase):
    def test_create_defaults(self):
        goal = self.create_goal()
        self.assertEqual(goal["schema"], "for-takt.goal/v1")
        self.assertEqual(goal["status"], "draft")
        self.assertEqual(goal["revision"], 1)
        self.assertEqual(goal["startBranch"], "main")
        self.assertEqual(goal["targetBranch"], "main")
        self.assertIsNone(goal["branch"])
        path = os.path.join(self.data_dir, "goals", f"{goal['id']}.json")
        self.assertTrue(os.path.isfile(path))

    def test_create_requires_acceptance(self):
        with self.assertRaises(ToolError):
            self.create_goal(acceptanceCriteria=[])

    def test_create_rejects_dash_branch(self):
        with self.assertRaises(ToolError) as ctx:
            self.create_goal(startBranch="-x")
        self.assertIn("-", str(ctx.exception))

    def test_project_must_be_top_level(self):
        sub = os.path.join(self.repo, "subdir")
        os.makedirs(sub)
        with self.assertRaises(ToolError):
            self.create_goal(project=sub)

    def test_get_and_list(self):
        goal = self.create_goal()
        got = mcp_call("goal_get", {"goalId": goal["id"]})
        self.assertEqual(got["id"], goal["id"])
        listed = mcp_call("goal_list", {"project": str(self.repo)})
        self.assertEqual(len(listed["goals"]), 1)
        s = listed["goals"][0]
        self.assertEqual(s["id"], goal["id"])
        self.assertEqual(s["status"], "draft")
        self.assertEqual(s["taskCount"], 0)
        self.assertEqual(s["pendingQuestions"], 0)
        filtered = mcp_call(
            "goal_list", {"project": str(self.repo), "status": "active"}
        )
        self.assertEqual(filtered["goals"], [])


class ProjectListTests(ForTaktTestCase):
    def test_project_list_reflects_registration(self):
        out = mcp_call("project_list", {})
        self.assertEqual(out["projects"], [])
        goal = self.create_goal()  # auto-registers the project
        out = mcp_call("project_list", {})
        self.assertEqual(len(out["projects"]), 1)
        self.assertEqual(out["projects"][0]["path"], str(self.repo))
        self.assertIn("hasTakt", out["projects"][0])


class RunnerTests(ForTaktTestCase):
    def test_run_start_status_stop(self):
        import stat as _stat

        fake = os.path.join(self.tmp.name, "fake-takt")
        with open(fake, "w") as f:
            f.write("#!/bin/sh\nsleep 30\n")
        os.chmod(fake, os.stat(fake).st_mode | _stat.S_IXUSR)
        os.environ["TAKT_BIN"] = fake
        try:
            out = mcp_call("takt_run", {"project": str(self.repo)})
            self.assertTrue(out["running"])
            pid = out["runner"]["pid"]
            # second start refused
            with self.assertRaises(ToolError):
                mcp_call("takt_run", {"project": str(self.repo)})
            st = mcp_call("takt_runner_status", {"project": str(self.repo)})
            self.assertTrue(st["running"])
            stop = mcp_call("takt_runner_stop", {"project": str(self.repo)})
            self.assertTrue(stop["stopped"])
            st = mcp_call("takt_runner_status", {"project": str(self.repo)})
            self.assertFalse(st["running"])
        finally:
            os.environ.pop("TAKT_BIN", None)


class RunnerGuardTests(ForTaktTestCase):
    def _fake_takt(self):
        import stat as _stat

        fake = os.path.join(self.tmp.name, "fake-takt")
        with open(fake, "w") as f:
            f.write("#!/bin/sh\nsleep 30\n")
        os.chmod(fake, os.stat(fake).st_mode | _stat.S_IXUSR)
        os.environ["TAKT_BIN"] = fake
        self.addCleanup(os.environ.pop, "TAKT_BIN", None)

    def _pending(self, name):
        import yaml

        d = os.path.join(self.repo, ".takt")
        os.makedirs(d, exist_ok=True)
        p = os.path.join(d, "tasks.yaml")
        doc = {"tasks": []}
        if os.path.exists(p):
            doc = yaml.safe_load(open(p).read()) or {"tasks": []}
        doc["tasks"].append({"name": name, "status": "pending"})
        with open(p, "w") as f:
            yaml.safe_dump(doc, f)

    def test_foreign_pending_refused_then_allowed(self):
        self._fake_takt()
        self._pending("foreign-task")
        with self.assertRaises(ToolError):
            mcp_call("takt_run", {"project": str(self.repo)})
        # allow naming it still runs (it is the intended set)
        out = mcp_call(
            "takt_run",
            {"project": str(self.repo), "allow": ["foreign-task"]},
        )
        self.assertTrue(out["running"])
        mcp_call("takt_runner_stop", {"project": str(self.repo)})

    def test_allow_all_runs(self):
        self._fake_takt()
        self._pending("other")
        out = mcp_call(
            "takt_run", {"project": str(self.repo), "allowAll": True}
        )
        self.assertTrue(out["running"])
        mcp_call("takt_runner_stop", {"project": str(self.repo)})


class TransitionTests(ForTaktTestCase):
    def set_status(self, goal_id, status, reason="r", **kw):
        return mcp_call(
            "goal_set_status",
            {"goalId": goal_id, "status": status, "reason": reason, **kw},
        )

    def test_draft_to_active_creates_branch(self):
        goal = self.create_goal()
        res = self.set_status(goal["id"], "active")
        self.assertEqual(res["status"], "active")
        self.assertEqual(res["branch"], f"takt-goal/{goal['id'][:8]}")
        # branch exists in the repo at startBranch sha
        self.assertEqual(sha(self.repo, res["branch"]), self.base_sha)
        got = mcp_call("goal_get", {"goalId": goal["id"]})
        self.assertEqual(got["status"], "active")
        self.assertEqual(got["branch"], res["branch"])

    def test_illegal_transitions(self):
        goal = self.create_goal()
        for bad in ("awaiting_merge", "paused"):
            with self.assertRaises(ToolError):
                self.set_status(goal["id"], bad)
        # completed via set_status is rejected even on awaiting_merge
        self.set_status(goal["id"], "active")
        self.set_status(goal["id"], "awaiting_merge")
        with self.assertRaises(ToolError) as ctx:
            self.set_status(goal["id"], "completed")
        self.assertIn("goal_complete", str(ctx.exception))

    def test_pause_resume_and_awaiting_cycle(self):
        goal = self.active_goal()
        gid = goal["id"]
        self.set_status(gid, "paused")
        self.set_status(gid, "active")
        self.set_status(gid, "awaiting_merge")
        self.set_status(gid, "active")
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["status"], "active")

    def test_abort_from_any_non_terminal_and_terminal_is_final(self):
        goal = self.active_goal()
        gid = goal["id"]
        self.set_status(gid, "aborted")
        with self.assertRaises(ToolError):
            self.set_status(gid, "active")
        with self.assertRaises(ToolError):
            mcp_call("goal_update", {"goalId": gid, "objective": "x"})

    def test_status_worklog_recorded(self):
        goal = self.create_goal()
        self.set_status(goal["id"], "active", reason="ship it")
        got = mcp_call("goal_get", {"goalId": goal["id"]})
        entries = [w for w in got["workLog"] if w["kind"] == "status"]
        self.assertTrue(any("ship it" in w["summary"] for w in entries))


class RevisionTests(ForTaktTestCase):
    def test_expected_revision(self):
        goal = self.create_goal()
        with self.assertRaises(ToolError) as ctx:
            mcp_call(
                "goal_update",
                {
                    "goalId": goal["id"],
                    "objective": "new",
                    "expectedRevision": 99,
                },
            )
        self.assertIn("revision mismatch", str(ctx.exception))
        res = mcp_call(
            "goal_update",
            {
                "goalId": goal["id"],
                "objective": "new",
                "expectedRevision": 1,
            },
        )
        self.assertEqual(res["revision"], 2)
        self.assertEqual(res["objective"], "new")

    def test_update_terminal_rejected(self):
        goal = self.active_goal()
        mcp_call(
            "goal_set_status",
            {"goalId": goal["id"], "status": "aborted", "reason": "stop"},
        )
        with self.assertRaises(ToolError):
            mcp_call("goal_update", {"goalId": goal["id"], "objective": "x"})


class QuestionTests(ForTaktTestCase):
    def test_ask_answer_withdraw_flow(self):
        goal = self.active_goal()
        gid = goal["id"]
        res = mcp_call(
            "goal_ask",
            {"goalId": gid, "body": "which?", "options": ["a", "b"]},
        )
        qid = res["questionId"]
        mcp_call(
            "goal_answer", {"goalId": gid, "questionId": qid, "answer": "a"}
        )
        res2 = mcp_call("goal_ask", {"goalId": gid, "body": "later?"})
        qid2 = res2["questionId"]
        mcp_call(
            "goal_withdraw_question",
            {"goalId": gid, "questionId": qid2, "reason": "obsolete"},
        )
        got = mcp_call("goal_get", {"goalId": gid})
        qs = {q["id"]: q for q in got["questions"]}
        self.assertEqual(qs[qid]["status"], "answered")
        self.assertEqual(qs[qid]["answer"], "a")
        self.assertIsNotNone(qs[qid]["answeredAt"])
        self.assertEqual(qs[qid2]["status"], "withdrawn")
        # answered/withdrawn questions cannot be answered again
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_answer",
                {"goalId": gid, "questionId": qid, "answer": "b"},
            )
        # unknown question id
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_answer",
                {"goalId": gid, "questionId": "nope", "answer": "b"},
            )

    def test_pending_questions_never_trimmed(self):
        goal = self.active_goal()
        gid = goal["id"]

        def stuff(g):
            for i in range(ft_goals.QUESTION_LIMIT + 5):
                g["questions"].append(
                    {
                        "id": f"p{i}",
                        "at": "2026-01-01T00:00:00Z",
                        "body": "q",
                        "options": [],
                        "status": "pending",
                        "answer": None,
                        "answeredAt": None,
                    }
                )

        ft_goals.update_goal(gid, None, stuff)
        mcp_call("goal_ask", {"goalId": gid, "body": "one more"})
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(len(got["questions"]), ft_goals.QUESTION_LIMIT + 6)
        self.assertTrue(
            all(q["status"] == "pending" for q in got["questions"])
        )

    def test_answered_trimmed_before_pending(self):
        goal = self.active_goal()
        gid = goal["id"]

        def stuff(g):
            for i in range(ft_goals.QUESTION_LIMIT):
                status = "answered" if i < ft_goals.QUESTION_LIMIT - 2 else "pending"
                g["questions"].append(
                    {
                        "id": f"q{i}",
                        "at": "2026-01-01T00:00:00Z",
                        "body": "q",
                        "options": [],
                        "status": status,
                        "answer": "x" if status == "answered" else None,
                        "answeredAt": None,
                    }
                )

        ft_goals.update_goal(gid, None, stuff)
        mcp_call("goal_ask", {"goalId": gid, "body": "new"})
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(len(got["questions"]), ft_goals.QUESTION_LIMIT)
        pending = [q for q in got["questions"] if q["status"] == "pending"]
        self.assertEqual(len(pending), 3)


class WorkLogCapTests(ForTaktTestCase):
    def test_worklog_capped(self):
        goal = self.active_goal()
        gid = goal["id"]

        def stuff(g):
            for i in range(ft_goals.WORKLOG_LIMIT + 10):
                ft_goals.append_worklog(g, "note", f"entry {i}")

        ft_goals.update_goal(gid, None, stuff)
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(len(got["workLog"]), ft_goals.WORKLOG_LIMIT)
        # oldest entries were dropped; newest remain
        self.assertEqual(
            got["workLog"][-1]["summary"], f"entry {ft_goals.WORKLOG_LIMIT + 9}"
        )

    def test_goal_log_tool(self):
        goal = self.active_goal()
        mcp_call(
            "goal_log",
            {"goalId": goal["id"], "summary": "patrolled", "kind": "patrol"},
        )
        got = mcp_call("goal_get", {"goalId": goal["id"]})
        self.assertEqual(got["workLog"][-1]["kind"], "patrol")
        self.assertEqual(got["workLog"][-1]["summary"], "patrolled")


class TaskUpdateTests(ForTaktTestCase):
    def test_task_update_states(self):
        goal = self.active_goal()
        gid = goal["id"]

        def add_task(g):
            g["tasks"].append(
                {
                    "taskName": "t1",
                    "workflow": "w",
                    "enqueuedAt": "2026-01-01T00:00:00Z",
                    "state": "queued",
                    "branch": "feat-1",
                    "integratedSha": None,
                    "note": None,
                }
            )

        ft_goals.update_goal(gid, None, add_task)
        mcp_call(
            "goal_task_update",
            {"goalId": gid, "taskName": "t1", "state": "dropped", "note": "bad"},
        )
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["tasks"][0]["state"], "dropped")
        self.assertEqual(got["tasks"][0]["note"], "bad")
        # integrated cannot be set manually
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_task_update",
                {"goalId": gid, "taskName": "t1", "state": "integrated"},
            )
        # unknown task
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_task_update",
                {"goalId": gid, "taskName": "missing", "state": "dropped"},
            )


if __name__ == "__main__":
    import unittest

    unittest.main()
