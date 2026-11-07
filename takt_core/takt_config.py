"""Read (and narrowly write) TAKT config.yaml files.

Global `~/.takt/config.yaml` is TAKT-owned but editable through the
dashboard for a small whitelist of scalar keys (provider/model/language)
— always with a `.bak` backup and an mtime-based revision check so an
external edit is never silently overwritten. The per-project
`<repo>/.takt/config.yaml` stays strictly read-only like the rest of
`.takt/`.
"""

import os
import re
import shutil
import stat
from pathlib import Path

import yaml

from .util import ToolError

#: Scalar top-level keys the dashboard may write to ~/.takt/config.yaml.
WRITABLE_KEYS = ("provider", "model", "language")
_VALUE_RE = re.compile(r"^[A-Za-z0-9_.\-/]+$")
MAX_VALUE_LEN = 200


def global_config_path() -> Path:
    return Path.home() / ".takt" / "config.yaml"


def project_config_path(project: Path) -> Path:
    return Path(project) / ".takt" / "config.yaml"


def _read(path: Path) -> dict:
    """Return {exists, config, error?} — regular-file only, no symlinks."""
    out = {"path": str(path), "exists": False, "config": {}}
    try:
        st = path.lstat()
    except FileNotFoundError:
        return out
    if not stat.S_ISREG(st.st_mode):
        out["error"] = "not a regular file"
        return out
    out["exists"] = True
    try:
        data = yaml.safe_load(
            path.read_text(encoding="utf-8", errors="replace")
        )
        out["config"] = data if isinstance(data, dict) else {}
    except (OSError, yaml.YAMLError) as e:
        out["error"] = f"unreadable config: {e}"
    return out


def revision(path: Path):
    """mtime_ns:size token for optimistic write checks, or None."""
    try:
        st = path.stat()
    except OSError:
        return None
    return f"{st.st_mtime_ns}:{st.st_size}"


def config_view(project: Path | None) -> dict:
    proj = {"path": None, "exists": False, "config": {}}
    if project is not None:
        proj = _read(project_config_path(project))
    gpath = global_config_path()
    return {
        "global": _read(gpath),
        "project": proj,
        "writableKeys": list(WRITABLE_KEYS),
        "revision": revision(gpath),
    }


def write_global(changes: dict, expected_revision) -> dict:
    """Apply whitelisted scalar changes to ~/.takt/config.yaml.

    `changes` maps key -> value (str/int/bool) or None to delete the key.
    """
    if not isinstance(changes, dict) or not changes:
        raise ToolError("changes must be a non-empty object")
    for k in changes:
        if k not in WRITABLE_KEYS:
            raise ToolError(f"key is not writable: {k}")
    path = global_config_path()
    if revision(path) != expected_revision:
        raise ToolError(
            "config changed on disk; reload before editing", code="conflict"
        )
    state = _read(path)
    if "error" in state:
        raise ToolError(state["error"])
    cfg = dict(state["config"])
    for k, v in changes.items():
        if v is None:
            cfg.pop(k, None)
            continue
        if not isinstance(v, (str, int, float, bool)):
            raise ToolError(f"invalid value type for {k}")
        s = str(v)
        if len(s) > MAX_VALUE_LEN or (
            isinstance(v, str) and not _VALUE_RE.match(s)
        ):
            raise ToolError(f"invalid value for {k}")
        cfg[k] = v
    if path.exists():
        shutil.copy2(path, path.with_suffix(path.suffix + ".bak"))
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    tmp.write_text(
        yaml.safe_dump(cfg, allow_unicode=True, sort_keys=False),
        encoding="utf-8",
    )
    os.replace(tmp, path)
    return {"revision": revision(path), "config": cfg}
