"""Shared helpers for backend tests: path setup, temp repos, fake ctx."""

import importlib
import json
import logging
import os
import subprocess
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

from aiohttp import streams, web
from aiohttp.test_utils import make_mocked_request

TEST_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TEST_DIR)
APP_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.insert(0, APP_ROOT)

from takt_core.util import ToolError  # noqa: E402

# The gateway loads backend modules into a synthetic package rooted at the
# app dir, which is what makes `from ..takt_core import ...` resolvable.
# Mirror kiro_crew.apps.module_loader's shape so tests exercise the same
# import layout the gateway will use.
SYNTH_ROOT = "_kirocrew_app_for-takt"


def load_app_module(dotted):
    if SYNTH_ROOT not in sys.modules:
        root = types.ModuleType(SYNTH_ROOT)
        root.__path__ = [APP_ROOT]
        sys.modules[SYNTH_ROOT] = root
    return importlib.import_module(f"{SYNTH_ROOT}.{dotted}")


def git(repo, *args, check=True):
    proc = subprocess.run(
        ["git", "-C", str(repo), *args], capture_output=True, text=True
    )
    if check and proc.returncode != 0:
        raise AssertionError(
            f"git {' '.join(args)} failed: {proc.stderr} {proc.stdout}"
        )
    return proc


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
    (path / "a.txt").write_text("base\n")
    git(path, "add", "a.txt")
    git(path, "commit", "-m", "initial")
    return path


def get_req(path, user="test-user", app=""):
    req = make_mocked_request("GET", path)
    req["user"] = user
    req["app"] = app
    return req


def post_req(path, body, user="test-user", app=""):
    payload = streams.StreamReader(protocol=mock.Mock(), limit=2**16)
    payload.feed_data(json.dumps(body).encode("utf-8"))
    payload.feed_eof()
    req = make_mocked_request(
        "POST",
        path,
        headers={"Content-Type": "application/json"},
        payload=payload,
    )
    req["user"] = user
    req["app"] = app
    return req


class FakeCtx:
    """Minimal stand-in for the app context a routes handler receives."""

    def __init__(self, owner_response=None):
        self.owner_response = owner_response
        self.owner_calls = []
        self.logger = logging.getLogger("for-takt-test")

    async def require_owner(self, request, op):
        self.owner_calls.append(op)
        return self.owner_response


def no_gate_ctx():
    """A ctx object that predates ctx.require_owner (must fail closed)."""
    return type("NoGate", (), {"logger": logging.getLogger("for-takt-test")})()


async def call(handler, request, ctx):
    resp = await handler(request, ctx)
    text = resp.text
    try:
        parsed = json.loads(text) if text else None
    except json.JSONDecodeError:
        parsed = None
    return resp, parsed


class BackendTestCase(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.data_dir = os.path.join(self.tmp.name, "data")
        os.environ["FOR_TAKT_DATA_DIR"] = self.data_dir
        self.addCleanup(
            lambda: os.environ.pop("FOR_TAKT_DATA_DIR", None)
        )
        self.repo = str(make_repo(os.path.join(self.tmp.name, "repo")))
        self.ctx = FakeCtx()


def denied_403():
    return web.json_response(
        {"error": "owner only", "code": "owner_only"}, status=403
    )
