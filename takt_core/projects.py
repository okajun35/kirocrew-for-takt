"""Project registry: the repositories the dashboard may read.

Stored in data/projects.json under a flock; every entry is the realpath
of a git top level (the same validation as the MCP tools' project arg).
The dashboard's `project` parameters must resolve to one of these so the
UI cannot be aimed at arbitrary paths.
"""

import fcntl
import json
import os
from contextlib import contextmanager
from pathlib import Path

from .util import (
    ToolError,
    atomic_write_json,
    check_str,
    data_dir,
    validate_project,
)

SCHEMA = "for-takt.projects/v1"
MAX_PROJECTS = 50


def _projects_path():
    return data_dir() / "projects.json"


def _lock_path():
    return data_dir() / "projects.lock"


@contextmanager
def _lock():
    data_dir().mkdir(parents=True, exist_ok=True)
    with open(_lock_path(), "a") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            yield
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)


def _load():
    try:
        with open(_projects_path(), encoding="utf-8") as f:
            doc = json.load(f)
    except FileNotFoundError:
        return []
    except (OSError, json.JSONDecodeError) as e:
        raise ToolError(f"cannot read projects.json: {e}")
    if (
        not isinstance(doc, dict)
        or doc.get("schema") != SCHEMA
        or not isinstance(doc.get("projects"), list)
    ):
        raise ToolError("corrupt projects.json")
    return [p for p in doc["projects"] if isinstance(p, str)]


def _key(project):
    """Canonical comparison key for a project path."""
    return os.path.realpath(project)


def add_project(project):
    """Validate project (absolute git top level) and register it.

    Returns the canonical path that was stored.
    """
    top = validate_project(project)
    with _lock():
        projs = _load()
        if top in projs:
            return top
        if len(projs) >= MAX_PROJECTS:
            raise ToolError(f"project limit reached ({MAX_PROJECTS})")
        projs.append(top)
        atomic_write_json(
            _projects_path(), {"schema": SCHEMA, "projects": projs}
        )
    return top


def remove_project(project):
    """Unregister a project. Goal records are never touched."""
    check_str(project, "project")
    key = _key(project)
    with _lock():
        projs = _load()
        if key in projs:
            projs.remove(key)
            atomic_write_json(
                _projects_path(), {"schema": SCHEMA, "projects": projs}
            )


def list_projects():
    """[{path, name, hasTakt, missing?}] in registration order."""
    with _lock():
        projs = _load()
    out = []
    for p in projs:
        entry = {
            "path": p,
            "name": os.path.basename(p.rstrip(os.sep)) or p,
            "hasTakt": (Path(p) / ".takt").is_dir(),
        }
        if not os.path.isdir(p):
            entry["missing"] = True
        out.append(entry)
    return out


def require_registered(project):
    """Return the stored project path, or ToolError when not registered."""
    check_str(project, "project")
    if not os.path.isabs(project):
        raise ToolError("project must be an absolute path")
    key = _key(project)
    with _lock():
        projs = _load()
    if key not in projs:
        raise ToolError(f"project is not registered: {project}")
    return key
