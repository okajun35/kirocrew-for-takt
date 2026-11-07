"""takt_core.takt_files tests: read-only .takt inspection.

Every test ends by asserting that nothing under .takt/ changed
(content or mtime) — these readers must never write.
"""

import json
import os
import unittest
from pathlib import Path

from helper import BackendTestCase

from takt_core import goals, takt_files
from takt_core.util import ToolError

SLUG = "20240101-120000-abc"


def _task(name, **kw):
    t = {
        "name": name,
        "status": "pending",
        "created_at": "2024-01-01T00:00:00Z",
        "started_at": None,
        "completed_at": None,
    }
    t.update(kw)
    return t


def _log_line(rec):
    return json.dumps(rec, ensure_ascii=False) + "\n"


class TaktFilesCase(BackendTestCase):
    def setUp(self):
        super().setUp()
        self.takt = Path(self.repo) / ".takt"
        self.takt.mkdir()
        self._before = self._snapshot()

    def _snapshot(self):
        snap = {}
        if self.takt.is_dir():
            for p in sorted(self.takt.rglob("*")):
                if p.is_file() or p.is_symlink():
                    st = os.lstat(p)
                    content = (
                        os.readlink(p)
                        if p.is_symlink()
                        else p.read_bytes()
                    )
                    snap[p.relative_to(self.takt).as_posix()] = (
                        st.st_mtime_ns,
                        content,
                    )
        return snap

    def _assert_unchanged(self):
        self.assertEqual(
            self._before, self._snapshot(), ".takt must not be modified"
        )

    def write_tasks_yaml(self, tasks):
        import yaml as _yaml

        self.takt.mkdir(exist_ok=True)
        (self.takt / "tasks.yaml").write_text(
            _yaml.safe_dump({"tasks": tasks}), encoding="utf-8"
        )
        self._before = self._snapshot()

    def make_run(self, slug=SLUG, meta=None, root=None, lines=None, reports=None):
        run_root = Path(root) if root else self.takt / "runs"
        run = run_root / slug
        (run / "logs").mkdir(parents=True)
        (run / "reports").mkdir(parents=True)
        if meta is not None:
            (run / "meta.json").write_text(
                json.dumps(meta), encoding="utf-8"
            )
        if lines is not None:
            (run / "logs" / f"{slug}.jsonl").write_text(
                "".join(lines), encoding="utf-8"
            )
        for name, text in (reports or {}).items():
            (run / "reports" / name).write_text(text, encoding="utf-8")
        self._before = self._snapshot()
        return run

    def assert_not_found(self, fn, *args):
        with self.assertRaises(ToolError) as cm:
            fn(*args)
        self.assertEqual(cm.exception.code, "not_found")


class TaskListTests(TaktFilesCase):
    def test_no_takt_dir(self):
        import shutil

        shutil.rmtree(self.takt)
        out = takt_files.list_tasks(self.repo)
        self.assertEqual(out["tasks"], [])
        self.assertFalse(out["hasTakt"])

    def test_summary_counts_and_goal_ids(self):
        self.write_tasks_yaml(
            [
                _task(
                    "t1",
                    status="completed",
                    workflow="default",
                    branch="b1",
                    base_branch="main",
                    worktree_path=None,
                    run_slug=SLUG,
                    started_at="2024-01-01T00:01:00Z",
                    completed_at="2024-01-01T00:02:00Z",
                ),
                _task(
                    "t2",
                    status="failed",
                    failure={
                        "step": "work",
                        "error": "boom",
                        "last_message": "very long detail",
                    },
                ),
            ]
        )
        g = goals.create_goal(
            self.repo, "obj", ["ac"], [], [], "main", "main"
        )

        def mut(goal):
            goal["tasks"] = [{"taskName": "t1", "state": "queued"}]

        goals.update_goal(g["id"], None, mut)

        out = takt_files.list_tasks(self.repo)
        self.assertTrue(out["hasTakt"])
        self.assertEqual(out["counts"], {"completed": 1, "failed": 1})
        self.assertEqual(len(out["tasks"]), 2)
        t1 = out["tasks"][0]
        self.assertEqual(t1["name"], "t1")
        self.assertEqual(t1["runSlug"], SLUG)
        self.assertEqual(t1["baseBranch"], "main")
        self.assertEqual(t1["goalIds"], [g["id"]])
        t2 = out["tasks"][1]
        self.assertEqual(t2["failure"], {"step": "work", "error": "boom"})
        self.assertEqual(t2["goalIds"], [])
        self._assert_unchanged()

    def test_broken_yaml_retryable(self):
        (self.takt / "tasks.yaml").write_text("tasks: [", encoding="utf-8")
        self._before = self._snapshot()
        out = takt_files.list_tasks(self.repo)
        self.assertTrue(out.get("retryable"))
        self.assertIn("error", out)
        self._assert_unchanged()

    def test_oversized_yaml_400(self):
        with open(self.takt / "tasks.yaml", "w", encoding="utf-8") as f:
            f.write("tasks: []\n")
            f.write("# " + "x" * (takt_files.TASKS_YAML_MAX + 10))
        self._before = self._snapshot()
        with self.assertRaises(ToolError) as cm:
            takt_files.list_tasks(self.repo)
        self.assertEqual(cm.exception.code, "bad_request")
        self._assert_unchanged()


