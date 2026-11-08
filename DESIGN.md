# for-takt: 設計書（実装者向け）

Kiro Crew の外部アプリ。Kiro Crew の Bot が TAKT の「manager」役を担えるように、
goal の記録、git 統合判定、TAKT 操作を **1 つの stdio MCP サーバー**として提供する。
タスクの実行は TAKT の CLI（`takt run` / `takt watch`）が行う。

## 0. 前提と制約（守ること）

- 置き場所: `~/tmp/KiroCrew-app/for-takt`（独立リポジトリ。Kiro Crew 本体には何も足さない）
- 対象: Kiro Crew 0.13.0（source checkout）、TAKT 0.74.0、git 2.43.0、Python 3.12（gateway の venv）
- **外部依存なし（Python 標準ライブラリのみ）**。gateway の venv に `mcp` パッケージは無い。
  MCP は JSON-RPC 2.0 を自前で実装する（改行区切りの stdio）。
- **TAKT の状態ファイル（`.takt/tasks.yaml`、`.takt/goals/*/goal.json` など）には一切書き込まない。**
  TAKT への書き込みは `takt-mcp` 経由のみ。`goal.json` は読み取り専用で表示に使うだけ。
- goal の記録はアプリ自身のデータとして `<app root>/data/goals/` に持つ
  （Kiro Crew は `~/.kiro/crew/apps/for-takt/data/` を更新時も保持する）。
- 対応 OS: macOS / Linux のみ（`fcntl` を使ってよい）。
- サーバーはステートレス。呼び出しごとにディスクを読む。モジュールグローバルに呼び出し元ごとのデータを持たない。

## 1. ディレクトリ構成

```
for-takt/
├── app.json
├── README.md
├── DESIGN.md                 ← この文書
├── agents/takt-manager.json
├── skills/takt-goal-manager/SKILL.md
├── mcp/
│   ├── server.py             ← JSON-RPC ループとツール登録
│   ├── ft_util.py            ← 入力検証、アトミック書き込み、ロック、git 実行
│   ├── ft_goals.py           ← goal ストア
│   ├── ft_git.py             ← merge-tree 判定と統合
│   ├── ft_takt.py            ← takt-mcp ブリッジ、.takt 読み取り
│   └── tests/                ← 標準 unittest（下記 §8）
└── assets/icon.png           ← 512x512（仮でよい）
```

モジュール名に `ft_` を付けるのは、`server.py` をスクリプトとして起動したとき
`sys.path[0]` に入る同ディレクトリの名前が他のパッケージと衝突しないようにするため。

## 2. app.json

```json
{
  "name": "for-takt",
  "version": "0.1.0",
  "displayName": "TAKT Bridge",
  "description": "Let a Kiro Crew Bot manage TAKT goals: goal records, git merge-tree integration checks, and TAKT task enqueue/inspection through takt-mcp.",
  "author": "okajun35",
  "license": "MIT",
  "minKiroCrewVersion": "0.13.0",
  "tags": ["takt", "developer-tools", "workflows"],
  "iconPath": "assets/icon.png",
  "agents": ["agents/takt-manager.json"],
  "skills": ["skills/takt-goal-manager"],
  "mcpServers": {
    "takt-bridge": { "command": "python3", "args": ["mcp/server.py"] }
  },
  "permissions": { "api": [], "events": [], "mcpTools": [], "storage": false, "cron": false },
  "dependencies": { "commands": ["git"], "optionalCommands": ["takt-mcp", "takt"] },
  "platform": { "os": ["macos", "linux"], "installMode": "server" }
}
```

- `command: "python3"` と相対の `.py` は、Kiro Crew が gateway の interpreter とアプリ内の絶対パスに解決する
  （`src/kiro_crew/apps/bridges_mcp.py` の stdio 解決規則）。
- 登録名は `for-takt:takt-bridge`。エージェントからは `@for-takt:takt-bridge` で参照する。

## 3. MCP サーバー（server.py）

- stdin から 1 行 1 JSON を読み、stdout に 1 行 1 JSON を書く。ログは stderr のみ。
- 対応メソッド:
  - `initialize` → `{"protocolVersion": <クライアントが送った値。無ければ "2025-06-18">, "capabilities": {"tools": {}}, "serverInfo": {"name": "for-takt", "version": "0.1.0"}}`
  - `notifications/*` → 応答しない
  - `ping` → `{}`
  - `tools/list` → 全ツールの `name`、`description`、`inputSchema`（JSON Schema、`additionalProperties: false`）
  - `tools/call` → 成功時 `{"content": [{"type": "text", "text": <JSON 文字列>}]}`、
    `ToolError` 時は同形式で `"isError": true`（メッセージのみ。スタックトレースは stderr へ）
  - それ以外で `id` があれば JSON-RPC エラー `-32601`
