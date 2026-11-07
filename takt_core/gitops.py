"""Git integration: merge-tree based checks and applying them to goal branches.

Same judgement model as TAKT's src/infra/goals/git-command.ts: ancestor
checks first, then `git merge-tree --write-tree` for the merge case.
"""

from . import goals
from .util import (
    ToolError,
    check_str,
    git_out,
    resolve_commit,
    resolve_commit_quiet,
    run_git,
)

DIFFSTAT_FILE_LIMIT = 50

_EMPTY_DIFFSTAT = {
    "files": [],
    "totalFiles": 0,
    "additions": 0,
    "deletions": 0,
    "truncated": False,
}


def _is_ancestor(project, older, newer):
    proc = run_git(
        project, ["merge-base", "--is-ancestor", older, newer], check=False
    )
    if proc.returncode == 0:
        return True
    if proc.returncode == 1:
        return False
    raise ToolError(
        f"git merge-base failed: {proc.stderr.strip() or proc.stdout.strip()}"
    )


def _diffstat(project, base, merged):
    out = git_out(project, ["diff", "--numstat", base, merged])
    files = []
    additions = 0
    deletions = 0
    total = 0
    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        total += 1
        a, d, path = parts[0], parts[1], "\t".join(parts[2:])
        na = int(a) if a.isdigit() else 0
        nd = int(d) if d.isdigit() else 0
        additions += na
        deletions += nd
        if len(files) < DIFFSTAT_FILE_LIMIT:
            files.append(
                {
                    "path": path,
                    "additions": int(a) if a.isdigit() else None,
                    "deletions": int(d) if d.isdigit() else None,
                }
            )
    return {
        "files": files,
        "totalFiles": total,
        "additions": additions,
        "deletions": deletions,
        "truncated": total > DIFFSTAT_FILE_LIMIT,
    }


def integration_check(project, target, source):
    """Judge how source would integrate into target. Read-only on refs.

    merge-tree --write-tree does write objects into the odb but never
    touches refs, the index, or the worktree.
    """
    t_sha = resolve_commit(project, target, "target")
    s_sha = resolve_commit(project, source, "source")
    result = {"targetSha": t_sha, "sourceSha": s_sha}

    if _is_ancestor(project, s_sha, t_sha):
        result["result"] = "already_integrated"
        result["diffstat"] = dict(_EMPTY_DIFFSTAT)
        return result

    if _is_ancestor(project, t_sha, s_sha):
        result["result"] = "fast_forward"
        result["mergedTree"] = git_out(
            project, ["rev-parse", f"{s_sha}^{{tree}}"]
        )
        result["diffstat"] = _diffstat(project, t_sha, s_sha)
        return result

    proc = run_git(
        project,
        ["merge-tree", "--write-tree", "--name-only", "--no-messages", t_sha, s_sha],
        check=False,
    )
    lines = proc.stdout.splitlines()
    if proc.returncode == 0:
        merged_tree = lines[0].strip()
        result["mergedTree"] = merged_tree
        t_tree = git_out(project, ["rev-parse", f"{t_sha}^{{tree}}"])
        if merged_tree == t_tree:
            result["result"] = "already_integrated"
            result["diffstat"] = dict(_EMPTY_DIFFSTAT)
        else:
            result["result"] = "clean_merge"
            result["diffstat"] = _diffstat(project, t_sha, merged_tree)
        return result
    if proc.returncode == 1:
        result["result"] = "conflict"
        result["conflicts"] = [l.strip() for l in lines[1:] if l.strip()]
        return result
    raise ToolError(
        f"git merge-tree failed: {proc.stderr.strip() or proc.stdout.strip()}"
    )


def ensure_goal_branch(project, goal):
    """Create takt-goal/<id8> at startBranch, or reuse it if it is a
    descendant of startBranch. Returns the branch name."""
    name = goals.goal_branch_name(goal["id"])
    start_sha = resolve_commit(project, goal["startBranch"], "startBranch")
    existing = resolve_commit_quiet(project, f"refs/heads/{name}")
    if existing is not None:
        if _is_ancestor(project, start_sha, existing):
            return name
        raise ToolError(
            f"branch {name} exists but is not a descendant of "
            f"{goal['startBranch']}; refusing to reuse it"
        )
    git_out(project, ["branch", name, start_sha])
    return name


def ensure_branch_not_checked_out(project, branch):
    out = git_out(project, ["worktree", "list", "--porcelain"])
    for line in out.splitlines():
        if line.strip() == f"branch refs/heads/{branch}":
            raise ToolError(
                f"branch {branch} is checked out in a worktree; "
                "refusing to update it"
            )


