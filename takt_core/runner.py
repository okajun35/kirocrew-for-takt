"""Detached `takt run`/`takt watch` launcher.

The bot can start the TAKT runner itself so the user never has to.
Each spawn is a detached OS process; the registry under
`data/runner/<key>.json` only records pid/log path — the MCP server
stays stateless (the record is re-read and the pid re-probed on every
call).
"""

import hashlib
import json
import os
import signal
import subprocess
from pathlib import Path

from .util import ToolError, atomic_write_json, data_dir, now_iso

MODES = ("once", "watch")
_TAIL_LINES = 20


def _key(project: str) -> str:
    return hashlib.sha1(project.encode()).hexdigest()[:12]


def _reg_path(project: str) -> Path:
    return data_dir() / "runner" / f"{_key(project)}.json"


def _load(project: str) -> dict | None:
    p = _reg_path(project)
    try:
        d = json.loads(p.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else None
    except (OSError, json.JSONDecodeError):
        return None


def _alive(pid) -> bool:
    if not isinstance(pid, int) or pid <= 0:
        return False
    try:
        os.kill(pid, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    # A reaped-but-unwaited runner is a zombie: alive to kill(0), dead in fact.
    try:
        stat = Path(f"/proc/{pid}/stat").read_text()
        if stat.rsplit(")", 1)[-1].split()[0] == "Z":
            return False
    except OSError:
        pass
    return True


def _tail(path: str | None) -> list[str]:
    if not path:
        return []
    try:
        lines = Path(path).read_text(
            encoding="utf-8", errors="replace"
        ).splitlines()
        return lines[-_TAIL_LINES:]
    except OSError:
        return []


def status(project: str) -> dict:
    rec = _load(project)
    if not rec:
        return {"running": False, "runner": None}
    alive = _alive(rec.get("pid"))
    return {
        "running": alive,
        "runner": {
            "pid": rec.get("pid"),
            "mode": rec.get("mode"),
            "startedAt": rec.get("startedAt"),
            "log": rec.get("log"),
            "logTail": _tail(rec.get("log")),
            "exited": not alive,
        },
    }


def start(project: str, takt_bin: str, mode: str = "once") -> dict:
    if mode not in MODES:
        raise ToolError(f"mode must be one of {MODES}")
    st = status(project)
    if st["running"]:
        raise ToolError(
            f"a takt runner is already running for this project "
            f"(pid {st['runner']['pid']})", code="conflict"
        )
    runner_dir = data_dir() / "runner"
    runner_dir.mkdir(parents=True, exist_ok=True)
    log = runner_dir / f"{_key(project)}.log"
    logf = open(log, "ab", buffering=0)
    argv = [takt_bin, "watch" if mode == "watch" else "run"]
    try:
        proc = subprocess.Popen(
            argv,
            cwd=project,
            stdin=subprocess.DEVNULL,
            stdout=logf,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
    except OSError as e:
        logf.close()
        raise ToolError(f"failed to start takt: {e}")
    logf.close()
    rec = {
        "pid": proc.pid,
        "mode": mode,
        "project": project,
        "argv": argv,
        "log": str(log),
        "startedAt": now_iso(),
    }
    atomic_write_json(_reg_path(project), rec)
    return {"pid": proc.pid, "mode": mode, "log": str(log), **status(project)}


def stop(project: str) -> dict:
    rec = _load(project)
    pid = (rec or {}).get("pid")
    if not _alive(pid):
        return {"stopped": False, "reason": "not running"}
    try:
        os.kill(pid, signal.SIGTERM)
    except OSError as e:
        raise ToolError(f"failed to stop runner pid {pid}: {e}")
    return {"stopped": True, "pid": pid}
