# for-takt: UI 設計書（実装者向け, v0.2）

v0.1（`DESIGN.md`）の MCP ツールはそのまま残し、ダッシュボードのページと、それを支えるバックエンドを足す。
UI は「見る」が中心。書き込みは goal の一時停止・再開と、質問への回答だけ。

## 0. 前提と制約（守ること）

- v0.1 の制約はすべて引き継ぐ。特に **TAKT の `.takt/` 配下には一切書き込まない**。
- バックエンドは `backend.hooks` の routes（gateway プロセス内で動く Python）。別プロセスのバックエンドは作らない。
  - gateway の interpreter は Kiro Crew 本体の venv（`<KiroCrew>/.venv/bin/python`、Python 3.12）。`aiohttp` 3.14 と `PyYAML` 6.0 が入っている。
    この 2 つだけは import してよい。`kiro_crew` は import しない。
  - hooks のモジュールはファイルパスから合成パッケージとして読み込まれる（`src/kiro_crew/apps/module_loader.py`）。
    アプリのルートが合成パッケージのルートになるので、**アプリ内の import はすべて相対 import** にする。
  - ハンドラは gateway のイベントループ上で動く。**ファイル読み取り・git・takt-mcp の呼び出しはすべて `asyncio.to_thread` で逃がす**。
- バックエンドを持つので、利用者はアプリの実行コードを信頼する設定が必要になる（README に書く）。
- 外部の npm パッケージは UI のビルド用だけ。実行時の React と SDK はホストが提供する。

## 1. 構成の変更

v0.1 のロジックを、MCP サーバーとバックエンドの両方から使える 1 つのパッケージに移す。

```
for-takt/
├── app.json                  ← backend / ui / permissions を追加（§2）
├── takt_core/                ← 新設。mcp/ft_*.py をここへ移す
│   ├── __init__.py
│   ├── util.py               ← 旧 ft_util.py
│   ├── goals.py              ← 旧 ft_goals.py
│   ├── gitops.py             ← 旧 ft_git.py
│   ├── takt_bridge.py        ← 旧 ft_takt.py
│   ├── takt_files.py         ← 新設。.takt の読み取り（§4）
│   └── projects.py           ← 新設。プロジェクト登録（§5）
├── mcp/
│   ├── server.py             ← APP_ROOT を sys.path に入れて `from takt_core import ...`
│   └── tests/                ← import を takt_core に合わせて更新
├── backend/
│   ├── __init__.py
│   ├── routes.py             ← register_routes(ctx)（§3）
│   ├── handlers.py           ← 各ハンドラ
│   └── tests/
└── ui/                       ← Vite + React + TypeScript（§6）
    ├── package.json, vite.config.ts, tsconfig.json
    ├── src/…
    └── dist/index.mjs        ← ビルド成果物（コミット対象）
```

- `takt_core` 内の import は相対（`from . import util`）。
- `mcp/server.py` は自分のプロセスなので `sys.path.insert(0, APP_ROOT)` して `from takt_core import goals` などでよい。
- `backend/` からは `from ..takt_core import goals`。
- データの置き場所（`<app root>/data/`、`FOR_TAKT_DATA_DIR` で上書き可）は v0.1 と同じ。
- 既存の 51 件のテストは import の修正だけで通ること（挙動は変えない）。

## 2. app.json の追加分

```json
{
  "version": "0.2.0",
  "backend": {
    "hooks": { "routes": "backend.routes:register_routes" }
  },
  "ui": {
    "entry": "dist/index.mjs",
    "pages": [
      { "route": "/apps/for-takt", "label": "TAKT", "iconUrl": "icon.svg" }
    ],
    "sidebar": { "section": "Apps", "order": 20 }
  },
  "permissions": {
    "api": ["/api/apps/for-takt"],
    "events": [],
    "mcpTools": [],
    "storage": false,
    "cron": false
  }
}
```

- 既存のキー（agents、skills、mcpServers など）はそのまま残す。
- `ui/icon.svg` を用意する（単純な図形でよい）。外部アプリのサイドバーは Lucide のアイコン名を使えないため。
- `ui.entry` と `iconUrl` は `ui/` からの相対パス。

## 3. バックエンドの API

