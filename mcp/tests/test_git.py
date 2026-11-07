"""Git integration tests: merge-tree judgement, apply, CAS, worktree guard,
and goal_complete gating on the human merge into targetBranch."""

import os
from pathlib import Path

from helper import ForTaktTestCase, commit_file, git, mcp_call, sha

from takt_core import gitops as ft_git
from takt_core import goals as ft_goals
from takt_core.util import ToolError


def branch(repo, name, start="main"):
    git(repo, "branch", name, start)


def on(repo, name):
    git(repo, "checkout", name)


def diverge_branch(repo, branch_name, wt_path, filename, content):
    """Give <branch_name> its own commit via a temporary worktree, so a
    merge against another branch diverges instead of fast-forwarding."""
    git(repo, "worktree", "add", str(wt_path), branch_name)
    try:
        p = Path(wt_path) / filename
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content)
        git(wt_path, "add", filename)
        git(wt_path, "commit", "-m", f"diverge {filename}")
        return sha(wt_path)
    finally:
        git(repo, "worktree", "remove", "--force", str(wt_path))


class IntegrationCheckTests(ForTaktTestCase):
    def check(self, target, source):
        return mcp_call(
            "integration_check",
            {"project": str(self.repo), "target": target, "source": source},
        )

    def test_already_integrated_ancestor(self):
        branch(self.repo, "feat")
        commit_file(self.repo, "b.txt", "main\n", "main work")
        res = self.check("main", "feat")
        self.assertEqual(res["result"], "already_integrated")
        self.assertEqual(res["targetSha"], sha(self.repo, "main"))
        self.assertEqual(res["sourceSha"], sha(self.repo, "feat"))

    def test_fast_forward(self):
        branch(self.repo, "feat")
        on(self.repo, "feat")
        feat_sha = commit_file(self.repo, "c.txt", "feat\n", "feat work")
        on(self.repo, "main")
        res = self.check("main", "feat")
        self.assertEqual(res["result"], "fast_forward")
        self.assertEqual(res["sourceSha"], feat_sha)
        self.assertEqual(res["diffstat"]["totalFiles"], 1)
        self.assertEqual(res["diffstat"]["additions"], 1)

    def test_clean_merge(self):
        branch(self.repo, "feat")
        on(self.repo, "feat")
        commit_file(self.repo, "c.txt", "feat\n", "feat work")
        on(self.repo, "main")
        commit_file(self.repo, "d.txt", "main\n", "main work")
        res = self.check("main", "feat")
        self.assertEqual(res["result"], "clean_merge")
        self.assertTrue(res["mergedTree"])
        self.assertEqual(res["diffstat"]["totalFiles"], 1)
        self.assertEqual(res["diffstat"]["files"][0]["path"], "c.txt")

    def test_conflict_lists_files(self):
        branch(self.repo, "feat")
        on(self.repo, "feat")
        commit_file(self.repo, "a.txt", "feat change\n", "feat edit")
        on(self.repo, "main")
        commit_file(self.repo, "a.txt", "main change\n", "main edit")
        res = self.check("main", "feat")
        self.assertEqual(res["result"], "conflict")
        self.assertEqual(res["conflicts"], ["a.txt"])

    def test_tree_equal_is_already_integrated(self):
        # Both sides made the identical change -> merged tree == target tree.
        branch(self.repo, "feat")
        on(self.repo, "feat")
        commit_file(self.repo, "same.txt", "identical\n", "feat same")
        on(self.repo, "main")
        commit_file(self.repo, "same.txt", "identical\n", "main same")
        res = self.check("main", "feat")
        self.assertEqual(res["result"], "already_integrated")
        self.assertEqual(res["diffstat"]["totalFiles"], 0)

    def test_dash_rejected(self):
        with self.assertRaises(ToolError):
            self.check("main", "-bad")
        with self.assertRaises(ToolError):
            self.check("-bad", "main")

    def test_unresolvable_rev(self):
        with self.assertRaises(ToolError):
            self.check("main", "no-such-rev")


