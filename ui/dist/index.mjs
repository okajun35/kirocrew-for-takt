import { jsxs as r, jsx as e, Fragment as I } from "react/jsx-runtime";
import { useAppApi as B, fmtRelative as ie, fmtDateTime as J, fmtNumber as le, useAppInfo as de } from "@kirocrew/app-sdk";
import { Card as T, CardTitle as q, ErrorNotice as R, EmptyState as U, Clickable as z, Badge as P, Btn as S, Input as te, Modal as V, MarkdownRenderer as ue, StatCard as me, PageHeader as pe, Select as he, SegmentedControl as ge } from "@kirocrew/app-sdk/ui";
import { useQuery as K, useQueryClient as re, useMutation as X, QueryClient as fe, QueryClientProvider as xe } from "@tanstack/react-query";
import { useState as k, useRef as Ne, useEffect as ne, useMemo as ye } from "react";
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
  runSelectHint: "上の表からタスクを選んでください",
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
}, C = "/api/apps/for-takt", F = encodeURIComponent;
function Y(n) {
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
function ce(n) {
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
function be(n) {
  return n ? n.slice(0, 8) : "—";
}
function ke(n) {
  return n ? n.slice(0, 8) : "—";
}
function E(n) {
  if (n && typeof n == "object") {
    const u = n;
    if (typeof u.body == "string" && u.body) {
      try {
        const m = JSON.parse(u.body);
        if (m && typeof m.code == "string" && oe[m.code]) {
          const f = typeof m.error == "string" ? m.error : "";
          return `${oe[m.code]}${f ? `（${f}）` : ""}`;
        }
        if (m && typeof m.error == "string") return m.error;
      } catch {
      }
      return u.body;
    }
    if (typeof u.message == "string" && u.message) return u.message;
  }
  return t.errorGeneric;
}
function ve(n) {
  if (n && typeof n == "object" && "status" in n) {
    const u = n.status;
    return typeof u == "number" ? u : null;
  }
  return null;
}
const we = (n) => ve(n) === 409;
function Se({
  project: n,
  active: u,
  onOpenRun: m
}) {
  var y, b;
  const f = B(), [d, c] = k(null), g = K({
    queryKey: ["goals", n],
    queryFn: () => f.get(`${C}/goals?project=${F(n)}`),
    refetchInterval: u ? 5e3 : !1
  }), a = K({
    queryKey: ["takt-tasks", n],
    queryFn: () => f.get(`${C}/takt/tasks?project=${F(n)}`),
    refetchInterval: u ? 5e3 : !1
  }), h = ((y = g.data) == null ? void 0 : y.goals) ?? [], s = /* @__PURE__ */ new Map();
  for (const o of ((b = a.data) == null ? void 0 : b.tasks) ?? [])
    o.name && s.set(o.name, o);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.tabGoals }),
      g.error ? /* @__PURE__ */ e(R, { message: E(g.error) }) : null,
      h.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((o) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: o }, o)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.map((o) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => c(o.id),
            className: `cursor-pointer ${o.id === d ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(z, { onClick: () => c(o.id), children: (o.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(P, { variant: Y(o.status), children: ce(o.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: o.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: ie(o.updatedAt) })
            ]
          },
          o.id
        )) })
      ] }) : /* @__PURE__ */ e(U, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: d ? /* @__PURE__ */ e(
      Te,
      {
        id: d,
        active: u,
        taktByName: s,
        onOpenRun: m
      }
    ) : /* @__PURE__ */ e(T, { children: /* @__PURE__ */ e(U, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function Te({
  id: n,
  active: u,
  taktByName: m,
  onOpenRun: f
}) {
  var Z, W, p, H, ee, se, ae;
  const d = B(), c = re(), [g, a] = k(null), [h, s] = k(null), [y, b] = k(""), [o, j] = k(null), [A, N] = k(""), Q = K({
    queryKey: ["goal", n],
    queryFn: () => d.get(`${C}/goal?id=${F(n)}`),
    refetchInterval: u ? 5e3 : !1
  }), x = Q.data, M = () => {
    c.invalidateQueries({ queryKey: ["goal", n] }), c.invalidateQueries({ queryKey: ["goals"] });
  }, i = (l) => {
    we(l) ? (a(t.conflictReloaded), M()) : a(E(l));
  }, v = X({
    mutationFn: (l) => d.post(`${C}/goal/status`, {
      id: n,
      status: l.status,
      reason: l.reason,
      expectedRevision: l.revision
    }),
    onSuccess: () => {
      s(null), b(""), a(null), M();
    },
    onError: i
  }), $ = X({
    mutationFn: (l) => d.post(`${C}/goal/answer`, {
      id: n,
      questionId: l.questionId,
      answer: l.answer,
      expectedRevision: l.revision
    }),
    onSuccess: () => {
      j(null), N(""), a(null), M();
    },
    onError: i
  });
  if (Q.isPending && !x) return /* @__PURE__ */ e(T, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!x)
    return /* @__PURE__ */ e(T, { children: Q.error ? /* @__PURE__ */ e(R, { message: E(Q.error) }) : null });
  const _ = (x.questions ?? []).filter((l) => l.status === "pending"), G = [...x.workLog ?? []].reverse().slice(0, 50), D = x.status === "active" ? "paused" : x.status === "paused" ? "active" : null, L = (l, w) => {
    const O = A.trim();
    O && $.mutate({ questionId: l, answer: O, revision: x.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    g ? /* @__PURE__ */ e(R, { message: g, onDismiss: () => a(null) }) : null,
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(q, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: x.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(P, { variant: Y(x.status), children: ce(x.status) }),
          D ? /* @__PURE__ */ e(S, { onClick: () => {
            b(""), s(D);
          }, children: D === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ r("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: x.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: x.revision })
      ] })
    ] }),
    (Z = x.outOfScope) != null && Z.length || (W = x.acceptanceCriteria) != null && W.length || (p = x.constraints) != null && p.length ? /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ r(q, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (H = x.acceptanceCriteria) != null && H.length ? /* @__PURE__ */ r(I, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: x.acceptanceCriteria.map((l, w) => /* @__PURE__ */ e("li", { children: l }, w)) })
      ] }) : null,
      (ee = x.outOfScope) != null && ee.length ? /* @__PURE__ */ r(I, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: x.outOfScope.map((l, w) => /* @__PURE__ */ e("li", { children: l }, w)) })
      ] }) : null,
      (se = x.constraints) != null && se.length ? /* @__PURE__ */ r(I, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: x.constraints.map((l, w) => /* @__PURE__ */ e("li", { children: l }, w)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.tasks }),
      (ae = x.tasks) != null && ae.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((l) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: l }, l)) }) }),
        /* @__PURE__ */ e("tbody", { children: x.tasks.map((l) => {
          const w = l.taskName ? m.get(l.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: l.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: be(l.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: w ? /* @__PURE__ */ e(z, { onClick: () => w.runSlug && f(w.runSlug), children: /* @__PURE__ */ e(P, { variant: Y(w.status), children: w.status }) }) : "—" })
          ] }, l.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.questions }),
      _.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: _.map((l) => {
        var w;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: l.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (w = l.options) != null && w.length ? l.options.map((O) => /* @__PURE__ */ e(S, { onClick: () => {
            j(l.id), N(O);
          }, children: O }, O)) : /* @__PURE__ */ r(I, { children: [
            /* @__PURE__ */ e(
              te,
              {
                value: o === l.id ? A : "",
                onChange: (O) => {
                  j(l.id), N(O.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(S, { primary: !0, onClick: () => L(l.id), children: t.submit })
          ] }) })
        ] }, l.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.workLog }),
      G.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: G.map((l) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: ie(l.at) }),
        /* @__PURE__ */ e(P, { variant: "muted", children: l.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: l.summary })
      ] }, l.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      V,
      {
        open: h !== null,
        onClose: () => s(null),
        title: h === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(I, { children: [
          /* @__PURE__ */ e(S, { onClick: () => s(null), children: t.cancel }),
          /* @__PURE__ */ e(
            S,
            {
              primary: !0,
              disabled: !y.trim() || v.isPending,
              onClick: () => h && v.mutate({ status: h, reason: y.trim(), revision: x.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            te,
            {
              value: y,
              onChange: (l) => b(l.target.value),
              placeholder: t.reasonPlaceholder,
              className: "w-full mt-1"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e(
      V,
      {
        open: o !== null && _.some((l) => {
          var w;
          return l.id === o && ((w = l.options) == null ? void 0 : w.length);
        }),
        onClose: () => j(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(I, { children: [
          /* @__PURE__ */ e(S, { onClick: () => j(null), children: t.cancel }),
          /* @__PURE__ */ e(S, { primary: !0, onClick: () => o && L(o), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: o ? t.answerConfirm(A) : "" })
      }
    )
  ] });
}
function Ce({
  project: n,
  slug: u,
  active: m
}) {
  var Q, x, M;
  const f = B(), [d, c] = k(null), g = K({
    queryKey: ["takt-run", n, u],
    queryFn: () => f.get(
      `${C}/takt/run?project=${F(n)}&slug=${F(u)}`
    ),
    refetchInterval: m ? 3e3 : !1
  }), a = g.data, h = ((Q = a == null ? void 0 : a.meta) == null ? void 0 : Q.status) === "running", s = Ne({ offset: 0, file: "", records: [] }), [y, b] = k(0);
  ne(() => {
    s.current = { offset: 0, file: "", records: [] }, b((i) => i + 1);
  }, [n, u]);
  const o = K({
    queryKey: ["takt-run-log", n, u],
    queryFn: () => f.get(
      `${C}/takt/run/log?project=${F(n)}&slug=${F(u)}&offset=${s.current.offset}`
    ),
    refetchInterval: m && h ? 2e3 : !1,
    retry: 0
  });
  ne(() => {
    const i = o.data;
    if (!i) return;
    const v = s.current;
    (i.reset || v.file && v.file !== i.file) && (v.records = []), v.file = i.file, i.records.length && (v.records = v.records.concat(i.records).slice(-2e3), b(($) => $ + 1)), v.offset = i.nextOffset;
  }, [o.data]);
  const j = s.current.records, A = K({
    queryKey: ["takt-report", n, u, d],
    queryFn: () => f.get(
      `${C}/takt/run/report?project=${F(n)}&slug=${F(u)}&name=${F(d ?? "")}`
    ),
    enabled: d !== null
  }), N = a == null ? void 0 : a.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    g.error ? /* @__PURE__ */ e(R, { message: E(g.error) }) : null,
    a != null && a.error ? /* @__PURE__ */ e(R, { message: a.error + (a.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: u }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: N ? /* @__PURE__ */ e(P, { variant: Y(N.status), children: N.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (N == null ? void 0 : N.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (N == null ? void 0 : N.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (N == null ? void 0 : N.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: J(N == null ? void 0 : N.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: J(N == null ? void 0 : N.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.runSteps }),
      (x = a == null ? void 0 : a.steps) != null && x.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: a.steps.map((i, v) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(P, { variant: i.type === "workflow_abort" ? "err" : i.type === "workflow_complete" ? "ok" : "muted", children: i.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: i.step ?? "—" }),
        i.status ? /* @__PURE__ */ e("span", { children: i.status }) : null,
        i.iteration != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "iter ",
          i.iteration
        ] }) : null,
        i.matchedRule != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "rule ",
          String(i.matchedRule)
        ] }) : null,
        i.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: i.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: J(i.at) })
      ] }, v)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        o.error ? /* @__PURE__ */ e(R, { message: E(o.error) }) : null,
        j.length ? j.map((i, v) => /* @__PURE__ */ e(Re, { rec: i }, v)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      o.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        o.data.file,
        " — ",
        le(o.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.runReports }),
      (M = a == null ? void 0 : a.reports) != null && M.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: a.reports.map((i) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(z, { onClick: () => c(i.name), className: "text-accent underline", children: i.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          le(i.size),
          " B）"
        ] })
      ] }, i.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      V,
      {
        open: d !== null,
        onClose: () => c(null),
        title: d,
        maxWidth: 880,
        children: [
          A.error ? /* @__PURE__ */ e(R, { message: E(A.error) }) : null,
          A.data ? /* @__PURE__ */ r(I, { children: [
            /* @__PURE__ */ e(ue, { content: A.data.text }),
            A.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function Re({ rec: n }) {
  const u = ye(() => {
    if (typeof n.raw == "string") return n.raw;
    const m = n.type ?? n.event ?? "", f = n.step ? ` ${String(n.step)}` : "", d = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(m)}${f} ${d}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: u });
}
const je = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], Ae = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function $e({
  project: n,
  hasTakt: u,
  active: m,
  runSlug: f,
  onSelectRun: d
}) {
  const c = B(), g = K({
    queryKey: ["takt-tasks", n],
    queryFn: () => c.get(`${C}/takt/tasks?project=${F(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), a = g.data, h = (a == null ? void 0 : a.tasks) ?? [];
  return !u && a && !a.hasTakt ? /* @__PURE__ */ e(U, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    g.error ? /* @__PURE__ */ e(R, { message: E(g.error) }) : null,
    a != null && a.error ? /* @__PURE__ */ e(R, { message: a.error + (a.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: je.map((s) => {
      var y;
      return /* @__PURE__ */ e(
        me,
        {
          label: s,
          value: ((y = a == null ? void 0 : a.counts) == null ? void 0 : y[s]) ?? 0,
          accent: s === "running"
        },
        s
      );
    }) }),
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.tabTakt }),
      h.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((s) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: s }, s)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.map((s, y) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => s.runSlug && d(s.runSlug),
            className: `cursor-pointer ${s.runSlug && s.runSlug === f ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(P, { variant: Y(s.status), children: s.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                s.runSlug ? /* @__PURE__ */ e(z, { onClick: () => d(s.runSlug), children: s.name }) : s.name,
                s.failure && Ae.has(s.status ?? "") ? /* @__PURE__ */ r("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(s.failure.step),
                  s.failure.error ? `: ${s.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: s.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: s.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: J(s.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: J(s.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: s.goalIds.map(ke).join(", ") || "—" })
            ]
          },
          s.name ?? y
        )) })
      ] }) : /* @__PURE__ */ e(U, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    f ? /* @__PURE__ */ e(Ce, { project: n, slug: f, active: m }) : h.length ? /* @__PURE__ */ e(T, { children: /* @__PURE__ */ e(U, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(qe, { project: n, active: m })
  ] });
}
function qe({ project: n, active: u }) {
  var a;
  const m = B(), [f, d] = k(!1), g = ((a = K({
    queryKey: ["takt-goal-files", n],
    queryFn: () => m.get(`${C}/takt/goal-files?project=${F(n)}`),
    refetchInterval: u ? 5e3 : !1,
    enabled: f
  }).data) == null ? void 0 : a.goals) ?? [];
  return /* @__PURE__ */ r(T, { children: [
    /* @__PURE__ */ r(z, { onClick: () => d((h) => !h), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(q, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: f ? "▾" : "▸" })
    ] }),
    f ? g.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: g.map((h) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(P, { variant: "muted", children: h.status ?? "—" }),
        h.executionStatus ? /* @__PURE__ */ e(P, { variant: "muted", children: h.executionStatus }) : null,
        h.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: h.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: h.objective ?? h.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: h.path })
    ] }, h.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Pe({ active: n, project: u }) {
  var b;
  const m = B(), f = re(), [d, c] = k(""), [g, a] = k(null), h = K({
    queryKey: ["settings"],
    queryFn: () => m.get(`${C}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), s = (b = h.data) == null ? void 0 : b.taktMcp;
  ne(() => {
    s && c(s.pinned ?? "");
  }, [s == null ? void 0 : s.pinned]);
  const y = X({
    mutationFn: (o) => m.post(`${C}/settings/takt-mcp`, { path: o }),
    onSuccess: (o) => {
      f.setQueryData(["settings"], o), a(null);
    },
    onError: (o) => a(E(o))
  });
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    g ? /* @__PURE__ */ e(R, { message: g, onDismiss: () => a(null) }) : null,
    h.error ? /* @__PURE__ */ e(R, { message: E(h.error) }) : null,
    /* @__PURE__ */ r(T, { children: [
      /* @__PURE__ */ e(q, { children: t.settingsTaktMcp }),
      /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.settingsTaktMcpHint }),
      s ? s.path ? /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(P, { variant: "ok", children: t.settingsResolved(s.source ?? "") }),
        " ",
        /* @__PURE__ */ e("code", { className: "text-[13px]", children: s.path })
      ] }) : /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(P, { variant: "err", children: t.settingsNotFound }),
        " ",
        s.error ? /* @__PURE__ */ e("span", { className: "text-muted", children: s.error }) : null
      ] }) : null,
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ e(
          te,
          {
            value: d,
            onChange: (o) => c(o.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          S,
          {
            primary: !0,
            disabled: y.isPending,
            onClick: () => y.mutate(d.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          S,
          {
            disabled: y.isPending || !(s != null && s.pinned),
            onClick: () => y.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      s != null && s.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(s.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] })
  ] });
}
function Ee({
  path: n,
  onNavigate: u,
  onPick: m
}) {
  const f = B(), d = K({
    queryKey: ["directories", n],
    queryFn: () => f.post(`${C}/directories`, { path: n })
  }), c = d.data;
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ e(
        S,
        {
          disabled: !(c != null && c.parent),
          onClick: () => (c == null ? void 0 : c.parent) && u(c.parent),
          children: t.browseUp
        }
      ),
      /* @__PURE__ */ e("code", { className: "text-[12px] text-muted truncate flex-1", children: (c == null ? void 0 : c.path) ?? n }),
      /* @__PURE__ */ e(S, { primary: !0, onClick: () => c && m(c.path), children: t.browsePick })
    ] }),
    /* @__PURE__ */ e("div", { className: "border border-subtle rounded max-h-[220px] overflow-y-auto", children: d.isLoading ? /* @__PURE__ */ e("p", { className: "text-sm text-muted p-2", children: "…" }) : d.error ? /* @__PURE__ */ e("p", { className: "text-sm p-2", children: E(d.error) }) : ((c == null ? void 0 : c.directories) ?? []).map((g) => /* @__PURE__ */ r(
      z,
      {
        className: "flex items-center gap-2 px-2 py-1 text-[13px] hover:bg-hover",
        onClick: () => u(g.path),
        children: [
          /* @__PURE__ */ e("span", { className: "truncate", children: g.name }),
          /* @__PURE__ */ r("span", { className: "ml-auto flex gap-1", children: [
            g.hasGit ? /* @__PURE__ */ e(P, { variant: "ok", children: t.browseGit }) : null,
            g.hasTakt ? /* @__PURE__ */ e(P, { variant: "aim", children: t.browseTakt }) : null
          ] })
        ]
      },
      g.path
    )) }),
    c != null && c.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.browseTruncated }) : null
  ] });
}
const Fe = new fe({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Ie() {
  var W;
  const n = B(), m = de().active !== !1, f = re(), [d, c] = k(""), [g, a] = k("goals"), [h, s] = k(null), [y, b] = k(!1), [o, j] = k(!1), [A, N] = k(""), [Q, x] = k("~"), [M, i] = k(null), v = K({
    queryKey: ["projects"],
    queryFn: () => n.get(`${C}/projects`),
    refetchInterval: m ? 5e3 : !1
  }), $ = ((W = v.data) == null ? void 0 : W.projects) ?? [];
  ne(() => {
    if (!$.length) {
      c("");
      return;
    }
    if (!$.some((H) => H.path === d && !H.missing)) {
      const H = $.find((ee) => !ee.missing) ?? $[0];
      c(H.path);
    }
  }, [$, d]);
  const _ = () => f.invalidateQueries({ queryKey: ["projects"] }), G = X({
    mutationFn: (p) => n.post(`${C}/projects/add`, { path: p }),
    onSuccess: (p) => {
      f.setQueryData(["projects"], p), _(), b(!1), N(""), i(null), p.projects.length && c(p.projects[p.projects.length - 1].path);
    },
    onError: (p) => i(E(p))
  }), D = X({
    mutationFn: (p) => n.post(`${C}/projects/remove`, { path: p }),
    onSuccess: (p) => {
      f.setQueryData(["projects"], p), _(), j(!1), i(null);
    },
    onError: (p) => i(E(p))
  }), L = $.find((p) => p.path === d), Z = (p) => {
    s(p), a("takt");
  };
  return /* @__PURE__ */ r(I, { children: [
    /* @__PURE__ */ e(
      pe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ r(I, { children: [
          /* @__PURE__ */ e(
            he,
            {
              "aria-label": t.projectLabel,
              options: $.map((p) => p.path),
              optionLabels: $.map((p) => p.missing ? `${p.name}（${t.projectMissing}）` : p.name),
              value: d,
              onChange: c,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(S, { onClick: () => {
            i(null), b(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(
            S,
            {
              danger: !0,
              disabled: !L,
              onClick: () => {
                i(null), j(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: $.length ? /* @__PURE__ */ r(I, { children: [
      v.error ? /* @__PURE__ */ e(R, { message: E(v.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        ge,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt },
            { key: "settings", label: t.tabSettings }
          ],
          value: g,
          onChange: a,
          ariaLabel: t.appTitle
        }
      ) }),
      g === "settings" ? /* @__PURE__ */ e(Pe, { active: m, project: d }) : d ? g === "goals" ? /* @__PURE__ */ e(Se, { project: d, active: m, onOpenRun: Z }) : /* @__PURE__ */ e(
        $e,
        {
          project: d,
          hasTakt: (L == null ? void 0 : L.hasTakt) ?? !1,
          active: m,
          runSlug: h,
          onSelectRun: s
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      U,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(S, { primary: !0, onClick: () => {
          i(null), b(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      V,
      {
        open: y,
        onClose: () => b(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(I, { children: [
          /* @__PURE__ */ e(S, { onClick: () => b(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            S,
            {
              primary: !0,
              disabled: !A.trim() || G.isPending,
              onClick: () => G.mutate(A.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            Ee,
            {
              path: Q,
              onNavigate: x,
              onPick: (p) => {
                G.mutate(p), b(!1);
              }
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-3 mb-1", children: t.browseOrType }),
          /* @__PURE__ */ e(
            te,
            {
              value: A,
              onChange: (p) => N(p.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          M ? /* @__PURE__ */ e(R, { message: M }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      V,
      {
        open: o,
        onClose: () => j(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(I, { children: [
          /* @__PURE__ */ e(S, { onClick: () => j(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            S,
            {
              danger: !0,
              disabled: D.isPending,
              onClick: () => L && D.mutate(L.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: L ? t.projectRemoveConfirm(L.name) : "" }),
          M ? /* @__PURE__ */ e(R, { message: M }) : null
        ]
      }
    )
  ] });
}
function Be() {
  return /* @__PURE__ */ e(xe, { client: Fe, children: /* @__PURE__ */ e(Ie, {}) });
}
export {
  Be as default
};
