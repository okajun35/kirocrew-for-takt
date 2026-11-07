#!/usr/bin/env python3
"""for-takt MCP server.

Newline-delimited JSON-RPC 2.0 over stdio: one JSON object per line in,
one per line out. Logs go to stderr only. Standard library only — the
gateway venv has no mcp package.
"""

import json
import os
import sys
from pathlib import Path
import traceback

# The app root goes on sys.path so `takt_core` resolves as a real package.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from takt_core import goals as ft_goals
from takt_core import gitops as ft_git
from takt_core import projects as ft_projects
from takt_core import runner as ft_runner
from takt_core import takt_bridge as ft_takt
from takt_core.util import (
    ToolError,
    bool_arg,
    current_branch,
    int_arg,
    now_iso,
    resolve_commit,
    str_arg,
    str_list_arg,
    validate_branch,
    validate_project,
)

SERVER_NAME = "for-takt"
SERVER_VERSION = "0.1.0"
DEFAULT_PROTOCOL_VERSION = "2025-06-18"
MAX_RESPONSE_BYTES = 200 * 1024

_OBJECTIVE = {"type": "string"}
_STRINGS = {"type": "array", "items": {"type": "string"}}
_REVISION = {"type": "integer"}


def _schema(properties, required):
    return {
        "type": "object",
        "properties": properties,
        "required": required,
        "additionalProperties": False,
    }


# ---------------------------------------------------------------------------
# goal tool handlers
# ---------------------------------------------------------------------------

def h_goal_create(args):
    project = validate_project(str_arg(args, "project", required=True))
    objective = str_arg(args, "objective", required=True)
    acceptance = str_list_arg(args, "acceptanceCriteria", required=True)
    out_of_scope = str_list_arg(args, "outOfScope", default=[])
    constraints = str_list_arg(args, "constraints", default=[])
    start = str_arg(args, "startBranch") or current_branch(project)
    target = str_arg(args, "targetBranch") or start
    validate_branch(project, start, "startBranch")
    validate_branch(project, target, "targetBranch")
    resolve_commit(project, start, "startBranch")
    resolve_commit(project, target, "targetBranch")
    goal = ft_goals.create_goal(
        project, objective, acceptance, out_of_scope, constraints, start, target
    )
    # Register the project so the dashboard may read it (best effort: the
    # goal record already exists, so a registry failure must not fail the
    # call).
    try:
        ft_projects.add_project(project)
    except Exception as e:
        print(f"for-takt: could not register project {project}: {e}", file=sys.stderr)
    return goal


def h_project_list(args):
    """Registered projects (path, name, hasTakt) for discovery."""
    out = []
    for p in ft_projects.list_projects():
        has_takt = None
        try:
            has_takt = (Path(p["path"]) / ".takt").is_dir()
        except OSError:
            pass
        out.append(
            {
                "path": p["path"],
                "name": p.get("name"),
                "hasTakt": has_takt,
                "missing": p.get("missing", False),
            }
        )
    return {"projects": out}


def h_goal_list(args):
    project = str_arg(args, "project")
    if project is not None:
        project = validate_project(project)
    status = str_arg(args, "status")
    if status is not None and status not in ft_goals.STATUSES:
        raise ToolError(f"unknown status: {status}")
    return {"goals": ft_goals.list_goals(project=project, status=status)}


def h_goal_get(args):
    return ft_goals.load_goal(str_arg(args, "goalId", required=True))


def h_goal_update(args):
    goal_id = str_arg(args, "goalId", required=True)
    objective = str_arg(args, "objective")
    out_of_scope = str_list_arg(args, "outOfScope")
    constraints = str_list_arg(args, "constraints")
    acceptance = str_list_arg(args, "acceptanceCriteria")
    expected = int_arg(args, "expectedRevision")

    def mut(goal):
        if goal["status"] in ft_goals.TERMINAL:
            raise ToolError(f"goal is already {goal['status']}; cannot update")
        if objective is not None:
            goal["objective"] = objective
        if out_of_scope is not None:
            goal["outOfScope"] = out_of_scope
        if constraints is not None:
            goal["constraints"] = constraints
        if acceptance is not None:
            if not acceptance:
                raise ToolError(
                    "acceptanceCriteria must have at least one entry"
                )
            goal["acceptanceCriteria"] = acceptance

    return ft_goals.update_goal(goal_id, expected, mut)


