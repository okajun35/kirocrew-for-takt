import { jsxs as n, jsx as e, Fragment as q } from "react/jsx-runtime";
import { useAppApi as G, fmtRelative as oe, fmtDateTime as U, fmtNumber as se, useAppInfo as de } from "@kirocrew/app-sdk";
import { Card as b, CardTitle as E, ErrorNotice as F, EmptyState as H, Clickable as V, Badge as L, Btn as C, Input as Z, Modal as W, MarkdownRenderer as ue, StatCard as me, PageHeader as pe, Select as he, SegmentedControl as fe } from "@kirocrew/app-sdk/ui";
import { useQuery as M, useQueryClient as ce, useMutation as Y, QueryClient as ge, QueryClientProvider as xe } from "@tanstack/react-query";
import { useState as v, useRef as Ne, useEffect as ee, useMemo as ye } from "react";
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
  projectRemoveConfirm: (r) => `${r} を登録から外しますか？ goal の記録は残ります。`,
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
  answerConfirm: (r) => `質問への回答を送信しますか？
「${r}」`,
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
  failureAt: (r) => r ? `失敗: ${r}` : "失敗",
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
  errorGeneric: "エラーが発生しました"
}, le = {
  bad_request: t.errorBadRequest,
  unauthorized: t.errorUnauthorized,
  owner_only: t.errorOwnerOnly,
  app_token_forbidden: t.errorAppTokenForbidden,
  sensitive_path: t.errorSensitivePath,
  not_found: t.errorNotFound,
  conflict: t.errorConflict,
  internal: t.errorInternal
}, R = "/api/apps/for-takt", A = encodeURIComponent;
function J(r) {
  switch (r) {
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
function ie(r) {
  switch (r) {
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
      return r ?? "";
  }
}
function ke(r) {
  return r ? r.slice(0, 8) : "—";
}
function be(r) {
  return r ? r.slice(0, 8) : "—";
}
function Q(r) {
  if (r && typeof r == "object") {
    const d = r;
    if (typeof d.body == "string" && d.body) {
      try {
        const m = JSON.parse(d.body);
        if (m && typeof m.code == "string" && le[m.code]) {
          const f = typeof m.error == "string" ? m.error : "";
          return `${le[m.code]}${f ? `（${f}）` : ""}`;
        }
        if (m && typeof m.error == "string") return m.error;
      } catch {
      }
      return d.body;
    }
    if (typeof d.message == "string" && d.message) return d.message;
  }
  return t.errorGeneric;
}
function ve(r) {
  if (r && typeof r == "object" && "status" in r) {
    const d = r.status;
    return typeof d == "number" ? d : null;
  }
  return null;
}
const we = (r) => ve(r) === 409;
function Se({
  project: r,
  active: d,
  onOpenRun: m
}) {
  var S, w;
  const f = G(), [p, k] = v(null), x = M({
    queryKey: ["goals", r],
    queryFn: () => f.get(`${R}/goals?project=${A(r)}`),
    refetchInterval: d ? 5e3 : !1
  }), s = M({
    queryKey: ["takt-tasks", r],
    queryFn: () => f.get(`${R}/takt/tasks?project=${A(r)}`),
    refetchInterval: d ? 5e3 : !1
  }), h = ((S = x.data) == null ? void 0 : S.goals) ?? [], l = /* @__PURE__ */ new Map();
  for (const c of ((w = s.data) == null ? void 0 : w.tasks) ?? [])
    c.name && l.set(c.name, c);
  return /* @__PURE__ */ n("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tabGoals }),
      x.error ? /* @__PURE__ */ e(F, { message: Q(x.error) }) : null,
      h.length ? /* @__PURE__ */ n("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((c) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: c }, c)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.map((c) => /* @__PURE__ */ n(
          "tr",
          {
            onClick: () => k(c.id),
            className: `cursor-pointer ${c.id === p ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(V, { onClick: () => k(c.id), children: (c.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(L, { variant: J(c.status), children: ie(c.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: c.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: oe(c.updatedAt) })
            ]
          },
          c.id
        )) })
      ] }) : /* @__PURE__ */ e(H, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: p ? /* @__PURE__ */ e(
      Ce,
      {
        id: p,
        active: d,
        taktByName: l,
        onOpenRun: m
      }
    ) : /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e(H, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function Ce({
  id: r,
  active: d,
  taktByName: m,
  onOpenRun: f
}) {
  var u, _, X, te, re, ne, ae;
  const p = G(), k = ce(), [x, s] = v(null), [h, l] = v(null), [S, w] = v(""), [c, T] = v(null), [j, g] = v(""), $ = M({
    queryKey: ["goal", r],
    queryFn: () => p.get(`${R}/goal?id=${A(r)}`),
    refetchInterval: d ? 5e3 : !1
  }), i = $.data, P = () => {
    k.invalidateQueries({ queryKey: ["goal", r] }), k.invalidateQueries({ queryKey: ["goals"] });
  }, o = (a) => {
    we(a) ? (s(t.conflictReloaded), P()) : s(Q(a));
  }, y = Y({
    mutationFn: (a) => p.post(`${R}/goal/status`, {
      id: r,
      status: a.status,
      reason: a.reason,
      expectedRevision: a.revision
    }),
    onSuccess: () => {
      l(null), w(""), s(null), P();
    },
    onError: o
  }), B = Y({
    mutationFn: (a) => p.post(`${R}/goal/answer`, {
      id: r,
      questionId: a.questionId,
      answer: a.answer,
      expectedRevision: a.revision
    }),
    onSuccess: () => {
      T(null), g(""), s(null), P();
    },
    onError: o
  });
  if ($.isPending && !i) return /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!i)
    return /* @__PURE__ */ e(b, { children: $.error ? /* @__PURE__ */ e(F, { message: Q($.error) }) : null });
  const K = (i.questions ?? []).filter((a) => a.status === "pending"), I = [...i.workLog ?? []].reverse().slice(0, 50), D = i.status === "active" ? "paused" : i.status === "paused" ? "active" : null, z = (a, N) => {
    const O = j.trim();
    O && B.mutate({ questionId: a, answer: O, revision: i.revision });
  };
  return /* @__PURE__ */ n("div", { className: "flex flex-col gap-4", children: [
    x ? /* @__PURE__ */ e(F, { message: x, onDismiss: () => s(null) }) : null,
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ n("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ n("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(E, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: i.objective })
        ] }),
        /* @__PURE__ */ n("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(L, { variant: J(i.status), children: ie(i.status) }),
          D ? /* @__PURE__ */ e(C, { onClick: () => {
            w(""), l(D);
          }, children: D === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ n("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: i.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: i.revision })
      ] })
    ] }),
    (u = i.outOfScope) != null && u.length || (_ = i.acceptanceCriteria) != null && _.length || (X = i.constraints) != null && X.length ? /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ n(E, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (te = i.acceptanceCriteria) != null && te.length ? /* @__PURE__ */ n(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.acceptanceCriteria.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null,
      (re = i.outOfScope) != null && re.length ? /* @__PURE__ */ n(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.outOfScope.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null,
      (ne = i.constraints) != null && ne.length ? /* @__PURE__ */ n(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.constraints.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tasks }),
      (ae = i.tasks) != null && ae.length ? /* @__PURE__ */ n("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((a) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: a }, a)) }) }),
        /* @__PURE__ */ e("tbody", { children: i.tasks.map((a) => {
          const N = a.taskName ? m.get(a.taskName) : void 0;
          return /* @__PURE__ */ n("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: a.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: ke(a.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: N ? /* @__PURE__ */ e(V, { onClick: () => N.runSlug && f(N.runSlug), children: /* @__PURE__ */ e(L, { variant: J(N.status), children: N.status }) }) : "—" })
          ] }, a.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.questions }),
      K.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: K.map((a) => {
        var N;
        return /* @__PURE__ */ n("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: a.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (N = a.options) != null && N.length ? a.options.map((O) => /* @__PURE__ */ e(C, { onClick: () => {
            T(a.id), g(O);
          }, children: O }, O)) : /* @__PURE__ */ n(q, { children: [
            /* @__PURE__ */ e(
              Z,
              {
                value: c === a.id ? j : "",
                onChange: (O) => {
                  T(a.id), g(O.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(C, { primary: !0, onClick: () => z(a.id), children: t.submit })
          ] }) })
        ] }, a.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.workLog }),
      I.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: I.map((a) => /* @__PURE__ */ n("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: oe(a.at) }),
        /* @__PURE__ */ e(L, { variant: "muted", children: a.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: a.summary })
      ] }, a.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ n(
      W,
      {
        open: h !== null,
        onClose: () => l(null),
        title: h === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ n(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => l(null), children: t.cancel }),
          /* @__PURE__ */ e(
            C,
            {
              primary: !0,
              disabled: !S.trim() || y.isPending,
              onClick: () => h && y.mutate({ status: h, reason: S.trim(), revision: i.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            Z,
            {
              value: S,
              onChange: (a) => w(a.target.value),
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
        open: c !== null && K.some((a) => {
          var N;
          return a.id === c && ((N = a.options) == null ? void 0 : N.length);
        }),
        onClose: () => T(null),
        title: t.questions,
        footer: /* @__PURE__ */ n(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => T(null), children: t.cancel }),
          /* @__PURE__ */ e(C, { primary: !0, onClick: () => c && z(c), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: c ? t.answerConfirm(j) : "" })
      }
    )
  ] });
}
function Te({
  project: r,
  slug: d,
  active: m
}) {
  var $, i, P;
  const f = G(), [p, k] = v(null), x = M({
    queryKey: ["takt-run", r, d],
    queryFn: () => f.get(
      `${R}/takt/run?project=${A(r)}&slug=${A(d)}`
    ),
    refetchInterval: m ? 3e3 : !1
  }), s = x.data, h = (($ = s == null ? void 0 : s.meta) == null ? void 0 : $.status) === "running", l = Ne({ offset: 0, file: "", records: [] }), [S, w] = v(0);
  ee(() => {
    l.current = { offset: 0, file: "", records: [] }, w((o) => o + 1);
  }, [r, d]);
  const c = M({
    queryKey: ["takt-run-log", r, d],
    queryFn: () => f.get(
      `${R}/takt/run/log?project=${A(r)}&slug=${A(d)}&offset=${l.current.offset}`
    ),
    refetchInterval: m && h ? 2e3 : !1,
    retry: 0
  });
  ee(() => {
    const o = c.data;
    if (!o) return;
    const y = l.current;
    (o.reset || y.file && y.file !== o.file) && (y.records = []), y.file = o.file, o.records.length && (y.records = y.records.concat(o.records).slice(-2e3), w((B) => B + 1)), y.offset = o.nextOffset;
  }, [c.data]);
  const T = l.current.records, j = M({
    queryKey: ["takt-report", r, d, p],
    queryFn: () => f.get(
      `${R}/takt/run/report?project=${A(r)}&slug=${A(d)}&name=${A(p ?? "")}`
    ),
    enabled: p !== null
  }), g = s == null ? void 0 : s.meta;
  return /* @__PURE__ */ n("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(F, { message: Q(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(F, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runMeta }),
      /* @__PURE__ */ n("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: d }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: g ? /* @__PURE__ */ e(L, { variant: J(g.status), children: g.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (g == null ? void 0 : g.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (g == null ? void 0 : g.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (g == null ? void 0 : g.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: U(g == null ? void 0 : g.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: U(g == null ? void 0 : g.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runSteps }),
      (i = s == null ? void 0 : s.steps) != null && i.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: s.steps.map((o, y) => /* @__PURE__ */ n("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(L, { variant: o.type === "workflow_abort" ? "err" : o.type === "workflow_complete" ? "ok" : "muted", children: o.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: o.step ?? "—" }),
        o.status ? /* @__PURE__ */ e("span", { children: o.status }) : null,
        o.iteration != null ? /* @__PURE__ */ n("span", { className: "text-muted", children: [
          "iter ",
          o.iteration
        ] }) : null,
        o.matchedRule != null ? /* @__PURE__ */ n("span", { className: "text-muted", children: [
          "rule ",
          String(o.matchedRule)
        ] }) : null,
        o.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: o.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: U(o.at) })
      ] }, y)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runLog }),
      /* @__PURE__ */ n("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        c.error ? /* @__PURE__ */ e(F, { message: Q(c.error) }) : null,
        T.length ? T.map((o, y) => /* @__PURE__ */ e(je, { rec: o }, y)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      c.data ? /* @__PURE__ */ n("p", { className: "text-[12px] text-muted mt-1", children: [
        c.data.file,
        " — ",
        se(c.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runReports }),
      (P = s == null ? void 0 : s.reports) != null && P.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: s.reports.map((o) => /* @__PURE__ */ n("li", { children: [
        /* @__PURE__ */ e(V, { onClick: () => k(o.name), className: "text-accent underline", children: o.name }),
        /* @__PURE__ */ n("span", { className: "text-muted", children: [
          "（",
          se(o.size),
          " B）"
        ] })
      ] }, o.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ n(
      W,
      {
        open: p !== null,
        onClose: () => k(null),
        title: p,
        maxWidth: 880,
        children: [
          j.error ? /* @__PURE__ */ e(F, { message: Q(j.error) }) : null,
          j.data ? /* @__PURE__ */ n(q, { children: [
            /* @__PURE__ */ e(ue, { content: j.data.text }),
            j.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function je({ rec: r }) {
  const d = ye(() => {
    if (typeof r.raw == "string") return r.raw;
    const m = r.type ?? r.event ?? "", f = r.step ? ` ${String(r.step)}` : "", p = typeof r.content == "string" ? r.content : typeof r.reason == "string" ? r.reason : typeof r.error == "string" ? r.error : JSON.stringify(r);
    return `${String(m)}${f} ${p}`.trim();
  }, [r]);
  return /* @__PURE__ */ e("div", { children: d });
}
const Re = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], $e = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Ae({
  project: r,
  hasTakt: d,
  active: m,
  runSlug: f,
  onSelectRun: p
}) {
  const k = G(), x = M({
    queryKey: ["takt-tasks", r],
    queryFn: () => k.get(`${R}/takt/tasks?project=${A(r)}`),
    refetchInterval: m ? 5e3 : !1
  }), s = x.data, h = (s == null ? void 0 : s.tasks) ?? [];
  return !d && s && !s.hasTakt ? /* @__PURE__ */ e(H, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ n("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(F, { message: Q(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(F, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: Re.map((l) => {
      var S;
      return /* @__PURE__ */ e(
        me,
        {
          label: l,
          value: ((S = s == null ? void 0 : s.counts) == null ? void 0 : S[l]) ?? 0,
          accent: l === "running"
        },
        l
      );
    }) }),
    /* @__PURE__ */ n(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tabTakt }),
      h.length ? /* @__PURE__ */ n("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((l) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: l }, l)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.map((l, S) => /* @__PURE__ */ n(
          "tr",
          {
            onClick: () => l.runSlug && p(l.runSlug),
            className: `cursor-pointer ${l.runSlug && l.runSlug === f ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(L, { variant: J(l.status), children: l.status }) }),
              /* @__PURE__ */ n("td", { className: "px-2.5 py-2 text-sm", children: [
                l.runSlug ? /* @__PURE__ */ e(V, { onClick: () => p(l.runSlug), children: l.name }) : l.name,
                l.failure && $e.has(l.status ?? "") ? /* @__PURE__ */ n("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(l.failure.step),
                  l.failure.error ? `: ${l.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: l.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: U(l.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: U(l.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.goalIds.map(be).join(", ") || "—" })
            ]
          },
          l.name ?? S
        )) })
      ] }) : /* @__PURE__ */ e(H, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    f ? /* @__PURE__ */ e(Te, { project: r, slug: f, active: m }) : h.length ? /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e(H, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(qe, { project: r, active: m })
  ] });
}
function qe({ project: r, active: d }) {
  var s;
  const m = G(), [f, p] = v(!1), x = ((s = M({
    queryKey: ["takt-goal-files", r],
    queryFn: () => m.get(`${R}/takt/goal-files?project=${A(r)}`),
    refetchInterval: d ? 5e3 : !1,
    enabled: f
  }).data) == null ? void 0 : s.goals) ?? [];
  return /* @__PURE__ */ n(b, { children: [
    /* @__PURE__ */ n(V, { onClick: () => p((h) => !h), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(E, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: f ? "▾" : "▸" })
    ] }),
    f ? x.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: x.map((h) => /* @__PURE__ */ n("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ n("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(L, { variant: "muted", children: h.status ?? "—" }),
        h.executionStatus ? /* @__PURE__ */ e(L, { variant: "muted", children: h.executionStatus }) : null,
        h.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: h.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: h.objective ?? h.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: h.path })
    ] }, h.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
const Ee = new ge({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Fe() {
  var z;
  const r = G(), m = de().active !== !1, f = ce(), [p, k] = v(""), [x, s] = v("goals"), [h, l] = v(null), [S, w] = v(!1), [c, T] = v(!1), [j, g] = v(""), [$, i] = v(null), P = M({
    queryKey: ["projects"],
    queryFn: () => r.get(`${R}/projects`),
    refetchInterval: m ? 5e3 : !1
  }), o = ((z = P.data) == null ? void 0 : z.projects) ?? [];
  ee(() => {
    if (!o.length) {
      k("");
      return;
    }
    if (!o.some((_) => _.path === p && !_.missing)) {
      const _ = o.find((X) => !X.missing) ?? o[0];
      k(_.path);
    }
  }, [o, p]);
  const y = () => f.invalidateQueries({ queryKey: ["projects"] }), B = Y({
    mutationFn: (u) => r.post(`${R}/projects/add`, { path: u }),
    onSuccess: (u) => {
      f.setQueryData(["projects"], u), y(), w(!1), g(""), i(null), u.projects.length && k(u.projects[u.projects.length - 1].path);
    },
    onError: (u) => i(Q(u))
  }), K = Y({
    mutationFn: (u) => r.post(`${R}/projects/remove`, { path: u }),
    onSuccess: (u) => {
      f.setQueryData(["projects"], u), y(), T(!1), i(null);
    },
    onError: (u) => i(Q(u))
  }), I = o.find((u) => u.path === p), D = (u) => {
    l(u), s("takt");
  };
  return /* @__PURE__ */ n(q, { children: [
    /* @__PURE__ */ e(
      pe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ n(q, { children: [
          /* @__PURE__ */ e(
            he,
            {
              "aria-label": t.projectLabel,
              options: o.map((u) => u.path),
              optionLabels: o.map((u) => u.missing ? `${u.name}（${t.projectMissing}）` : u.name),
              value: p,
              onChange: k,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(C, { onClick: () => {
            i(null), w(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(
            C,
            {
              danger: !0,
              disabled: !I,
              onClick: () => {
                i(null), T(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: o.length ? /* @__PURE__ */ n(q, { children: [
      P.error ? /* @__PURE__ */ e(F, { message: Q(P.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        fe,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt }
          ],
          value: x,
          onChange: s,
          ariaLabel: t.appTitle
        }
      ) }),
      p ? x === "goals" ? /* @__PURE__ */ e(Se, { project: p, active: m, onOpenRun: D }) : /* @__PURE__ */ e(
        Ae,
        {
          project: p,
          hasTakt: (I == null ? void 0 : I.hasTakt) ?? !1,
          active: m,
          runSlug: h,
          onSelectRun: l
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      H,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(C, { primary: !0, onClick: () => {
          i(null), w(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ n(
      W,
      {
        open: S,
        onClose: () => w(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ n(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => w(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            C,
            {
              primary: !0,
              disabled: !j.trim() || B.isPending,
              onClick: () => B.mutate(j.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            Z,
            {
              value: j,
              onChange: (u) => g(u.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          $ ? /* @__PURE__ */ e(F, { message: $ }) : null
        ]
      }
    ),
    /* @__PURE__ */ n(
      W,
      {
        open: c,
        onClose: () => T(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ n(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => T(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            C,
            {
              danger: !0,
              disabled: K.isPending,
              onClick: () => I && K.mutate(I.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: I ? t.projectRemoveConfirm(I.name) : "" }),
          $ ? /* @__PURE__ */ e(F, { message: $ }) : null
        ]
      }
    )
  ] });
}
function Oe() {
  return /* @__PURE__ */ e(xe, { client: Ee, children: /* @__PURE__ */ e(Fe, {}) });
}
export {
  Oe as default
};
