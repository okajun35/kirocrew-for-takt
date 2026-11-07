"""Shared helpers for for-takt: input validation, atomic writes, locking, git execution."""

import fcntl
import json
import os
import subprocess
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path


class ToolError(Exception):
    """An error whose message is safe to return to the MCP client.

    ``code`` is a coarse category the HTTP backend maps to a status:
    bad_request (400), not_found (404), conflict (409). The MCP server
    ignores it and always reports isError.
    """

    def __init__(self, message, code="bad_request"):
        super().__init__(message)
        self.code = code


MAX_STRING_BYTES = 128 * 1024
APP_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR_ENV = "FOR_TAKT_DATA_DIR"


def data_dir() -> Path:
    override = os.environ.get(DATA_DIR_ENV)
    if override:
        return Path(override)
    return APP_ROOT / "data"


def goals_dir() -> Path:
    return data_dir() / "goals"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def new_id() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# argument validation
# ---------------------------------------------------------------------------

def check_str(value, field):
    if not isinstance(value, str):
        raise ToolError(f"{field} must be a string")
    if len(value.encode("utf-8")) > MAX_STRING_BYTES:
        raise ToolError(f"{field} exceeds {MAX_STRING_BYTES} bytes")
    return value


def str_arg(args, name, required=False, default=None):
    v = args.get(name)
    if v is None:
        if required:
            raise ToolError(f"missing required argument: {name}")
        return default
    return check_str(v, name)


def str_list_arg(args, name, required=False, default=None):
    v = args.get(name)
    if v is None:
        if required:
            raise ToolError(f"missing required argument: {name}")
        return default
    if not isinstance(v, list):
        raise ToolError(f"{name} must be an array of strings")
    return [check_str(x, name) for x in v]


def int_arg(args, name, required=False, default=None):
    v = args.get(name)
    if v is None:
        if required:
            raise ToolError(f"missing required argument: {name}")
        return default
    if not isinstance(v, int) or isinstance(v, bool):
        raise ToolError(f"{name} must be an integer")
    return v


def bool_arg(args, name, required=False, default=None):
    v = args.get(name)
    if v is None:
        if required:
            raise ToolError(f"missing required argument: {name}")
        return default
    if not isinstance(v, bool):
        raise ToolError(f"{name} must be a boolean")
    return v


def check_expected_revision(goal, args):
    expected = args.get("expectedRevision")
    if expected is not None:
        if not isinstance(expected, int) or isinstance(expected, bool):
            raise ToolError("expectedRevision must be an integer")
        if expected != goal["revision"]:
            raise ToolError(
                f"revision mismatch: expected {expected}, current {goal['revision']}",
                code="conflict",
            )


# ---------------------------------------------------------------------------
# atomic JSON writes under a flock
# ---------------------------------------------------------------------------

@contextmanager
def goals_lock():
    d = goals_dir()
    d.mkdir(parents=True, exist_ok=True)
    lock_path = d / ".lock"
    with open(lock_path, "a") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def atomic_write_json(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f"{path.name}.tmp.{os.getpid()}")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
        f.write("\n")
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


# ---------------------------------------------------------------------------
# git execution
# ---------------------------------------------------------------------------

def git_env():
    env = dict(os.environ)
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["LC_ALL"] = "C"
    return env


def run_git(project, args, check=True, timeout=60):
    cmd = ["git", "-C", str(project), "-c", "commit.gpgSign=false", *args]
    try:
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, env=git_env()
        )
    except FileNotFoundError:
        raise ToolError("git executable not found on PATH")
    except subprocess.TimeoutExpired:
        raise ToolError(f"git {' '.join(args)} timed out after {timeout}s")
    if check and proc.returncode != 0:
        detail = proc.stderr.strip() or proc.stdout.strip()
        raise ToolError(f"git {' '.join(args)} failed: {detail}")
    return proc


def git_out(project, args, **kw):
    return run_git(project, args, **kw).stdout.strip()


def validate_project(project):
    """project must be an absolute path equal to the git top level."""
    check_str(project, "project")
    if not os.path.isabs(project):
        raise ToolError("project must be an absolute path")
    proc = run_git(project, ["rev-parse", "--show-toplevel"], check=False)
    if proc.returncode != 0:
        raise ToolError(f"not a git repository: {project}")
    top = os.path.realpath(proc.stdout.strip())
    if top != os.path.realpath(project):
        raise ToolError(f"project must be the git top level: {top}")
    return top


def validate_branch(project, name, field="branch"):
    check_str(name, field)
    if name.startswith("-"):
        raise ToolError(f"{field} must not start with '-'")
    proc = run_git(project, ["check-ref-format", "--branch", name], check=False)
    if proc.returncode != 0:
        raise ToolError(f"invalid {field} name: {name}")
    return name


def resolve_commit(project, rev, field="revision"):
    """Resolve a revision to a commit SHA."""
    check_str(rev, field)
    if rev.startswith("-"):
        raise ToolError(f"{field} must not start with '-'")
    proc = run_git(
        project, ["rev-parse", "--verify", "--quiet", f"{rev}^{{commit}}"], check=False
    )
    if proc.returncode != 0:
        raise ToolError(f"cannot resolve {field}: {rev}")
    return proc.stdout.strip().splitlines()[0]


def resolve_commit_quiet(project, rev):
    """Like resolve_commit but returns None instead of raising."""
    try:
        return resolve_commit(project, rev)
    except ToolError:
        return None


def current_branch(project):
    proc = run_git(project, ["symbolic-ref", "--quiet", "--short", "HEAD"], check=False)
    if proc.returncode != 0:
        raise ToolError("HEAD is detached; pass startBranch explicitly")
    return proc.stdout.strip()