def h_goal_set_status(args):
    goal_id = str_arg(args, "goalId", required=True)
    status = str_arg(args, "status", required=True)
    reason = str_arg(args, "reason", required=True)
    expected = int_arg(args, "expectedRevision")
    if status == "completed":
        raise ToolError("use goal_complete to mark a goal completed")

    def mut(goal):
        current = goal["status"]
        ft_goals.check_transition(current, status)
        if status == "active":
            goal["branch"] = ft_git.ensure_goal_branch(goal["project"], goal)
        goal["status"] = status
        ft_goals.append_worklog(
            goal, "status", f"{current} -> {status}: {reason}"
        )

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {
        "id": goal["id"],
        "status": goal["status"],
        "branch": goal.get("branch"),
        "revision": goal["revision"],
    }


def h_goal_log(args):
    goal_id = str_arg(args, "goalId", required=True)
    summary = str_arg(args, "summary", required=True)
    kind = str_arg(args, "kind", default="note")
    if kind not in ("note", "patrol"):
        raise ToolError("kind must be 'note' or 'patrol'")
    expected = int_arg(args, "expectedRevision")

    def mut(goal):
        ft_goals.append_worklog(goal, kind, summary)

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {"id": goal["id"], "revision": goal["revision"]}


def h_goal_ask(args):
    goal_id = str_arg(args, "goalId", required=True)
    body = str_arg(args, "body", required=True)
    options = str_list_arg(args, "options")
    expected = int_arg(args, "expectedRevision")
    holder = {}

    def mut(goal):
        if goal["status"] in ft_goals.TERMINAL:
            raise ToolError(f"goal is already {goal['status']}; cannot ask")
        q = {
            "id": ft_goals.new_id(),
            "at": now_iso(),
            "body": body,
            "options": options or [],
            "status": "pending",
            "answer": None,
            "answeredAt": None,
        }
        goal.setdefault("questions", []).append(q)
        ft_goals.trim_questions(goal)
        holder["question"] = q

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {
        "id": goal["id"],
        "questionId": holder["question"]["id"],
        "revision": goal["revision"],
    }


def h_goal_answer(args):
    goal_id = str_arg(args, "goalId", required=True)
    question_id = str_arg(args, "questionId", required=True)
    answer = str_arg(args, "answer", required=True)
    expected = int_arg(args, "expectedRevision")

    def mut(goal):
        q = ft_goals.find_question(goal, question_id)
        if q.get("status") != "pending":
            raise ToolError(f"question is {q.get('status')}, not pending")
        q["status"] = "answered"
        q["answer"] = answer
        q["answeredAt"] = now_iso()

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {"id": goal["id"], "revision": goal["revision"]}


def h_goal_withdraw_question(args):
    goal_id = str_arg(args, "goalId", required=True)
    question_id = str_arg(args, "questionId", required=True)
    reason = str_arg(args, "reason", required=True)
    expected = int_arg(args, "expectedRevision")

    def mut(goal):
        q = ft_goals.find_question(goal, question_id)
        if q.get("status") != "pending":
            raise ToolError(f"question is {q.get('status')}, not pending")
        q["status"] = "withdrawn"
        ft_goals.append_worklog(
            goal, "note", f"question {question_id} withdrawn: {reason}"
        )

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {"id": goal["id"], "revision": goal["revision"]}


def h_goal_task_update(args):
    goal_id = str_arg(args, "goalId", required=True)
    task_name = str_arg(args, "taskName", required=True)
    state = str_arg(args, "state", required=True)
    note = str_arg(args, "note")
    expected = int_arg(args, "expectedRevision")
    if state not in ("queued", "dropped"):
        raise ToolError(
            "state must be 'queued' or 'dropped'; tasks become 'integrated' "
            "only via integration_apply"
        )

    def mut(goal):
        t = ft_goals.find_task(goal, task_name)
        t["state"] = state
        if note is not None:
            t["note"] = note
        ft_goals.append_worklog(
            goal, "note", f"task {task_name} -> {state}"
            + (f": {note}" if note else "")
        )

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {"id": goal["id"], "revision": goal["revision"]}


