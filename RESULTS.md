# for-takt: 実装結果レポート

DESIGN.md（v0.1）に基づく実装の結果まとめ。2026-11-07 時点。v0.2（UI/backend hooks）は DESIGN-ui.md を参照。

## 1. 結果サマリ

- **`python3 -m unittest discover -s mcp/tests` : 52 件全件成功**（約 5 秒）
- 実 `takt-mcp`（`~/.nvm/versions/node/v24.13.0/bin/takt-mcp`）を使った
  往復テストを含む。バイナリが無い環境では自動スキップ
- 実 stdio 経路での E2E スモーク（goal 作成 → active → integration_check →
  integration_apply）も手動検証済み
- §11 完了条件はすべて達成。2・3（`kirocrew app install` → 信頼設定 → enable、
  チャット上の一巡、Bot 化しての自律動作）も実機で確認済み（docs/screenshots/ 参照）

## 2. 作成ファイル

```
for-takt/
├── app.json                     ← §2 のマニフェストどおり
├── README.md                    ← 概要・要件・ライフサイクル・テスト/導入手順
├── RESULTS.md                   ← この文書
├── .gitignore                   ← __pycache__/ と data/ を除外
├── agents/takt-manager.json     ← §9 どおり（読み取り系 6 ツールだけ自動承認）
├── assets/icon.png              ← 512x512 仮アイコン（zlib 生成の単純画像）
├── skills/takt-goal-manager/SKILL.md  ← §9 の手順 1-5 + ハードルール 3 条
└── mcp/
    ├── server.py                ← JSON-RPC ループ + 全 18 ツール登録
    ├── ft_util.py               ← （既存）検証・アトミック書き込み・flock・git 実行
    ├── ft_goals.py              ← goal ストア
    ├── ft_git.py                ← merge-tree 判定と統合
    ├── ft_takt.py               ← takt-mcp ブリッジ、.takt 読み取り
    └── tests/                   ← helper.py + test_*.py 4 本
```

`data/` は実行時に生成される（`data/goals/.lock` の flock + tmp/fsync/replace）。

## 3. 実装済みツール（18 個）

| ツール | 備考 |
|---|---|
| `goal_create` | draft で作成。startBranch 既定=HEAD、targetBranch 既定=startBranch。ブランチは作らない |
| `goal_list` / `goal_get` | 要約 / 全レコード |
| `goal_update` | 終端状態では拒否。`acceptanceCriteria` は空配列不可 |
| `goal_set_status` | 遷移検査。`draft→active` で `takt-goal/<id8>` 作成（既存は startBranch の子孫なら再利用）。`completed` は拒否（goal_complete へ誘導） |
| `goal_log` | kind は `note`/`patrol` のみ |
| `goal_ask` / `goal_answer` / `goal_withdraw_question` | pending 質問のライフサイクル。withdraw は理由を workLog に記録 |
| `goal_task_update` | `queued`/`dropped` のみ。`integrated` は拒否 |
| `goal_complete` | `awaiting_merge` かつ goal ブランチが targetBranch に包含のときのみ |
| `integration_check` | 読み取りのみ。5 判定 + diffstat（50 ファイル上限・truncated 付き） |
| `integration_apply` | goal が active 必須。worktree チェックアウト拒否。`commit-tree` + `update-ref` CAS。タスクを `integrated` に記録 |
| `takt_tasks` / `takt_run_detail` / `takt_tell` | takt-mcp 中継（`cwd=<project>` を注入） |
| `takt_enqueue` | goalId 指定時は goal が active か確認 → `taskContext.baseBranch` に goal ブランチ → 成功後 `tasks` に `queued` 記録。記録時にも mut 内で active/project を再検査し、失敗時は `recorded:false` + `recordError` を返す（TAKT への enqueue 自体は成立） |
| `takt_goal_files` | `.takt/goals/*/goal.json` の読み取りのみ要約（壊れたファイルは `error` 付き） |

すべての `inputSchema` は `additionalProperties: false`。`project` は絶対パスかつ
`git rev-parse --show-toplevel` の realpath と一致必須。`-` 始まりのブランチ/rev は拒否。

