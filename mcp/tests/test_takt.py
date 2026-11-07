"""takt bridge tests: binary discovery, error paths, .takt readers, and a
real takt-mcp round-trip when the binary is available."""

import json
import os
import shutil
import unittest
from pathlib import Path

from helper import ForTaktTestCase, mcp_call

from takt_core import takt_bridge as ft_takt
from takt_core.util import ToolError


class DiscoveryTests(ForTaktTestCase):
    def test_bad_env_binary(self):
        os.environ["TAKT_MCP_BIN"] = "/nonexistent/takt-mcp"
        self.addCleanup(lambda: os.environ.pop("TAKT_MCP_BIN", None))
        with self.assertRaises(ToolError) as ctx:
            mcp_call("takt_tasks", {"project": str(self.repo)})
        self.assertIn("TAKT_MCP_BIN", str(ctx.exception))


class TaktGoalFilesTests(ForTaktTestCase):
    def test_empty_when_no_takt_dir(self):
        res = mcp_call("takt_goal_files", {"project": str(self.repo)})
        self.assertEqual(res, {"goals": []})

    def test_summarizes_and_reports_errors(self):
        goals_dir = Path(self.repo) / ".takt" / "goals"
        good = goals_dir / "11111111-1111-4111-8111-111111111111"
        bad = goals_dir / "broken"
        good.mkdir(parents=True)
        bad.mkdir(parents=True)
        (good / "goal.json").write_text(
            json.dumps(
                {
                    "id": "11111111-1111-4111-8111-111111111111",
                    "objective": "obj",
                    "status": "created",
                    "executionStatus": "active",
                    "branch": "takt-goal/abc",
                }
            )
        )
        (bad / "goal.json").write_text("{corrupted")

        res = mcp_call("takt_goal_files", {"project": str(self.repo)})
        self.assertEqual(len(res["goals"]), 2)
        by_path = {g["path"]: g for g in res["goals"]}
        good_entry = by_path[".takt/goals/11111111-1111-4111-8111-111111111111/goal.json"]
        self.assertEqual(good_entry["objective"], "obj")
        self.assertEqual(good_entry["status"], "created")
        self.assertEqual(good_entry["executionStatus"], "active")
        self.assertIn("error", by_path[".takt/goals/broken/goal.json"])


def _takt_mcp_available():
    if os.environ.get("TAKT_MCP_BIN"):
        return os.access(os.environ["TAKT_MCP_BIN"], os.X_OK)
    if shutil.which("takt-mcp"):
        return True
    import glob

    return any(
        os.access(p, os.X_OK)
        for p in glob.glob(os.path.expanduser("~/.nvm/versions/node/*/bin/takt-mcp"))
    )


class TaktEnqueueRecordTests(ForTaktTestCase):
    """If the goal stops being active while takt-mcp runs, the task is still
    enqueued but the response reports it was not recorded on the goal."""

    def test_enqueue_not_recorded_when_goal_deactivated(self):
        goal = self.active_goal()
        gid = goal["id"]
        orig_call_tool = ft_takt.call_tool

        def fake_call_tool(project, name, arguments):
            # Simulate the race: goal aborted while the enqueue was in flight.
            mcp_call(
                "goal_set_status",
                {"goalId": gid, "status": "aborted", "reason": "stop"},
            )
            return {"taskName": "fake-task", "tasksFile": ".takt/tasks.yaml"}

        ft_takt.call_tool = fake_call_tool
        try:
            res = mcp_call(
                "takt_enqueue",
                {
                    "project": str(self.repo),
                    "task": "do something",
                    "workflow": "w",
                    "autoPr": False,
                    "goalId": gid,
                },
            )
        finally:
            ft_takt.call_tool = orig_call_tool

        # Enqueued to TAKT, but explicitly marked as not recorded on the goal.
        self.assertEqual(res["result"]["taskName"], "fake-task")
        self.assertIs(res["recorded"], False)
        self.assertIn("recordError", res)
        self.assertIn("active", res["recordError"])
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["tasks"], [])
        self.assertFalse(
            any("enqueued" in w["summary"] for w in got["workLog"])
        )


@unittest.skipUnless(_takt_mcp_available(), "takt-mcp binary not available")
class RealTaktMcpTests(ForTaktTestCase):
    def test_find_takt_mcp(self):
        self.assertTrue(os.access(ft_takt.find_takt_mcp(), os.X_OK))

    def test_takt_tasks_empty_repo(self):
        res = mcp_call("takt_tasks", {"project": str(self.repo)})
        # A fresh repo has no queued tasks; shape is takt-mcp's own.
        self.assertIsNotNone(res)


if __name__ == "__main__":
    unittest.main()