class IntegrationApplyTests(ForTaktTestCase):
    def make_feat(self, filename="c.txt", content="feat\n"):
        branch(self.repo, "feat")
        on(self.repo, "feat")
        new_sha = commit_file(self.repo, filename, content, "feat work")
        on(self.repo, "main")
        return new_sha

    def test_apply_requires_active(self):
        goal = self.create_goal()
        self.make_feat()
        with self.assertRaises(ToolError) as ctx:
            mcp_call(
                "integration_apply",
                {"goalId": goal["id"], "source": "feat"},
            )
        self.assertIn("active", str(ctx.exception))

    def test_apply_fast_forward(self):
        goal = self.active_goal()
        feat_sha = self.make_feat()
        res = mcp_call(
            "integration_apply", {"goalId": goal["id"], "source": "feat"}
        )
        self.assertEqual(res["result"], "fast_forward")
        self.assertEqual(res["newSha"], feat_sha)
        self.assertEqual(sha(self.repo, goal["branch"]), feat_sha)
        got = mcp_call("goal_get", {"goalId": goal["id"]})
        self.assertTrue(
            any(w["kind"] == "integration" for w in got["workLog"])
        )

    def test_apply_clean_merge_makes_merge_commit(self):
        goal = self.active_goal()
        self.make_feat()
        # goal branch diverges from feat's base with its own file
        diverge_branch(
            self.repo,
            goal["branch"],
            os.path.join(self.tmp.name, "wt-goal"),
            "g.txt",
            "goal work\n",
        )
        res = mcp_call(
            "integration_apply", {"goalId": goal["id"], "source": "feat"}
        )
        self.assertEqual(res["result"], "clean_merge")
        new_sha = res["newSha"]
        self.assertEqual(sha(self.repo, goal["branch"]), new_sha)
        parents = git(
            self.repo, "rev-list", "--parents", "-n", "1", new_sha
        ).stdout.split()
        self.assertEqual(len(parents), 3)  # commit + 2 parents

    def test_apply_marks_matching_task(self):
        goal = self.active_goal()
        feat_sha = self.make_feat()
        gid = goal["id"]

        def add_task(g):
            g["tasks"].append(
                {
                    "taskName": "task-1",
                    "workflow": "w",
                    "enqueuedAt": "2026-01-01T00:00:00Z",
                    "state": "queued",
                    "branch": "feat",
                    "integratedSha": None,
                    "note": None,
                }
            )

        ft_goals.update_goal(gid, None, add_task)
        mcp_call("integration_apply", {"goalId": gid, "source": "feat"})
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["tasks"][0]["state"], "integrated")
        self.assertEqual(got["tasks"][0]["integratedSha"], feat_sha)

    def _add_unbranched_task(self, gid, name):
        # Real shape: at enqueue time TAKT has not named the branch yet.
        def add_task(g):
            g["tasks"].append(
                {
                    "taskName": name,
                    "workflow": "default",
                    "enqueuedAt": "2026-01-01T00:00:00Z",
                    "state": "queued",
                    "branch": None,
                    "integratedSha": None,
                    "note": None,
                }
            )

        ft_goals.update_goal(gid, None, add_task)

    def test_apply_marks_task_named_explicitly(self):
        goal = self.active_goal()
        feat_sha = self.make_feat()
        gid = goal["id"]
        self._add_unbranched_task(gid, "task-1")
        mcp_call(
            "integration_apply",
            {"goalId": gid, "source": "feat", "taskName": "task-1"},
        )
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["tasks"][0]["state"], "integrated")
        self.assertEqual(got["tasks"][0]["integratedSha"], feat_sha)
        self.assertEqual(got["tasks"][0]["branch"], "feat")

    def test_apply_matches_takt_branch_name_convention(self):
        goal = self.active_goal()
        gid = goal["id"]
        src = "takt/20261107T1254-readme-task"
        branch(self.repo, src)
        on(self.repo, src)
        commit_file(self.repo, "r.txt", "r\n", "takt work")
        on(self.repo, "main")
        self._add_unbranched_task(gid, "readme-task")
        mcp_call("integration_apply", {"goalId": gid, "source": src})
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["tasks"][0]["state"], "integrated")
        self.assertEqual(got["tasks"][0]["branch"], src)

    def test_apply_unknown_task_name_refuses_before_ref_update(self):
        goal = self.active_goal()
        self.make_feat()
        before = sha(self.repo, goal["branch"])
        with self.assertRaises(ToolError):
            mcp_call(
                "integration_apply",
                {"goalId": goal["id"], "source": "feat", "taskName": "nope"},
            )
        self.assertEqual(sha(self.repo, goal["branch"]), before)

    def test_apply_conflict_raises(self):
        goal = self.active_goal()
        self.make_feat(filename="a.txt", content="feat change\n")
        # goal branch edits the same file differently -> merge conflict
        diverge_sha = diverge_branch(
            self.repo,
            goal["branch"],
            os.path.join(self.tmp.name, "wt-goal"),
            "a.txt",
            "goal change\n",
        )
        with self.assertRaises(ToolError) as ctx:
            mcp_call(
                "integration_apply",
                {"goalId": goal["id"], "source": "feat"},
            )
        self.assertIn("a.txt", str(ctx.exception))
        # branch untouched
        self.assertEqual(sha(self.repo, goal["branch"]), diverge_sha)

    def test_apply_refuses_when_branch_checked_out(self):
        goal = self.active_goal()
        wt = os.path.join(self.tmp.name, "wt")
        git(self.repo, "worktree", "add", wt, goal["branch"])
        self.make_feat()
        with self.assertRaises(ToolError) as ctx:
            mcp_call(
                "integration_apply",
                {"goalId": goal["id"], "source": "feat"},
            )
        self.assertIn("worktree", str(ctx.exception))

    def test_apply_cas_race(self):
        goal = self.active_goal()
        self.make_feat()
        commit_file(self.repo, "d.txt", "main\n", "main work")
        other = commit_file(self.repo, "e.txt", "sneak\n", "sneaky")
        git(self.repo, "checkout", "main")

        orig_run_git = ft_git.run_git

        def racy(project, args, **kw):
            if args[0] == "update-ref":
                orig_run_git(
                    project,
                    ["update-ref", f"refs/heads/{goal['branch']}", other],
                )
            return orig_run_git(project, args, **kw)

        ft_git.run_git = racy
        try:
            with self.assertRaises(ToolError) as ctx:
                mcp_call(
                    "integration_apply",
                    {"goalId": goal["id"], "source": "feat"},
                )
            self.assertIn("concurrent", str(ctx.exception))
        finally:
            ft_git.run_git = orig_run_git

    def test_apply_already_integrated_records_only(self):
        goal = self.active_goal()
        # feat == goal branch point, then move goal branch past it manually
        self.make_feat()
        mcp_call("integration_apply", {"goalId": goal["id"], "source": "feat"})
        before = sha(self.repo, goal["branch"])
        res = mcp_call(
            "integration_apply", {"goalId": goal["id"], "source": "feat"}
        )
        self.assertEqual(res["result"], "already_integrated")
        self.assertEqual(sha(self.repo, goal["branch"]), before)

    def test_apply_rejects_dash_source(self):
        goal = self.active_goal()
        with self.assertRaises(ToolError):
            mcp_call(
                "integration_apply", {"goalId": goal["id"], "source": "-x"}
            )

    def test_ensure_goal_branch_rejects_foreign_branch(self):
        goal = self.create_goal()
        name = ft_goals.goal_branch_name(goal["id"])
        # create the branch somewhere unrelated (not a descendant of main)
        git(self.repo, "checkout", "--orphan", "orphan")
        git(self.repo, "rm", "-rf", ".")
        commit_file(self.repo, "z.txt", "z\n", "orphan commit")
        git(self.repo, "branch", name)
        git(self.repo, "checkout", "main")
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_set_status",
                {"goalId": goal["id"], "status": "active", "reason": "go"},
            )

    def test_ensure_goal_branch_reuses_descendant(self):
        goal = self.create_goal()
        name = ft_goals.goal_branch_name(goal["id"])
        git(self.repo, "branch", name, "main")  # pre-existing, descendant
        res = mcp_call(
            "goal_set_status",
            {"goalId": goal["id"], "status": "active", "reason": "go"},
        )
        self.assertEqual(res["branch"], name)


