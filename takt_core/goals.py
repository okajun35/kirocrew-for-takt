"""Goal store: for-takt's own goal records under data/goals/.

Owns the record schema and every mutation rule (transitions, caps, revision).
Git side effects are injected by callers as mutator callbacks.
"""

import json
import re

from .util import (
    ToolError,
    atomic_write_json,
    check_expected_revision,
    check_str,
    goals_dir,
    goals_lock,
    new_id,
    now_iso,
)

SCHEMA = "for-takt.goal/v1"
STATUSES = ("draft", "active", "paused", "awaiting_merge", "completed", "aborted")
TERMINAL = {"completed", "aborted"}
TASK_STATES = ("queued", "integrated", "dropped")
LOG_KINDS = ("note", "patrol", "integration", "status")
QUESTION_STATUSES = ("pending", "answered", "withdrawn")

WORKLOG_LIMIT = 500
QUESTION_LIMIT = 200
SUMMARY_CHARS = 200

_GOAL_ID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
)

_TRANSITIONS = {
    ("draft", "active"),
    ("active", "paused"),
    ("paused", "active"),
    ("active", "awaiting_merge"),
    ("awaiting_merge", "active"),
    ("awaiting_merge", "completed"),
}


def goal_branch_name(goal_id):
    return f"takt-goal/{goal_id[:8]}"


def goal_path(goal_id):
    check_str(goal_id, "goalId")
    if not _GOAL_ID_RE.match(goal_id):
        raise ToolError("invalid goalId")
    return goals_dir() / f"{goal_id}.json"


def load_goal(goal_id):
    path = goal_path(goal_id)
    try:
        with open(path, encoding="utf-8") as f:
            goal = json.load(f)
    except FileNotFoundError:
        raise ToolError(f"goal not found: {goal_id}", code="not_found")
    except (OSError, json.JSONDecodeError) as e:
        raise ToolError(f"cannot read goal {goal_id}: {e}")
    if (
        not isinstance(goal, dict)
        or goal.get("schema") != SCHEMA
        or goal.get("id") != goal_id
    ):
        raise ToolError(f"corrupt goal file: {goal_id}")
    return goal


def update_goal(goal_id, expected_revision, mutator):
    """Load under the goals lock, check the revision, mutate, write back.

    mutator(goal) may raise ToolError to abort without writing, and may
    perform git side effects (it runs while the lock is held).
    """
    with goals_lock():
        goal = load_goal(goal_id)
        check_expected_revision(goal, {"expectedRevision": expected_revision})
        mutator(goal)
        goal["revision"] += 1
        goal["updatedAt"] = now_iso()
        atomic_write_json(goal_path(goal_id), goal)
    return goal


# ---------------------------------------------------------------------------
# rules
# ---------------------------------------------------------------------------

def check_transition(current, new, allow_complete=False):
    if new not in STATUSES:
        raise ToolError(f"unknown status: {new}")
    if current in TERMINAL:
        raise ToolError(
            f"goal is already {current}; no further transitions",
            code="conflict",
        )
    if (current, new) in _TRANSITIONS:
        if new == "completed" and not allow_complete:
            raise ToolError(
                "use goal_complete to mark a goal completed", code="conflict"
            )
        return
    if new == "aborted":
        return
    raise ToolError(
        f"invalid status transition: {current} -> {new}", code="conflict"
    )


def append_worklog(goal, kind, summary):
    check_str(summary, "summary")
    goal.setdefault("workLog", []).append(
        {"id": new_id(), "at": now_iso(), "kind": kind, "summary": summary}
    )
    overflow = len(goal["workLog"]) - WORKLOG_LIMIT
    if overflow > 0:
        del goal["workLog"][:overflow]


def trim_questions(goal):
    """Cap questions at QUESTION_LIMIT, dropping oldest answered/withdrawn.

    Pending questions are never dropped; the list may exceed the cap when
    it consists only of pending entries.
    """
    qs = goal.get("questions", [])
    if len(qs) <= QUESTION_LIMIT:
        return
    pending = [q for q in qs if q.get("status") == "pending"]
    keep_done = max(QUESTION_LIMIT - len(pending), 0)
    done = [q for q in qs if q.get("status") != "pending"]
    keep = {id(q) for q in pending} | {id(q) for q in done[-keep_done:]}
    goal["questions"] = [q for q in qs if id(q) in keep]


# ---------------------------------------------------------------------------
# create / read
# ---------------------------------------------------------------------------

def create_goal(
    project,
    objective,
    acceptance_criteria,
    out_of_scope,
    constraints,
    start_branch,
    target_branch,
):
    if not acceptance_criteria:
        raise ToolError("acceptanceCriteria must have at least one entry")
    now = now_iso()
    goal = {
        "schema": SCHEMA,
        "id": new_id(),
        "revision": 1,
        "project": project,
        "createdAt": now,
        "updatedAt": now,
        "objective": objective,
        "outOfScope": out_of_scope,
        "acceptanceCriteria": acceptance_criteria,
        "constraints": constraints,
        "status": "draft",
        "startBranch": start_branch,
        "targetBranch": target_branch,
        "branch": None,
        "tasks": [],
        "workLog": [],
        "questions": [],
        "completion": None,
    }
    append_worklog(goal, "status", "goal created (draft)")
    with goals_lock():
        atomic_write_json(goal_path(goal["id"]), goal)
    return goal


def goal_summary(goal):
    questions = goal.get("questions") or []
    return {
        "id": goal.get("id"),
        "objective": (goal.get("objective") or "")[:SUMMARY_CHARS],
        "status": goal.get("status"),
        "branch": goal.get("branch"),
        "taskCount": len(goal.get("tasks") or []),
        "pendingQuestions": sum(
            1 for q in questions if q.get("status") == "pending"
        ),
        "updatedAt": goal.get("updatedAt"),
    }


def _iter_goal_records(project=None):
    """Yield goal dicts from disk (skipping corrupt/unreadable files)."""
    d = goals_dir()
    if not d.is_dir():
        return
    for path in sorted(d.glob("*.json")):
        try:
            with open(path, encoding="utf-8") as f:
                goal = json.load(f)
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(goal, dict) or goal.get("schema") != SCHEMA:
            continue
        if project is not None and goal.get("project") != project:
            continue
        yield goal


def list_goals(project=None, status=None):
    out = []
    for goal in _iter_goal_records(project=project):
        if status is not None and goal.get("status") != status:
            continue
        out.append(goal_summary(goal))
    out.sort(key=lambda s: s.get("updatedAt") or "", reverse=True)
    return out


def task_goal_index(project):
    """taskName -> [goalId] for goals in this project (read-only cross-check)."""
    index = {}
    for goal in _iter_goal_records(project=project):
        for t in goal.get("tasks") or []:
            name = t.get("taskName")
            if name:
                index.setdefault(name, []).append(goal["id"])
    return index


def find_question(goal, question_id):
    for q in goal.get("questions") or []:
        if q.get("id") == question_id:
            return q
    raise ToolError(f"question not found: {question_id}", code="not_found")


def find_task(goal, task_name):
    for t in goal.get("tasks") or []:
        if t.get("taskName") == task_name:
            return t
    raise ToolError(f"task not found on this goal: {task_name}", code="not_found")