def h_goal_complete(args):
    goal_id = str_arg(args, "goalId", required=True)
    summary = str_arg(args, "summary", required=True)
    expected = int_arg(args, "expectedRevision")

    goal = ft_goals.load_goal(goal_id)
    if goal["status"] != "awaiting_merge":
        raise ToolError(
            f"goal must be awaiting_merge to complete (status: {goal['status']})"
        )
    check = ft_git.check_goal_merged_into_target(goal)
    if check["result"] != "already_integrated":
        raise ToolError(
            f"goal branch {goal.get('branch')} is not contained in "
            f"{goal['targetBranch']} yet ({check['result']}). Merge the goal "
            "branch into the target branch yourself, then re-run goal_complete."
        )

    def mut(g):
        ft_goals.check_transition(g["status"], "completed", allow_complete=True)
        g["completion"] = {
            "goalSha": check["sourceSha"],
            "targetSha": check["targetSha"],
            "summary": summary,
            "at": now_iso(),
        }
        g["status"] = "completed"
        ft_goals.append_worklog(
            g, "status", f"awaiting_merge -> completed: {summary}"
        )

    goal = ft_goals.update_goal(goal_id, expected, mut)
    return {
        "id": goal["id"],
        "status": goal["status"],
        "completion": goal["completion"],
        "revision": goal["revision"],
    }


# ---------------------------------------------------------------------------
# git tool handlers
# ---------------------------------------------------------------------------

def h_integration_check(args):
    project = validate_project(str_arg(args, "project", required=True))
    target = str_arg(args, "target", required=True)
    source = str_arg(args, "source", required=True)
    return ft_git.integration_check(project, target, source)


def h_integration_apply(args):
    goal_id = str_arg(args, "goalId", required=True)
    source = str_arg(args, "source", required=True)
    message = str_arg(args, "message")
    expected = int_arg(args, "expectedRevision")
    return ft_git.integration_apply(
        goal_id, source, message=message, expected_revision=expected
    )


# ---------------------------------------------------------------------------
# takt tool handlers
# ---------------------------------------------------------------------------

def h_takt_tasks(args):
    project = validate_project(str_arg(args, "project", required=True))
    return ft_takt.call_tool(project, "takt_list_tasks", {"cwd": project})


def h_takt_run_detail(args):
    project = validate_project(str_arg(args, "project", required=True))
    run_slug = str_arg(args, "runSlug", required=True)
    return ft_takt.call_tool(
        project, "takt_get_run", {"cwd": project, "runSlug": run_slug}
    )


def h_takt_enqueue(args):
    project = validate_project(str_arg(args, "project", required=True))
    task = str_arg(args, "task", required=True)
    workflow = str_arg(args, "workflow", required=True)
    auto_pr = bool_arg(args, "autoPr", required=True)
    worktree = bool_arg(args, "worktree")
    draft_pr = bool_arg(args, "draftPr")
    goal_id = str_arg(args, "goalId")

    takt_args = {
        "cwd": project,
        "task": task,
        "workflow": workflow,
        "autoPr": auto_pr,
    }
    if worktree is not None:
        takt_args["worktree"] = worktree
    if draft_pr is not None:
        takt_args["draftPr"] = draft_pr

    goal = None
    if goal_id is not None:
        goal = ft_goals.load_goal(goal_id)
        if goal["status"] != "active":
            raise ToolError(
                f"goal must be active to enqueue (status: {goal['status']})"
            )
        if goal["project"] != project:
            raise ToolError("goal belongs to a different project")
        if not goal.get("branch"):
            raise ToolError("goal has no integration branch")
        takt_args["taskContext"] = {"baseBranch": goal["branch"]}

    result = ft_takt.call_tool(project, "takt_enqueue_task", takt_args)

    out = {"result": result}
    if goal is not None:
        task_name = (
            result.get("taskName") if isinstance(result, dict) else None
        ) or task.splitlines()[0][:80]

        def mut(g):
            # Re-verify under the lock: the goal may have changed while the
            # takt-mcp call was in flight.
            if g["status"] != "active":
                raise ToolError(
                    f"goal is {g['status']}, not active"
                )
            if g["project"] != project:
                raise ToolError("goal project mismatch")
            g.setdefault("tasks", []).append(
                {
                    "taskName": task_name,
                    "workflow": workflow,
                    "enqueuedAt": now_iso(),
                    "state": "queued",
                    "branch": None,
                    "integratedSha": None,
                    "note": None,
                }
            )
            ft_goals.append_worklog(
                g, "note", f"enqueued task {task_name} (workflow: {workflow})"
            )

        try:
            goal = ft_goals.update_goal(goal["id"], None, mut)
        except ToolError as e:
            # The task IS enqueued in TAKT; report that plus why the goal
            # record was not updated.
            out["goalId"] = goal["id"]
            out["taskName"] = task_name
            out["recorded"] = False
            out["recordError"] = str(e)
        else:
            out["goalId"] = goal["id"]
            out["taskName"] = task_name
            out["goalRevision"] = goal["revision"]
            out["recorded"] = True
    return out