class GoalCompleteTests(ForTaktTestCase):
    def test_complete_requires_awaiting_merge(self):
        goal = self.active_goal()
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_complete", {"goalId": goal["id"], "summary": "done"}
            )

    def test_complete_refused_until_human_merges(self):
        goal = self.active_goal()
        gid = goal["id"]
        branch_name = goal["branch"]
        branch(self.repo, "feat")
        on(self.repo, "feat")
        commit_file(self.repo, "c.txt", "feat\n", "feat work")
        on(self.repo, "main")
        mcp_call("integration_apply", {"goalId": gid, "source": "feat"})
        mcp_call(
            "goal_set_status",
            {"goalId": gid, "status": "awaiting_merge", "reason": "ready"},
        )
        # not yet merged into target -> refuse
        with self.assertRaises(ToolError) as ctx:
            mcp_call("goal_complete", {"goalId": gid, "summary": "done"})
        self.assertIn("target", str(ctx.exception).lower())
        # human merges goal branch into main (target)
        git(self.repo, "merge", "--no-ff", "-m", "merge goal", branch_name)
        res = mcp_call("goal_complete", {"goalId": gid, "summary": "shipped"})
        self.assertEqual(res["status"], "completed")
        self.assertEqual(res["completion"]["summary"], "shipped")
        self.assertEqual(res["completion"]["targetSha"], sha(self.repo, "main"))
        got = mcp_call("goal_get", {"goalId": gid})
        self.assertEqual(got["status"], "completed")
        # terminal
        with self.assertRaises(ToolError):
            mcp_call(
                "goal_set_status",
                {"goalId": gid, "status": "active", "reason": "again"},
            )


if __name__ == "__main__":
    import unittest

    unittest.main()
