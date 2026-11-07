"""Read-only .takt inspection for the dashboard backend (DESIGN-ui §4).

Never writes, locks, or runs TAKT. TAKT may be mid-write while we read,
so parse failures get one re-read and then a retryable error dict
instead of an exception.
"""

import json
import os
import re
from pathlib import Path

import yaml

from . import goals
from .util import ToolError

TASKS_YAML_MAX = 5 * 1024 * 1024
META_MAX = 1024 * 1024
LOG_PAGE = 64 * 1024
REPORT_MAX = 512 * 1024
RECORD_STR_MAX = 4 * 1024
STEP_LIMIT = 200

_SLUG_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
_REPORT_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*\.md$")

_STEP_TYPES = ("step_start", "step_complete", "workflow_complete", "workflow_abort")
_META_KEYS = (
    "task",
    "workflow",
    "status",
    "startTime",
    "endTime",
    "updatedAt",
    "currentStep",
    "currentIteration",
    "phase",
)

# Session-log sidecars (see takt's core/logging/contracts.ts); anything
# containing -usage-events or -otel- is also excluded per DESIGN-ui §4.2.
_SIDECAR_SUFFIXES = (
    "-prompts.jsonl",
    "-provider-events.jsonl",
    "-usage-events.jsonl",
    "-usage-events.phase.jsonl",
    "-otel-session-shadow.jsonl",
)
_SIDECAR_SUBSTRINGS = ("-usage-events", "-otel-")


def _retryable(message):
    return {"error": message, "retryable": True}


def _load_capped(path, max_bytes, what):
    with open(path, "rb") as f:
        data = f.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise ToolError(f"{what} exceeds {max_bytes} bytes")
    return data


def _parse_retry(path, parse, max_bytes, what):
    """Read + parse with one retry; returns parsed value or a retryable dict."""
    err = None
    for _ in range(2):
        try:
            return parse(_load_capped(path, max_bytes, what))
        except ToolError:
            raise
        except (OSError, ValueError, yaml.YAMLError) as e:
            err = e
    return _retryable(f"cannot read {what}: {err}")


# ---------------------------------------------------------------------------
# tasks.yaml
# ---------------------------------------------------------------------------

def _tasks_yaml_path(project):
    return Path(project) / ".takt" / "tasks.yaml"


def _load_task_records(project):
    """tasks.yaml -> list of task dicts, or a retryable error dict."""
    path = _tasks_yaml_path(project)
    if not path.exists():
        return []

    def parse(data):
        doc = yaml.safe_load(data.decode("utf-8"))
        if doc is None:
            return []
        if not isinstance(doc, dict) or not isinstance(doc.get("tasks"), list):
            raise ValueError("tasks.yaml: expected a mapping with a 'tasks' list")
        return [t for t in doc["tasks"] if isinstance(t, dict)]

    return _parse_retry(path, parse, TASKS_YAML_MAX, "tasks.yaml")


def list_tasks(project):
    """Summarize .takt/tasks.yaml + per-status counts + for-takt goalIds."""
    if not (Path(project) / ".takt").is_dir():
        return {"tasks": [], "counts": {}, "hasTakt": False}
    loaded = _load_task_records(project)
    if isinstance(loaded, dict):
        return loaded
    index = goals.task_goal_index(project)
    tasks = []
    counts = {}
    for t in loaded:
        status = t.get("status")
        counts[status] = counts.get(status, 0) + 1
        failure = t.get("failure")
        name = t.get("name")
        tasks.append(
            {
                "name": name,
                "status": status,
                "workflow": t.get("workflow"),
                "branch": t.get("branch"),
                "baseBranch": t.get("base_branch"),
                "worktree": t.get("worktree"),
                "worktreePath": t.get("worktree_path"),
                "runSlug": t.get("run_slug"),
                "createdAt": t.get("created_at"),
                "startedAt": t.get("started_at"),
                "completedAt": t.get("completed_at"),
                "failure": (
                    {"step": failure.get("step"), "error": failure.get("error")}
                    if isinstance(failure, dict)
                    else None
                ),
                "goalIds": index.get(name) or [],
            }
        )
    return {"tasks": tasks, "counts": counts, "hasTakt": True}