class RunDetailTests(TaktFilesCase):
    def _meta(self, **kw):
        m = {
            "task": "t1",
            "workflow": "default",
            "status": "running",
            "startTime": "2024-01-01T00:00:00Z",
            "currentStep": "plan",
            "currentIteration": 2,
            "phase": "judge",
            "updatedAt": "2024-01-01T00:05:00Z",
        }
        m.update(kw)
        return m

    def test_detail_reads_meta_steps_logs_reports(self):
        lines = [
            _log_line({"type": "workflow_start", "task": "t1"}),
            _log_line(
                {
                    "type": "step_start",
                    "step": "plan",
                    "iteration": 1,
                    "timestamp": "2024-01-01T00:00:01Z",
                }
            ),
            _log_line(
                {
                    "type": "step_complete",
                    "step": "plan",
                    "status": "ok",
                    "iteration": 1,
                    "matchedRuleIndex": 3,
                    "timestamp": "2024-01-01T00:00:02Z",
                }
            ),
            _log_line(
                {
                    "type": "workflow_abort",
                    "iterations": 1,
                    "reason": "stopped",
                    "endTime": "2024-01-01T00:00:03Z",
                }
            ),
        ]
        self.make_run(
            meta=self._meta(),
            lines=lines,
            reports={"report.md": "# hi\n"},
        )
        run = self.takt / "runs" / SLUG
        (run / "logs" / "side-usage-events.jsonl").write_text("{}\n")
        self._before = self._snapshot()

        out = takt_files.run_detail(self.repo, SLUG)
        self.assertEqual(out["meta"]["currentStep"], "plan")
        self.assertEqual(out["meta"]["currentIteration"], 2)
        self.assertEqual(out["meta"]["phase"], "judge")
        self.assertEqual(
            [(s["type"], s["step"]) for s in out["steps"]],
            [
                ("step_start", "plan"),
                ("step_complete", "plan"),
                ("workflow_abort", None),
            ],
        )
        self.assertEqual(out["steps"][1]["matchedRule"], 3)
        self.assertEqual(out["steps"][2]["reason"], "stopped")
        self.assertEqual(
            [f["name"] for f in out["logFiles"]], [f"{SLUG}.jsonl"]
        )
        self.assertEqual(
            [(r["name"], r["size"]) for r in out["reports"]],
            [("report.md", 5)],
        )
        self._assert_unchanged()

    def test_slug_rejected(self):
        for bad in ("..", "a/b", ".hidden", "a/../b", "", "x" * 0):
            with self.assertRaises(ToolError):
                takt_files.run_detail(self.repo, bad)
        self._assert_unchanged()

    def test_symlink_escape_rejected(self):
        outside = Path(self.tmp.name) / "outside" / SLUG
        outside.mkdir(parents=True)
        runs = self.takt / "runs"
        runs.mkdir(exist_ok=True)
        os.symlink(outside, runs / SLUG)
        self._before = self._snapshot()
        self.assert_not_found(takt_files.run_detail, self.repo, SLUG)
        self._assert_unchanged()

    def test_worktree_fallback(self):
        wt = Path(self.tmp.name) / "wt"
        self.make_run(
            root=wt / ".takt" / "runs", meta=self._meta(status="completed")
        )
        self.write_tasks_yaml(
            [
                _task(
                    "t1",
                    status="running",
                    worktree=True,
                    worktree_path=str(wt),
                    run_slug=SLUG,
                )
            ]
        )
        out = takt_files.run_detail(self.repo, SLUG)
        self.assertEqual(out["meta"]["status"], "completed")