すべて `/api/apps/for-takt/` 配下。**パス引数は使わず、クエリ（GET）と JSON 本文（POST）で渡す**。

| メソッド | パス | 入力 | 返り値 |
|---|---|---|---|
| GET | `projects` | なし | `{projects: [{path, name, hasTakt}]}` |
| POST | `projects/add` | `{path}` | 追加後の一覧 |
| POST | `projects/remove` | `{path}` | 削除後の一覧（goal の記録は消さない） |
| GET | `goals` | `project?`, `status?` | v0.1 の `goal_list` と同じ要約 |
| GET | `goal` | `id` | goal の全体 |
| POST | `goal/status` | `{id, status: "active" \| "paused", reason, expectedRevision}` | 更新後の goal |
| POST | `goal/answer` | `{id, questionId, answer, expectedRevision}` | 更新後の goal |
| GET | `takt/tasks` | `project` | §4.1 のタスク一覧 |
| GET | `takt/run` | `project`, `slug` | §4.2 の run の詳細 |
| GET | `takt/run/log` | `project`, `slug`, `offset?`（既定 0） | §4.3 の差分ログ |
| GET | `takt/run/report` | `project`, `slug`, `name` | `{name, text, truncated}` |
| GET | `takt/goal-files` | `project` | v0.1 の `takt_goal_files` と同じ |

共通規則:
- 成功は 200 と JSON。エラーは `{"error": "<日本語メッセージ>", "code": "<識別子>"}`。
  - 400 `bad_request`：入力不正。
  - 404 `not_found`：goal、run、レポートが無い。
  - 409 `conflict`：`expectedRevision` の不一致と、遷移規則違反。
  - 403 `owner_only`：オーナー以外からの書き込み。
  - 500 `internal`：想定外の例外。メッセージは一般的な文言にし、詳細は `ctx.logger` に出す。
- `takt_core` の `ToolError` は 400、ただし revision 不一致と遷移違反は 409 に対応付ける
  （`goals.py` の `ToolError` に `code` 属性を足すか、専用の例外クラスを派生させる）。
- `project` は登録済みプロジェクト（§5）のどれかと一致することを必須にする。未登録なら 400。
  これで、UI から任意のパスを読ませられないようにする。
- **POST はすべてオーナーだけに許可する**。手順は `docs/app-kit/api-reference.md` の「Owner gate (`ctx.require_owner`)」のとおり。
  - `request.get("app")` が無い呼び出し（ダッシュボードから）では `await ctx.require_owner(request, "<op>")` を呼び、
    `None` 以外が返ればそれをそのまま返す。
  - `ctx.require_owner` が無いホストでは 403 を返す（fail closed）。
- `goal/status` で UI から許すのは `active ⇄ paused` だけ。それ以外の遷移は 400。
- ルート登録は docs の例どおり、アプリ側で `method`、`path`、`handler` を持つ dataclass を定義して返す。
  `handler` は `async def handler(request, ctx)` で、`aiohttp.web` の Response を返す。

## 4. `.takt` の読み取り（takt_core/takt_files.py）

**読み取り専用**。書き込み・ロック取得・TAKT のコマンド実行はしない。
TAKT が書き換えている最中に読むと失敗することがあるので、パース失敗は 1 回だけ再読し、それでも駄目なら
`{"error": ..., "retryable": true}` を返す（UI は次のポーリングで再試行する）。

### 4.1 タスク一覧
- `<project>/.takt/tasks.yaml` を `yaml.safe_load` で読む。5 MiB を超えたら 400。
- 各タスクを次の形に要約する（無いキーは null）：
  `name, status, workflow, branch, baseBranch, worktree, runSlug, createdAt, startedAt, completedAt, failure{step, error}, goalIds`
  - `goalIds` は、for-takt の goal の `tasks[].taskName` がこのタスク名と一致するものの goal id 一覧（同じ project の goal に限る）。
  - `failure.last_message` は返さない（長くなるため。必要なら run の詳細で見る）。
- 状態ごとの件数 `counts` も返す。