## 4. 設計からの差分（意図的）

1. **`goal_complete` に `expectedRevision` を追加**
   §4 の「書き込み系ツールはすべて任意引数 expectedRevision を取る」を全書き込みツールへ
   一律適用した（§5 の表には `goalId, summary` しか無かったが、ルール優先）。
2. **`integration_apply` のタスク紐付けに `taskName` 一致を追加**
   仕様は「source のブランチ名一致」だが、`takt_enqueue_task` の結果にはブランチ名が
   含まれない（`taskName` と `tasksFile` が返る）ため、ブランチ未記録のタスクでも
   紐付くように taskName 一致もフォールバックとして見る。仕様の挙動の上位互換。
3. **`goal_ask` には goal が終端でないことを確認**（`completed`/`aborted` への質問追加を拒否）。
4. **`takt_enqueue` は goal の `project` 一致も検査**（別リポジトリの goal に誤記録しない）。
   レビュー対応で、記録を行う `update_goal` の mut 内でも active/project を再検査するようにした
   （takt-mcp 呼び出し中に goal が変化する競合への対処）。

## 5. 検証内容（テスト 52 件）

- **プロトコル**（subprocess で実 stdio）: initialize（protocolVersion エコー/既定値）、
  tools/list（18 個・`additionalProperties:false`）、不明メソッド `-32601`、
  不正 JSON `-32700` で継続、不明ツールは isError で落ちない、通知は無応答
- **goal**: 作成・既定値、遷移の許可/拒否両方、`draft→active` でブランチ実体を git 確認、
  `expectedRevision` 不一致/一致、終端での更新拒否、workLog 500 切り詰め、
  questions 200 上限で answered から削る・pending だけの超過は残る
- **git**: already_integrated（祖先）、fast_forward、clean_merge（マージコミットの 2 親確認）、
  conflict（衝突ファイル名 `a.txt`）、tree 一致の取り込み済み、worktree チェックアウト中は
  apply 拒否、CAS 競合（run_git をパッチして疑似的に更新競合を再現）、
  `-` 始まりの拒否、startBranch の子孫でない同名ブランチの再利用拒否、
  descendant なら再利用
- **complete**: awaiting_merge 以外拒否、targetBranch 未包含で拒否、人が `git merge` した後に
  `completed` + `completion{goalSha,targetSha,summary,at}` 記録、終端の確認
- **takt**: `TAKT_MCP_BIN` 不正値のエラー、`takt_goal_files` の要約/破損ファイル error、
  enqueue 後の記録時に goal が非 active になっていた競合（`recorded:false` + `recordError` で
  返り、goal には記録されない）、**実 takt-mcp を起動して `takt_tasks` が返ること**
  （無ければ skip、今回は実行済み）

## 6. 手動スモーク（実 stdio）

```
initialize       → serverInfo {name: for-takt, version: 0.1.0}
goal_create      → draft (id 19732ddc-...)
goal_set_status  → active, branch=takt-goal/19732ddc 作成
integration_check→ fast_forward
integration_apply→ newSha=feat の SHA、diffstat g.txt +1、workLog kind=integration
```

## 7. 既知の留意点

- `takt_cleanup_tasks` / `takt_stop_goal_task` / `takt_remove_goal_task` は
  設計どおり中継していない。
- §10 の範囲外のうち、UI・backend hooks は v0.2（DESIGN-ui.md）で実装済み。
  cron 巡回はホスト側の cron 設定（`kirocrew cron add`）で運用中。
  targetBranch への自動マージは設計どおり未実装のまま（人がマージする）。

## 8. §11 完了条件 2・3 の確認結果（済）

```
kirocrew app install ~/tmp/KiroCrew-app/for-takt   # → 信頼設定
kirocrew app enable for-takt                        # → ~/.kiro/agents/ に生成
```

実施済み。チャットで takt-manager を選んで `goal_create → active →
takt_enqueue → takt_tasks` の一巡を確認し、Bot（TAKT Manager）への切替と
定期起床（`kirocrew cron add`）での自律動作も確認済み。
