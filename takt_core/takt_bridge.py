"""takt-mcp bridge and read-only .takt inspection.

Each tool call spawns `takt-mcp --tool-set all` with cwd=<project> (the
allowed-project root is fixed at process start), performs the MCP
handshake, issues one tools/call, then shuts the process down.
"""

import glob
import json
import os
import queue
import re
import shutil
import subprocess
import threading
import time
from pathlib import Path

from .util import ToolError

TAKT_MCP_ENV = "TAKT_MCP_BIN"
CALL_TIMEOUT = 60
PROTOCOL_VERSION = "2025-06-18"
_CLIENT = {"name": "for-takt", "version": "0.2.0"}
_STDERR_TAIL = 20


def _version_key(path):
    m = re.search(r"node/v?(\d+)\.(\d+)\.(\d+)", path)
    return tuple(int(x) for x in m.groups()) if m else (0, 0, 0)


def _nvm_candidates():
    candidates = glob.glob(
        os.path.expanduser("~/.nvm/versions/node/*/bin/takt-mcp")
    )
    candidates = [c for c in candidates if os.access(c, os.X_OK)]
    candidates.sort(key=_version_key, reverse=True)
    return candidates


_NOT_FOUND = (
    "takt-mcp not found. Install TAKT (npm i -g takt), put takt-mcp on "
    "PATH, pin its path in the app settings, or set TAKT_MCP_BIN."
)


def find_takt_mcp():
    """Resolve the takt-mcp binary.

    Order: the app setting (data/settings.json `taktMcpPath`, settable from
    the dashboard) → $TAKT_MCP_BIN → PATH → newest nvm install. A pinned or
    env-var path that is not executable is an error, not a fallback.
    """
    return _resolve()["path"]


def resolve_takt_mcp():
    """Like find_takt_mcp but reports which source produced the path."""
    return _resolve()


def _resolve():
    try:
        from . import settings

        pinned = settings.get_takt_mcp_path()
    except Exception:  # pragma: no cover - settings unreadable
        pinned = None
    if pinned:
        if os.path.isfile(pinned) and os.access(pinned, os.X_OK):
            return {"path": pinned, "source": "settings", "pinned": pinned}
        raise ToolError(
            f"configured taktMcpPath is not an executable file: {pinned}"
        )
    env_bin = os.environ.get(TAKT_MCP_ENV)
    if env_bin:
        if os.path.isfile(env_bin) and os.access(env_bin, os.X_OK):
            return {"path": env_bin, "source": TAKT_MCP_ENV, "pinned": pinned}
        raise ToolError(
            f"{TAKT_MCP_ENV} is set but not an executable file: {env_bin}"
        )
    found = shutil.which("takt-mcp")
    if found:
        return {"path": found, "source": "PATH", "pinned": pinned}
    candidates = _nvm_candidates()
    if candidates:
        return {"path": candidates[0], "source": "nvm", "pinned": pinned}
    raise ToolError(_NOT_FOUND)


def _drain(stream, buf):
    try:
        for line in stream:
            buf.append(line)
            if len(buf) > _STDERR_TAIL:
                del buf[: len(buf) - _STDERR_TAIL]
    except (OSError, ValueError):
        pass


def _pump(stream, q):
    try:
        for line in stream:
            q.put(line)
    except (OSError, ValueError):
        pass
    finally:
        q.put(None)


class _McpProcess:
    def __init__(self, binary, project):
        env = dict(os.environ)
        env["PATH"] = (
            os.path.dirname(binary) + os.pathsep + env.get("PATH", "")
        )
        try:
            self.proc = subprocess.Popen(
                [binary, "--tool-set", "all"],
                cwd=project,
                env=env,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                encoding="utf-8",
                errors="replace",
                bufsize=1,
            )
        except OSError as e:
            raise ToolError(f"cannot start takt-mcp: {e}")
        self.stderr_buf = []
        self.lines = queue.Queue()
        threading.Thread(
            target=_drain, args=(self.proc.stderr, self.stderr_buf), daemon=True
        ).start()
        threading.Thread(
            target=_pump, args=(self.proc.stdout, self.lines), daemon=True
        ).start()

    def _stderr_tail(self):
        tail = "".join(self.stderr_buf).strip()
        return f"; stderr: {tail}" if tail else ""

    def send(self, obj):
        try:
            self.proc.stdin.write(json.dumps(obj) + "\n")
            self.proc.stdin.flush()
        except (BrokenPipeError, OSError):
            raise ToolError(
                "takt-mcp closed stdin unexpectedly" + self._stderr_tail()
            )

    def wait_response(self, req_id, deadline):
        while True:
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise ToolError("takt-mcp call timed out")
            try:
                line = self.lines.get(timeout=remaining)
            except queue.Empty:
                raise ToolError("takt-mcp call timed out")
            if line is None:
                raise ToolError(
                    "takt-mcp exited unexpectedly" + self._stderr_tail()
                )
            try:
                msg = json.loads(line)
            except json.JSONDecodeError:
                continue
            if msg.get("id") == req_id:
                return msg

    def close(self):
        proc = self.proc
        try:
            if proc.stdin:
                proc.stdin.close()
        except (BrokenPipeError, OSError):
            pass
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            proc.kill()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                pass
        for stream in (proc.stdout, proc.stderr):
            try:
                if stream:
                    stream.close()
            except OSError:
                pass


def call_tool(project, name, arguments, timeout=CALL_TIMEOUT):
    """Spawn takt-mcp in <project>, call one tool, return its payload.

    content[0].text is parsed as JSON when possible and returned as the
    raw string otherwise. An isError result is raised as ToolError so the
    caller's tool response also carries isError.
    """
    binary = find_takt_mcp()
    mcp = _McpProcess(binary, project)
    deadline = time.monotonic() + timeout
    try:
        mcp.send(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "protocolVersion": PROTOCOL_VERSION,
                    "capabilities": {},
                    "clientInfo": _CLIENT,
                },
            }
        )
        init = mcp.wait_response(1, deadline)
        if "error" in init:
            raise ToolError(
                f"takt-mcp initialize failed: "
                f"{init['error'].get('message', init['error'])}"
            )
        mcp.send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        mcp.send(
            {
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/call",
                "params": {"name": name, "arguments": arguments},
            }
        )
        resp = mcp.wait_response(2, deadline)
    finally:
        mcp.close()

    if "error" in resp:
        err = resp["error"]
        raise ToolError(f"takt-mcp {name} failed: {err.get('message', err)}")
    result = resp.get("result") or {}
    content = result.get("content") or []
    text = ""
    if content and isinstance(content[0], dict):
        text = content[0].get("text", "")
    if result.get("isError"):
        raise ToolError(f"takt-mcp {name}: {text}")
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return text


def takt_goal_files(project):
    """Read .takt/goals/*/goal.json summaries. Read-only."""
    root = Path(project) / ".takt" / "goals"
    goals = []
    if root.is_dir():
        for goal_file in sorted(root.glob("*/goal.json")):
            entry = {"path": goal_file.relative_to(project).as_posix()}
            try:
                with open(goal_file, encoding="utf-8") as f:
                    g = json.load(f)
                objective = g.get("objective")
                entry.update(
                    {
                        "id": g.get("id"),
                        "objective": objective[:200]
                        if isinstance(objective, str)
                        else objective,
                        "status": g.get("status"),
                        "executionStatus": g.get("executionStatus"),
                        "branch": g.get("branch") or g.get("integrationBranch"),
                    }
                )
            except (OSError, json.JSONDecodeError) as e:
                entry["error"] = str(e)
            goals.append(entry)
    return {"goals": goals}