def _takt_branch_task(source, name):
    """Whether *source* is TAKT's branch for task *name*.

    TAKT names a task branch `takt/<timestamp>-<slug>` only when the task
    runs (src/shared/utils/takt-branch-name.ts), so a goal's task record has
    no branch at enqueue time and the branch has to be matched by name.
    """
    if not (name and source.startswith("takt/")):
        return False
    head, sep, slug = source[len("takt/"):].partition("-")
    return bool(sep and head) and slug == name


def _match_task(goal, source, source_sha, task_name):
    open_tasks = [t for t in goal.get("tasks") or [] if t.get("state") != "integrated"]
    if task_name is not None:
        for t in open_tasks:
            if t.get("taskName") == task_name:
                return t
        raise ToolError(f"no open task named {task_name!r} on this goal")
    for t in open_tasks:
        if t.get("branch") in (source, source_sha) or t.get("taskName") in (
            source,
            source_sha,
        ):
            return t
    by_convention = [t for t in open_tasks if _takt_branch_task(source, t.get("taskName"))]
    return by_convention[0] if len(by_convention) == 1 else None


def integration_apply(
    goal_id, source, message=None, expected_revision=None, task_name=None
):
    """Merge source into the goal branch (ff or commit-tree merge).

    Runs inside the goals lock so the revision check, the ref update, and
    the goal record write cannot interleave with another writer.
    """
    check_str(source, "source")
    if source.startswith("-"):
        raise ToolError("source must not start with '-'")
    if message is not None:
        check_str(message, "message")
    if task_name is not None:
        check_str(task_name, "taskName")
    holder = {}

    def mut(goal):
        if goal["status"] != "active":
            raise ToolError(
                f"goal must be active to integrate (status: {goal['status']})"
            )
        branch = goal.get("branch")
        if not branch:
            raise ToolError("goal has no integration branch")
        project = goal["project"]
        # Resolved before any ref moves: an unknown taskName must not leave
        # the goal branch updated with nothing recorded.
        source_sha = resolve_commit(project, source)
        matched = _match_task(goal, source, source_sha, task_name)
        ensure_branch_not_checked_out(project, branch)

        check = integration_check(project, target=branch, source=source)
        outcome = check["result"]
        if outcome == "conflict":
            raise ToolError(
                "merge conflicts; resolve manually or drop the task: "
                + ", ".join(check["conflicts"])
            )

        new_sha = check["targetSha"]
        if outcome == "fast_forward":
            new_sha = check["sourceSha"]
        elif outcome == "clean_merge":
            msg = message or f"takt-goal: integrate {source}"
            new_sha = git_out(
                project,
                [
                    "commit-tree",
                    check["mergedTree"],
                    "-p",
                    check["targetSha"],
                    "-p",
                    check["sourceSha"],
                    "-m",
                    msg,
                ],
            )

        if outcome in ("fast_forward", "clean_merge"):
            proc = run_git(
                project,
                ["update-ref", f"refs/heads/{branch}", new_sha, check["targetSha"]],
                check=False,
            )
            if proc.returncode != 0:
                raise ToolError(
                    f"concurrent update on {branch}; retry: "
                    f"{proc.stderr.strip() or proc.stdout.strip()}"
                )

        # Record on the goal: mark the matched task integrated; with no match
        # the workLog entry alone records it.
        source_sha = check["sourceSha"]
        if matched is not None:
            matched["state"] = "integrated"
            matched["integratedSha"] = source_sha
            if not matched.get("branch"):
                matched["branch"] = source
        note = "" if matched else " (no matching task on this goal)"
        goals.append_worklog(
            goal,
            "integration",
            f"integrated {source} into {branch}: {outcome} -> {new_sha}{note}",
        )
        holder["out"] = {
            "result": outcome,
            "goalId": goal["id"],
            "branch": branch,
            "previousSha": check["targetSha"],
            "sourceSha": source_sha,
            "newSha": new_sha,
            "taskIntegrated": matched.get("taskName") if matched else None,
            "diffstat": check.get("diffstat"),
        }

    goal = goals.update_goal(goal_id, expected_revision, mut)
    holder["out"]["revision"] = goal["revision"]
    return holder["out"]


def check_goal_merged_into_target(goal):
    """For goal_complete: is the goal branch fully contained in targetBranch?"""
    project = goal["project"]
    branch = goal.get("branch")
    if not branch:
        raise ToolError("goal has no integration branch")
    check = integration_check(project, target=goal["targetBranch"], source=branch)
    return check