- 不正 JSON 行は `-32700` を返して継続。想定外の例外でもプロセスを落とさない。
- 応答テキストは 200 KiB を上限に切り詰め、`"truncated": true` を付ける。

## 4. goal ストア（ft_goals.py）

保存先: `data/goals/<uuid>.json`。書き込みは `data/goals/.lock` の `flock` 下で、tmp + `fsync` + `os.replace`。

```json
{
  "schema": "for-takt.goal/v1",
  "id": "uuid4",
  "revision": 1,
  "project": "/abs/repo",
  "createdAt": "ISO8601 UTC", "updatedAt": "ISO8601 UTC",
  "objective": "…",
  "outOfScope": ["…"],
  "acceptanceCriteria": ["…"],
  "constraints": ["…"],
  "status": "draft | active | paused | awaiting_merge | completed | aborted",
  "startBranch": "main",
  "targetBranch": "main",
  "branch": "takt-goal/<id 先頭8桁> | null",
  "tasks": [{"taskName": "…", "workflow": "…", "enqueuedAt": "…",
             "state": "queued | integrated | dropped",
             "branch": "… | null", "integratedSha": "… | null", "note": "… | null"}],
  "workLog": [{"id": "uuid", "at": "…", "kind": "note | patrol | integration | status", "summary": "…"}],
  "questions": [{"id": "uuid", "at": "…", "body": "…", "options": ["…"],
                 "status": "pending | answered | withdrawn", "answer": "… | null", "answeredAt": "… | null"}],
  "completion": {"goalSha": "…", "targetSha": "…", "summary": "…", "at": "…"}
}
```

規則:
- 文字列は 128 KiB まで。`acceptanceCriteria` は 1 件以上。
- 状態遷移は以下のみ許可（それ以外は `ToolError`）:
  `draft→active`、`active⇄paused`、`active→awaiting_merge`、`awaiting_merge→active`、
  `awaiting_merge→completed`（`goal_complete` 経由のみ）、`draft|active|paused|awaiting_merge→aborted`。
  `completed` と `aborted` は終端。
- 書き込み系ツールはすべて任意引数 `expectedRevision` を取る。指定時に現在値と違えば `ToolError`（楽観ロック）。
  書き込みごとに `revision` を +1、`updatedAt` を更新。
- `workLog` は 500 件、`questions` は 200 件を上限（古い answered/withdrawn から削る。pending は削らない）。

## 5. ツール一覧

すべての `project` は絶対パスで、git の top level であること（`git rev-parse --show-toplevel` の realpath と一致）。

### goal 系（アプリのデータのみ読み書き）

| ツール | 入力 | 動作 |
|---|---|---|
| `goal_create` | project, objective, acceptanceCriteria[], outOfScope[]?, constraints[]?, startBranch?（既定: 現在の HEAD のブランチ）, targetBranch?（既定: startBranch） | status=draft で作成。ブランチは作らない |
| `goal_list` | project?, status? | 要約（id, objective 先頭 200 文字, status, branch, タスク数, pending 質問数, updatedAt） |
| `goal_get` | goalId | 全体を返す |
| `goal_update` | goalId, objective?, outOfScope?, constraints?, acceptanceCriteria?, expectedRevision? | 本文の更新。終端状態では不可 |
| `goal_set_status` | goalId, status, reason, expectedRevision? | 遷移規則を検査。`draft→active` 時に goal ブランチを作成（§6.1）。workLog に `status` を記録 |
| `goal_log` | goalId, summary, kind?（note/patrol） | workLog に追加 |
| `goal_ask` | goalId, body, options[]? | pending の質問を追加し id を返す |
| `goal_answer` | goalId, questionId, answer | pending → answered |
| `goal_withdraw_question` | goalId, questionId, reason | pending → withdrawn |
| `goal_task_update` | goalId, taskName, state, note? | `dropped` などへ手動更新（`integrated` は §6.2 からのみ） |
| `goal_complete` | goalId, summary | §6.3 の検査に通ったら completed |

### git 系（ft_git.py）

| ツール | 入力 | 動作 |
|---|---|---|
| `integration_check` | project, target, source | 読み取りのみ。§6.2 の判定結果を返す |
| `integration_apply` | goalId, source, message?, expectedRevision? | goal ブランチに source を統合。§6.2 |

