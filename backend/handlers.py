"""Dashboard route handlers (DESIGN-ui §3).

Handlers run on the gateway event loop: every file read, git call and
takt-mcp bridge call goes through asyncio.to_thread. Every GET requires
an authenticated subject (request["user"]); every POST is owner-gated via
ctx.require_owner, and app tokens are refused outright — nothing in this
app mints a token that should mutate.
"""

import asyncio
import json
import logging

from aiohttp import web

from ..takt_core import (
    goals,
    gitops,
    hostsec,
    projects,
    settings,
    takt_bridge,
    takt_files,
)
from ..takt_core.util import ToolError, int_arg, now_iso, str_arg

#: Largest accepted request body (reasons and answers are the big fields).
MAX_BODY_BYTES = 1 << 20

_STATUS_BY_CODE = {
    "bad_request": 400,
    "unauthorized": 401,
    "owner_only": 403,
    "app_token_forbidden": 403,
    "sensitive_path": 403,
    "not_found": 404,
    "conflict": 409,
}


def _json(obj, status=200):
    return web.json_response(
        obj,
        status=status,
        dumps=lambda o: json.dumps(o, ensure_ascii=False, default=str),
    )


def _tool_error(err):
    code = getattr(err, "code", "bad_request")
    return _json(
        {"error": str(err), "code": code},
        status=_STATUS_BY_CODE.get(code, 400),
    )


def _internal(err, ctx):
    logger = getattr(ctx, "logger", None) or logging.getLogger("for-takt")
    logger.error("for-takt handler failed: %s", err, exc_info=True)
    return _json(
        {"error": "内部エラーが発生しました", "code": "internal"}, status=500
    )


def _query(request, name, required=False):
    v = request.query.get(name)
    if v is None and required:
        raise ToolError(f"missing query parameter: {name}")
    return v


def _registered_project(request):
    """The project query param must resolve to a registered project."""
    return projects.require_registered(
        _query(request, "project", required=True)
    )


async def _body(request):
    length = request.content_length
    if length is not None and int(length) > MAX_BODY_BYTES:
        raise ToolError(
            f"request body exceeds {MAX_BODY_BYTES} bytes", code="bad_request"
        )
    try:
        data = await request.json()
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise ToolError("request body must be JSON")
    if not isinstance(data, dict):
        raise ToolError("request body must be a JSON object")
    return data


async def _guard(request, ctx, op):
    """Owner gate for writes; returns the response to send, or None."""
    if request.get("app"):
        return _json(
            {
                "error": "app tokens cannot perform this operation",
                "code": "app_token_forbidden",
            },
            status=403,
        )
    gate = getattr(ctx, "require_owner", None)
    if gate is None:
        return _json(
            {"error": "オーナー権限が必要です", "code": "owner_only"},
            status=403,
        )
    return await gate(request, op)


def _handle(fn):
    """Wrap a sync reader: authenticate, run it in a worker, map errors."""

    async def handler(request, ctx):
        if not str(request.get("user") or ""):
            return _json(
                {"error": "authentication required", "code": "unauthorized"},
                status=401,
            )
        try:
            return _json(await asyncio.to_thread(fn, request))
        except ToolError as e:
            return _tool_error(e)
        except Exception as e:
            return _internal(e, ctx)

    handler.__kirocrew_authenticated__ = True
    handler.__kirocrew_owner_only__ = False
    return handler


def _handle_post(fn, op):
    """Wrap a sync writer behind the owner gate."""

    async def handler(request, ctx):
        denied = await _guard(request, ctx, op)
        if denied is not None:
            return denied
        try:
            body = await _body(request)
            return _json(await asyncio.to_thread(fn, body))
        except ToolError as e:
            return _tool_error(e)
        except Exception as e:
            return _internal(e, ctx)

    handler.__kirocrew_authenticated__ = True
    handler.__kirocrew_owner_only__ = True
    return handler


# ---------------------------------------------------------------------------
# health
# ---------------------------------------------------------------------------

async def health(request, ctx):
    """Route-registration check plus tool availability. Cheap and sync-only."""
    if not str(request.get("user") or ""):
        return _json(
            {"error": "authentication required", "code": "unauthorized"},
            status=401,
        )

    def build():
        out = {"ok": True, "name": "for-takt"}
        try:
            out["taktMcp"] = takt_bridge.find_takt_mcp()
        except Exception as e:
            out["taktMcp"] = None
            out["taktMcpError"] = str(e)
        try:
            out["projects"] = len(projects.list_projects())
        except Exception:
            out["projects"] = None
        return out

    try:
        result = await asyncio.to_thread(build)
    except Exception as e:
        return _internal(e, ctx)
    result["sdkLevel"] = getattr(ctx, "sdk_level", None)
    return _json(result)


