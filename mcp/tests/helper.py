"""Shared test helpers: path setup, temp git repos, MCP tool invocation."""

import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

TEST_DIR = os.path.dirname(os.path.abspath(__file__))
MCP_DIR = os.path.dirname(TEST_DIR)
APP_ROOT = os.path.dirname(MCP_DIR)
sys.path.insert(0, MCP_DIR)
sys.path.insert(0, APP_ROOT)

from takt_core import util as ft_util  # noqa: E402
from takt_core.util import ToolError  # noqa: E402

SERVER_PATH = os.path.join(MCP_DIR, "server.py")


def git(repo, *args, check=True):
    proc = subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, text=True
    )
    if check and proc.returncode != 0:
        raise AssertionError(
            f"git {' '.join(args)} failed: {proc.stderr} {proc.stdout}"
        )
    return proc


def sha(repo, rev="HEAD"):
    return git(repo, "rev-parse", rev).stdout.strip()


def make_repo(path):
    path = Path(path)
    path.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["git", "init", "-b", "main", str(path)],
        check=True,
        capture_output=True,
    )
    git(path, "config", "user.email", "test@example.com")
    git(path, "config", "user.name", "test")
    git(path, "config", "commit.gpgSign", "false")
    return path


def commit_file(repo, name, content, message=None):
    p = Path(repo) / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    git(repo, "add", name)
    git(repo, "commit", "-m", message or f"update {name}")
    return sha(repo)


def mcp_call(name, arguments=None):
    """Invoke a tool through the server's dispatch; returns the parsed
    payload or raises ToolError on isError."""
    import server

    res = server._call_tool({"name": name, "arguments": arguments or {}})
    text = res["content"][0]["text"]
    if res.get("isError"):
        raise ToolError(text)
    return json.loads(text)


class ForTaktTestCase(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.data_dir = os.path.join(self.tmp.name, "data")
        os.environ["FOR_TAKT_DATA_DIR"] = self.data_dir
        self.addCleanup(
            lambda: os.environ.pop("FOR_TAKT_DATA_DIR", None)
        )
        self.repo = make_repo(os.path.join(self.tmp.name, "repo"))
        self.base_sha = commit_file(self.repo, "a.txt", "base\n", "initial")

    def create_goal(self, **overrides):
        args = {
            "project": str(self.repo),
            "objective": "test objective",
            "acceptanceCriteria": ["it works"],
        }
        args.update(overrides)
        return mcp_call("goal_create", args)

    def active_goal(self, **overrides):
        goal = self.create_goal(**overrides)
        mcp_call(
            "goal_set_status",
            {"goalId": goal["id"], "status": "active", "reason": "go"},
        )
        return mcp_call("goal_get", {"goalId": goal["id"]})
