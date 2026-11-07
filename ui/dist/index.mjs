import { jsxs as r, jsx as e, Fragment as q } from "react/jsx-runtime";
import { useAppApi as G, fmtRelative as le, fmtDateTime as z, fmtNumber as se, useAppInfo as ie } from "@kirocrew/app-sdk";
import { Card as b, CardTitle as E, ErrorNotice as I, EmptyState as D, Clickable as V, Badge as L, Btn as C, Input as Z, Modal as J, MarkdownRenderer as de, StatCard as ue, PageHeader as me, Select as pe, SegmentedControl as he } from "@kirocrew/app-sdk/ui";
import { useQuery as M, useQueryClient as oe, useMutation as Y, QueryClient as fe, QueryClientProvider as ge } from "@tanstack/react-query";
import { useState as v, useRef as xe, useEffect as ee, useMemo as Ne } from "react";
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
  truncatedReport: "（512 KiB で切り詰めました）"
}, $ = "/api/apps/for-takt", A = encodeURIComponent;
function U(n) {
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
function ye(n) {
  return n ? n.slice(0, 8) : "—";
}
function ke(n) {
  return n ? n.slice(0, 8) : "—";
}
function Q(n) {
  if (n && typeof n == "object") {
    const d = n;
    if (typeof d.body == "string" && d.body) {
      try {
        const f = JSON.parse(d.body);
        if (f && typeof f.error == "string") return f.error;
      } catch {
      }
      return d.body;
    }
    if (typeof d.message == "string" && d.message) return d.message;
  }
  return String(n);
}
function be(n) {
  if (n && typeof n == "object" && "status" in n) {
    const d = n.status;
    return typeof d == "number" ? d : null;
  }
  return null;
}
const ve = (n) => be(n) === 409;
function we({
  project: n,
  active: d,
  onOpenRun: f
}) {
  var S, w;
  const g = G(), [m, k] = v(null), x = M({
    queryKey: ["goals", n],
    queryFn: () => g.get(`${$}/goals?project=${A(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), s = M({
    queryKey: ["takt-tasks", n],
    queryFn: () => g.get(`${$}/takt/tasks?project=${A(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), p = ((S = x.data) == null ? void 0 : S.goals) ?? [], l = /* @__PURE__ */ new Map();
  for (const c of ((w = s.data) == null ? void 0 : w.tasks) ?? [])
    c.name && l.set(c.name, c);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tabGoals }),
      x.error ? /* @__PURE__ */ e(I, { message: Q(x.error) }) : null,
      p.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((c) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: c }, c)) }) }),
        /* @__PURE__ */ e("tbody", { children: p.map((c) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => k(c.id),
            className: `cursor-pointer ${c.id === m ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(V, { onClick: () => k(c.id), children: (c.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(L, { variant: U(c.status), children: ce(c.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: c.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: c.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: le(c.updatedAt) })
            ]
          },
          c.id
        )) })
      ] }) : /* @__PURE__ */ e(D, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: m ? /* @__PURE__ */ e(
      Se,
      {
        id: m,
        active: d,
        taktByName: l,
        onOpenRun: f
      }
    ) : /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e(D, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function Se({
  id: n,
  active: d,
  taktByName: f,
  onOpenRun: g
}) {
  var u, H, X, te, ne, re, ae;
  const m = G(), k = oe(), [x, s] = v(null), [p, l] = v(null), [S, w] = v(""), [c, T] = v(null), [j, h] = v(""), R = M({
    queryKey: ["goal", n],
    queryFn: () => m.get(`${$}/goal?id=${A(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), i = R.data, P = () => {
    k.invalidateQueries({ queryKey: ["goal", n] }), k.invalidateQueries({ queryKey: ["goals"] });
  }, o = (a) => {
    ve(a) ? (s(t.conflictReloaded), P()) : s(Q(a));
  }, y = Y({
    mutationFn: (a) => m.post(`${$}/goal/status`, {
      id: n,
      status: a.status,
      reason: a.reason,
      expectedRevision: a.revision
    }),
    onSuccess: () => {
      l(null), w(""), s(null), P();
    },
    onError: o
  }), B = Y({
    mutationFn: (a) => m.post(`${$}/goal/answer`, {
      id: n,
      questionId: a.questionId,
      answer: a.answer,
      expectedRevision: a.revision
    }),
    onSuccess: () => {
      T(null), h(""), s(null), P();
    },
    onError: o
  });
  if (R.isPending && !i) return /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!i)
    return /* @__PURE__ */ e(b, { children: R.error ? /* @__PURE__ */ e(I, { message: Q(R.error) }) : null });
  const O = (i.questions ?? []).filter((a) => a.status === "pending"), F = [...i.workLog ?? []].reverse().slice(0, 50), _ = i.status === "active" ? "paused" : i.status === "paused" ? "active" : null, W = (a, N) => {
    const K = j.trim();
    K && B.mutate({ questionId: a, answer: K, revision: i.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x ? /* @__PURE__ */ e(I, { message: x, onDismiss: () => s(null) }) : null,
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(E, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: i.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(L, { variant: U(i.status), children: ce(i.status) }),
          _ ? /* @__PURE__ */ e(C, { onClick: () => {
            w(""), l(_);
          }, children: _ === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ r("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: i.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: i.revision })
      ] })
    ] }),
    (u = i.outOfScope) != null && u.length || (H = i.acceptanceCriteria) != null && H.length || (X = i.constraints) != null && X.length ? /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ r(E, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (te = i.acceptanceCriteria) != null && te.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.acceptanceCriteria.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null,
      (ne = i.outOfScope) != null && ne.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.outOfScope.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null,
      (re = i.constraints) != null && re.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: i.constraints.map((a, N) => /* @__PURE__ */ e("li", { children: a }, N)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tasks }),
      (ae = i.tasks) != null && ae.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((a) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: a }, a)) }) }),
        /* @__PURE__ */ e("tbody", { children: i.tasks.map((a) => {
          const N = a.taskName ? f.get(a.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: a.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: a.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: ye(a.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: N ? /* @__PURE__ */ e(V, { onClick: () => N.runSlug && g(N.runSlug), children: /* @__PURE__ */ e(L, { variant: U(N.status), children: N.status }) }) : "—" })
          ] }, a.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.questions }),
      O.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: O.map((a) => {
        var N;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: a.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (N = a.options) != null && N.length ? a.options.map((K) => /* @__PURE__ */ e(C, { onClick: () => {
            T(a.id), h(K);
          }, children: K }, K)) : /* @__PURE__ */ r(q, { children: [
            /* @__PURE__ */ e(
              Z,
              {
                value: c === a.id ? j : "",
                onChange: (K) => {
                  T(a.id), h(K.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(C, { primary: !0, onClick: () => W(a.id), children: t.submit })
          ] }) })
        ] }, a.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.workLog }),
      F.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: F.map((a) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: le(a.at) }),
        /* @__PURE__ */ e(L, { variant: "muted", children: a.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: a.summary })
      ] }, a.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      J,
      {
        open: p !== null,
        onClose: () => l(null),
        title: p === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => l(null), children: t.cancel }),
          /* @__PURE__ */ e(
            C,
            {
              primary: !0,
              disabled: !S.trim() || y.isPending,
              onClick: () => p && y.mutate({ status: p, reason: S.trim(), revision: i.revision }),
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
      J,
      {
        open: c !== null && O.some((a) => {
          var N;
          return a.id === c && ((N = a.options) == null ? void 0 : N.length);
        }),
        onClose: () => T(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => T(null), children: t.cancel }),
          /* @__PURE__ */ e(C, { primary: !0, onClick: () => c && W(c), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: c ? t.answerConfirm(j) : "" })
      }
    )
  ] });
}
function Ce({
  project: n,
  slug: d,
  active: f
}) {
  var R, i, P;
  const g = G(), [m, k] = v(null), x = M({
    queryKey: ["takt-run", n, d],
    queryFn: () => g.get(
      `${$}/takt/run?project=${A(n)}&slug=${A(d)}`
    ),
    refetchInterval: f ? 3e3 : !1
  }), s = x.data, p = ((R = s == null ? void 0 : s.meta) == null ? void 0 : R.status) === "running", l = xe({ offset: 0, file: "", records: [] }), [S, w] = v(0);
  ee(() => {
    l.current = { offset: 0, file: "", records: [] }, w((o) => o + 1);
  }, [n, d]);
  const c = M({
    queryKey: ["takt-run-log", n, d],
    queryFn: () => g.get(
      `${$}/takt/run/log?project=${A(n)}&slug=${A(d)}&offset=${l.current.offset}`
    ),
    refetchInterval: f && p ? 2e3 : !1,
    retry: 0
  });
  ee(() => {
    const o = c.data;
    if (!o) return;
    const y = l.current;
    (o.reset || y.file && y.file !== o.file) && (y.records = []), y.file = o.file, o.records.length && (y.records = y.records.concat(o.records).slice(-2e3), w((B) => B + 1)), y.offset = o.nextOffset;
  }, [c.data]);
  const T = l.current.records, j = M({
    queryKey: ["takt-report", n, d, m],
    queryFn: () => g.get(
      `${$}/takt/run/report?project=${A(n)}&slug=${A(d)}&name=${A(m ?? "")}`
    ),
    enabled: m !== null
  }), h = s == null ? void 0 : s.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(I, { message: Q(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(I, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: d }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: h ? /* @__PURE__ */ e(L, { variant: U(h.status), children: h.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (h == null ? void 0 : h.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (h == null ? void 0 : h.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (h == null ? void 0 : h.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: z(h == null ? void 0 : h.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: z(h == null ? void 0 : h.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runSteps }),
      (i = s == null ? void 0 : s.steps) != null && i.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: s.steps.map((o, y) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(L, { variant: o.type === "workflow_abort" ? "err" : o.type === "workflow_complete" ? "ok" : "muted", children: o.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: o.step ?? "—" }),
        o.status ? /* @__PURE__ */ e("span", { children: o.status }) : null,
        o.iteration != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "iter ",
          o.iteration
        ] }) : null,
        o.matchedRule != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "rule ",
          String(o.matchedRule)
        ] }) : null,
        o.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: o.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: z(o.at) })
      ] }, y)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        c.error ? /* @__PURE__ */ e(I, { message: Q(c.error) }) : null,
        T.length ? T.map((o, y) => /* @__PURE__ */ e(Te, { rec: o }, y)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      c.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        c.data.file,
        " — ",
        se(c.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.runReports }),
      (P = s == null ? void 0 : s.reports) != null && P.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: s.reports.map((o) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(V, { onClick: () => k(o.name), className: "text-accent underline", children: o.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          se(o.size),
          " B）"
        ] })
      ] }, o.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      J,
      {
        open: m !== null,
        onClose: () => k(null),
        title: m,
        maxWidth: 880,
        children: [
          j.error ? /* @__PURE__ */ e(I, { message: Q(j.error) }) : null,
          j.data ? /* @__PURE__ */ r(q, { children: [
            /* @__PURE__ */ e(de, { content: j.data.text }),
            j.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function Te({ rec: n }) {
  const d = Ne(() => {
    if (typeof n.raw == "string") return n.raw;
    const f = n.type ?? n.event ?? "", g = n.step ? ` ${String(n.step)}` : "", m = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(f)}${g} ${m}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: d });
}
const je = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], $e = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Re({
  project: n,
  hasTakt: d,
  active: f,
  runSlug: g,
  onSelectRun: m
}) {
  const k = G(), x = M({
    queryKey: ["takt-tasks", n],
    queryFn: () => k.get(`${$}/takt/tasks?project=${A(n)}`),
    refetchInterval: f ? 5e3 : !1
  }), s = x.data, p = (s == null ? void 0 : s.tasks) ?? [];
  return !d && s && !s.hasTakt ? /* @__PURE__ */ e(D, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(I, { message: Q(x.error) }) : null,
    s != null && s.error ? /* @__PURE__ */ e(I, { message: s.error + (s.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: je.map((l) => {
      var S;
      return /* @__PURE__ */ e(
        ue,
        {
          label: l,
          value: ((S = s == null ? void 0 : s.counts) == null ? void 0 : S[l]) ?? 0,
          accent: l === "running"
        },
        l
      );
    }) }),
    /* @__PURE__ */ r(b, { children: [
      /* @__PURE__ */ e(E, { children: t.tabTakt }),
      p.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((l) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: l }, l)) }) }),
        /* @__PURE__ */ e("tbody", { children: p.map((l, S) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => l.runSlug && m(l.runSlug),
            className: `cursor-pointer ${l.runSlug && l.runSlug === g ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(L, { variant: U(l.status), children: l.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                l.runSlug ? /* @__PURE__ */ e(V, { onClick: () => m(l.runSlug), children: l.name }) : l.name,
                l.failure && $e.has(l.status ?? "") ? /* @__PURE__ */ r("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(l.failure.step),
                  l.failure.error ? `: ${l.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: l.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: z(l.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: z(l.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.goalIds.map(ke).join(", ") || "—" })
            ]
          },
          l.name ?? S
        )) })
      ] }) : /* @__PURE__ */ e(D, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    g ? /* @__PURE__ */ e(Ce, { project: n, slug: g, active: f }) : p.length ? /* @__PURE__ */ e(b, { children: /* @__PURE__ */ e(D, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(Ae, { project: n, active: f })
  ] });
}
function Ae({ project: n, active: d }) {
  var s;
  const f = G(), [g, m] = v(!1), x = ((s = M({
    queryKey: ["takt-goal-files", n],
    queryFn: () => f.get(`${$}/takt/goal-files?project=${A(n)}`),
    refetchInterval: d ? 5e3 : !1,
    enabled: g
  }).data) == null ? void 0 : s.goals) ?? [];
  return /* @__PURE__ */ r(b, { children: [
    /* @__PURE__ */ r(V, { onClick: () => m((p) => !p), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(E, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: g ? "▾" : "▸" })
    ] }),
    g ? x.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: x.map((p) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(L, { variant: "muted", children: p.status ?? "—" }),
        p.executionStatus ? /* @__PURE__ */ e(L, { variant: "muted", children: p.executionStatus }) : null,
        p.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: p.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: p.objective ?? p.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: p.path })
    ] }, p.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