health.__kirocrew_authenticated__ = True
health.__kirocrew_owner_only__ = False


# ---------------------------------------------------------------------------
# projects
# ---------------------------------------------------------------------------

@_handle
def list_projects(request):
    return {"projects": projects.list_projects()}


def _add_project(body):
    from ..takt_core.util import validate_project

    top = validate_project(str_arg(body, "path", required=True))
    if hostsec.is_sensitive(top):
        raise ToolError(
            f"project path is protected: {top}", code="sensitive_path"
        )
    projects.add_project(top)
    return {"projects": projects.list_projects()}


def _remove_project(body):
    projects.remove_project(str_arg(body, "path", required=True))
    return {"projects": projects.list_projects()}


add_project = _handle_post(_add_project, "project_add")
remove_project = _handle_post(_remove_project, "project_remove")


# ---------------------------------------------------------------------------
# settings (takt-mcp binary pin)
# ---------------------------------------------------------------------------

def _settings_view():
    out = {"settings": settings.get_settings()}
    try:
        out["taktMcp"] = takt_bridge.resolve_takt_mcp()
    except ToolError as e:
        out["taktMcp"] = {
            "path": None,
            "source": None,
            "pinned": settings.get_takt_mcp_path(),
            "error": str(e),
        }
    return out


@_handle
def get_settings(request):
    return _settings_view()


def _set_takt_mcp(body):
    if "path" not in body or (
        body["path"] is not None and not isinstance(body["path"], str)
    ):
        raise ToolError("path must be an absolute path or null")
    settings.set_takt_mcp_path(body["path"])
    return _settings_view()


set_takt_mcp = _handle_post(_set_takt_mcp, "settings_takt_mcp")


# ---------------------------------------------------------------------------
# goals
# ---------------------------------------------------------------------------

@_handle
def list_goals(request):
    project = _query(request, "project")
    if project is not None:
        project = projects.require_registered(project)
    status = _query(request, "status")
    if status is not None and status not in goals.STATUSES:
        raise ToolError(f"unknown status: {status}")
    return {"goals": goals.list_goals(project=project, status=status)}


@_handle
def get_goal(request):
    return goals.load_goal(_query(request, "id", required=True))


def _set_goal_status(body):
    goal_id = str_arg(body, "id", required=True)
    status = str_arg(body, "status", required=True)
    reason = str_arg(body, "reason", required=True)
    expected = int_arg(body, "expectedRevision")
    # The UI may only pause/resume; other transitions stay with the bot.
    if status not in ("active", "paused"):
        raise ToolError(f"status must be 'active' or 'paused' (got: {status})")

    def mut(goal):
        current = goal["status"]
        goals.check_transition(current, status)
        if status == "active":
            goal["branch"] = gitops.ensure_goal_branch(goal["project"], goal)
        goal["status"] = status
        goals.append_worklog(
            goal, "status", f"{current} -> {status}: {reason}"
        )

    return goals.update_goal(goal_id, expected, mut)


def _answer_question(body):
    goal_id = str_arg(body, "id", required=True)
    question_id = str_arg(body, "questionId", required=True)
    answer = str_arg(body, "answer", required=True)
    expected = int_arg(body, "expectedRevision")

    def mut(goal):
        q = goals.find_question(goal, question_id)
        if q.get("status") != "pending":
            raise ToolError(
                f"question is {q.get('status')}, not pending", code="conflict"
            )
        q["status"] = "answered"
        q["answer"] = answer
        q["answeredAt"] = now_iso()

    return goals.update_goal(goal_id, expected, mut)


set_goal_status = _handle_post(_set_goal_status, "goal_status")
answer_question = _handle_post(_answer_question, "goal_answer")


# ---------------------------------------------------------------------------
# .takt readers (read-only)
# ---------------------------------------------------------------------------

@_handle
def takt_tasks(request):
    return takt_files.list_tasks(_registered_project(request))


@_handle
def takt_run(request):
    return takt_files.run_detail(
        _registered_project(request), _query(request, "slug", required=True)
    )


@_handle
def takt_run_log(request):
    raw = _query(request, "offset")
    offset = 0
    if raw is not None:
        try:
            offset = int(raw)
        except ValueError:
            raise ToolError("offset must be an integer")
        if offset < 0:
            raise ToolError("offset must be a non-negative integer")
    return takt_files.run_log(
        _registered_project(request),
        _query(request, "slug", required=True),
        offset,
    )


@_handle
def takt_run_report(request):
    return takt_files.report(
        _registered_project(request),
        _query(request, "slug", required=True),
        _query(request, "name", required=True),
    )


@_handle
def takt_goal_files(request):
    return takt_bridge.takt_goal_files(_registered_project(request))