def h_takt_tell(args):
    project = validate_project(str_arg(args, "project", required=True))
    run_slug = str_arg(args, "runSlug", required=True)
    content = str_arg(args, "content", required=True)
    return ft_takt.call_tool(
        project,
        "takt_tell_run",
        {"cwd": project, "runSlug": run_slug, "content": content},
    )


def h_takt_run(args):
    """Start a detached `takt run` (mode=once) or `takt watch` (mode=watch)
    for the project so the user does not have to run it themselves."""
    project = validate_project(str_arg(args, "project", required=True))
    mode = str_arg(args, "mode") or "once"
    allow = str_list_arg(args, "allow")
    allow_all = bool_arg(args, "allowAll", default=False)
    return ft_runner.start(
        project, ft_takt.find_takt(), mode, allow=allow, allow_all=allow_all
    )


def h_takt_runner_status(args):
    project = validate_project(str_arg(args, "project", required=True))
    return ft_runner.status(project)


def h_takt_runner_stop(args):
    project = validate_project(str_arg(args, "project", required=True))
    return ft_runner.stop(project)


def h_takt_goal_files(args):
    project = validate_project(str_arg(args, "project", required=True))
    return ft_takt.takt_goal_files(project)


# ---------------------------------------------------------------------------
# tool registry
# ---------------------------------------------------------------------------