class RunLogTests(TaktFilesCase):
    def test_log_paging_and_reset(self):
        lines = [_log_line({"n": i, "pad": "x" * 980}) for i in range(80)]
        total = sum(len(l.encode()) for l in lines)
        self.make_run(lines=lines)

        out = takt_files.run_log(self.repo, SLUG, 0)
        self.assertEqual(out["file"], f"{SLUG}.jsonl")
        self.assertFalse(out["eof"])
        self.assertEqual(out["records"][0]["n"], 0)
        # cut at a newline boundary inside the 64 KiB page
        self.assertLess(out["nextOffset"], takt_files.LOG_PAGE)
        nl = out["records"][-1]["n"]
        out2 = takt_files.run_log(self.repo, SLUG, out["nextOffset"])
        self.assertEqual(out2["records"][0]["n"], nl + 1)
        # drain
        offset = out2["nextOffset"]
        recs = out2["records"]
        while not out2["eof"]:
            out2 = takt_files.run_log(self.repo, SLUG, offset)
            recs += out2["records"]
            offset = out2["nextOffset"]
        self.assertEqual(len(recs) + len(out["records"]), 80)

        out3 = takt_files.run_log(self.repo, SLUG, total + 100)
        self.assertTrue(out3.get("reset"))
        self.assertEqual(out3["offset"], 0)
        self.assertEqual(out3["records"][0]["n"], 0)
        self._assert_unchanged()

    def test_string_truncation_and_raw(self):
        lines = [
            _log_line({"big": "y" * 5000}),
            "this is not json\n",
        ]
        self.make_run(lines=lines)
        out = takt_files.run_log(self.repo, SLUG, 0)
        self.assertEqual(len(out["records"][0]["big"]), 4096)
        self.assertEqual(out["records"][1], {"raw": "this is not json"})
        self.assertTrue(out["eof"])
        self._assert_unchanged()

    def test_no_session_log_404(self):
        run = self.takt / "runs" / SLUG
        (run / "logs").mkdir(parents=True)
        (run / "logs" / f"{SLUG}-usage-events.jsonl").write_text("{}\n")
        self._before = self._snapshot()
        self.assert_not_found(takt_files.run_log, self.repo, SLUG, 0)
        self._assert_unchanged()

    def test_newest_log_selected(self):
        run = self.takt / "runs" / SLUG
        (run / "logs").mkdir(parents=True)
        (run / "logs" / "20240101-000000-aaa.jsonl").write_text(
            _log_line({"n": "old"})
        )
        (run / "logs" / "20240102-000000-bbb.jsonl").write_text(
            _log_line({"n": "new"})
        )
        self._before = self._snapshot()
        out = takt_files.run_log(self.repo, SLUG, 0)
        self.assertEqual(out["file"], "20240102-000000-bbb.jsonl")
        self.assertEqual(out["records"][0]["n"], "new")
        self._assert_unchanged()


class ReportTests(TaktFilesCase):
    def test_report_read_and_rejects(self):
        self.make_run(reports={"ok.md": "# report\nbody\n"})
        out = takt_files.report(self.repo, SLUG, "ok.md")
        self.assertEqual(out["text"], "# report\nbody\n")
        self.assertFalse(out["truncated"])

        for bad in ("../x.md", "a/b.md", "x.txt", ".md", "..md"):
            with self.assertRaises(ToolError) as cm:
                takt_files.report(self.repo, SLUG, bad)
            self.assertEqual(cm.exception.code, "bad_request")

        self.assert_not_found(
            takt_files.report, self.repo, SLUG, "missing.md"
        )
        self._assert_unchanged()

    def test_report_truncated(self):
        big = "z" * (takt_files.REPORT_MAX + 100)
        self.make_run(reports={"big.md": big})
        out = takt_files.report(self.repo, SLUG, "big.md")
        self.assertTrue(out["truncated"])
        self.assertEqual(len(out["text"].encode()), takt_files.REPORT_MAX)
        self._assert_unchanged()


class ProjectRegistryTests(TaktFilesCase):
    def test_add_require_remove_missing(self):
        from takt_core import projects

        projects.add_project(self.repo)
        self.assertEqual(
            projects.require_registered(self.repo),
            os.path.realpath(self.repo),
        )
        listed = projects.list_projects()
        self.assertEqual([p["path"] for p in listed],
                         [os.path.realpath(self.repo)])
        self.assertNotIn("missing", listed[0])

        with self.assertRaises(ToolError):
            projects.require_registered(os.path.join(self.tmp.name, "nope"))

        # disappeared dir is reported missing, not dropped
        import shutil

        os.rename(self.repo, self.repo + "-moved")
        listed = projects.list_projects()
        self.assertTrue(listed[0]["missing"])
        os.rename(self.repo + "-moved", self.repo)

        projects.remove_project(self.repo)
        with self.assertRaises(ToolError):
            projects.require_registered(self.repo)
        self.assertEqual(projects.list_projects(), [])


if __name__ == "__main__":
    unittest.main()