# ---------------------------------------------------------------------------
# run directory
# ---------------------------------------------------------------------------

def _worktree_for_slug(project, slug):
    """Absolute worktree_path of the task owning run_slug, when it is a dir."""
    loaded = _load_task_records(project)
    if not isinstance(loaded, list):
        return None
    for t in loaded:
        if t.get("run_slug") != slug:
            continue
        wt = t.get("worktree_path")
        if isinstance(wt, str) and os.path.isabs(wt) and os.path.isdir(wt):
            return wt
    return None


def _find_run_dir(project, slug):
    """Locate .takt/runs/<slug> (or the worktree fallback). Read-only."""
    if not isinstance(slug, str) or not _SLUG_RE.match(slug):
        raise ToolError(f"invalid run slug: {slug}")
    roots = [Path(project) / ".takt" / "runs"]
    wt = _worktree_for_slug(project, slug)
    if wt is not None:
        roots.append(Path(wt) / ".takt" / "runs")
    for root in roots:
        cand = root / slug
        if not cand.is_dir():
            continue
        real_root = Path(os.path.realpath(root))
        real = Path(os.path.realpath(cand))
        if real.parent != real_root or real.name != slug:
            continue  # symlink escaping the runs root: refuse
        return real
    raise ToolError(f"run not found: {slug}", code="not_found")


def _is_session_log(name):
    if not name.endswith(".jsonl"):
        return False
    if any(s in name for s in _SIDECAR_SUBSTRINGS):
        return False
    return not any(name.endswith(s) for s in _SIDECAR_SUFFIXES)


def _session_logs(run_dir):
    """Session .jsonl logs under logs/ (timestamps sort chronologically)."""
    logs_dir = run_dir / "logs"
    try:
        entries = [
            e
            for e in os.scandir(logs_dir)
            if e.is_file() and not e.is_symlink()
        ]
    except OSError:
        return []
    return [
        logs_dir / e.name for e in sorted(entries, key=lambda e: e.name)
        if _is_session_log(e.name)
    ]


def _load_meta(run_dir):
    path = run_dir / "meta.json"
    if not path.exists():
        return None

    def parse(data):
        obj = json.loads(data.decode("utf-8"))
        if not isinstance(obj, dict):
            raise ValueError("meta.json: not an object")
        return {k: obj.get(k) for k in _META_KEYS}

    return _parse_retry(path, parse, META_MAX, "meta.json")


def _step_summary(rec):
    out = {
        "type": rec.get("type"),
        "step": rec.get("step"),
        "status": rec.get("status"),
        "at": rec.get("timestamp") or rec.get("endTime"),
    }
    if rec.get("iteration") is not None:
        out["iteration"] = rec.get("iteration")
    matched = rec.get("matchedRuleIndex")
    if matched is None:
        matched = rec.get("matchedRuleMethod")
    if matched is None:
        matched = rec.get("matchMethod")
    if matched is not None:
        out["matchedRule"] = matched
    reason = rec.get("reason")
    if reason is None:
        reason = rec.get("error")
    if reason is not None:
        out["reason"] = reason
    return out


def _read_steps(log_paths):
    found = []
    for path in log_paths:
        try:
            with open(path, "r", encoding="utf-8", errors="replace") as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        rec = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if isinstance(rec, dict) and rec.get("type") in _STEP_TYPES:
                        found.append(_step_summary(rec))
        except OSError:
            continue
    return found[-STEP_LIMIT:]


def _list_reports(run_dir):
    reports_dir = run_dir / "reports"
    out = []
    try:
        entries = list(os.scandir(reports_dir))
    except OSError:
        return out
    for e in sorted(entries, key=lambda e: e.name):
        if not e.name.endswith(".md") or e.is_symlink() or not e.is_file():
            continue
        try:
            size = e.stat().st_size
        except OSError:
            continue
        out.append({"name": e.name, "size": size})
    return out