TOOLS = [
    {
        "name": "goal_create",
        "description": "Create a for-takt goal record (status=draft). Does not create any git branch. acceptanceCriteria needs at least one entry. startBranch defaults to the current HEAD branch; targetBranch defaults to startBranch.",
        "inputSchema": _schema(
            {
                "project": _OBJECTIVE,
                "objective": _OBJECTIVE,
                "acceptanceCriteria": _STRINGS,
                "outOfScope": _STRINGS,
                "constraints": _STRINGS,
                "startBranch": _OBJECTIVE,
                "targetBranch": _OBJECTIVE,
            },
            ["project", "objective", "acceptanceCriteria"],
        ),
        "handler": h_goal_create,
    },
    {
        "name": "project_list",
        "description": "List projects registered with this app (path, name, hasTakt). Call this FIRST when the user does not name a project — pick it yourself when exactly one is registered.",
        "inputSchema": _schema({}, []),
        "handler": h_project_list,
    },
    {
        "name": "goal_list",
        "description": "List for-takt goals (id, objective head, status, branch, task count, pending question count, updatedAt).",
        "inputSchema": _schema(
            {"project": _OBJECTIVE, "status": {"type": "string", "enum": list(ft_goals.STATUSES)}},
            [],
        ),
        "handler": h_goal_list,
    },
    {
        "name": "goal_get",
        "description": "Return the full for-takt goal record.",
        "inputSchema": _schema({"goalId": _OBJECTIVE}, ["goalId"]),
        "handler": h_goal_get,
    },
    {
        "name": "goal_update",
        "description": "Update objective/outOfScope/constraints/acceptanceCriteria of a non-terminal goal. expectedRevision enables optimistic locking.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "objective": _OBJECTIVE,
                "outOfScope": _STRINGS,
                "constraints": _STRINGS,
                "acceptanceCriteria": _STRINGS,
                "expectedRevision": _REVISION,
            },
            ["goalId"],
        ),
        "handler": h_goal_update,
    },
    {
        "name": "goal_set_status",
        "description": "Transition goal status. draft->active creates the goal branch takt-goal/<id8>. Allowed: draft->active, active<->paused, active->awaiting_merge, awaiting_merge->active, any non-terminal->aborted. Completion goes through goal_complete.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "status": {"type": "string", "enum": ["active", "paused", "awaiting_merge", "aborted"]},
                "reason": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "status", "reason"],
        ),
        "handler": h_goal_set_status,
    },
    {
        "name": "goal_log",
        "description": "Append an entry to the goal's workLog.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "summary": _OBJECTIVE,
                "kind": {"type": "string", "enum": ["note", "patrol"]},
                "expectedRevision": _REVISION,
            },
            ["goalId", "summary"],
        ),
        "handler": h_goal_log,
    },
    {
        "name": "goal_ask",
        "description": "Record a pending question on the goal and return its id.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "body": _OBJECTIVE,
                "options": _STRINGS,
                "expectedRevision": _REVISION,
            },
            ["goalId", "body"],
        ),
        "handler": h_goal_ask,
    },
    {
        "name": "goal_answer",
        "description": "Answer a pending question on the goal.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "questionId": _OBJECTIVE,
                "answer": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "questionId", "answer"],
        ),
        "handler": h_goal_answer,
    },
    {
        "name": "goal_withdraw_question",
        "description": "Withdraw a pending question on the goal.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "questionId": _OBJECTIVE,
                "reason": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "questionId", "reason"],
        ),
        "handler": h_goal_withdraw_question,
    },
    {
        "name": "goal_task_update",
        "description": "Manually set a recorded task's state to queued or dropped ('integrated' is set only by integration_apply).",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "taskName": _OBJECTIVE,
                "state": {"type": "string", "enum": ["queued", "dropped"]},
                "note": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "taskName", "state"],
        ),
        "handler": h_goal_task_update,
    },
    {
        "name": "goal_complete",
        "description": "Complete a goal that is awaiting_merge. Refuses until the goal branch is fully contained in targetBranch (the human performs that merge).",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "summary": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "summary"],
        ),
        "handler": h_goal_complete,
    },
    {
        "name": "integration_check",
        "description": "Read-only judgement of how source integrates into target: already_integrated / fast_forward / clean_merge / conflict, with diffstat.",
        "inputSchema": _schema(
            {"project": _OBJECTIVE, "target": _OBJECTIVE, "source": _OBJECTIVE},
            ["project", "target", "source"],
        ),
        "handler": h_integration_check,
    },
    {
        "name": "integration_apply",
        "description": "Integrate source into the goal's branch (fast-forward or merge commit via commit-tree + update-ref CAS). Requires status=active; refuses on conflict or when the goal branch is checked out in a worktree.",
        "inputSchema": _schema(
            {
                "goalId": _OBJECTIVE,
                "source": _OBJECTIVE,
                "message": _OBJECTIVE,
                "expectedRevision": _REVISION,
            },
            ["goalId", "source"],
        ),
        "handler": h_integration_apply,
    },
    {
        "name": "takt_tasks",
        "description": "Relay takt-mcp takt_list_tasks for the project.",
        "inputSchema": _schema({"project": _OBJECTIVE}, ["project"]),
        "handler": h_takt_tasks,
    },
    {
        "name": "takt_run_detail",
        "description": "Relay takt-mcp takt_get_run for one run slug.",
        "inputSchema": _schema(
            {"project": _OBJECTIVE, "runSlug": _OBJECTIVE},
            ["project", "runSlug"],
        ),
        "handler": h_takt_run_detail,
    },
    {
        "name": "takt_enqueue",
        "description": "Relay takt-mcp takt_enqueue_task. With goalId, the goal must be active; taskContext.baseBranch is set to the goal branch and the task is recorded on the goal as queued.",
        "inputSchema": _schema(
            {
                "project": _OBJECTIVE,
                "task": _OBJECTIVE,
                "workflow": _OBJECTIVE,
                "autoPr": {"type": "boolean"},
                "goalId": _OBJECTIVE,
                "worktree": {"type": "boolean"},
                "draftPr": {"type": "boolean"},
            },
            ["project", "task", "workflow", "autoPr"],
        ),
        "handler": h_takt_enqueue,
    },
    {
        "name": "takt_tell",
        "description": "Relay takt-mcp takt_tell_run: send an instruction to a running task.",
        "inputSchema": _schema(
            {"project": _OBJECTIVE, "runSlug": _OBJECTIVE, "content": _OBJECTIVE},
            ["project", "runSlug", "content"],
        ),
        "handler": h_takt_tell,
    },
    {
        "name": "takt_run",
        "description": "Start a detached `takt run` (mode=once, default) or `takt watch` (mode=watch) in the project so queued tasks execute without the user running takt themselves. Refuses if a runner is already alive, and refuses (409) when pending tasks exist that are not in `allow` — takt run executes EVERY pending task, so pass allow=[task names you expect] or allowAll=true to run all of them.",
        "inputSchema": _schema(
            {
                "project": _OBJECTIVE,
                "mode": {"type": "string", "enum": ["once", "watch"]},
                "allow": _STRINGS,
                "allowAll": {"type": "boolean"},
            },
            ["project"],
        ),
        "handler": h_takt_run,
    },
    {
        "name": "takt_runner_status",
        "description": "Report whether a detached takt runner is alive for the project, with its pid and recent log lines.",
        "inputSchema": _schema({"project": _OBJECTIVE}, ["project"]),
        "handler": h_takt_runner_status,
    },
    {
        "name": "takt_runner_stop",
        "description": "SIGTERM the detached takt runner recorded for the project (no-op when none is running).",
        "inputSchema": _schema({"project": _OBJECTIVE}, ["project"]),
        "handler": h_takt_runner_stop,
    },
    {
        "name": "takt_goal_files",
        "description": "Read-only summary of .takt/goals/*/goal.json (id, objective, status, executionStatus, branch). Unparseable files return an error entry.",
        "inputSchema": _schema({"project": _OBJECTIVE}, ["project"]),
        "handler": h_takt_goal_files,
    },
]