### 4.2 run の詳細
- `slug` は `^[A-Za-z0-9][A-Za-z0-9._-]*$` に一致すること（TAKT の Web UI と同じ規則）。
- run ディレクトリの探索順：
  1. `<project>/.takt/runs/<slug>`
  2. tasks.yaml でその slug を持つタスクの `worktree_path` が絶対パスのディレクトリなら、`<worktree_path>/.takt/runs/<slug>`
  - どちらも realpath を取り、`.../.takt/runs/<slug>` の配下に収まっていること（シンボリックリンクで外へ出ない）。
- 返すもの：
  - `meta`：`meta.json` から `task, workflow, status, startTime, endTime, updatedAt, currentStep, currentIteration, phase`（1 MiB まで）。
  - `steps`：`logs/*.jsonl` のうち `-usage-events` や `-otel-` を含まないものを時刻順に読み、
    `step_start` / `step_complete` / `workflow_complete` / `workflow_abort` を
    `{type, step, status, at, matchedRule?, reason?}` に要約した直近 200 件。本文（content）は返さない。
  - `logFiles`：セッションログのファイル名とサイズ。
  - `reports`：`reports/` 直下の `.md` ファイル名とサイズ。

### 4.3 差分ログ
- 対象は 4.2 のセッションログのうち最新のもの。
- `offset` から最大 64 KiB を読み、最後の改行までで切る。返り値は
  `{file, offset, nextOffset, size, records: [...], eof}`。
  - `records` は各行を JSON パースしたもの。各レコードの文字列値は 4 KiB で切り詰める。パースできない行は `{"raw": "<先頭 4 KiB>"}`。
- ファイルが入れ替わって `offset` がサイズを超えていたら、0 から読み直して `reset: true` を付ける。

### 4.4 レポート
- `name` は `^[A-Za-z0-9][A-Za-z0-9._-]*\.md$`。`reports/` 直下のみ。512 KiB で切り詰めて `truncated: true`。

## 5. プロジェクト登録（takt_core/projects.py）

- 保存先 `data/projects.json`：`{"schema": "for-takt.projects/v1", "projects": ["/abs/repo", ...]}`。
  書き込みは `data/projects.lock` の flock 下でアトミックに行う。上限 50 件。
- 追加時は v0.1 の `require_project` と同じ検証（絶対パス、git の top level の realpath）。`hasTakt` は `.takt/` があるかどうか。
- goal を作ったプロジェクトは、goal_create の時点で自動的に登録に足す（MCP の `goal_create` にこの処理を追加）。
- 一覧取得時に、存在しなくなったパスは `missing: true` を付けて返す（自動では消さない）。

## 6. UI（ui/）

### 6.1 ビルド
- 雛形は Kiro Crew のスキャフォールドから取る：`/tmp` で `kirocrew app init tmp-scaffold --ui` を実行し、
  生成された `ui/` の `package.json`、`vite.config.ts`、`tsconfig.json` の形をそのまま使う
  （外部化の設定や出力先を推測で書かない）。作業後に `/tmp/tmp-scaffold` は消す。
- 外部化するもの：`react`、`react-dom`、`react/jsx-runtime`、`@kirocrew/app-sdk`、`@kirocrew/app-sdk/ui`、`lucide-react`、`@tanstack/react-query`。
- 型定義は起動中のダッシュボードから取る：`curl --fail -o ui/src/kirocrew-app-sdk.d.ts http://localhost:<port>/vendor/kirocrew-app-sdk.d.ts`
  （ポートは `kirocrew status` などで確認。既定は 5476）。
- `cd ui && npm install && npm run build` で `ui/dist/index.mjs` ができること。

### 6.2 画面
1 ページ構成。左上でプロジェクトを選び、タブで切り替える。

- **ヘッダー**：`PageHeader`。プロジェクトの選択（`Select`）、プロジェクトの追加・削除（`Modal` でパス入力）。
- **タブ「Goals」**
  - 一覧：objective（先頭 1 行）、状態の `Badge`、goal ブランチ、タスク数、未回答の質問数、更新日時（`fmtRelative`）。
  - 詳細（一覧の行をクリックで右側に表示）：
    - 目的、範囲外、受け入れ基準、制約（`MarkdownRenderer` は使わずプレーンテキスト）。
    - タスク：taskName、state、branch、integratedSha（先頭 8 桁）。TAKT 側のタスクに一致すれば TAKT の status も並べ、クリックで「TAKT」タブの該当 run を開く。
    - 未回答の質問：本文、選択肢があればボタン、なければテキスト入力。送信前に確認（`Modal`）。
    - 作業記録：新しい順に 50 件。
    - 操作：active なら「一時停止」、paused なら「再開」。理由の入力を必須にする。
  - 書き込みには必ず表示中の `revision` を `expectedRevision` として送る。409 が返ったら
    「他で更新されました。最新を読み込みました」と表示して再取得する。
