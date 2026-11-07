# for-takt — TAKT Bridge for Kiro Crew

A Kiro Crew external app that lets a Bot act as a TAKT "manager". It has three
parts:

- **stdio MCP server** (`for-takt:takt-bridge`, `mcp/server.py`) — the tool
  surface a Bot uses: goal records, `git merge-tree`-based integration
  checks/merges, and a relay to `takt-mcp` (`takt_list_tasks` / `takt_get_run` /
  `takt_enqueue_task` / `takt_tell_run`) plus read-only inspection of
  `.takt/goals/*/goal.json`.
- **in-gateway backend** (`backend/`) — App Kit `backend.hooks.routes` handlers
  under `/api/apps/for-takt/`, serving the dashboard: registered projects,
  app-owned goals, and read-only `.takt` data (tasks, run meta, paged session
  logs, reports, TAKT goal files).
- **dashboard page** (`ui/`) — a React page at `/apps/for-takt` (sidebar label
  **TAKT**) that polls the backend every few seconds. It is read-mostly: the
  only writes are project add/remove, goal pause/resume, and answering a goal's
  pending question.

The app's own state lives under `data/` (goal records in `data/goals/`, the
project registry in `data/projects.json`). `.takt/` is **read-only** to this
app — nothing under it is ever written.

## Layout

```
app.json                      app manifest (v0.2: backend hook + ui + permissions)
agents/takt-manager.json      bot definition (read tools auto-approved)
skills/takt-goal-manager/     the manager playbook
takt_core/                    shared logic: goals store, git ops, takt-mcp
                              bridge, .takt readers, project registry
mcp/server.py                 JSON-RPC 2.0 loop + tool registry (stdlib only)
mcp/tests/                    unittest suite
backend/routes.py             register_routes() -> 12 routes
backend/handlers.py           route handlers (owner-gated writes)
backend/tests/                handler + .takt-reader tests
ui/                           Vite/React/TS source; dist/index.mjs is committed
assets/icon.png               app-store icon
```

## Requirements

- macOS or Linux, Python 3 (standard library only for `mcp/`; `takt_core/` and
  `backend/` additionally use `aiohttp` and `PyYAML` from the gateway venv)
- `git` on PATH
- `takt-mcp` (optional — TAKT tools error without it). Resolution order:
  `$TAKT_MCP_BIN` → `takt-mcp` on PATH → newest `~/.nvm/versions/node/*/bin/takt-mcp`.

## Trust (required for the backend)

`backend.hooks` run **inside the Gateway process** with full gateway
privileges (Kiro Crew CSE SEC-012). Installing/enabling is not enough — you must
grant execution trust for this app, or the routes module refuses to load
("Refusing to load third-party app 'for-takt' ...").

Grant it from the dashboard's Trusted Apps control (POST
`/api/security/trusted-apps/for-takt`), or add to `~/.kiro/crew/config.local.json`:

```json
{ "agent": { "apps_trusted": ["for-takt"], "apps_trusted_local": ["for-takt"] } }
```

Only do this if you trust this source tree — that is the whole point of the
setting.

## Install / update

```
kirocrew app install ~/tmp/KiroCrew-app/for-takt
# after the trust grant above:
kirocrew app enable for-takt

# later changes:
kirocrew app update for-takt --source ~/tmp/KiroCrew-app/for-takt
```

## Dashboard usage

Open the **TAKT** page from the sidebar (`/apps/for-takt`).

- **Project selector** — add a git repository by absolute path (or a `file://`
  URL). The registry is app-owned; removing a project only unregisters it.
  `goal_create` via MCP also auto-registers its project.