_HANDLERS = {t["name"]: t["handler"] for t in TOOLS}


# ---------------------------------------------------------------------------
# JSON-RPC plumbing
# ---------------------------------------------------------------------------

def _write(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def _error(req_id, code, message):
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {"code": code, "message": message},
    }


def _tool_result(out):
    text = json.dumps(out, ensure_ascii=False)
    truncated = False
    encoded = text.encode("utf-8")
    if len(encoded) > MAX_RESPONSE_BYTES:
        text = encoded[:MAX_RESPONSE_BYTES].decode("utf-8", "ignore")
        truncated = True
    result = {"content": [{"type": "text", "text": text}]}
    if truncated:
        result["truncated"] = True
    return result


def _tool_error(message):
    return {
        "content": [{"type": "text", "text": message}],
        "isError": True,
    }


def _call_tool(params):
    if not isinstance(params, dict):
        return _tool_error("tools/call params must be an object")
    name = params.get("name")
    arguments = params.get("arguments")
    if arguments is None:
        arguments = {}
    if not isinstance(arguments, dict):
        return _tool_error("tools/call arguments must be an object")
    handler = _HANDLERS.get(name)
    if handler is None:
        return _tool_error(f"unknown tool: {name}")
    try:
        return _tool_result(handler(arguments))
    except ToolError as e:
        return _tool_error(str(e))
    except Exception:
        traceback.print_exc(file=sys.stderr)
        return _tool_error("internal error (see server stderr)")


def _handle(msg):
    req_id = msg.get("id")
    method = msg.get("method")
    if not isinstance(method, str):
        if req_id is not None:
            return _error(req_id, -32600, "invalid request: missing method")
        return None
    if method.startswith("notifications/"):
        return None
    if method == "initialize":
        params = msg.get("params") if isinstance(msg.get("params"), dict) else {}
        protocol = params.get("protocolVersion") or DEFAULT_PROTOCOL_VERSION
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": protocol,
                "capabilities": {"tools": {}},
                "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
            },
        }
    if method == "ping":
        return {"jsonrpc": "2.0", "id": req_id, "result": {}}
    if method == "tools/list":
        tools = [
            {
                "name": t["name"],
                "description": t["description"],
                "inputSchema": t["inputSchema"],
            }
            for t in TOOLS
        ]
        return {"jsonrpc": "2.0", "id": req_id, "result": {"tools": tools}}
    if method == "tools/call":
        return {"jsonrpc": "2.0", "id": req_id, "result": _call_tool(msg.get("params"))}
    if req_id is not None:
        return _error(req_id, -32601, f"method not found: {method}")
    return None


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except json.JSONDecodeError:
            _write(_error(None, -32700, "parse error"))
            continue
        if not isinstance(msg, dict):
            _write(_error(None, -32600, "invalid request"))
            continue
        try:
            resp = _handle(msg)
        except Exception:
            traceback.print_exc(file=sys.stderr)
            resp = _error(msg.get("id"), -32603, "internal error")
        if resp is not None:
            _write(resp)


if __name__ == "__main__":
    main()