### TAKT 系（ft_takt.py）

| ツール | 入力 | 動作 |
|---|---|---|
| `takt_tasks` | project | takt-mcp の `takt_list_tasks` を中継 |
| `takt_run_detail` | project, runSlug | `takt_get_run` を中継 |
| `takt_enqueue` | project, task, workflow, autoPr, goalId?, worktree?, draftPr? | `takt_enqueue_task` を中継。goalId 指定時は goal が active であることを確認し、`taskContext.baseBranch` に goal ブランチを入れ、成功したら goal の `tasks` に `queued` で記録 |
| `takt_tell` | project, runSlug, content | `takt_tell_run` を中継 |
| `takt_goal_files` | project | `.takt/goals/*/goal.json` を**読み取りのみ**で要約（id, objective, status, executionStatus, branch）。パースできないものは `error` 付きで返す |

`takt_cleanup_tasks`、`takt_stop_goal_task`、`takt_remove_goal_task` は中継しない（範囲外）。

## 6. git の詳細

すべて `git -C <project> -c commit.gpgSign=false …`、環境に `GIT_TERMINAL_PROMPT=0`、`LC_ALL=C`、タイムアウト 60 秒。
ブランチ名は `git check-ref-format --branch` で検証し、`-` で始まる値は拒否する（引数注入対策）。
リビジョンは `git rev-parse --verify --quiet <rev>^{commit}` で SHA に解決してから使う。

### 6.1 goal ブランチ作成（`draft→active`）
- 名前 `takt-goal/<id 先頭8桁>`。既に存在すれば、それが startBranch の子孫なら再利用、そうでなければ `ToolError`。
- 作成は `git branch <name> <startBranch の SHA>`。チェックアウトはしない。

### 6.2 統合判定と適用（TAKT の `src/infra/goals/git-command.ts:95-104` と同じ考え方）
判定（`integration_check`、`integration_apply` 共通）:
1. `S`=source の SHA、`T`=target の SHA。
2. `git merge-base --is-ancestor S T` が真 → `already_integrated`。
3. `git merge-base --is-ancestor T S` が真 → `fast_forward`（新 SHA は S）。
4. それ以外 `git merge-tree --write-tree --name-only --no-messages T S`（exit 0 = clean、1 = conflict）。
   - 1 行目がマージ後 tree。exit 1 なら 2 行目以降が衝突ファイル → `conflict`（ファイル一覧付き）。
   - exit 0 で tree が `T^{tree}` と同じ → `already_integrated`（内容は取り込み済み）。
   - exit 0 でそれ以外 → `clean_merge`。
5. 返却: `{result, targetSha, sourceSha, mergedTree?, conflicts?, diffstat}`。
   diffstat は `git diff --numstat T <マージ後>` から files/additions/deletions（ファイルは 50 件まで、超過は `truncated`）。

適用（`integration_apply`）:
- goal が `active` であること。target = goal ブランチ。
- goal ブランチがどこかの worktree でチェックアウトされていたら拒否（`git worktree list --porcelain` の `branch refs/heads/<name>`）。
- `conflict` → `ToolError`（衝突ファイル付き）。`already_integrated` → 何もせず記録だけ。
- `fast_forward` → 新 SHA = S。`clean_merge` → `git commit-tree <tree> -p T -p S -m <message>`（既定メッセージ `takt-goal: integrate <source>`）。
- `git update-ref refs/heads/<goal branch> <新 SHA> <T>`（旧値付き CAS。競合したら `ToolError`）。
- goal の該当タスク（source のブランチ名一致、無ければ taskName 未紐付けで workLog のみ）を `integrated` にし、`integratedSha` と workLog（kind=integration）を記録。

### 6.3 完了（`goal_complete`）
- goal が `awaiting_merge` であること。
- goal ブランチの内容が targetBranch に含まれていること（§6.2 の判定で source=goal ブランチ、target=targetBranch が `already_integrated`）。
  含まれていなければ `ToolError`（「人が targetBranch へマージしてから再実行」）。
- targetBranch へのマージはこのアプリでは**行わない**（人が行う）。
- `completion` に goalSha、targetSha、summary を記録して `completed`。

## 7. takt-mcp ブリッジ（ft_takt.py）

- 実行ファイルの探索順: 環境変数 `TAKT_MCP_BIN` → `shutil.which("takt-mcp")` →
  `~/.nvm/versions/node/*/bin/takt-mcp` のうち最新バージョン。見つからなければ `ToolError`（設定方法を含める）。
  （例: `~/.nvm/versions/node/v24.13.0/bin/takt-mcp`）