const qe = new fe({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Ee() {
  var W;
  const n = G(), f = ie().active !== !1, g = oe(), [m, k] = v(""), [x, s] = v("goals"), [p, l] = v(null), [S, w] = v(!1), [c, T] = v(!1), [j, h] = v(""), [R, i] = v(null), P = M({
    queryKey: ["projects"],
    queryFn: () => n.get(`${$}/projects`),
    refetchInterval: f ? 5e3 : !1
  }), o = ((W = P.data) == null ? void 0 : W.projects) ?? [];
  ee(() => {
    if (!o.length) {
      k("");
      return;
    }
    if (!o.some((H) => H.path === m && !H.missing)) {
      const H = o.find((X) => !X.missing) ?? o[0];
      k(H.path);
    }
  }, [o, m]);
  const y = () => g.invalidateQueries({ queryKey: ["projects"] }), B = Y({
    mutationFn: (u) => n.post(`${$}/projects/add`, { path: u }),
    onSuccess: (u) => {
      g.setQueryData(["projects"], u), y(), w(!1), h(""), i(null), u.projects.length && k(u.projects[u.projects.length - 1].path);
    },
    onError: (u) => i(Q(u))
  }), O = Y({
    mutationFn: (u) => n.post(`${$}/projects/remove`, { path: u }),
    onSuccess: (u) => {
      g.setQueryData(["projects"], u), y(), T(!1), i(null);
    },
    onError: (u) => i(Q(u))
  }), F = o.find((u) => u.path === m), _ = (u) => {
    l(u), s("takt");
  };
  return /* @__PURE__ */ r(q, { children: [
    /* @__PURE__ */ e(
      me,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(
            pe,
            {
              "aria-label": t.projectLabel,
              options: o.map((u) => u.path),
              optionLabels: o.map((u) => u.missing ? `${u.name}（${t.projectMissing}）` : u.name),
              value: m,
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
              disabled: !F,
              onClick: () => {
                i(null), T(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: o.length ? /* @__PURE__ */ r(q, { children: [
      P.error ? /* @__PURE__ */ e(I, { message: Q(P.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        he,
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
      m ? x === "goals" ? /* @__PURE__ */ e(we, { project: m, active: f, onOpenRun: _ }) : /* @__PURE__ */ e(
        Re,
        {
          project: m,
          hasTakt: (F == null ? void 0 : F.hasTakt) ?? !1,
          active: f,
          runSlug: p,
          onSelectRun: l
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      D,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(C, { primary: !0, onClick: () => {
          i(null), w(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      J,
      {
        open: S,
        onClose: () => w(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(q, { children: [
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
              onChange: (u) => h(u.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          R ? /* @__PURE__ */ e(I, { message: R }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      J,
      {
        open: c,
        onClose: () => T(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(C, { onClick: () => T(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            C,
            {
              danger: !0,
              disabled: O.isPending,
              onClick: () => F && O.mutate(F.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: F ? t.projectRemoveConfirm(F.name) : "" }),
          R ? /* @__PURE__ */ e(I, { message: R }) : null
        ]
      }
    )
  ] });
}
function Me() {
  return /* @__PURE__ */ e(ge, { client: qe, children: /* @__PURE__ */ e(Ee, {}) });
}
export {
  Me as default
};
