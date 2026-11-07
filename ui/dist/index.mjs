import { jsxs as r, jsx as e, Fragment as A } from "react/jsx-runtime";
import { useAppApi as _, fmtRelative as de, fmtDateTime as ne, fmtNumber as ie, useAppInfo as pe } from "@kirocrew/app-sdk";
import { Card as $, CardTitle as E, ErrorNotice as R, EmptyState as V, Clickable as X, Badge as F, Btn as y, Input as D, Modal as U, MarkdownRenderer as he, StatCard as ge, PageHeader as fe, Select as xe, SegmentedControl as Ne } from "@kirocrew/app-sdk/ui";
import { useQuery as Q, useQueryClient as ae, useMutation as H, QueryClient as be, QueryClientProvider as ye } from "@tanstack/react-query";
import { useState as v, useRef as ke, useEffect as se, useMemo as ve } from "react";
const t = {
  appTitle: "TAKT",
  appSubtitle: "for-takt ダッシュボード",
  tabGoals: "Goals",
  tabTakt: "TAKT",
  projectLabel: "プロジェクト",
  projectEmpty: "プロジェクトが登録されていません",
  projectEmptyHint: "「追加」から git リポジトリを登録してください。Bot が goal を作ると自動で登録されます。",
  projectAdd: "追加",
  projectAddTitle: "プロジェクトを追加",
  projectAddHint: "git リポジトリのトップレベルの絶対パス",
  projectRemove: "削除",
  projectRemoveTitle: "プロジェクトを削除",
  projectRemoveConfirm: (n) => `${n} を登録から外しますか？ goal の記録は残ります。`,
  projectMissing: "見つかりません",
  cancel: "キャンセル",
  submit: "送信",
  confirm: "確認",
  close: "閉じる",
  reload: "再読み込み",
  goalListEmpty: "このプロジェクトの goal はまだありません",
  goalListEmptyHint: "Bot に goal の作成を依頼してください。",
  goalSelectHint: "左の一覧から goal を選んでください",
  goalBranch: "goal ブランチ",
  goalNone: "未作成",
  objective: "目的",
  outOfScope: "範囲外",
  acceptance: "受け入れ基準",
  constraints: "制約",
  tasks: "タスク",
  taskName: "タスク名",
  taskState: "状態",
  taskBranch: "ブランチ",
  taskIntegrated: "統合 SHA",
  taktStatus: "TAKT",
  questions: "質問",
  questionAnswerPlaceholder: "回答を入力",
  answerConfirm: (n) => `質問への回答を送信しますか？
「${n}」`,
  workLog: "作業記録",
  pause: "一時停止",
  resume: "再開",
  reasonRequired: "理由（必須）",
  reasonPlaceholder: "例：人手での確認を挟む",
  pauseTitle: "goal を一時停止",
  resumeTitle: "goal を再開",
  conflictReloaded: "他で更新されました。最新を読み込みました",
  statusDraft: "下書き",
  statusActive: "実行中",
  statusPaused: "一時停止",
  statusAwaitingMerge: "マージ待ち",
  statusCompleted: "完了",
  statusAborted: "中止",
  taktEmptyNoDir: ".takt ディレクトリがありません",
  taktEmptyNoDirHint: "このリポジトリではまだ TAKT を使っていません。",
  taktEmptyNoTasks: "タスクがありません",
  taktEmptyNoTasksHint: "Bot に takt_enqueue でタスクを投入してもらってください。",
  runSelectHint: "上の表で実行中/完了のタスクをクリックすると、ログとレポートがここに出ます（pending はまだ選べません）",
  runNotStarted: "このタスクはまだ実行されていません（takt run 開始まで待ってください）",
  enqueueTitle: "タスク投入",
  enqueueTask: "タスク名（takt add 相当）",
  enqueueSubmit: "投入",
  runnerTitle: "runner（takt run 相当）",
  runnerRunning: (n, m) => `実行中 pid=${n} (${m})`,
  runnerStopped: "停止中",
  runnerStartOnce: "run（1回）",
  runnerStartWatch: "watch（常駐）",
  runnerStop: "停止",
  runnerConfirmTitle: "pending タスクも実行されます",
  runnerConfirmBody: (n) => `takt run / watch は pending のタスクをすべて実行します。次の ${n} 件が対象になります。`,
  runnerConfirmRun: "すべて実行",
  colStatus: "状態",
  colName: "名前",
  colWorkflow: "workflow",
  colBranch: "ブランチ",
  colStarted: "開始",
  colCompleted: "終了",
  colGoals: "関連 goal",
  failureAt: (n) => n ? `失敗: ${n}` : "失敗",
  runMeta: "Run メタ情報",
  runCurrentStep: "現在の step",
  runIteration: "イテレーション",
  runPhase: "フェーズ",
  runSteps: "ステップ",
  runLog: "ライブログ",
  runReports: "レポート",
  taktGoalFiles: "TAKT manager の goal",
  statPending: "待機中",
  statRunning: "実行中",
  statCompleted: "完了",
  statFailed: "失敗",
  loading: "読み込み中…",
  retrying: "再読み込み待ち…",
  noReports: "レポートはありません",
  noSteps: "ステップ記録はありません",
  noQuestions: "未回答の質問はありません",
  truncatedReport: "（512 KiB で切り詰めました）",
  // backend の error.code に対応する日本語メッセージ。
  // 未知の code には errorGeneric を使う（英語の error 文字列はそのまま出さない）。
  errorBadRequest: "リクエストが不正です",
  errorUnauthorized: "認証が必要です",
  errorOwnerOnly: "オーナー権限が必要です",
  errorAppTokenForbidden: "アプリトークンではこの操作はできません",
  errorSensitivePath: "保護されたパスのため登録できません",
  errorNotFound: "見つかりません",
  errorConflict: "他の変更と競合しました",
  errorInternal: "内部エラーが発生しました",
  errorGeneric: "エラーが発生しました",
  tabSettings: "設定",
  settingsTaktMcp: "takt-mcp 実行ファイル",
  settingsTaktMcpHint: "解決順: 設定 → TAKT_MCP_BIN → PATH → nvm。空欄で保存すると自動探索に戻ります。",
  settingsResolved: (n) => `解決済み（${n}）`,
  settingsNotFound: "見つかりません",
  settingsPathPlaceholder: "/path/to/takt-mcp",
  settingsSave: "保存",
  settingsClear: "自動探索に戻す",
  settingsPinnedAt: (n) => `固定: ${n}`,
  settingsAuto: "固定なし（自動探索）",
  browseTitle: "ディレクトリを選択",
  browseUp: "上へ",
  browsePick: "このディレクトリを登録",
  browseGit: "git",
  browseTakt: "TAKT",
  browseTruncated: "（多すぎるため一部のみ表示）",
  browseOrType: "または直接パスを入力",
  configTitle: "TAKT 設定",
  configGlobal: "グローバル（~/.takt/config.yaml）",
  configProject: "プロジェクト（.takt/config.yaml・読み取り専用）",
  configKey: "キー",
  configValue: "値",
  configSource: "出所",
  configEdit: "編集",
  configSave: "保存",
  configNotFound: "config.yaml がありません",
  configRevisionLost: "設定ファイルが外部で変更されました。再読み込みしてください",
  cloneTitle: "リポジトリを clone して登録",
  cloneUrl: "clone URL",
  cloneUrlHint: "https:// または git@ の git URL",
  cloneParent: "clone 先の親ディレクトリ",
  cloneName: "ディレクトリ名（空欄は URL から推測）",
  cloneSubmit: "clone して登録"
}, oe = {
  bad_request: t.errorBadRequest,
  unauthorized: t.errorUnauthorized,
  owner_only: t.errorOwnerOnly,
  app_token_forbidden: t.errorAppTokenForbidden,
  sensitive_path: t.errorSensitivePath,
  not_found: t.errorNotFound,
  conflict: t.errorConflict,
  internal: t.errorInternal
}, C = "/api/apps/for-takt", M = encodeURIComponent;
function re(n) {
  switch (n) {
    case "active":
    case "completed":
      return "ok";
    case "paused":
    case "awaiting_merge":
      return "warn";
    case "running":
      return "aim";
    case "failed":
    case "exceeded":
    case "pr_failed":
    case "aborted":
      return "err";
    default:
      return "muted";
  }
}
function ue(n) {
  switch (n) {
    case "draft":
      return t.statusDraft;
    case "active":
      return t.statusActive;
    case "paused":
      return t.statusPaused;
    case "awaiting_merge":
      return t.statusAwaitingMerge;
    case "completed":
      return t.statusCompleted;
    case "aborted":
      return t.statusAborted;
    default:
      return n ?? "";
  }
}
function we(n) {
  return n ? n.slice(0, 8) : "—";
}
function Se(n) {
  return n ? n.slice(0, 8) : "—";
}
function j(n) {
  if (n && typeof n == "object") {
    const m = n;
    if (typeof m.body == "string" && m.body) {
      try {
        const p = JSON.parse(m.body);
        if (p && typeof p.code == "string" && oe[p.code]) {
          const b = typeof p.error == "string" ? p.error : "";
          return `${oe[p.code]}${b ? `（${b}）` : ""}`;
        }
        if (p && typeof p.error == "string") return p.error;
      } catch {
      }
      return m.body;
    }
    if (typeof m.message == "string" && m.message) return m.message;
  }
  return t.errorGeneric;
}
function Ce(n) {
  if (n && typeof n == "object" && "status" in n) {
    const m = n.status;
    return typeof m == "number" ? m : null;
  }
  return null;
}
const Te = (n) => Ce(n) === 409;
function qe({
  project: n,
  active: m,
  onOpenRun: p
}) {
  var w, o;
  const b = _(), [h, u] = v(null), x = Q({
    queryKey: ["goals", n],
    queryFn: () => b.get(`${C}/goals?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), s = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => b.get(`${C}/takt/tasks?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), g = ((w = x.data) == null ? void 0 : w.goals) ?? [], a = /* @__PURE__ */ new Map();
  for (const c of ((o = s.data) == null ? void 0 : o.tasks) ?? [])
    c.name && a.set(c.name, c);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.tabGoals }),
      x.error ? /* @__PURE__ */ e(R, { message: j(x.error) }) : null,
      g.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((c) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: c }, c)) }) }),
        /* @__PURE__ */ e("tbody", { children: g.map((c) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => u(c.id),
            className: `cursor-pointer ${c.id === h ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(X, { onClick: () => u(c.id), children: (c.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(F, { variant: re(c.status), children: ue(c.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: c.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: de(c.updatedAt) })
            ]
          },
          c.id
        )) })
      ] }) : /* @__PURE__ */ e(V, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: h ? /* @__PURE__ */ e(
      $e,
      {
        id: h,
        active: m,
        taktByName: a,
        onOpenRun: p
      }
    ) : /* @__PURE__ */ e($, { children: /* @__PURE__ */ e(V, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function $e({
  id: n,
  active: m,
  taktByName: p,
  onOpenRun: b
}) {
  var z, O, Z, J, ee, te, L;
  const h = _(), u = ae(), [x, s] = v(null), [g, a] = v(null), [w, o] = v(""), [c, S] = v(null), [q, k] = v(""), P = Q({
    queryKey: ["goal", n],
    queryFn: () => h.get(`${C}/goal?id=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), N = P.data, K = () => {
    u.invalidateQueries({ queryKey: ["goal", n] }), u.invalidateQueries({ queryKey: ["goals"] });
  }, l = (i) => {
    Te(i) ? (s(t.conflictReloaded), K()) : s(j(i));
  }, f = H({
    mutationFn: (i) => h.post(`${C}/goal/status`, {
      id: n,
      status: i.status,
      reason: i.reason,
      expectedRevision: i.revision
    }),
    onSuccess: () => {
      a(null), o(""), s(null), K();
    },
    onError: l
  }), G = H({
    mutationFn: (i) => h.post(`${C}/goal/answer`, {
      id: n,
      questionId: i.questionId,
      answer: i.answer,
      expectedRevision: i.revision
    }),
    onSuccess: () => {
      S(null), k(""), s(null), K();
    },
    onError: l
  });
  if (P.isPending && !N) return /* @__PURE__ */ e($, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!N)
    return /* @__PURE__ */ e($, { children: P.error ? /* @__PURE__ */ e(R, { message: j(P.error) }) : null });
  const W = (N.questions ?? []).filter((i) => i.status === "pending"), Y = [...N.workLog ?? []].reverse().slice(0, 50), B = N.status === "active" ? "paused" : N.status === "paused" ? "active" : null, I = (i, T) => {
    const d = (T ?? q).trim();
    d && G.mutate({ questionId: i, answer: d, revision: N.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x ? /* @__PURE__ */ e(R, { message: x, onDismiss: () => s(null) }) : null,
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(E, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: N.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(F, { variant: re(N.status), children: ue(N.status) }),
          B ? /* @__PURE__ */ e(y, { onClick: () => {
            o(""), a(B);
          }, children: B === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ r("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: N.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: N.revision })
      ] })
    ] }),
    (z = N.outOfScope) != null && z.length || (O = N.acceptanceCriteria) != null && O.length || (Z = N.constraints) != null && Z.length ? /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ r(E, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (J = N.acceptanceCriteria) != null && J.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.acceptanceCriteria.map((i, T) => /* @__PURE__ */ e("li", { children: i }, T)) })
      ] }) : null,
      (ee = N.outOfScope) != null && ee.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.outOfScope.map((i, T) => /* @__PURE__ */ e("li", { children: i }, T)) })
      ] }) : null,
      (te = N.constraints) != null && te.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.constraints.map((i, T) => /* @__PURE__ */ e("li", { children: i }, T)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.tasks }),
      (L = N.tasks) != null && L.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((i) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: i }, i)) }) }),
        /* @__PURE__ */ e("tbody", { children: N.tasks.map((i) => {
          const T = i.taskName ? p.get(i.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: i.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: i.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: i.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: we(i.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: T ? /* @__PURE__ */ e(X, { onClick: () => T.runSlug && b(T.runSlug), children: /* @__PURE__ */ e(F, { variant: re(T.status), children: T.status }) }) : "—" })
          ] }, i.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.questions }),
      W.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: W.map((i) => {
        var T;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: i.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (T = i.options) != null && T.length ? i.options.map((d) => /* @__PURE__ */ e(
            y,
            {
              disabled: G.isPending,
              onClick: () => I(i.id, d),
              children: d
            },
            d
          )) : /* @__PURE__ */ r(A, { children: [
            /* @__PURE__ */ e(
              D,
              {
                value: c === i.id ? q : "",
                onChange: (d) => {
                  S(i.id), k(d.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(y, { primary: !0, onClick: () => I(i.id), children: t.submit })
          ] }) })
        ] }, i.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.workLog }),
      Y.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: Y.map((i) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: de(i.at) }),
        /* @__PURE__ */ e(F, { variant: "muted", children: i.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: i.summary })
      ] }, i.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      U,
      {
        open: g !== null,
        onClose: () => a(null),
        title: g === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => a(null), children: t.cancel }),
          /* @__PURE__ */ e(
            y,
            {
              primary: !0,
              disabled: !w.trim() || f.isPending,
              onClick: () => g && f.mutate({ status: g, reason: w.trim(), revision: N.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            D,
            {
              value: w,
              onChange: (i) => o(i.target.value),
              placeholder: t.reasonPlaceholder,
              className: "w-full mt-1"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e(
      U,
      {
        open: c !== null && W.some((i) => {
          var T;
          return i.id === c && ((T = i.options) == null ? void 0 : T.length);
        }),
        onClose: () => S(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => S(null), children: t.cancel }),
          /* @__PURE__ */ e(y, { primary: !0, onClick: () => c && I(c), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: c ? t.answerConfirm(q) : "" })
      }
    )
  ] });
}
function Re({
  project: n,
  slug: m,
  active: p
}) {
  var P, N, K;
  const b = _(), [h, u] = v(null), x = Q({
    queryKey: ["takt-run", n, m],
    queryFn: () => b.get(
      `${C}/takt/run?project=${M(n)}&slug=${M(m)}`
    ),
    refetchInterval: p ? 3e3 : !1
  }), s = x.data, g = ((P = s == null ? void 0 : s.meta) == null ? void 0 : P.status) === "running", a = ke({ offset: 0, file: "", records: [] }), [w, o] = v(0);
  se(() => {
    a.current = { offset: 0, file: "", records: [] }, o((l) => l + 1);
  }, [n, m]);
  const c = Q({
    queryKey: ["takt-run-log", n, m],
    queryFn: () => b.get(
      `${C}/takt/run/log?project=${M(n)}&slug=${M(m)}&offset=${a.current.offset}`
    ),
    refetchInterval: p && g ? 2e3 : !1,
    retry: 0
  });
  se(() => {
    const l = c.data;
    if (!l) return;
    const f = a.current;
    (l.reset || f.file && f.file !== l.file) && (f.records = []), f.file = l.file, l.records.length && (f.records = f.records.concat(l.records).slice(-2e3), o((G) => G + 1)), f.offset = l.nextOffset;
  }, [c.data]);
  const S = a.current.records, q = Q({
    queryKey: ["takt-report", n, m, h],
    queryFn: () => b.get(
      `${C}/takt/run/report?project=${M(n)}&slug=${M(m)}&name=${M(h ?? "")}`
    ),
    enabled: h !== null
  }), k = s == null ? void 0 : s.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(R, { message: j(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(R, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: m }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: k ? /* @__PURE__ */ e(F, { variant: re(k.status), children: k.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (k == null ? void 0 : k.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (k == null ? void 0 : k.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (k == null ? void 0 : k.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: ne(k == null ? void 0 : k.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: ne(k == null ? void 0 : k.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.runSteps }),
      (N = s == null ? void 0 : s.steps) != null && N.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: s.steps.map((l, f) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(F, { variant: l.type === "workflow_abort" ? "err" : l.type === "workflow_complete" ? "ok" : "muted", children: l.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: l.step ?? "—" }),
        l.status ? /* @__PURE__ */ e("span", { children: l.status }) : null,
        l.iteration != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "iter ",
          l.iteration
        ] }) : null,
        l.matchedRule != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "rule ",
          String(l.matchedRule)
        ] }) : null,
        l.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: l.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: ne(l.at) })
      ] }, f)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        c.error ? /* @__PURE__ */ e(R, { message: j(c.error) }) : null,
        S.length ? S.map((l, f) => /* @__PURE__ */ e(je, { rec: l }, f)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      c.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        c.data.file,
        " — ",
        ie(c.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.runReports }),
      (K = s == null ? void 0 : s.reports) != null && K.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: s.reports.map((l) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(X, { onClick: () => u(l.name), className: "text-accent underline", children: l.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          ie(l.size),
          " B）"
        ] })
      ] }, l.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      U,
      {
        open: h !== null,
        onClose: () => u(null),
        title: h,
        maxWidth: 880,
        children: [
          q.error ? /* @__PURE__ */ e(R, { message: j(q.error) }) : null,
          q.data ? /* @__PURE__ */ r(A, { children: [
            /* @__PURE__ */ e(he, { content: q.data.text }),
            q.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function je({ rec: n }) {
  const m = ve(() => {
    if (typeof n.raw == "string") return n.raw;
    const p = n.type ?? n.event ?? "", b = n.step ? ` ${String(n.step)}` : "", h = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(p)}${b} ${h}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: m });
}
const Pe = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], Ae = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Ee({
  project: n,
  hasTakt: m,
  active: p,
  runSlug: b,
  onSelectRun: h
}) {
  const u = _(), x = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => u.get(`${C}/takt/tasks?project=${M(n)}`),
    refetchInterval: p ? 5e3 : !1
  }), s = x.data, g = (s == null ? void 0 : s.tasks) ?? [];
  return !m && s && !s.hasTakt ? /* @__PURE__ */ e(V, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(R, { message: j(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(R, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: Pe.map((a) => {
      var w;
      return /* @__PURE__ */ e(
        ge,
        {
          label: a,
          value: ((w = s == null ? void 0 : s.counts) == null ? void 0 : w[a]) ?? 0,
          accent: a === "running"
        },
        a
      );
    }) }),
    /* @__PURE__ */ e(Fe, { project: n, active: p }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.tabTakt }),
      g.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((a) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: a }, a)) }) }),
        /* @__PURE__ */ e("tbody", { children: g.map((a, w) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => a.runSlug && h(a.runSlug),
            title: a.runSlug ? void 0 : t.runNotStarted,
            className: a.runSlug ? `cursor-pointer ${a.runSlug === b ? "bg-accent/10" : "hover:bg-raised"}` : "opacity-60 cursor-default",
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(F, { variant: re(a.status), children: a.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                a.runSlug ? /* @__PURE__ */ e(X, { onClick: () => h(a.runSlug), children: a.name }) : a.name,
                a.failure && Ae.has(a.status ?? "") ? /* @__PURE__ */ r("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(a.failure.step),
                  a.failure.error ? `: ${a.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: a.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: ne(a.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: ne(a.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.goalIds.map(Se).join(", ") || "—" })
            ]
          },
          a.name ?? w
        )) })
      ] }) : /* @__PURE__ */ e(V, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    /* @__PURE__ */ e(Ke, { project: n, active: p, tasks: g }),
    b ? /* @__PURE__ */ e(Re, { project: n, slug: b, active: p }) : g.length ? /* @__PURE__ */ e($, { children: /* @__PURE__ */ e(V, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(Ie, { project: n, active: p })
  ] });
}
function Fe({ project: n, active: m }) {
  const p = _(), b = ae(), [h, u] = v(!1), [x, s] = v(""), [g, a] = v("default"), [w, o] = v(null), c = H({
    mutationFn: () => p.post(`${C}/takt/enqueue`, {
      project: n,
      task: x,
      workflow: g,
      autoPr: !1
    }),
    onSuccess: () => {
      b.invalidateQueries({ queryKey: ["takt-tasks", n] }), u(!1), s(""), o(null);
    },
    onError: (S) => o(j(S))
  });
  return /* @__PURE__ */ r("div", { className: "flex justify-end", children: [
    /* @__PURE__ */ e(y, { primary: !0, onClick: () => u(!0), children: t.enqueueTitle }),
    /* @__PURE__ */ r(
      U,
      {
        open: h,
        onClose: () => u(!1),
        title: t.enqueueTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => u(!1), children: t.cancel }),
          /* @__PURE__ */ e(y, { primary: !0, disabled: !x.trim() || c.isPending, onClick: () => c.mutate(), children: t.enqueueSubmit })
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.enqueueTask }),
          /* @__PURE__ */ e(D, { value: x, onChange: (S) => s(S.target.value), className: "w-full mb-2" }),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.colWorkflow }),
          /* @__PURE__ */ e(D, { value: g, onChange: (S) => a(S.target.value), className: "w-full" }),
          w ? /* @__PURE__ */ e(R, { message: w }) : null
        ]
      }
    )
  ] });
}
function Ke({ project: n, active: m, tasks: p }) {
  var q, k, P, N, K, l;
  const b = _(), h = ae(), [u, x] = v(null), [s, g] = v(null), a = p.filter((f) => f.status === "pending" && f.name).map((f) => f.name), w = Q({
    queryKey: ["runner", n],
    queryFn: () => b.get(`${C}/takt/runner?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), o = (q = w.data) == null ? void 0 : q.runner, c = H({
    mutationFn: (f) => b.post(`${C}/takt/runner/start`, {
      project: n,
      mode: f,
      allowAll: !0
    }),
    onSuccess: () => {
      h.invalidateQueries({ queryKey: ["runner", n] }), x(null);
    },
    onError: (f) => x(j(f))
  }), S = H({
    mutationFn: () => b.post(`${C}/takt/runner/stop`, { project: n }),
    onSuccess: () => {
      h.invalidateQueries({ queryKey: ["runner", n] }), x(null);
    },
    onError: (f) => x(j(f))
  });
  return /* @__PURE__ */ r($, { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ e(E, { children: t.runnerTitle }),
      (k = w.data) != null && k.running ? /* @__PURE__ */ e(F, { variant: "ok", children: t.runnerRunning((o == null ? void 0 : o.pid) ?? 0, (o == null ? void 0 : o.mode) ?? "") }) : /* @__PURE__ */ e(F, { variant: "muted", children: t.runnerStopped }),
      /* @__PURE__ */ r("span", { className: "ml-auto flex gap-2", children: [
        /* @__PURE__ */ e(
          y,
          {
            disabled: ((P = w.data) == null ? void 0 : P.running) || c.isPending,
            onClick: () => a.length ? g("once") : c.mutate("once"),
            children: t.runnerStartOnce
          }
        ),
        /* @__PURE__ */ e(
          y,
          {
            disabled: ((N = w.data) == null ? void 0 : N.running) || c.isPending,
            onClick: () => a.length ? g("watch") : c.mutate("watch"),
            children: t.runnerStartWatch
          }
        ),
        /* @__PURE__ */ e(y, { danger: !0, disabled: !((K = w.data) != null && K.running) || S.isPending, onClick: () => S.mutate(), children: t.runnerStop })
      ] })
    ] }),
    u ? /* @__PURE__ */ e(R, { message: u }) : null,
    (l = o == null ? void 0 : o.logTail) != null && l.length ? /* @__PURE__ */ e("pre", { className: "mt-2 text-[12px] text-muted whitespace-pre-wrap max-h-[160px] overflow-y-auto font-mono", children: o.logTail.join(`
`) }) : null,
    /* @__PURE__ */ r(
      U,
      {
        open: s !== null,
        onClose: () => g(null),
        title: t.runnerConfirmTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => g(null), children: t.cancel }),
          /* @__PURE__ */ e(
            y,
            {
              primary: !0,
              disabled: c.isPending,
              onClick: () => {
                s && c.mutate(s), g(null);
              },
              children: t.runnerConfirmRun
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: t.runnerConfirmBody(a.length) }),
          /* @__PURE__ */ e("ul", { className: "text-[13px] font-mono mt-2 max-h-[140px] overflow-y-auto", children: a.map((f) => /* @__PURE__ */ r("li", { children: [
            "・",
            f
          ] }, f)) })
        ]
      }
    )
  ] });
}
function Ie({ project: n, active: m }) {
  var s;
  const p = _(), [b, h] = v(!1), x = ((s = Q({
    queryKey: ["takt-goal-files", n],
    queryFn: () => p.get(`${C}/takt/goal-files?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1,
    enabled: b
  }).data) == null ? void 0 : s.goals) ?? [];
  return /* @__PURE__ */ r($, { children: [
    /* @__PURE__ */ r(X, { onClick: () => h((g) => !g), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(E, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: b ? "▾" : "▸" })
    ] }),
    b ? x.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: x.map((g) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(F, { variant: "muted", children: g.status ?? "—" }),
        g.executionStatus ? /* @__PURE__ */ e(F, { variant: "muted", children: g.executionStatus }) : null,
        g.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: g.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: g.objective ?? g.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: g.path })
    ] }, g.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Me({ active: n, project: m }) {
  var K;
  const p = _(), b = ae(), [h, u] = v(""), [x, s] = v(null), g = Q({
    queryKey: ["settings"],
    queryFn: () => p.get(`${C}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), a = (K = g.data) == null ? void 0 : K.taktMcp, o = Q({
    queryKey: ["takt-config", m],
    queryFn: () => p.get(
      `${C}/takt/config?project=${encodeURIComponent(m)}`
    ),
    refetchInterval: n ? 5e3 : !1
  }).data, [c, S] = v(null), [q, k] = v(""), P = H({
    mutationFn: (l) => p.post(`${C}/takt/config`, {
      changes: l,
      revision: (o == null ? void 0 : o.revision) ?? null
    }),
    onSuccess: () => {
      b.invalidateQueries({ queryKey: ["takt-config"] }), S(null), s(null);
    },
    onError: (l) => s(j(l))
  });
  se(() => {
    a && u(a.pinned ?? "");
  }, [a == null ? void 0 : a.pinned]);
  const N = H({
    mutationFn: (l) => p.post(`${C}/settings/takt-mcp`, { path: l }),
    onSuccess: (l) => {
      b.setQueryData(["settings"], l), s(null);
    },
    onError: (l) => s(j(l))
  });
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    x ? /* @__PURE__ */ e(R, { message: x, onDismiss: () => s(null) }) : null,
    g.error ? /* @__PURE__ */ e(R, { message: j(g.error) }) : null,
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.settingsTaktMcp }),
      /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.settingsTaktMcpHint }),
      a ? a.path ? /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(F, { variant: "ok", children: t.settingsResolved(a.source ?? "") }),
        " ",
        /* @__PURE__ */ e("code", { className: "text-[13px]", children: a.path })
      ] }) : /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(F, { variant: "err", children: t.settingsNotFound }),
        " ",
        a.error ? /* @__PURE__ */ e("span", { className: "text-muted", children: a.error }) : null
      ] }) : null,
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ e(
          D,
          {
            value: h,
            onChange: (l) => u(l.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          y,
          {
            primary: !0,
            disabled: N.isPending,
            onClick: () => N.mutate(h.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          y,
          {
            disabled: N.isPending || !(a != null && a.pinned),
            onClick: () => N.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      a != null && a.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(a.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] }),
    /* @__PURE__ */ r($, { children: [
      /* @__PURE__ */ e(E, { children: t.configTitle }),
      o != null && o.global.error ? /* @__PURE__ */ e(R, { message: o.global.error }) : o != null && o.global.exists ? null : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.configNotFound }),
      /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configGlobal }),
      o ? /* @__PURE__ */ e("table", { className: "w-full text-[13px] mb-3", children: /* @__PURE__ */ e("tbody", { children: Object.entries(o.global.config).map(([l, f]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
        /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: l }),
        /* @__PURE__ */ e("td", { className: "py-1", children: c === l ? /* @__PURE__ */ r("div", { className: "flex gap-1 items-center", children: [
          /* @__PURE__ */ e(
            D,
            {
              value: q,
              onChange: (G) => k(G.target.value),
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ e(
            y,
            {
              primary: !0,
              disabled: P.isPending,
              onClick: () => P.mutate({ [l]: q }),
              children: t.configSave
            }
          )
        ] }) : typeof f == "object" ? /* @__PURE__ */ e("code", { className: "text-muted", children: JSON.stringify(f) }) : /* @__PURE__ */ e("code", { children: String(f) }) }),
        /* @__PURE__ */ e("td", { className: "py-1 w-[60px] text-right", children: o.writableKeys.includes(l) && c !== l ? /* @__PURE__ */ e(
          y,
          {
            onClick: () => {
              S(l), k(String(f));
            },
            children: t.configEdit
          }
        ) : null })
      ] }, l)) }) }) : null,
      o != null && o.project.exists ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configProject }),
        /* @__PURE__ */ e("table", { className: "w-full text-[13px]", children: /* @__PURE__ */ e("tbody", { children: Object.entries(o.project.config).map(([l, f]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
          /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: l }),
          /* @__PURE__ */ e("td", { className: "py-1", children: /* @__PURE__ */ e("code", { className: "text-muted", children: typeof f == "object" ? JSON.stringify(f) : String(f) }) })
        ] }, l)) }) })
      ] }) : null
    ] })
  ] });
}
function ce({
  path: n,
  onNavigate: m,
  onPick: p
}) {
  const b = _(), h = Q({
    queryKey: ["directories", n],
    queryFn: () => b.post(`${C}/directories`, { path: n })
  }), u = h.data;
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ e(
        y,
        {
          disabled: !(u != null && u.parent),
          onClick: () => (u == null ? void 0 : u.parent) && m(u.parent),
          children: t.browseUp
        }
      ),
      /* @__PURE__ */ e("code", { className: "text-[12px] text-muted truncate flex-1", children: (u == null ? void 0 : u.path) ?? n }),
      p ? /* @__PURE__ */ e(y, { primary: !0, onClick: () => u && p(u.path), children: t.browsePick }) : null
    ] }),
    /* @__PURE__ */ e("div", { className: "border border-subtle rounded max-h-[220px] overflow-y-auto", children: h.isLoading ? /* @__PURE__ */ e("p", { className: "text-sm text-muted p-2", children: "…" }) : h.error ? /* @__PURE__ */ e("p", { className: "text-sm p-2", children: j(h.error) }) : ((u == null ? void 0 : u.directories) ?? []).map((x) => /* @__PURE__ */ r(
      X,
      {
        className: "flex items-center gap-2 px-2 py-1 text-[13px] hover:bg-hover",
        onClick: () => m(x.path),
        children: [
          /* @__PURE__ */ e("span", { className: "truncate", children: x.name }),
          /* @__PURE__ */ r("span", { className: "ml-auto flex gap-1", children: [
            x.hasGit ? /* @__PURE__ */ e(F, { variant: "ok", children: t.browseGit }) : null,
            x.hasTakt ? /* @__PURE__ */ e(F, { variant: "aim", children: t.browseTakt }) : null
          ] })
        ]
      },
      x.path
    )) }),
    u != null && u.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.browseTruncated }) : null
  ] });
}
const Qe = new be({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Oe() {
  var T;
  const n = _(), p = pe().active !== !1, b = ae(), [h, u] = v(""), [x, s] = v("goals"), [g, a] = v(null), [w, o] = v(!1), [c, S] = v(!1), [q, k] = v(""), [P, N] = v(""), [K, l] = v(!1), [f, G] = v(""), [W, Y] = v("~"), [B, I] = v(null), z = Q({
    queryKey: ["projects"],
    queryFn: () => n.get(`${C}/projects`),
    refetchInterval: p ? 5e3 : !1
  }), O = ((T = z.data) == null ? void 0 : T.projects) ?? [];
  se(() => {
    if (!O.length) {
      u("");
      return;
    }
    if (!O.some((le) => le.path === h && !le.missing)) {
      const le = O.find((me) => !me.missing) ?? O[0];
      u(le.path);
    }
  }, [O, h]);
  const Z = () => b.invalidateQueries({ queryKey: ["projects"] }), J = H({
    mutationFn: (d) => n.post(`${C}/projects/add`, { path: d }),
    onSuccess: (d) => {
      b.setQueryData(["projects"], d), Z(), o(!1), G(""), I(null), d.projects.length && u(d.projects[d.projects.length - 1].path);
    },
    onError: (d) => I(j(d))
  }), ee = H({
    mutationFn: (d) => n.post(`${C}/projects/clone`, d),
    onSuccess: (d) => {
      b.setQueryData(["projects"], d), S(!1), k(""), N(""), I(null);
    },
    onError: (d) => I(j(d))
  }), te = H({
    mutationFn: (d) => n.post(`${C}/projects/remove`, { path: d }),
    onSuccess: (d) => {
      b.setQueryData(["projects"], d), Z(), l(!1), I(null);
    },
    onError: (d) => I(j(d))
  }), L = O.find((d) => d.path === h), i = (d) => {
    a(d), s("takt");
  };
  return /* @__PURE__ */ r(A, { children: [
    /* @__PURE__ */ e(
      fe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(
            xe,
            {
              "aria-label": t.projectLabel,
              options: O.map((d) => d.path),
              optionLabels: O.map((d) => d.missing ? `${d.name}（${t.projectMissing}）` : d.name),
              value: h,
              onChange: u,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(y, { onClick: () => {
            I(null), o(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(y, { onClick: () => {
            I(null), S(!0);
          }, children: t.cloneTitle }),
          /* @__PURE__ */ e(
            y,
            {
              danger: !0,
              disabled: !L,
              onClick: () => {
                I(null), l(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: O.length ? /* @__PURE__ */ r(A, { children: [
      z.error ? /* @__PURE__ */ e(R, { message: j(z.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        Ne,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt },
            { key: "settings", label: t.tabSettings }
          ],
          value: x,
          onChange: s,
          ariaLabel: t.appTitle
        }
      ) }),
      x === "settings" ? /* @__PURE__ */ e(Me, { active: p, project: h }) : h ? x === "goals" ? /* @__PURE__ */ e(qe, { project: h, active: p, onOpenRun: i }) : /* @__PURE__ */ e(
        Ee,
        {
          project: h,
          hasTakt: (L == null ? void 0 : L.hasTakt) ?? !1,
          active: p,
          runSlug: g,
          onSelectRun: a
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      V,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(y, { primary: !0, onClick: () => {
          I(null), o(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      U,
      {
        open: w,
        onClose: () => o(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => o(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            y,
            {
              primary: !0,
              disabled: !f.trim() || J.isPending,
              onClick: () => J.mutate(f.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            ce,
            {
              path: W,
              onNavigate: Y,
              onPick: (d) => {
                J.mutate(d), o(!1);
              }
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-3 mb-1", children: t.browseOrType }),
          /* @__PURE__ */ e(
            D,
            {
              value: f,
              onChange: (d) => G(d.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          B ? /* @__PURE__ */ e(R, { message: B }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      U,
      {
        open: c,
        onClose: () => S(!1),
        title: t.cloneTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => S(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            y,
            {
              primary: !0,
              disabled: !q.trim() || ee.isPending,
              onClick: () => ee.mutate({
                url: q.trim(),
                parent: W,
                name: P.trim() || void 0
              }),
              children: t.cloneSubmit
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.cloneUrl }),
          /* @__PURE__ */ e(
            D,
            {
              value: q,
              onChange: (d) => k(d.target.value),
              placeholder: t.cloneUrlHint,
              className: "w-full mb-2"
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.cloneParent }),
          /* @__PURE__ */ e(ce, { path: W, onNavigate: Y }),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2 mb-1", children: t.cloneName }),
          /* @__PURE__ */ e(
            D,
            {
              value: P,
              onChange: (d) => N(d.target.value),
              placeholder: "repo-name",
              className: "w-full"
            }
          ),
          B ? /* @__PURE__ */ e(R, { message: B }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      U,
      {
        open: K,
        onClose: () => l(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(y, { onClick: () => l(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            y,
            {
              danger: !0,
              disabled: te.isPending,
              onClick: () => L && te.mutate(L.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: L ? t.projectRemoveConfirm(L.name) : "" }),
          B ? /* @__PURE__ */ e(R, { message: B }) : null
        ]
      }
    )
  ] });
}
function De() {
  return /* @__PURE__ */ e(ye, { client: Qe, children: /* @__PURE__ */ e(Oe, {}) });
}
export {
  De as default
};
