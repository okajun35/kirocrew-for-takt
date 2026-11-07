import { jsxs as s, jsx as e, Fragment as E } from "react/jsx-runtime";
import { useAppApi as O, fmtRelative as ie, fmtDateTime as z, fmtNumber as le, useAppInfo as de } from "@kirocrew/app-sdk";
import { Card as S, CardTitle as $, ErrorNotice as R, EmptyState as G, Clickable as X, Badge as M, Btn as T, Input as Z, Modal as W, MarkdownRenderer as ue, StatCard as me, PageHeader as pe, Select as he, SegmentedControl as ge } from "@kirocrew/app-sdk/ui";
import { useQuery as K, useQueryClient as te, useMutation as J, QueryClient as fe, QueryClientProvider as xe } from "@tanstack/react-query";
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
}, C = "/api/apps/for-takt", P = encodeURIComponent;
function V(n) {
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
function ke(n) {
  return n ? n.slice(0, 8) : "—";
}
function be(n) {
  return n ? n.slice(0, 8) : "—";
}
function F(n) {
  if (n && typeof n == "object") {
    const d = n;
    if (typeof d.body == "string" && d.body) {
      try {
        const u = JSON.parse(d.body);
        if (u && typeof u.code == "string" && oe[u.code]) {
          const g = typeof u.error == "string" ? u.error : "";
          return `${oe[u.code]}${g ? `（${g}）` : ""}`;
        }
        if (u && typeof u.error == "string") return u.error;
      } catch {
      }
      return d.body;
    }
    if (typeof d.message == "string" && d.message) return d.message;
  }
  return t.errorGeneric;
}
function ve(n) {
  if (n && typeof n == "object" && "status" in n) {
    const d = n.status;
    return typeof d == "number" ? d : null;
  }
  return null;
}
const we = (n) => ve(n) === 409;
function Se({
  project: n,
  active: d,
  onOpenRun: u
}) {
  var y, k;
  const g = O(), [m, N] = v(null), x = K({
    queryKey: ["goals", n],
    queryFn: () => g.get(`${C}/goals?project=${P(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), a = K({
    queryKey: ["takt-tasks", n],
    queryFn: () => g.get(`${C}/takt/tasks?project=${P(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), p = ((y = x.data) == null ? void 0 : y.goals) ?? [], r = /* @__PURE__ */ new Map();
  for (const o of ((k = a.data) == null ? void 0 : k.tasks) ?? [])
    o.name && r.set(o.name, o);
  return /* @__PURE__ */ s("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.tabGoals }),
      x.error ? /* @__PURE__ */ e(R, { message: F(x.error) }) : null,
      p.length ? /* @__PURE__ */ s("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((o) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: o }, o)) }) }),
        /* @__PURE__ */ e("tbody", { children: p.map((o) => /* @__PURE__ */ s(
          "tr",
          {
            onClick: () => N(o.id),
            className: `cursor-pointer ${o.id === m ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(X, { onClick: () => N(o.id), children: (o.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(M, { variant: V(o.status), children: ce(o.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: o.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: ie(o.updatedAt) })
            ]
          },
          o.id
        )) })
      ] }) : /* @__PURE__ */ e(G, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: m ? /* @__PURE__ */ e(
      Te,
      {
        id: m,
        active: d,
        taktByName: r,
        onOpenRun: u
      }
    ) : /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e(G, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function Te({
  id: n,
  active: d,
  taktByName: u,
  onOpenRun: g
}) {
  var h, H, Y, ne, re, se, ae;
  const m = O(), N = te(), [x, a] = v(null), [p, r] = v(null), [y, k] = v(""), [o, j] = v(null), [A, f] = v(""), q = K({
    queryKey: ["goal", n],
    queryFn: () => m.get(`${C}/goal?id=${P(n)}`),
    refetchInterval: d ? 5e3 : !1
  }), c = q.data, L = () => {
    N.invalidateQueries({ queryKey: ["goal", n] }), N.invalidateQueries({ queryKey: ["goals"] });
  }, i = (l) => {
    we(l) ? (a(t.conflictReloaded), L()) : a(F(l));
  }, w = J({
    mutationFn: (l) => m.post(`${C}/goal/status`, {
      id: n,
      status: l.status,
      reason: l.reason,
      expectedRevision: l.revision
    }),
    onSuccess: () => {
      r(null), k(""), a(null), L();
    },
    onError: i
  }), _ = J({
    mutationFn: (l) => m.post(`${C}/goal/answer`, {
      id: n,
      questionId: l.questionId,
      answer: l.answer,
      expectedRevision: l.revision
    }),
    onSuccess: () => {
      j(null), f(""), a(null), L();
    },
    onError: i
  });
  if (q.isPending && !c) return /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!c)
    return /* @__PURE__ */ e(S, { children: q.error ? /* @__PURE__ */ e(R, { message: F(q.error) }) : null });
  const B = (c.questions ?? []).filter((l) => l.status === "pending"), I = [...c.workLog ?? []].reverse().slice(0, 50), D = c.status === "active" ? "paused" : c.status === "paused" ? "active" : null, U = (l, b) => {
    const Q = A.trim();
    Q && _.mutate({ questionId: l, answer: Q, revision: c.revision });
  };
  return /* @__PURE__ */ s("div", { className: "flex flex-col gap-4", children: [
    x ? /* @__PURE__ */ e(R, { message: x, onDismiss: () => a(null) }) : null,
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ s("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ s("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e($, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: c.objective })
        ] }),
        /* @__PURE__ */ s("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(M, { variant: V(c.status), children: ce(c.status) }),
          D ? /* @__PURE__ */ e(T, { onClick: () => {
            k(""), r(D);
          }, children: D === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ s("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: c.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: c.revision })
      ] })
    ] }),
    (h = c.outOfScope) != null && h.length || (H = c.acceptanceCriteria) != null && H.length || (Y = c.constraints) != null && Y.length ? /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ s($, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (ne = c.acceptanceCriteria) != null && ne.length ? /* @__PURE__ */ s(E, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: c.acceptanceCriteria.map((l, b) => /* @__PURE__ */ e("li", { children: l }, b)) })
      ] }) : null,
      (re = c.outOfScope) != null && re.length ? /* @__PURE__ */ s(E, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: c.outOfScope.map((l, b) => /* @__PURE__ */ e("li", { children: l }, b)) })
      ] }) : null,
      (se = c.constraints) != null && se.length ? /* @__PURE__ */ s(E, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: c.constraints.map((l, b) => /* @__PURE__ */ e("li", { children: l }, b)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.tasks }),
      (ae = c.tasks) != null && ae.length ? /* @__PURE__ */ s("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((l) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: l }, l)) }) }),
        /* @__PURE__ */ e("tbody", { children: c.tasks.map((l) => {
          const b = l.taskName ? u.get(l.taskName) : void 0;
          return /* @__PURE__ */ s("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: l.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: l.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: ke(l.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: b ? /* @__PURE__ */ e(X, { onClick: () => b.runSlug && g(b.runSlug), children: /* @__PURE__ */ e(M, { variant: V(b.status), children: b.status }) }) : "—" })
          ] }, l.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.questions }),
      B.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: B.map((l) => {
        var b;
        return /* @__PURE__ */ s("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: l.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (b = l.options) != null && b.length ? l.options.map((Q) => /* @__PURE__ */ e(T, { onClick: () => {
            j(l.id), f(Q);
          }, children: Q }, Q)) : /* @__PURE__ */ s(E, { children: [
            /* @__PURE__ */ e(
              Z,
              {
                value: o === l.id ? A : "",
                onChange: (Q) => {
                  j(l.id), f(Q.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(T, { primary: !0, onClick: () => U(l.id), children: t.submit })
          ] }) })
        ] }, l.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.workLog }),
      I.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: I.map((l) => /* @__PURE__ */ s("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: ie(l.at) }),
        /* @__PURE__ */ e(M, { variant: "muted", children: l.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: l.summary })
      ] }, l.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ s(
      W,
      {
        open: p !== null,
        onClose: () => r(null),
        title: p === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e(T, { onClick: () => r(null), children: t.cancel }),
          /* @__PURE__ */ e(
            T,
            {
              primary: !0,
              disabled: !y.trim() || w.isPending,
              onClick: () => p && w.mutate({ status: p, reason: y.trim(), revision: c.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            Z,
            {
              value: y,
              onChange: (l) => k(l.target.value),
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
        open: o !== null && B.some((l) => {
          var b;
          return l.id === o && ((b = l.options) == null ? void 0 : b.length);
        }),
        onClose: () => j(null),
        title: t.questions,
        footer: /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e(T, { onClick: () => j(null), children: t.cancel }),
          /* @__PURE__ */ e(T, { primary: !0, onClick: () => o && U(o), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: o ? t.answerConfirm(A) : "" })
      }
    )
  ] });
}
function Ce({
  project: n,
  slug: d,
  active: u
}) {
  var q, c, L;
  const g = O(), [m, N] = v(null), x = K({
    queryKey: ["takt-run", n, d],
    queryFn: () => g.get(
      `${C}/takt/run?project=${P(n)}&slug=${P(d)}`
    ),
    refetchInterval: u ? 3e3 : !1
  }), a = x.data, p = ((q = a == null ? void 0 : a.meta) == null ? void 0 : q.status) === "running", r = Ne({ offset: 0, file: "", records: [] }), [y, k] = v(0);
  ee(() => {
    r.current = { offset: 0, file: "", records: [] }, k((i) => i + 1);
  }, [n, d]);
  const o = K({
    queryKey: ["takt-run-log", n, d],
    queryFn: () => g.get(
      `${C}/takt/run/log?project=${P(n)}&slug=${P(d)}&offset=${r.current.offset}`
    ),
    refetchInterval: u && p ? 2e3 : !1,
    retry: 0
  });
  ee(() => {
    const i = o.data;
    if (!i) return;
    const w = r.current;
    (i.reset || w.file && w.file !== i.file) && (w.records = []), w.file = i.file, i.records.length && (w.records = w.records.concat(i.records).slice(-2e3), k((_) => _ + 1)), w.offset = i.nextOffset;
  }, [o.data]);
  const j = r.current.records, A = K({
    queryKey: ["takt-report", n, d, m],
    queryFn: () => g.get(
      `${C}/takt/run/report?project=${P(n)}&slug=${P(d)}&name=${P(m ?? "")}`
    ),
    enabled: m !== null
  }), f = a == null ? void 0 : a.meta;
  return /* @__PURE__ */ s("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(R, { message: F(x.error) }) : null,
    a != null && a.error ? /* @__PURE__ */ e(R, { message: a.error + (a.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.runMeta }),
      /* @__PURE__ */ s("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: d }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: f ? /* @__PURE__ */ e(M, { variant: V(f.status), children: f.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (f == null ? void 0 : f.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (f == null ? void 0 : f.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (f == null ? void 0 : f.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: z(f == null ? void 0 : f.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: z(f == null ? void 0 : f.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.runSteps }),
      (c = a == null ? void 0 : a.steps) != null && c.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: a.steps.map((i, w) => /* @__PURE__ */ s("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(M, { variant: i.type === "workflow_abort" ? "err" : i.type === "workflow_complete" ? "ok" : "muted", children: i.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: i.step ?? "—" }),
        i.status ? /* @__PURE__ */ e("span", { children: i.status }) : null,
        i.iteration != null ? /* @__PURE__ */ s("span", { className: "text-muted", children: [
          "iter ",
          i.iteration
        ] }) : null,
        i.matchedRule != null ? /* @__PURE__ */ s("span", { className: "text-muted", children: [
          "rule ",
          String(i.matchedRule)
        ] }) : null,
        i.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: i.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: z(i.at) })
      ] }, w)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.runLog }),
      /* @__PURE__ */ s("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        o.error ? /* @__PURE__ */ e(R, { message: F(o.error) }) : null,
        j.length ? j.map((i, w) => /* @__PURE__ */ e(Re, { rec: i }, w)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      o.data ? /* @__PURE__ */ s("p", { className: "text-[12px] text-muted mt-1", children: [
        o.data.file,
        " — ",
        le(o.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.runReports }),
      (L = a == null ? void 0 : a.reports) != null && L.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: a.reports.map((i) => /* @__PURE__ */ s("li", { children: [
        /* @__PURE__ */ e(X, { onClick: () => N(i.name), className: "text-accent underline", children: i.name }),
        /* @__PURE__ */ s("span", { className: "text-muted", children: [
          "（",
          le(i.size),
          " B）"
        ] })
      ] }, i.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ s(
      W,
      {
        open: m !== null,
        onClose: () => N(null),
        title: m,
        maxWidth: 880,
        children: [
          A.error ? /* @__PURE__ */ e(R, { message: F(A.error) }) : null,
          A.data ? /* @__PURE__ */ s(E, { children: [
            /* @__PURE__ */ e(ue, { content: A.data.text }),
            A.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function Re({ rec: n }) {
  const d = ye(() => {
    if (typeof n.raw == "string") return n.raw;
    const u = n.type ?? n.event ?? "", g = n.step ? ` ${String(n.step)}` : "", m = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(u)}${g} ${m}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: d });
}
const je = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], Ae = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function $e({
  project: n,
  hasTakt: d,
  active: u,
  runSlug: g,
  onSelectRun: m
}) {
  const N = O(), x = K({
    queryKey: ["takt-tasks", n],
    queryFn: () => N.get(`${C}/takt/tasks?project=${P(n)}`),
    refetchInterval: u ? 5e3 : !1
  }), a = x.data, p = (a == null ? void 0 : a.tasks) ?? [];
  return !d && a && !a.hasTakt ? /* @__PURE__ */ e(G, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ s("div", { className: "flex flex-col gap-4", children: [
    x.error ? /* @__PURE__ */ e(R, { message: F(x.error) }) : null,
    a != null && a.error ? /* @__PURE__ */ e(R, { message: a.error + (a.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: je.map((r) => {
      var y;
      return /* @__PURE__ */ e(
        me,
        {
          label: r,
          value: ((y = a == null ? void 0 : a.counts) == null ? void 0 : y[r]) ?? 0,
          accent: r === "running"
        },
        r
      );
    }) }),
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.tabTakt }),
      p.length ? /* @__PURE__ */ s("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((r) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: r }, r)) }) }),
        /* @__PURE__ */ e("tbody", { children: p.map((r, y) => /* @__PURE__ */ s(
          "tr",
          {
            onClick: () => r.runSlug && m(r.runSlug),
            className: `cursor-pointer ${r.runSlug && r.runSlug === g ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(M, { variant: V(r.status), children: r.status }) }),
              /* @__PURE__ */ s("td", { className: "px-2.5 py-2 text-sm", children: [
                r.runSlug ? /* @__PURE__ */ e(X, { onClick: () => m(r.runSlug), children: r.name }) : r.name,
                r.failure && Ae.has(r.status ?? "") ? /* @__PURE__ */ s("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(r.failure.step),
                  r.failure.error ? `: ${r.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: r.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: r.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: z(r.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: z(r.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: r.goalIds.map(be).join(", ") || "—" })
            ]
          },
          r.name ?? y
        )) })
      ] }) : /* @__PURE__ */ e(G, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    g ? /* @__PURE__ */ e(Ce, { project: n, slug: g, active: u }) : p.length ? /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e(G, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(qe, { project: n, active: u })
  ] });
}
function qe({ project: n, active: d }) {
  var a;
  const u = O(), [g, m] = v(!1), x = ((a = K({
    queryKey: ["takt-goal-files", n],
    queryFn: () => u.get(`${C}/takt/goal-files?project=${P(n)}`),
    refetchInterval: d ? 5e3 : !1,
    enabled: g
  }).data) == null ? void 0 : a.goals) ?? [];
  return /* @__PURE__ */ s(S, { children: [
    /* @__PURE__ */ s(X, { onClick: () => m((p) => !p), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e($, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: g ? "▾" : "▸" })
    ] }),
    g ? x.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: x.map((p) => /* @__PURE__ */ s("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ s("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(M, { variant: "muted", children: p.status ?? "—" }),
        p.executionStatus ? /* @__PURE__ */ e(M, { variant: "muted", children: p.executionStatus }) : null,
        p.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: p.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: p.objective ?? p.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: p.path })
    ] }, p.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Pe({ active: n, project: d }) {
  var k;
  const u = O(), g = te(), [m, N] = v(""), [x, a] = v(null), p = K({
    queryKey: ["settings"],
    queryFn: () => u.get(`${C}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), r = (k = p.data) == null ? void 0 : k.taktMcp;
  ee(() => {
    r && N(r.pinned ?? "");
  }, [r == null ? void 0 : r.pinned]);
  const y = J({
    mutationFn: (o) => u.post(`${C}/settings/takt-mcp`, { path: o }),
    onSuccess: (o) => {
      g.setQueryData(["settings"], o), a(null);
    },
    onError: (o) => a(F(o))
  });
  return /* @__PURE__ */ s("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    x ? /* @__PURE__ */ e(R, { message: x, onDismiss: () => a(null) }) : null,
    p.error ? /* @__PURE__ */ e(R, { message: F(p.error) }) : null,
    /* @__PURE__ */ s(S, { children: [
      /* @__PURE__ */ e($, { children: t.settingsTaktMcp }),
      /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.settingsTaktMcpHint }),
      r ? r.path ? /* @__PURE__ */ s("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(M, { variant: "ok", children: t.settingsResolved(r.source ?? "") }),
        " ",
        /* @__PURE__ */ e("code", { className: "text-[13px]", children: r.path })
      ] }) : /* @__PURE__ */ s("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(M, { variant: "err", children: t.settingsNotFound }),
        " ",
        r.error ? /* @__PURE__ */ e("span", { className: "text-muted", children: r.error }) : null
      ] }) : null,
      /* @__PURE__ */ s("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ e(
          Z,
          {
            value: m,
            onChange: (o) => N(o.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          T,
          {
            primary: !0,
            disabled: y.isPending,
            onClick: () => y.mutate(m.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          T,
          {
            disabled: y.isPending || !(r != null && r.pinned),
            onClick: () => y.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      r != null && r.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(r.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] })
  ] });
}
const Ee = new fe({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Fe() {
  var U;
  const n = O(), u = de().active !== !1, g = te(), [m, N] = v(""), [x, a] = v("goals"), [p, r] = v(null), [y, k] = v(!1), [o, j] = v(!1), [A, f] = v(""), [q, c] = v(null), L = K({
    queryKey: ["projects"],
    queryFn: () => n.get(`${C}/projects`),
    refetchInterval: u ? 5e3 : !1
  }), i = ((U = L.data) == null ? void 0 : U.projects) ?? [];
  ee(() => {
    if (!i.length) {
      N("");
      return;
    }
    if (!i.some((H) => H.path === m && !H.missing)) {
      const H = i.find((Y) => !Y.missing) ?? i[0];
      N(H.path);
    }
  }, [i, m]);
  const w = () => g.invalidateQueries({ queryKey: ["projects"] }), _ = J({
    mutationFn: (h) => n.post(`${C}/projects/add`, { path: h }),
    onSuccess: (h) => {
      g.setQueryData(["projects"], h), w(), k(!1), f(""), c(null), h.projects.length && N(h.projects[h.projects.length - 1].path);
    },
    onError: (h) => c(F(h))
  }), B = J({
    mutationFn: (h) => n.post(`${C}/projects/remove`, { path: h }),
    onSuccess: (h) => {
      g.setQueryData(["projects"], h), w(), j(!1), c(null);
    },
    onError: (h) => c(F(h))
  }), I = i.find((h) => h.path === m), D = (h) => {
    r(h), a("takt");
  };
  return /* @__PURE__ */ s(E, { children: [
    /* @__PURE__ */ e(
      pe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e(
            he,
            {
              "aria-label": t.projectLabel,
              options: i.map((h) => h.path),
              optionLabels: i.map((h) => h.missing ? `${h.name}（${t.projectMissing}）` : h.name),
              value: m,
              onChange: N,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(T, { onClick: () => {
            c(null), k(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(
            T,
            {
              danger: !0,
              disabled: !I,
              onClick: () => {
                c(null), j(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: i.length ? /* @__PURE__ */ s(E, { children: [
      L.error ? /* @__PURE__ */ e(R, { message: F(L.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        ge,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt },
            { key: "settings", label: t.tabSettings }
          ],
          value: x,
          onChange: a,
          ariaLabel: t.appTitle
        }
      ) }),
      x === "settings" ? /* @__PURE__ */ e(Pe, { active: u, project: m }) : m ? x === "goals" ? /* @__PURE__ */ e(Se, { project: m, active: u, onOpenRun: D }) : /* @__PURE__ */ e(
        $e,
        {
          project: m,
          hasTakt: (I == null ? void 0 : I.hasTakt) ?? !1,
          active: u,
          runSlug: p,
          onSelectRun: r
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      G,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(T, { primary: !0, onClick: () => {
          c(null), k(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ s(
      W,
      {
        open: y,
        onClose: () => k(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e(T, { onClick: () => k(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            T,
            {
              primary: !0,
              disabled: !A.trim() || _.isPending,
              onClick: () => _.mutate(A.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            Z,
            {
              value: A,
              onChange: (h) => f(h.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          q ? /* @__PURE__ */ e(R, { message: q }) : null
        ]
      }
    ),
    /* @__PURE__ */ s(
      W,
      {
        open: o,
        onClose: () => j(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ s(E, { children: [
          /* @__PURE__ */ e(T, { onClick: () => j(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            T,
            {
              danger: !0,
              disabled: B.isPending,
              onClick: () => I && B.mutate(I.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: I ? t.projectRemoveConfirm(I.name) : "" }),
          q ? /* @__PURE__ */ e(R, { message: q }) : null
        ]
      }
    )
  ] });
}
function He() {
  return /* @__PURE__ */ e(xe, { client: Ee, children: /* @__PURE__ */ e(Fe, {}) });
}
export {
  He as default
};
