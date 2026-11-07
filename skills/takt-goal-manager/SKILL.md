---
description: Manage a TAKT goal end-to-end — draft the goal, enqueue TAKT tasks, integrate finished task branches into the goal branch, and hand the final merge to the user.
---

# takt-goal-manager

You drive the `for-takt:takt-bridge` MCP tools to manage one TAKT goal at a time.
Hard rules:

- Never edit `.takt/**` files directly. All TAKT writes go through the bridge tools.
- Never merge into the goal's `targetBranch` yourself. The human does the final merge.
- When a judgment call is needed (conflict, failed task, ambiguity), ask the user with `goal_ask` instead of guessing.

## Procedure

### 1. Draft the goal

- **Resolve the project yourself first.** Call `project_list`. If exactly one project is registered, use it without asking. If the user's message names a repo directory, that IS the project. Only ask when zero or several registered projects genuinely match.
- **Infer, then confirm once — do not interview.** From the user's message, draft: objective, out-of-scope, acceptance criteria (at least one, concrete and checkable), and constraints. For vague requests like "動作確認用" pick a reasonable smoke-test objective yourself rather than asking what to verify.
- `goal_create` (status = draft). Show the user the recorded contents and get explicit approval — ONE confirmation for the whole draft, not one question per field.
- `goal_set_status` → `active` (this creates the goal branch `takt-goal/<id8>` from `startBranch`).

### 2. Enqueue tasks

- Split the goal into units that can be verified independently.
- Always confirm the `workflow` and `autoPr` with the user before enqueueing (`autoPr` is normally `false`).
- `takt_enqueue` with `goalId` — the bridge sets `taskContext.baseBranch` to the goal branch and records the task on the goal.
- **Start the runner yourself** with `takt_run` (mode `once` processes the queue and exits; `watch` keeps running). Never tell the user to run `takt run` manually. Poll `takt_runner_status` for the pid/log tail. `takt_runner_stop` stops a watch-mode runner.

### 3. Patrol and integrate

- `takt_tasks` to check task state. Use `takt_run_detail` for details of a run, `takt_tell` to send instructions to a running task.
- For a completed task: `integration_check` (target = goal branch, source = task branch).
  - `clean_merge` or `fast_forward` → `integration_apply`, passing `taskName` (the goal's task record name) so the task is marked integrated. TAKT names the branch only when the task runs, so the goal's task record has no branch until then.
  - `conflict`, or task `failed` / `exceeded` → `goal_ask` the user for a decision. Do not push forward on a guess.
- Record what you did every time with `goal_log`.

### 4. Wrap up

- After all tasks are integrated, verify the acceptance criteria against the diff and reports (`git diff <targetBranch>...<goalBranch>` is fine to read).
- `goal_set_status` → `awaiting_merge`, then show the user how to merge the goal branch into `targetBranch`.
- After the user merges, `goal_complete`. It refuses while the goal branch is not yet contained in `targetBranch`.

### 5. Keep records

- Leave a `goal_log` entry for every meaningful action so the user can audit later.
- `goal_get` shows the full record; `goal_list` shows all goals with pending-question counts.

## Scheduled wake (supervision)

When you are woken by a schedule rather than a person, you are on patrol — be brief and do not start new work on your own:

1. `project_list`, then for each project `takt_runner_status` and `takt_tasks`.
2. Report only what matters: tasks that finished or failed, goals waiting on a question (`goal_list` shows pending counts), a runner that died with pending left behind. If nothing changed, reply with one short "異常なし" line and stop.
3. If pending tasks remain and no runner is alive, restart with `takt_run` mode `once` — pass `allow=[the pending task names]` so anything you do not recognize refuses instead of running.
4. Never create a goal, enqueue a task, apply an integration, or stop a runner on a scheduled wake unless the wake message explicitly says to. Conflicts, failures and merge decisions still go to the user (`goal_ask` / a plain question), never auto-resolved.
