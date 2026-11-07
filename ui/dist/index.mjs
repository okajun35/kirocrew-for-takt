import { jsxs as r, jsx as e, Fragment as A } from "react/jsx-runtime";
import { useAppApi as _, fmtRelative as de, fmtDateTime as ne, fmtNumber as oe, useAppInfo as pe } from "@kirocrew/app-sdk";
import { Card as R, CardTitle as E, ErrorNotice as j, EmptyState as V, Clickable as X, Badge as F, Btn as k, Input as D, Modal as W, MarkdownRenderer as he, StatCard as ge, PageHeader as fe, Select as xe, SegmentedControl as Ne } from "@kirocrew/app-sdk/ui";
import { useQuery as Q, useQueryClient as ae, useMutation as H, QueryClient as be, QueryClientProvider as ye } from "@tanstack/react-query";
import { useState as y, useRef as ke, useEffect as le, useMemo as ve } from "react";
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
}, ie = {
  bad_request: t.errorBadRequest,
  unauthorized: t.errorUnauthorized,
  owner_only: t.errorOwnerOnly,
  app_token_forbidden: t.errorAppTokenForbidden,
  sensitive_path: t.errorSensitivePath,
  not_found: t.errorNotFound,
  conflict: t.errorConflict,
  internal: t.errorInternal
}, S = "/api/apps/for-takt", I = encodeURIComponent;
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
function P(n) {
  if (n && typeof n == "object") {
    const m = n;
    if (typeof m.body == "string" && m.body) {
      try {
        const d = JSON.parse(m.body);
        if (d && typeof d.code == "string" && ie[d.code]) {
          const x = typeof d.error == "string" ? d.error : "";
          return `${ie[d.code]}${x ? `（${x}）` : ""}`;
        }
        if (d && typeof d.error == "string") return d.error;
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
  onOpenRun: d
}) {
  var T, g;
  const x = _(), [p, i] = y(null), h = Q({
    queryKey: ["goals", n],
    queryFn: () => x.get(`${S}/goals?project=${I(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), s = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => x.get(`${S}/takt/tasks?project=${I(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), f = ((T = h.data) == null ? void 0 : T.goals) ?? [], a = /* @__PURE__ */ new Map();
  for (const u of ((g = s.data) == null ? void 0 : g.tasks) ?? [])
    u.name && a.set(u.name, u);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.tabGoals }),
      h.error ? /* @__PURE__ */ e(j, { message: P(h.error) }) : null,
      f.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((u) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: u }, u)) }) }),
        /* @__PURE__ */ e("tbody", { children: f.map((u) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => i(u.id),
            className: `cursor-pointer ${u.id === p ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(X, { onClick: () => i(u.id), children: (u.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(F, { variant: re(u.status), children: ue(u.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: u.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: u.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: u.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: de(u.updatedAt) })
            ]
          },
          u.id
        )) })
      ] }) : /* @__PURE__ */ e(V, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: p ? /* @__PURE__ */ e(
      $e,
      {
        id: p,
        active: m,
        taktByName: a,
        onOpenRun: d
      }
    ) : /* @__PURE__ */ e(R, { children: /* @__PURE__ */ e(V, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function $e({
  id: n,
  active: m,
  taktByName: d,
  onOpenRun: x
}) {
  var z, O, Z, J, ee, te, L;
  const p = _(), i = ae(), [h, s] = y(null), [f, a] = y(null), [T, g] = y(""), [u, w] = y(null), [q, b] = y(""), $ = Q({
    queryKey: ["goal", n],
    queryFn: () => p.get(`${S}/goal?id=${I(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), N = $.data, M = () => {
    i.invalidateQueries({ queryKey: ["goal", n] }), i.invalidateQueries({ queryKey: ["goals"] });
  }, l = (o) => {
    Te(o) ? (s(t.conflictReloaded), M()) : s(P(o));
  }, v = H({
    mutationFn: (o) => p.post(`${S}/goal/status`, {
      id: n,
      status: o.status,
      reason: o.reason,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      a(null), g(""), s(null), M();
    },
    onError: l
  }), G = H({
    mutationFn: (o) => p.post(`${S}/goal/answer`, {
      id: n,
      questionId: o.questionId,
      answer: o.answer,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      w(null), b(""), s(null), M();
    },
    onError: l
  });
  if ($.isPending && !N) return /* @__PURE__ */ e(R, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!N)
    return /* @__PURE__ */ e(R, { children: $.error ? /* @__PURE__ */ e(j, { message: P($.error) }) : null });
  const U = (N.questions ?? []).filter((o) => o.status === "pending"), Y = [...N.workLog ?? []].reverse().slice(0, 50), B = N.status === "active" ? "paused" : N.status === "paused" ? "active" : null, K = (o, C) => {
    const c = (C ?? q).trim();
    c && G.mutate({ questionId: o, answer: c, revision: N.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    h ? /* @__PURE__ */ e(j, { message: h, onDismiss: () => s(null) }) : null,
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(E, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: N.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(F, { variant: re(N.status), children: ue(N.status) }),
          B ? /* @__PURE__ */ e(k, { onClick: () => {
            g(""), a(B);
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
    (z = N.outOfScope) != null && z.length || (O = N.acceptanceCriteria) != null && O.length || (Z = N.constraints) != null && Z.length ? /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ r(E, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (J = N.acceptanceCriteria) != null && J.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.acceptanceCriteria.map((o, C) => /* @__PURE__ */ e("li", { children: o }, C)) })
      ] }) : null,
      (ee = N.outOfScope) != null && ee.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.outOfScope.map((o, C) => /* @__PURE__ */ e("li", { children: o }, C)) })
      ] }) : null,
      (te = N.constraints) != null && te.length ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: N.constraints.map((o, C) => /* @__PURE__ */ e("li", { children: o }, C)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.tasks }),
      (L = N.tasks) != null && L.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((o) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: o }, o)) }) }),
        /* @__PURE__ */ e("tbody", { children: N.tasks.map((o) => {
          const C = o.taskName ? d.get(o.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: o.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: we(o.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: C ? /* @__PURE__ */ e(X, { onClick: () => C.runSlug && x(C.runSlug), children: /* @__PURE__ */ e(F, { variant: re(C.status), children: C.status }) }) : "—" })
          ] }, o.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.questions }),
      U.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: U.map((o) => {
        var C;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: o.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (C = o.options) != null && C.length ? o.options.map((c) => /* @__PURE__ */ e(
            k,
            {
              disabled: G.isPending,
              onClick: () => K(o.id, c),
              children: c
            },
            c
          )) : /* @__PURE__ */ r(A, { children: [
            /* @__PURE__ */ e(
              D,
              {
                value: u === o.id ? q : "",
                onChange: (c) => {
                  w(o.id), b(c.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(k, { primary: !0, onClick: () => K(o.id), children: t.submit })
          ] }) })
        ] }, o.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.workLog }),
      Y.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: Y.map((o) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: de(o.at) }),
        /* @__PURE__ */ e(F, { variant: "muted", children: o.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: o.summary })
      ] }, o.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      W,
      {
        open: f !== null,
        onClose: () => a(null),
        title: f === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => a(null), children: t.cancel }),
          /* @__PURE__ */ e(
            k,
            {
              primary: !0,
              disabled: !T.trim() || v.isPending,
              onClick: () => f && v.mutate({ status: f, reason: T.trim(), revision: N.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            D,
            {
              value: T,
              onChange: (o) => g(o.target.value),
              placeholder: t.reasonPlaceholder,
              className: "w-full mt-1"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e(
      W,
      {
        open: u !== null && U.some((o) => {
          var C;
          return o.id === u && ((C = o.options) == null ? void 0 : C.length);
        }),
        onClose: () => w(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => w(null), children: t.cancel }),
          /* @__PURE__ */ e(k, { primary: !0, onClick: () => u && K(u), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: u ? t.answerConfirm(q) : "" })
      }
    )
  ] });
}
function Re({
  project: n,
  slug: m,
  active: d
}) {
  var $, N, M;
  const x = _(), [p, i] = y(null), h = Q({
    queryKey: ["takt-run", n, m],
    queryFn: () => x.get(
      `${S}/takt/run?project=${I(n)}&slug=${I(m)}`
    ),
    refetchInterval: d ? 3e3 : !1
  }), s = h.data, f = (($ = s == null ? void 0 : s.meta) == null ? void 0 : $.status) === "running", a = ke({ offset: 0, file: "", records: [] }), [T, g] = y(0);
  le(() => {
    a.current = { offset: 0, file: "", records: [] }, g((l) => l + 1);
  }, [n, m]);
  const u = Q({
    queryKey: ["takt-run-log", n, m],
    queryFn: () => x.get(
      `${S}/takt/run/log?project=${I(n)}&slug=${I(m)}&offset=${a.current.offset}`
    ),
    refetchInterval: d && f ? 2e3 : !1,
    retry: 0
  });
  le(() => {
    const l = u.data;
    if (!l) return;
    const v = a.current;
    (l.reset || v.file && v.file !== l.file) && (v.records = []), v.file = l.file, l.records.length && (v.records = v.records.concat(l.records).slice(-2e3), g((G) => G + 1)), v.offset = l.nextOffset;
  }, [u.data]);
  const w = a.current.records, q = Q({
    queryKey: ["takt-report", n, m, p],
    queryFn: () => x.get(
      `${S}/takt/run/report?project=${I(n)}&slug=${I(m)}&name=${I(p ?? "")}`
    ),
    enabled: p !== null
  }), b = s == null ? void 0 : s.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    h.error ? /* @__PURE__ */ e(j, { message: P(h.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(j, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: m }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: b ? /* @__PURE__ */ e(F, { variant: re(b.status), children: b.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: ne(b == null ? void 0 : b.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: ne(b == null ? void 0 : b.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.runSteps }),
      (N = s == null ? void 0 : s.steps) != null && N.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: s.steps.map((l, v) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
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
      ] }, v)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        u.error ? /* @__PURE__ */ e(j, { message: P(u.error) }) : null,
        w.length ? w.map((l, v) => /* @__PURE__ */ e(je, { rec: l }, v)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      u.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        u.data.file,
        " — ",
        oe(u.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.runReports }),
      (M = s == null ? void 0 : s.reports) != null && M.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: s.reports.map((l) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(X, { onClick: () => i(l.name), className: "text-accent underline", children: l.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          oe(l.size),
          " B）"
        ] })
      ] }, l.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      W,
      {
        open: p !== null,
        onClose: () => i(null),
        title: p,
        maxWidth: 880,
        children: [
          q.error ? /* @__PURE__ */ e(j, { message: P(q.error) }) : null,
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
    const d = n.type ?? n.event ?? "", x = n.step ? ` ${String(n.step)}` : "", p = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(d)}${x} ${p}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: m });
}
const Pe = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], Ae = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Ee({
  project: n,
  hasTakt: m,
  active: d,
  runSlug: x,
  onSelectRun: p
}) {
  const i = _(), h = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => i.get(`${S}/takt/tasks?project=${I(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), s = h.data, f = (s == null ? void 0 : s.tasks) ?? [];
  return !m && s && !s.hasTakt ? /* @__PURE__ */ e(V, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    h.error ? /* @__PURE__ */ e(j, { message: P(h.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(j, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: Pe.map((a) => {
      var T;
      return /* @__PURE__ */ e(
        ge,
        {
          label: a,
          value: ((T = s == null ? void 0 : s.counts) == null ? void 0 : T[a]) ?? 0,
          accent: a === "running"
        },
        a
      );
    }) }),
    /* @__PURE__ */ e(Fe, { project: n, active: d }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.tabTakt }),
      f.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((a) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: a }, a)) }) }),
        /* @__PURE__ */ e("tbody", { children: f.map((a, T) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => a.runSlug && p(a.runSlug),
            title: a.runSlug ? void 0 : t.runNotStarted,
            className: a.runSlug ? `cursor-pointer ${a.runSlug === x ? "bg-accent/10" : "hover:bg-raised"}` : "opacity-60 cursor-default",
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(F, { variant: re(a.status), children: a.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                a.runSlug ? /* @__PURE__ */ e(X, { onClick: () => p(a.runSlug), children: a.name }) : a.name,
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
          a.name ?? T
        )) })
      ] }) : /* @__PURE__ */ e(V, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    /* @__PURE__ */ e(Ke, { project: n, active: d }),
    x ? /* @__PURE__ */ e(Re, { project: n, slug: x, active: d }) : f.length ? /* @__PURE__ */ e(R, { children: /* @__PURE__ */ e(V, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(Ie, { project: n, active: d })
  ] });
}
function Fe({ project: n, active: m }) {
  const d = _(), x = ae(), [p, i] = y(!1), [h, s] = y(""), [f, a] = y("default"), [T, g] = y(null), u = H({
    mutationFn: () => d.post(`${S}/takt/enqueue`, {
      project: n,
      task: h,
      workflow: f,
      autoPr: !1
    }),
    onSuccess: () => {
      x.invalidateQueries({ queryKey: ["takt-tasks", n] }), i(!1), s(""), g(null);
    },
    onError: (w) => g(P(w))
  });
  return /* @__PURE__ */ r("div", { className: "flex justify-end", children: [
    /* @__PURE__ */ e(k, { primary: !0, onClick: () => i(!0), children: t.enqueueTitle }),
    /* @__PURE__ */ r(
      W,
      {
        open: p,
        onClose: () => i(!1),
        title: t.enqueueTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => i(!1), children: t.cancel }),
          /* @__PURE__ */ e(k, { primary: !0, disabled: !h.trim() || u.isPending, onClick: () => u.mutate(), children: t.enqueueSubmit })
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.enqueueTask }),
          /* @__PURE__ */ e(D, { value: h, onChange: (w) => s(w.target.value), className: "w-full mb-2" }),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.colWorkflow }),
          /* @__PURE__ */ e(D, { value: f, onChange: (w) => a(w.target.value), className: "w-full" }),
          T ? /* @__PURE__ */ e(j, { message: T }) : null
        ]
      }
    )
  ] });
}
function Ke({ project: n, active: m }) {
  var T, g, u, w, q, b;
  const d = _(), x = ae(), [p, i] = y(null), h = Q({
    queryKey: ["runner", n],
    queryFn: () => d.get(`${S}/takt/runner?project=${I(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), s = (T = h.data) == null ? void 0 : T.runner, f = H({
    mutationFn: ($) => d.post(`${S}/takt/runner/start`, { project: n, mode: $ }),
    onSuccess: () => {
      x.invalidateQueries({ queryKey: ["runner", n] }), i(null);
    },
    onError: ($) => i(P($))
  }), a = H({
    mutationFn: () => d.post(`${S}/takt/runner/stop`, { project: n }),
    onSuccess: () => {
      x.invalidateQueries({ queryKey: ["runner", n] }), i(null);
    },
    onError: ($) => i(P($))
  });
  return /* @__PURE__ */ r(R, { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ e(E, { children: t.runnerTitle }),
      (g = h.data) != null && g.running ? /* @__PURE__ */ e(F, { variant: "ok", children: t.runnerRunning((s == null ? void 0 : s.pid) ?? 0, (s == null ? void 0 : s.mode) ?? "") }) : /* @__PURE__ */ e(F, { variant: "muted", children: t.runnerStopped }),
      /* @__PURE__ */ r("span", { className: "ml-auto flex gap-2", children: [
        /* @__PURE__ */ e(k, { disabled: ((u = h.data) == null ? void 0 : u.running) || f.isPending, onClick: () => f.mutate("once"), children: t.runnerStartOnce }),
        /* @__PURE__ */ e(k, { disabled: ((w = h.data) == null ? void 0 : w.running) || f.isPending, onClick: () => f.mutate("watch"), children: t.runnerStartWatch }),
        /* @__PURE__ */ e(k, { danger: !0, disabled: !((q = h.data) != null && q.running) || a.isPending, onClick: () => a.mutate(), children: t.runnerStop })
      ] })
    ] }),
    p ? /* @__PURE__ */ e(j, { message: p }) : null,
    (b = s == null ? void 0 : s.logTail) != null && b.length ? /* @__PURE__ */ e("pre", { className: "mt-2 text-[12px] text-muted whitespace-pre-wrap max-h-[160px] overflow-y-auto font-mono", children: s.logTail.join(`
`) }) : null
  ] });
}
function Ie({ project: n, active: m }) {
  var s;
  const d = _(), [x, p] = y(!1), h = ((s = Q({
    queryKey: ["takt-goal-files", n],
    queryFn: () => d.get(`${S}/takt/goal-files?project=${I(n)}`),
    refetchInterval: m ? 5e3 : !1,
    enabled: x
  }).data) == null ? void 0 : s.goals) ?? [];
  return /* @__PURE__ */ r(R, { children: [
    /* @__PURE__ */ r(X, { onClick: () => p((f) => !f), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(E, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: x ? "▾" : "▸" })
    ] }),
    x ? h.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: h.map((f) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(F, { variant: "muted", children: f.status ?? "—" }),
        f.executionStatus ? /* @__PURE__ */ e(F, { variant: "muted", children: f.executionStatus }) : null,
        f.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: f.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: f.objective ?? f.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: f.path })
    ] }, f.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Qe({ active: n, project: m }) {
  var M;
  const d = _(), x = ae(), [p, i] = y(""), [h, s] = y(null), f = Q({
    queryKey: ["settings"],
    queryFn: () => d.get(`${S}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), a = (M = f.data) == null ? void 0 : M.taktMcp, g = Q({
    queryKey: ["takt-config", m],
    queryFn: () => d.get(
      `${S}/takt/config?project=${encodeURIComponent(m)}`
    ),
    refetchInterval: n ? 5e3 : !1
  }).data, [u, w] = y(null), [q, b] = y(""), $ = H({
    mutationFn: (l) => d.post(`${S}/takt/config`, {
      changes: l,
      revision: (g == null ? void 0 : g.revision) ?? null
    }),
    onSuccess: () => {
      x.invalidateQueries({ queryKey: ["takt-config"] }), w(null), s(null);
    },
    onError: (l) => s(P(l))
  });
  le(() => {
    a && i(a.pinned ?? "");
  }, [a == null ? void 0 : a.pinned]);
  const N = H({
    mutationFn: (l) => d.post(`${S}/settings/takt-mcp`, { path: l }),
    onSuccess: (l) => {
      x.setQueryData(["settings"], l), s(null);
    },
    onError: (l) => s(P(l))
  });
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    h ? /* @__PURE__ */ e(j, { message: h, onDismiss: () => s(null) }) : null,
    f.error ? /* @__PURE__ */ e(j, { message: P(f.error) }) : null,
    /* @__PURE__ */ r(R, { children: [
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
            value: p,
            onChange: (l) => i(l.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          k,
          {
            primary: !0,
            disabled: N.isPending,
            onClick: () => N.mutate(p.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          k,
          {
            disabled: N.isPending || !(a != null && a.pinned),
            onClick: () => N.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      a != null && a.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(a.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] }),
    /* @__PURE__ */ r(R, { children: [
      /* @__PURE__ */ e(E, { children: t.configTitle }),
      g != null && g.global.error ? /* @__PURE__ */ e(j, { message: g.global.error }) : g != null && g.global.exists ? null : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.configNotFound }),
      /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configGlobal }),
      g ? /* @__PURE__ */ e("table", { className: "w-full text-[13px] mb-3", children: /* @__PURE__ */ e("tbody", { children: Object.entries(g.global.config).map(([l, v]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
        /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: l }),
        /* @__PURE__ */ e("td", { className: "py-1", children: u === l ? /* @__PURE__ */ r("div", { className: "flex gap-1 items-center", children: [
          /* @__PURE__ */ e(
            D,
            {
              value: q,
              onChange: (G) => b(G.target.value),
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ e(
            k,
            {
              primary: !0,
              disabled: $.isPending,
              onClick: () => $.mutate({ [l]: q }),
              children: t.configSave
            }
          )
        ] }) : typeof v == "object" ? /* @__PURE__ */ e("code", { className: "text-muted", children: JSON.stringify(v) }) : /* @__PURE__ */ e("code", { children: String(v) }) }),
        /* @__PURE__ */ e("td", { className: "py-1 w-[60px] text-right", children: g.writableKeys.includes(l) && u !== l ? /* @__PURE__ */ e(
          k,
          {
            onClick: () => {
              w(l), b(String(v));
            },
            children: t.configEdit
          }
        ) : null })
      ] }, l)) }) }) : null,
      g != null && g.project.exists ? /* @__PURE__ */ r(A, { children: [
        /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configProject }),
        /* @__PURE__ */ e("table", { className: "w-full text-[13px]", children: /* @__PURE__ */ e("tbody", { children: Object.entries(g.project.config).map(([l, v]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
          /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: l }),
          /* @__PURE__ */ e("td", { className: "py-1", children: /* @__PURE__ */ e("code", { className: "text-muted", children: typeof v == "object" ? JSON.stringify(v) : String(v) }) })
        ] }, l)) }) })
      ] }) : null
    ] })
  ] });
}
function ce({
  path: n,
  onNavigate: m,
  onPick: d
}) {
  const x = _(), p = Q({
    queryKey: ["directories", n],
    queryFn: () => x.post(`${S}/directories`, { path: n })
  }), i = p.data;
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ e(
        k,
        {
          disabled: !(i != null && i.parent),
          onClick: () => (i == null ? void 0 : i.parent) && m(i.parent),
          children: t.browseUp
        }
      ),
      /* @__PURE__ */ e("code", { className: "text-[12px] text-muted truncate flex-1", children: (i == null ? void 0 : i.path) ?? n }),
      d ? /* @__PURE__ */ e(k, { primary: !0, onClick: () => i && d(i.path), children: t.browsePick }) : null
    ] }),
    /* @__PURE__ */ e("div", { className: "border border-subtle rounded max-h-[220px] overflow-y-auto", children: p.isLoading ? /* @__PURE__ */ e("p", { className: "text-sm text-muted p-2", children: "…" }) : p.error ? /* @__PURE__ */ e("p", { className: "text-sm p-2", children: P(p.error) }) : ((i == null ? void 0 : i.directories) ?? []).map((h) => /* @__PURE__ */ r(
      X,
      {
        className: "flex items-center gap-2 px-2 py-1 text-[13px] hover:bg-hover",
        onClick: () => m(h.path),
        children: [
          /* @__PURE__ */ e("span", { className: "truncate", children: h.name }),
          /* @__PURE__ */ r("span", { className: "ml-auto flex gap-1", children: [
            h.hasGit ? /* @__PURE__ */ e(F, { variant: "ok", children: t.browseGit }) : null,
            h.hasTakt ? /* @__PURE__ */ e(F, { variant: "aim", children: t.browseTakt }) : null
          ] })
        ]
      },
      h.path
    )) }),
    i != null && i.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.browseTruncated }) : null
  ] });
}
const Oe = new be({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Me() {
  var C;
  const n = _(), d = pe().active !== !1, x = ae(), [p, i] = y(""), [h, s] = y("goals"), [f, a] = y(null), [T, g] = y(!1), [u, w] = y(!1), [q, b] = y(""), [$, N] = y(""), [M, l] = y(!1), [v, G] = y(""), [U, Y] = y("~"), [B, K] = y(null), z = Q({
    queryKey: ["projects"],
    queryFn: () => n.get(`${S}/projects`),
    refetchInterval: d ? 5e3 : !1
  }), O = ((C = z.data) == null ? void 0 : C.projects) ?? [];
  le(() => {
    if (!O.length) {
      i("");
      return;
    }
    if (!O.some((se) => se.path === p && !se.missing)) {
      const se = O.find((me) => !me.missing) ?? O[0];
      i(se.path);
    }
  }, [O, p]);
  const Z = () => x.invalidateQueries({ queryKey: ["projects"] }), J = H({
    mutationFn: (c) => n.post(`${S}/projects/add`, { path: c }),
    onSuccess: (c) => {
      x.setQueryData(["projects"], c), Z(), g(!1), G(""), K(null), c.projects.length && i(c.projects[c.projects.length - 1].path);
    },
    onError: (c) => K(P(c))
  }), ee = H({
    mutationFn: (c) => n.post(`${S}/projects/clone`, c),
    onSuccess: (c) => {
      x.setQueryData(["projects"], c), w(!1), b(""), N(""), K(null);
    },
    onError: (c) => K(P(c))
  }), te = H({
    mutationFn: (c) => n.post(`${S}/projects/remove`, { path: c }),
    onSuccess: (c) => {
      x.setQueryData(["projects"], c), Z(), l(!1), K(null);
    },
    onError: (c) => K(P(c))
  }), L = O.find((c) => c.path === p), o = (c) => {
    a(c), s("takt");
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
              options: O.map((c) => c.path),
              optionLabels: O.map((c) => c.missing ? `${c.name}（${t.projectMissing}）` : c.name),
              value: p,
              onChange: i,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(k, { onClick: () => {
            K(null), g(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(k, { onClick: () => {
            K(null), w(!0);
          }, children: t.cloneTitle }),
          /* @__PURE__ */ e(
            k,
            {
              danger: !0,
              disabled: !L,
              onClick: () => {
                K(null), l(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: O.length ? /* @__PURE__ */ r(A, { children: [
      z.error ? /* @__PURE__ */ e(j, { message: P(z.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        Ne,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt },
            { key: "settings", label: t.tabSettings }
          ],
          value: h,
          onChange: s,
          ariaLabel: t.appTitle
        }
      ) }),
      h === "settings" ? /* @__PURE__ */ e(Qe, { active: d, project: p }) : p ? h === "goals" ? /* @__PURE__ */ e(qe, { project: p, active: d, onOpenRun: o }) : /* @__PURE__ */ e(
        Ee,
        {
          project: p,
          hasTakt: (L == null ? void 0 : L.hasTakt) ?? !1,
          active: d,
          runSlug: f,
          onSelectRun: a
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      V,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(k, { primary: !0, onClick: () => {
          K(null), g(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      W,
      {
        open: T,
        onClose: () => g(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => g(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            k,
            {
              primary: !0,
              disabled: !v.trim() || J.isPending,
              onClick: () => J.mutate(v.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            ce,
            {
              path: U,
              onNavigate: Y,
              onPick: (c) => {
                J.mutate(c), g(!1);
              }
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-3 mb-1", children: t.browseOrType }),
          /* @__PURE__ */ e(
            D,
            {
              value: v,
              onChange: (c) => G(c.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          B ? /* @__PURE__ */ e(j, { message: B }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      W,
      {
        open: u,
        onClose: () => w(!1),
        title: t.cloneTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => w(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            k,
            {
              primary: !0,
              disabled: !q.trim() || ee.isPending,
              onClick: () => ee.mutate({
                url: q.trim(),
                parent: U,
                name: $.trim() || void 0
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
              onChange: (c) => b(c.target.value),
              placeholder: t.cloneUrlHint,
              className: "w-full mb-2"
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.cloneParent }),
          /* @__PURE__ */ e(ce, { path: U, onNavigate: Y }),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2 mb-1", children: t.cloneName }),
          /* @__PURE__ */ e(
            D,
            {
              value: $,
              onChange: (c) => N(c.target.value),
              placeholder: "repo-name",
              className: "w-full"
            }
          ),
          B ? /* @__PURE__ */ e(j, { message: B }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      W,
      {
        open: M,
        onClose: () => l(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(A, { children: [
          /* @__PURE__ */ e(k, { onClick: () => l(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            k,
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
          B ? /* @__PURE__ */ e(j, { message: B }) : null
        ]
      }
    )
  ] });
}
function De() {
  return /* @__PURE__ */ e(ye, { client: Oe, children: /* @__PURE__ */ e(Me, {}) });
}
export {
  De as default
};
