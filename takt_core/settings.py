"""App-owned settings (data/settings.json).

Small flock-protected JSON document, same pattern as projects.py. Today it
carries only `taktMcpPath` — an optional absolute path pinning the takt-mcp
binary, checked before PATH/nvm discovery by takt_bridge.find_takt_mcp.
"""

import fcntl
import os
from contextlib import contextmanager
from pathlib import Path

from .util import ToolError, atomic_write_json, check_str, data_dir

SCHEMA = "for-takt.settings/v1"


def _settings_path():
    return data_dir() / "settings.json"


def _lock_path():
    return data_dir() / "settings.lock"


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
        import json

        with open(_settings_path(), encoding="utf-8") as f:
            doc = json.load(f)
    except FileNotFoundError:
        return {}
    except (OSError, ValueError) as e:
        raise ToolError(f"cannot read settings.json: {e}")
    if not isinstance(doc, dict) or doc.get("schema") != SCHEMA:
        raise ToolError("corrupt settings.json")
    return {k: v for k, v in doc.items() if k != "schema"}


def _store(doc):
    doc = dict(doc)
    doc["schema"] = SCHEMA
    atomic_write_json(_settings_path(), doc)


def get_settings():
    """The stored settings as a plain dict ({} when absent)."""
    with _lock():
        return _load()


def get_takt_mcp_path():
    """Pinned takt-mcp path, or None when unset."""
    v = get_settings().get("taktMcpPath")
    return v if isinstance(v, str) and v else None


def set_takt_mcp_path(path):
    """Pin (absolute executable path) or clear (None) the takt-mcp binary."""
    if path is not None:
        check_str(path, "path")
        p = os.path.realpath(os.path.expanduser(path))
        if not os.path.isabs(p):
            raise ToolError("path must be absolute")
        if not (os.path.isfile(p) and os.access(p, os.X_OK)):
            raise ToolError(f"not an executable file: {p}")
        value = p
    else:
        value = None
    with _lock():
        doc = _load()
        if value is None:
            doc.pop("taktMcpPath", None)
        else:
            doc["taktMcpPath"] = value
        _store(doc)
    return value