- `takt-mcp` は `#!/usr/bin/env node` なので、起動時の `PATH` の先頭に見つけたバイナリのディレクトリを足す。
- **呼び出しごとに** `takt-mcp --tool-set all` を `cwd=<project>` で起動する
  （takt-mcp の許可ルートは起動時の cwd。`src/app/mcp/index.ts`）。
  手順: `initialize` → `notifications/initialized` → `tools/call` → stdin を閉じて終了待ち。全体タイムアウト 60 秒、超えたら kill。
- 引数の `cwd` は常に project を入れる（takt-mcp は全ツールで絶対パスの cwd を要求）。
- takt-mcp の結果は `content[0].text` が JSON 文字列。パースできれば JSON として、できなければ文字列のまま返す。`isError` はそのまま伝える。

## 8. テスト（`mcp/tests/`、`python3 -m unittest`）

一時ディレクトリに git リポジトリを作り、`FOR_TAKT_DATA_DIR` 環境変数でデータ先を差し替えて実行する
（`ft_util.DATA_DIR` はこの環境変数を優先する）。

- プロトコル: `initialize` / `tools/list` / 不明メソッド / 不正 JSON / 例外でも落ちない
- goal: 作成、遷移規則（許可・拒否の両方）、`expectedRevision` 不一致、上限切り詰め、pending 質問は削られない
- git: already_integrated（祖先）、fast_forward、clean_merge、conflict（衝突ファイル名）、内容取り込み済み（tree 一致）、
  worktree でチェックアウト中なら apply 拒否、CAS 競合、`-` で始まるブランチ名の拒否
- complete: target に含まれていないと拒否、含まれていれば completed
- takt ブリッジ: バイナリ未検出時のエラー。実 takt-mcp があれば `takt_tasks` を空リポジトリで呼べること（無ければ skip）

## 9. エージェントと skill

`agents/takt-manager.json`:
```json
{
  "name": "takt-manager",
  "model": "auto",
  "description": "Manages TAKT goals: splits a goal into TAKT tasks, integrates finished task branches, and reports to the user.",
  "prompt": "You manage TAKT goals for the user. Follow the takt-goal-manager skill. Never edit .takt files directly. Never merge into the target branch yourself.",
  "tools": ["@kirocrew-core", "@for-takt:takt-bridge"],
  "allowedTools": [
    "@for-takt:takt-bridge/goal_list", "@for-takt:takt-bridge/goal_get",
    "@for-takt:takt-bridge/integration_check", "@for-takt:takt-bridge/takt_tasks",
    "@for-takt:takt-bridge/takt_run_detail", "@for-takt:takt-bridge/takt_goal_files"
  ]
}
```
読み取り系だけ自動承認。書き込み系は承認を通す。

`skills/takt-goal-manager/SKILL.md`（frontmatter に `description` を付ける）の手順:
1. ユーザーと目的・範囲外・受け入れ基準・制約を詰めて `goal_create`（draft）。内容をユーザーに見せて承認を得てから `goal_set_status active`。
2. 独立して検証できる単位に分け、`takt_enqueue`（goalId 付き）で積む。workflow と autoPr は必ずユーザーに確認（autoPr は通常 false）。
3. 巡回時: `takt_tasks` で状態を見る。completed のタスクは `integration_check` → clean / fast_forward なら `integration_apply`。
   conflict・failed・exceeded は `goal_ask` でユーザーに判断を求める。判断に迷うことは推測で進めない。
4. 全タスク統合後、受け入れ基準を diff とレポートで確認し、`goal_set_status awaiting_merge`。
   ユーザーに targetBranch へのマージ手順を示す。マージ後に `goal_complete`。
5. 何をしたかは毎回 `goal_log` に残す。

## 10. 範囲外（今回はやらない）

- ダッシュボード UI、バックエンド（hooks）、cron / irq による自動巡回（次の段階）
- TAKT の requeue / stop（takt-mcp に非対話の入口が無いため）
- TAKT 本体の manager との連携、`goal.json` への書き込み
- targetBranch への自動マージ

## 11. 完了条件

1. `python3 -m unittest discover -s mcp/tests` が全件成功。
2. `kirocrew app install ~/tmp/KiroCrew-app/for-takt` → 信頼設定 → `kirocrew app enable for-takt` が成功し、
   `~/.kiro/agents/` に takt-manager のエージェントが生成される。
3. Kiro Crew のチャットで takt-manager を選び、テスト用リポジトリで
   goal 作成 → active → `takt_enqueue` → `takt_tasks` が一通り動く。