- **タブ「TAKT」**
  - タスク一覧：状態ごとの件数（`StatCard`）と表。status、name、workflow、branch、開始・終了日時、関連 goal。
    failed / exceeded / pr_failed は失敗した step とエラーの先頭 200 文字も表示。
  - run の詳細（行をクリック）：meta（currentStep、iteration、phase）、step のタイムライン、
    ライブログ（§4.3 を `offset` 付きで追いかける。最大 2,000 行を保持し、古いものから捨てる）、
    レポート一覧（クリックで `MarkdownRenderer` 表示）。
  - TAKT の `goal.json`（`takt/goal-files`）は折りたたみの「TAKT manager の goal」欄に読み取り専用で表示。
- 空の状態は `EmptyState` で案内する（プロジェクト未登録、`.takt` が無い、タスクが無い）。

### 6.3 データ取得
- `useAppApi()` 経由のみ。パスは `/api/apps/for-takt/...`。
- `@tanstack/react-query` を使う。ポーリング間隔：
  - 一覧（projects、goals、takt/tasks）は 5 秒。
  - 選択中の run の詳細は 3 秒。ログは run が running のとき 2 秒、それ以外は止める。
  - `useAppInfo().active` が false のときはポーリングを止める（`undefined` は true 扱い）。
- 日時は `fmtDateTime` / `fmtRelative`、件数は `fmtNumber` を使う。

### 6.4 文言
- 表示は日本語のみ（v0.2）。文言は `ui/src/strings.ts` にまとめ、コンポーネントに直書きしない。

## 7. テスト

- Python（gateway の interpreter で実行する）：
  `<KiroCrew>/.venv/bin/python -m unittest discover -s mcp/tests` と `-s backend/tests` の両方が全件成功すること。
- `takt_files` のテスト（一時ディレクトリに `.takt` を作る）：
  - tasks.yaml の要約と件数、goal との突き合わせ。
  - 壊れた YAML で `retryable` が返る。5 MiB 超で 400。
  - slug の拒否（`..`、`/` を含む、先頭が `.`）。シンボリックリンクで外へ出る run ディレクトリの拒否。
  - `worktree_path` 側の run ディレクトリへのフォールバック。
  - 差分ログ：offset 0 からの読み取り、64 KiB で改行に合わせて切れること、途中から再開、offset がサイズ超えで `reset`。
  - レポート名の拒否（`../x.md`、`.md` 以外）。
  - **どのテストでも `.takt/` 配下のファイルの mtime と内容が変わっていないこと**を最後に確認する。
- バックエンドのハンドラ：`aiohttp.test_utils.make_mocked_request` で呼ぶ。
  - 未登録プロジェクトで 400、revision 不一致で 409、`require_owner` が拒否を返したら 403 をそのまま返す、
    `require_owner` が無い ctx で POST が 403、UI から `aborted` への遷移で 400。
- UI：`npm run build` が成功すること。UI の自動テストは今回は不要。

## 8. 範囲外（今回はやらない）

- UI からの統合（`integration_apply`）、タスク投入、goal の作成・完了。これらは Bot から行う。
- cron / irq による自動巡回と通知。
- SSE によるプッシュ配信（ポーリングで足りるか見てから判断する）。
- 多言語対応。
- TAKT の requeue / stop。

## 9. 完了条件

1. §7 の Python テストがすべて成功し、`npm run build` が成功する。
2. `kirocrew app update for-takt --source ~/tmp/KiroCrew-app/for-takt`（gateway 起動中）で更新でき、
   サイドバーに「TAKT」が出て、ページが開く。
3. テスト用リポジトリを登録すると、TAKT のタスク一覧と run の詳細（step、ログ、レポート）が表示され、
   goal の一時停止・再開と質問への回答ができる。
4. README に UI の使い方、バックエンドの信頼設定が必要なこと、「設計との差分」を追記する。