- **Goals tab** — app-owned goals for the selected project: status, branch,
  task count, pending questions, updated time. Click a row for the detail:
  objective/scope/criteria, tasks with their linked TAKT task status (clicking
  it jumps to the run), pending questions (option buttons or free text), and
  the work log. **Pause**/**Resume** requires a reason and is owner-only.
- **TAKT tab** — status counts from `.takt/tasks.yaml`, the task table
  (failed/exceeded/pr_failed rows show the failing step + error), and a run
  view: meta (step/iteration/phase), step timeline, live session log that
  follows the newest `logs/*.jsonl` file, and reports rendered as markdown.
  TAKT goal files (`.takt/goals/*/goal.json`) are shown read-only in a
  collapsible section.

Polling: projects/goals/tasks 5 s, selected run 3 s, run log 2 s while the run
is `running` — all paused when the page is inactive. Writes carry
`expectedRevision`; a 409 reloads and tells you to retry.

## Goal lifecycle

`draft → active → (paused) → awaiting_merge → completed`, with `aborted`
reachable from any non-terminal state. `draft→active` creates the goal branch
`takt-goal/<id8>`; `awaiting_merge→completed` requires the goal branch to be
already contained in `targetBranch` (the human performs that merge).

Write tools accept `expectedRevision` for optimistic locking.

## Backend routes

All under `/api/apps/for-takt/`; reads are session-scoped, POSTs are
owner-only (`ctx.require_owner`, fail-closed 403 when the gate is absent):

```
GET  /health              GET  /settings            POST /settings/takt-mcp
GET  /projects            POST /projects/add        POST /projects/remove
                          POST /projects/clone      POST /directories
GET  /goals  /goal        POST /goal/status         POST /goal/answer
GET  /takt/config                                 POST /takt/config
GET  /takt/tasks  /takt/run  /takt/run/log  /takt/run/report  /takt/goal-files
```

Notes on the write endpoints:

- `POST /projects/clone` — `git clone` an `https://`/`ssh://`/`git@` remote
  (or an absolute local path) into a chosen parent directory and register
  the result; sensitive destinations are refused and clone errors are
  redacted before they reach the client.
- `POST /settings/takt-mcp` — pin the `takt-mcp` binary (or send
  `{"path": null}` to return to auto-detection). Resolution order:
  app setting → `$TAKT_MCP_BIN` → `PATH` → newest nvm install.
- `GET /takt/config` — read `~/.takt/config.yaml` (global) plus the
  selected project's `.takt/config.yaml` (read-only).
- `POST /takt/config` — owner-only, writes only the whitelisted scalar
  keys `provider` / `model` / `language` to `~/.takt/config.yaml`, with a
  `.bak` backup and an mtime revision check (`revision` field from the
  GET response; stale revisions return 409). Project `.takt/` files stay
  strictly read-only.
- `POST /directories` — list subdirectories of a path (with `hasGit` /
  `hasTakt` hints) for the project picker; capped at 200 entries.

## Test

```
/home/hddwm390/tmp/KiroCrew/.venv/bin/python -m unittest discover -s mcp/tests
/home/hddwm390/tmp/KiroCrew/.venv/bin/python -m unittest discover -s backend/tests
```

(Any Python ≥3.9 works for `mcp/tests`; `backend/tests` needs `aiohttp`/`yaml`,
which the gateway venv provides.)

```
cd ui && npm install --legacy-peer-deps && npm run build
```

`--legacy-peer-deps` is needed because `@kirocrew/app-sdk` is host-provided and
not on the npm registry.

## Deviations from the designs

- `goal_complete` takes `expectedRevision` too (v0.1 DESIGN §4 says all write
  tools accept it).
- `integration_apply` links a TAKT task to a goal by `branch` match with a
  `taskName` fallback (takt-mcp's enqueue result carries no branch).
- `h_takt_enqueue` re-checks `status == "active"` and project equality inside
  the `update_goal` mutator; on failure the TAKT task stays enqueued but the
  goal records nothing and the response says so (`recorded: false` +
  `recordError`).
- `takt_run_log` returns offset-paged **parsed NDJSON records** (plus
  `raw`/`truncated` flags) rather than raw text, and a `reset: true` flag when
  the requested offset is past the current file size.
- The UI exposes no integration-apply, enqueue, goal create/complete, cron/IRQ,
  SSE, or TAKT requeue/stop controls — those stay MCP-only by design.
- Beyond DESIGN-ui: the settings tab (takt-mcp pin, `~/.takt/config.yaml`
  whitelist edit), `POST /directories`, and `POST /projects/clone` were
  added after reviewing the aidlc reference app; project `.takt/` files
  remain read-only.

See DESIGN.md (v0.1) and DESIGN-ui.md (v0.2) for the full specifications.