def run_detail(project, slug):
    """meta + step timeline + log/report listing for one run."""
    run = _find_run_dir(project, slug)
    meta = _load_meta(run)
    if isinstance(meta, dict) and meta.get("retryable") and "error" in meta:
        return meta
    log_paths = _session_logs(run)
    log_files = []
    for p in log_paths:
        try:
            size = p.stat().st_size
        except OSError:
            continue
        log_files.append({"name": p.name, "size": size})
    return {
        "slug": slug,
        "meta": meta,
        "steps": _read_steps(log_paths),
        "logFiles": log_files,
        "reports": _list_reports(run),
    }


# ---------------------------------------------------------------------------
# paged session log
# ---------------------------------------------------------------------------

def _truncate_strings(obj):
    if isinstance(obj, str):
        return obj[:RECORD_STR_MAX]
    if isinstance(obj, list):
        return [_truncate_strings(v) for v in obj]
    if isinstance(obj, dict):
        return {k: _truncate_strings(v) for k, v in obj.items()}
    return obj


def run_log(project, slug, offset=0):
    """Read up to LOG_PAGE bytes of the newest session log from offset."""
    run = _find_run_dir(project, slug)
    logs = _session_logs(run)
    if not logs:
        raise ToolError(f"no session log for run: {slug}", code="not_found")
    path = logs[-1]
    try:
        size = path.stat().st_size
    except OSError as e:
        raise ToolError(f"cannot stat session log: {e}", code="not_found")
    if not isinstance(offset, int) or isinstance(offset, bool) or offset < 0:
        raise ToolError("offset must be a non-negative integer")
    reset = False
    if offset > size:
        offset = 0
        reset = True
    with open(path, "rb") as f:
        f.seek(offset)
        data = f.read(LOG_PAGE)
    consumed = len(data)
    if not data.endswith(b"\n"):
        nl = data.rfind(b"\n")
        if nl >= 0:
            consumed = nl + 1
        # A single line longer than LOG_PAGE has no newline to cut at;
        # consume the whole page so the reader still moves forward.
    text = data[:consumed].decode("utf-8", errors="replace")
    records = []
    for line in text.splitlines():
        if not line:
            continue
        try:
            rec = _truncate_strings(json.loads(line))
        except json.JSONDecodeError:
            rec = {"raw": line[:RECORD_STR_MAX]}
        records.append(rec)
    next_offset = offset + consumed
    out = {
        "file": path.name,
        "offset": offset,
        "nextOffset": next_offset,
        "size": size,
        "records": records,
        "eof": next_offset >= size,
    }
    if reset:
        out["reset"] = True
    return out


# ---------------------------------------------------------------------------
# reports
# ---------------------------------------------------------------------------

def report(project, slug, name):
    """One reports/<name>.md, truncated to REPORT_MAX."""
    if not _REPORT_RE.match(name):
        raise ToolError(f"invalid report name: {name}")
    run = _find_run_dir(project, slug)
    reports_dir = run / "reports"
    cand = reports_dir / name
    if not cand.exists():
        raise ToolError(f"report not found: {name}", code="not_found")
    real = Path(os.path.realpath(cand))
    real_dir = Path(os.path.realpath(reports_dir))
    if real.parent != real_dir or real.name != name:
        raise ToolError(f"report not found: {name}", code="not_found")
    try:
        with open(real, "rb") as f:
            data = f.read(REPORT_MAX + 1)
    except OSError as e:
        raise ToolError(f"cannot read report {name}: {e}", code="not_found")
    truncated = len(data) > REPORT_MAX
    if truncated:
        data = data[:REPORT_MAX]
    return {
        "name": name,
        "text": data.decode("utf-8", errors="replace"),
        "truncated": truncated,
    }
