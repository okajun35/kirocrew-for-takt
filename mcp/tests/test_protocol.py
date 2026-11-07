"""Protocol-level tests: drive server.py as a subprocess over stdio."""

import json
import os
import queue
import subprocess
import sys
import threading

from helper import SERVER_PATH, ForTaktTestCase


class ServerProc:
    def __init__(self, data_dir):
        env = dict(os.environ)
        env["FOR_TAKT_DATA_DIR"] = data_dir
        self.proc = subprocess.Popen(
            [sys.executable, SERVER_PATH],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            env=env,
        )
        self.lines = queue.Queue()
        threading.Thread(target=self._pump, daemon=True).start()

    def _pump(self):
        for line in self.proc.stdout:
            self.lines.put(line)
        self.lines.put(None)

    def send(self, text):
        self.proc.stdin.write(text + "\n")
        self.proc.stdin.flush()

    def request(self, obj, timeout=15):
        self.send(json.dumps(obj))
        line = self.lines.get(timeout=timeout)
        self.assert_line(line)
        return json.loads(line)

    @staticmethod
    def assert_line(line):
        if line is None:
            raise AssertionError("server closed stdout unexpectedly")

    def read_json(self, timeout=15):
        line = self.lines.get(timeout=timeout)
        self.assert_line(line)
        return json.loads(line)

    def close(self):
        try:
            self.proc.stdin.close()
        except (BrokenPipeError, OSError):
            pass
        try:
            self.proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            self.proc.kill()
        try:
            self.proc.stdout.close()
        except OSError:
            pass


class ProtocolTests(ForTaktTestCase):
    def setUp(self):
        super().setUp()
        self.server = ServerProc(self.data_dir)
        self.addCleanup(self.server.close)

    def test_initialize(self):
        resp = self.server.request(
            {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {"protocolVersion": "2025-03-26", "capabilities": {}},
            }
        )
        result = resp["result"]
        self.assertEqual(result["protocolVersion"], "2025-03-26")
        self.assertEqual(result["serverInfo"]["name"], "for-takt")
        self.assertIn("tools", result["capabilities"])

    def test_initialize_default_protocol(self):
        resp = self.server.request(
            {"jsonrpc": "2.0", "id": 1, "method": "initialize"}
        )
        self.assertEqual(resp["result"]["protocolVersion"], "2025-06-18")

    def test_tools_list(self):
        resp = self.server.request({"jsonrpc": "2.0", "id": 1, "method": "tools/list"})
        tools = resp["result"]["tools"]
        names = {t["name"] for t in tools}
        expected = {
            "goal_create", "project_list", "goal_list", "goal_get", "goal_update",
            "goal_set_status", "goal_log", "goal_ask", "goal_answer",
            "goal_withdraw_question", "goal_task_update", "goal_complete",
            "integration_check", "integration_apply",
            "takt_tasks", "takt_run_detail", "takt_enqueue", "takt_tell",
            "takt_run", "takt_runner_status", "takt_runner_stop",
            "takt_goal_files",
        }
        self.assertEqual(names, expected)
        for t in tools:
            self.assertIn("description", t)
            self.assertEqual(t["inputSchema"]["type"], "object")
            self.assertIs(t["inputSchema"]["additionalProperties"], False)

    def test_unknown_method(self):
        resp = self.server.request({"jsonrpc": "2.0", "id": 9, "method": "bogus/method"})
        self.assertEqual(resp["error"]["code"], -32601)
        self.assertEqual(resp["id"], 9)

    def test_invalid_json_then_valid(self):
        self.server.send("{not json")
        resp = self.server.read_json()
        self.assertEqual(resp["error"]["code"], -32700)
        # server survives and answers the next request
        resp = self.server.request({"jsonrpc": "2.0", "id": 2, "method": "ping"})
        self.assertEqual(resp["result"], {})

    def test_unknown_tool_is_error_not_crash(self):
        resp = self.server.request(
            {
                "jsonrpc": "2.0",
                "id": 3,
                "method": "tools/call",
                "params": {"name": "no_such_tool", "arguments": {}},
            }
        )
        self.assertTrue(resp["result"]["isError"])
        resp = self.server.request({"jsonrpc": "2.0", "id": 4, "method": "ping"})
        self.assertEqual(resp["result"], {})

    def test_tool_error_is_iserror(self):
        resp = self.server.request(
            {
                "jsonrpc": "2.0",
                "id": 5,
                "method": "tools/call",
                "params": {"name": "goal_get", "arguments": {"goalId": "x"}},
            }
        )
        result = resp["result"]
        self.assertTrue(result["isError"])
        self.assertIn("invalid goalId", result["content"][0]["text"])

    def test_notification_gets_no_response(self):
        # Send a notification then a ping; the ping response must arrive
        # with nothing before it.
        self.server.send(
            json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"})
        )
        resp = self.server.request({"jsonrpc": "2.0", "id": 6, "method": "ping"})
        self.assertEqual(resp["id"], 6)
        self.assertEqual(resp["result"], {})


if __name__ == "__main__":
    import unittest

    unittest.main()
