import { jsxs as r, jsx as e, Fragment as q } from "react/jsx-runtime";
import { useAppApi as _, fmtRelative as de, fmtDateTime as ne, fmtNumber as oe, useAppInfo as pe } from "@kirocrew/app-sdk";
import { Card as C, CardTitle as P, ErrorNotice as $, EmptyState as V, Clickable as X, Badge as I, Btn as v, Input as D, Modal as W, MarkdownRenderer as he, StatCard as ge, PageHeader as fe, Select as xe, SegmentedControl as Ne } from "@kirocrew/app-sdk/ui";
import { useQuery as Q, useQueryClient as le, useMutation as U, QueryClient as be, QueryClientProvider as ye } from "@tanstack/react-query";
import { useState as k, useRef as ke, useEffect as se, useMemo as ve } from "react";
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
}, ce = {
  bad_request: t.errorBadRequest,
  unauthorized: t.errorUnauthorized,
  owner_only: t.errorOwnerOnly,
  app_token_forbidden: t.errorAppTokenForbidden,
  sensitive_path: t.errorSensitivePath,
  not_found: t.errorNotFound,
  conflict: t.errorConflict,
  internal: t.errorInternal
}, S = "/api/apps/for-takt", M = encodeURIComponent;
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
function A(n) {
  if (n && typeof n == "object") {
    const i = n;
    if (typeof i.body == "string" && i.body) {
      try {
        const m = JSON.parse(i.body);
        if (m && typeof m.code == "string" && ce[m.code]) {
          const f = typeof m.error == "string" ? m.error : "";
          return `${ce[m.code]}${f ? `（${f}）` : ""}`;
        }
        if (m && typeof m.error == "string") return m.error;
      } catch {
      }
      return i.body;
    }
    if (typeof i.message == "string" && i.message) return i.message;
  }
  return t.errorGeneric;
}
function Ce(n) {
  if (n && typeof n == "object" && "status" in n) {
    const i = n.status;
    return typeof i == "number" ? i : null;
  }
  return null;
}
const Te = (n) => Ce(n) === 409;
function je({
  project: n,
  active: i,
  onOpenRun: m
}) {
  var R, g;
  const f = _(), [p, d] = k(null), N = Q({
    queryKey: ["goals", n],
    queryFn: () => f.get(`${S}/goals?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), l = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => f.get(`${S}/takt/tasks?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), x = ((R = N.data) == null ? void 0 : R.goals) ?? [], a = /* @__PURE__ */ new Map();
  for (const u of ((g = l.data) == null ? void 0 : g.tasks) ?? [])
    u.name && a.set(u.name, u);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.tabGoals }),
      N.error ? /* @__PURE__ */ e($, { message: A(N.error) }) : null,
      x.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((u) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: u }, u)) }) }),
        /* @__PURE__ */ e("tbody", { children: x.map((u) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => d(u.id),
            className: `cursor-pointer ${u.id === p ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(X, { onClick: () => d(u.id), children: (u.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(I, { variant: re(u.status), children: ue(u.status) }) }),
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
        active: i,
        taktByName: a,
        onOpenRun: m
      }
    ) : /* @__PURE__ */ e(C, { children: /* @__PURE__ */ e(V, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function $e({
  id: n,
  active: i,
  taktByName: m,
  onOpenRun: f
}) {
  var z, K, Z, J, ee, te, L;
  const p = _(), d = le(), [N, l] = k(null), [x, a] = k(null), [R, g] = k(""), [u, T] = k(null), [j, b] = k(""), E = Q({
    queryKey: ["goal", n],
    queryFn: () => p.get(`${S}/goal?id=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), h = E.data, O = () => {
    d.invalidateQueries({ queryKey: ["goal", n] }), d.invalidateQueries({ queryKey: ["goals"] });
  }, s = (o) => {
    Te(o) ? (l(t.conflictReloaded), O()) : l(A(o));
  }, y = U({
    mutationFn: (o) => p.post(`${S}/goal/status`, {
      id: n,
      status: o.status,
      reason: o.reason,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      a(null), g(""), l(null), O();
    },
    onError: s
  }), B = U({
    mutationFn: (o) => p.post(`${S}/goal/answer`, {
      id: n,
      questionId: o.questionId,
      answer: o.answer,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      T(null), b(""), l(null), O();
    },
    onError: s
  });
  if (E.isPending && !h) return /* @__PURE__ */ e(C, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!h)
    return /* @__PURE__ */ e(C, { children: E.error ? /* @__PURE__ */ e($, { message: A(E.error) }) : null });
  const G = (h.questions ?? []).filter((o) => o.status === "pending"), Y = [...h.workLog ?? []].reverse().slice(0, 50), H = h.status === "active" ? "paused" : h.status === "paused" ? "active" : null, F = (o, w) => {
    const c = j.trim();
    c && B.mutate({ questionId: o, answer: c, revision: h.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N ? /* @__PURE__ */ e($, { message: N, onDismiss: () => l(null) }) : null,
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(P, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: h.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(I, { variant: re(h.status), children: ue(h.status) }),
          H ? /* @__PURE__ */ e(v, { onClick: () => {
            g(""), a(H);
          }, children: H === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ r("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: h.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: h.revision })
      ] })
    ] }),
    (z = h.outOfScope) != null && z.length || (K = h.acceptanceCriteria) != null && K.length || (Z = h.constraints) != null && Z.length ? /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ r(P, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (J = h.acceptanceCriteria) != null && J.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.acceptanceCriteria.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null,
      (ee = h.outOfScope) != null && ee.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.outOfScope.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null,
      (te = h.constraints) != null && te.length ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.constraints.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.tasks }),
      (L = h.tasks) != null && L.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((o) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: o }, o)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.tasks.map((o) => {
          const w = o.taskName ? m.get(o.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: o.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: we(o.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: w ? /* @__PURE__ */ e(X, { onClick: () => w.runSlug && f(w.runSlug), children: /* @__PURE__ */ e(I, { variant: re(w.status), children: w.status }) }) : "—" })
          ] }, o.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.questions }),
      G.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: G.map((o) => {
        var w;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: o.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (w = o.options) != null && w.length ? o.options.map((c) => /* @__PURE__ */ e(v, { onClick: () => {
            T(o.id), b(c);
          }, children: c }, c)) : /* @__PURE__ */ r(q, { children: [
            /* @__PURE__ */ e(
              D,
              {
                value: u === o.id ? j : "",
                onChange: (c) => {
                  T(o.id), b(c.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(v, { primary: !0, onClick: () => F(o.id), children: t.submit })
          ] }) })
        ] }, o.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.workLog }),
      Y.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: Y.map((o) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: de(o.at) }),
        /* @__PURE__ */ e(I, { variant: "muted", children: o.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: o.summary })
      ] }, o.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      W,
      {
        open: x !== null,
        onClose: () => a(null),
        title: x === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(v, { onClick: () => a(null), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: !R.trim() || y.isPending,
              onClick: () => x && y.mutate({ status: x, reason: R.trim(), revision: h.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            D,
            {
              value: R,
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
        open: u !== null && G.some((o) => {
          var w;
          return o.id === u && ((w = o.options) == null ? void 0 : w.length);
        }),
        onClose: () => T(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(v, { onClick: () => T(null), children: t.cancel }),
          /* @__PURE__ */ e(v, { primary: !0, onClick: () => u && F(u), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: u ? t.answerConfirm(j) : "" })
      }
    )
  ] });
}
function Re({
  project: n,
  slug: i,
  active: m
}) {
  var E, h, O;
  const f = _(), [p, d] = k(null), N = Q({
    queryKey: ["takt-run", n, i],
    queryFn: () => f.get(
      `${S}/takt/run?project=${M(n)}&slug=${M(i)}`
    ),
    refetchInterval: m ? 3e3 : !1
  }), l = N.data, x = ((E = l == null ? void 0 : l.meta) == null ? void 0 : E.status) === "running", a = ke({ offset: 0, file: "", records: [] }), [R, g] = k(0);
  se(() => {
    a.current = { offset: 0, file: "", records: [] }, g((s) => s + 1);
  }, [n, i]);
  const u = Q({
    queryKey: ["takt-run-log", n, i],
    queryFn: () => f.get(
      `${S}/takt/run/log?project=${M(n)}&slug=${M(i)}&offset=${a.current.offset}`
    ),
    refetchInterval: m && x ? 2e3 : !1,
    retry: 0
  });
  se(() => {
    const s = u.data;
    if (!s) return;
    const y = a.current;
    (s.reset || y.file && y.file !== s.file) && (y.records = []), y.file = s.file, s.records.length && (y.records = y.records.concat(s.records).slice(-2e3), g((B) => B + 1)), y.offset = s.nextOffset;
  }, [u.data]);
  const T = a.current.records, j = Q({
    queryKey: ["takt-report", n, i, p],
    queryFn: () => f.get(
      `${S}/takt/run/report?project=${M(n)}&slug=${M(i)}&name=${M(p ?? "")}`
    ),
    enabled: p !== null
  }), b = l == null ? void 0 : l.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N.error ? /* @__PURE__ */ e($, { message: A(N.error) }) : null,
    l != null && l.error ? /* @__PURE__ */ e($, { message: l.error + (l.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: i }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: b ? /* @__PURE__ */ e(I, { variant: re(b.status), children: b.status }) : "—" }),
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
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.runSteps }),
      (h = l == null ? void 0 : l.steps) != null && h.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: l.steps.map((s, y) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(I, { variant: s.type === "workflow_abort" ? "err" : s.type === "workflow_complete" ? "ok" : "muted", children: s.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: s.step ?? "—" }),
        s.status ? /* @__PURE__ */ e("span", { children: s.status }) : null,
        s.iteration != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "iter ",
          s.iteration
        ] }) : null,
        s.matchedRule != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "rule ",
          String(s.matchedRule)
        ] }) : null,
        s.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: s.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: ne(s.at) })
      ] }, y)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        u.error ? /* @__PURE__ */ e($, { message: A(u.error) }) : null,
        T.length ? T.map((s, y) => /* @__PURE__ */ e(Ae, { rec: s }, y)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      u.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        u.data.file,
        " — ",
        oe(u.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.runReports }),
      (O = l == null ? void 0 : l.reports) != null && O.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: l.reports.map((s) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(X, { onClick: () => d(s.name), className: "text-accent underline", children: s.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          oe(s.size),
          " B）"
        ] })
      ] }, s.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      W,
      {
        open: p !== null,
        onClose: () => d(null),
        title: p,
        maxWidth: 880,
        children: [
          j.error ? /* @__PURE__ */ e($, { message: A(j.error) }) : null,
          j.data ? /* @__PURE__ */ r(q, { children: [
            /* @__PURE__ */ e(he, { content: j.data.text }),
            j.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function Ae({ rec: n }) {
  const i = ve(() => {
    if (typeof n.raw == "string") return n.raw;
    const m = n.type ?? n.event ?? "", f = n.step ? ` ${String(n.step)}` : "", p = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(m)}${f} ${p}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: i });
}
const qe = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], Pe = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Ee({
  project: n,
  hasTakt: i,
  active: m,
  runSlug: f,
  onSelectRun: p
}) {
  const d = _(), N = Q({
    queryKey: ["takt-tasks", n],
    queryFn: () => d.get(`${S}/takt/tasks?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), l = N.data, x = (l == null ? void 0 : l.tasks) ?? [];
  return !i && l && !l.hasTakt ? /* @__PURE__ */ e(V, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N.error ? /* @__PURE__ */ e($, { message: A(N.error) }) : null,
    l != null && l.error ? /* @__PURE__ */ e($, { message: l.error + (l.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: qe.map((a) => {
      var R;
      return /* @__PURE__ */ e(
        ge,
        {
          label: a,
          value: ((R = l == null ? void 0 : l.counts) == null ? void 0 : R[a]) ?? 0,
          accent: a === "running"
        },
        a
      );
    }) }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.tabTakt }),
      x.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((a) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: a }, a)) }) }),
        /* @__PURE__ */ e("tbody", { children: x.map((a, R) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => a.runSlug && p(a.runSlug),
            className: `cursor-pointer ${a.runSlug && a.runSlug === f ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(I, { variant: re(a.status), children: a.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                a.runSlug ? /* @__PURE__ */ e(X, { onClick: () => p(a.runSlug), children: a.name }) : a.name,
                a.failure && Pe.has(a.status ?? "") ? /* @__PURE__ */ r("div", { className: "text-[12px] text-danger", children: [
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
          a.name ?? R
        )) })
      ] }) : /* @__PURE__ */ e(V, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    f ? /* @__PURE__ */ e(Re, { project: n, slug: f, active: m }) : x.length ? /* @__PURE__ */ e(C, { children: /* @__PURE__ */ e(V, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(Fe, { project: n, active: m })
  ] });
}
function Fe({ project: n, active: i }) {
  var l;
  const m = _(), [f, p] = k(!1), N = ((l = Q({
    queryKey: ["takt-goal-files", n],
    queryFn: () => m.get(`${S}/takt/goal-files?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1,
    enabled: f
  }).data) == null ? void 0 : l.goals) ?? [];
  return /* @__PURE__ */ r(C, { children: [
    /* @__PURE__ */ r(X, { onClick: () => p((x) => !x), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(P, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: f ? "▾" : "▸" })
    ] }),
    f ? N.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: N.map((x) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(I, { variant: "muted", children: x.status ?? "—" }),
        x.executionStatus ? /* @__PURE__ */ e(I, { variant: "muted", children: x.executionStatus }) : null,
        x.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: x.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: x.objective ?? x.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: x.path })
    ] }, x.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Ie({ active: n, project: i }) {
  var O;
  const m = _(), f = le(), [p, d] = k(""), [N, l] = k(null), x = Q({
    queryKey: ["settings"],
    queryFn: () => m.get(`${S}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), a = (O = x.data) == null ? void 0 : O.taktMcp, g = Q({
    queryKey: ["takt-config", i],
    queryFn: () => m.get(
      `${S}/takt/config?project=${encodeURIComponent(i)}`
    ),
    refetchInterval: n ? 5e3 : !1
  }).data, [u, T] = k(null), [j, b] = k(""), E = U({
    mutationFn: (s) => m.post(`${S}/takt/config`, {
      changes: s,
      revision: (g == null ? void 0 : g.revision) ?? null
    }),
    onSuccess: () => {
      f.invalidateQueries({ queryKey: ["takt-config"] }), T(null), l(null);
    },
    onError: (s) => l(A(s))
  });
  se(() => {
    a && d(a.pinned ?? "");
  }, [a == null ? void 0 : a.pinned]);
  const h = U({
    mutationFn: (s) => m.post(`${S}/settings/takt-mcp`, { path: s }),
    onSuccess: (s) => {
      f.setQueryData(["settings"], s), l(null);
    },
    onError: (s) => l(A(s))
  });
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    N ? /* @__PURE__ */ e($, { message: N, onDismiss: () => l(null) }) : null,
    x.error ? /* @__PURE__ */ e($, { message: A(x.error) }) : null,
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.settingsTaktMcp }),
      /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.settingsTaktMcpHint }),
      a ? a.path ? /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(I, { variant: "ok", children: t.settingsResolved(a.source ?? "") }),
        " ",
        /* @__PURE__ */ e("code", { className: "text-[13px]", children: a.path })
      ] }) : /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(I, { variant: "err", children: t.settingsNotFound }),
        " ",
        a.error ? /* @__PURE__ */ e("span", { className: "text-muted", children: a.error }) : null
      ] }) : null,
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ e(
          D,
          {
            value: p,
            onChange: (s) => d(s.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          v,
          {
            primary: !0,
            disabled: h.isPending,
            onClick: () => h.mutate(p.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          v,
          {
            disabled: h.isPending || !(a != null && a.pinned),
            onClick: () => h.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      a != null && a.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(a.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] }),
    /* @__PURE__ */ r(C, { children: [
      /* @__PURE__ */ e(P, { children: t.configTitle }),
      g != null && g.global.error ? /* @__PURE__ */ e($, { message: g.global.error }) : g != null && g.global.exists ? null : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.configNotFound }),
      /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configGlobal }),
      g ? /* @__PURE__ */ e("table", { className: "w-full text-[13px] mb-3", children: /* @__PURE__ */ e("tbody", { children: Object.entries(g.global.config).map(([s, y]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
        /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: s }),
        /* @__PURE__ */ e("td", { className: "py-1", children: u === s ? /* @__PURE__ */ r("div", { className: "flex gap-1 items-center", children: [
          /* @__PURE__ */ e(
            D,
            {
              value: j,
              onChange: (B) => b(B.target.value),
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: E.isPending,
              onClick: () => E.mutate({ [s]: j }),
              children: t.configSave
            }
          )
        ] }) : typeof y == "object" ? /* @__PURE__ */ e("code", { className: "text-muted", children: JSON.stringify(y) }) : /* @__PURE__ */ e("code", { children: String(y) }) }),
        /* @__PURE__ */ e("td", { className: "py-1 w-[60px] text-right", children: g.writableKeys.includes(s) && u !== s ? /* @__PURE__ */ e(
          v,
          {
            onClick: () => {
              T(s), b(String(y));
            },
            children: t.configEdit
          }
        ) : null })
      ] }, s)) }) }) : null,
      g != null && g.project.exists ? /* @__PURE__ */ r(q, { children: [
        /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configProject }),
        /* @__PURE__ */ e("table", { className: "w-full text-[13px]", children: /* @__PURE__ */ e("tbody", { children: Object.entries(g.project.config).map(([s, y]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
          /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: s }),
          /* @__PURE__ */ e("td", { className: "py-1", children: /* @__PURE__ */ e("code", { className: "text-muted", children: typeof y == "object" ? JSON.stringify(y) : String(y) }) })
        ] }, s)) }) })
      ] }) : null
    ] })
  ] });
}
function ie({
  path: n,
  onNavigate: i,
  onPick: m
}) {
  const f = _(), p = Q({
    queryKey: ["directories", n],
    queryFn: () => f.post(`${S}/directories`, { path: n })
  }), d = p.data;
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ e(
        v,
        {
          disabled: !(d != null && d.parent),
          onClick: () => (d == null ? void 0 : d.parent) && i(d.parent),
          children: t.browseUp
        }
      ),
      /* @__PURE__ */ e("code", { className: "text-[12px] text-muted truncate flex-1", children: (d == null ? void 0 : d.path) ?? n }),
      m ? /* @__PURE__ */ e(v, { primary: !0, onClick: () => d && m(d.path), children: t.browsePick }) : null
    ] }),
    /* @__PURE__ */ e("div", { className: "border border-subtle rounded max-h-[220px] overflow-y-auto", children: p.isLoading ? /* @__PURE__ */ e("p", { className: "text-sm text-muted p-2", children: "…" }) : p.error ? /* @__PURE__ */ e("p", { className: "text-sm p-2", children: A(p.error) }) : ((d == null ? void 0 : d.directories) ?? []).map((N) => /* @__PURE__ */ r(
      X,
      {
        className: "flex items-center gap-2 px-2 py-1 text-[13px] hover:bg-hover",
        onClick: () => i(N.path),
        children: [
          /* @__PURE__ */ e("span", { className: "truncate", children: N.name }),
          /* @__PURE__ */ r("span", { className: "ml-auto flex gap-1", children: [
            N.hasGit ? /* @__PURE__ */ e(I, { variant: "ok", children: t.browseGit }) : null,
            N.hasTakt ? /* @__PURE__ */ e(I, { variant: "aim", children: t.browseTakt }) : null
          ] })
        ]
      },
      N.path
    )) }),
    d != null && d.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.browseTruncated }) : null
  ] });
}
const Ke = new be({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: !1,
      staleTime: 0
    }
  }
});
function Me() {
  var w;
  const n = _(), m = pe().active !== !1, f = le(), [p, d] = k(""), [N, l] = k("goals"), [x, a] = k(null), [R, g] = k(!1), [u, T] = k(!1), [j, b] = k(""), [E, h] = k(""), [O, s] = k(!1), [y, B] = k(""), [G, Y] = k("~"), [H, F] = k(null), z = Q({
    queryKey: ["projects"],
    queryFn: () => n.get(`${S}/projects`),
    refetchInterval: m ? 5e3 : !1
  }), K = ((w = z.data) == null ? void 0 : w.projects) ?? [];
  se(() => {
    if (!K.length) {
      d("");
      return;
    }
    if (!K.some((ae) => ae.path === p && !ae.missing)) {
      const ae = K.find((me) => !me.missing) ?? K[0];
      d(ae.path);
    }
  }, [K, p]);
  const Z = () => f.invalidateQueries({ queryKey: ["projects"] }), J = U({
    mutationFn: (c) => n.post(`${S}/projects/add`, { path: c }),
    onSuccess: (c) => {
      f.setQueryData(["projects"], c), Z(), g(!1), B(""), F(null), c.projects.length && d(c.projects[c.projects.length - 1].path);
    },
    onError: (c) => F(A(c))
  }), ee = U({
    mutationFn: (c) => n.post(`${S}/projects/clone`, c),
    onSuccess: (c) => {
      f.setQueryData(["projects"], c), T(!1), b(""), h(""), F(null);
    },
    onError: (c) => F(A(c))
  }), te = U({
    mutationFn: (c) => n.post(`${S}/projects/remove`, { path: c }),
    onSuccess: (c) => {
      f.setQueryData(["projects"], c), Z(), s(!1), F(null);
    },
    onError: (c) => F(A(c))
  }), L = K.find((c) => c.path === p), o = (c) => {
    a(c), l("takt");
  };
  return /* @__PURE__ */ r(q, { children: [
    /* @__PURE__ */ e(
      fe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(
            xe,
            {
              "aria-label": t.projectLabel,
              options: K.map((c) => c.path),
              optionLabels: K.map((c) => c.missing ? `${c.name}（${t.projectMissing}）` : c.name),
              value: p,
              onChange: d,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(v, { onClick: () => {
            F(null), g(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(v, { onClick: () => {
            F(null), T(!0);
          }, children: t.cloneTitle }),
          /* @__PURE__ */ e(
            v,
            {
              danger: !0,
              disabled: !L,
              onClick: () => {
                F(null), s(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: K.length ? /* @__PURE__ */ r(q, { children: [
      z.error ? /* @__PURE__ */ e($, { message: A(z.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        Ne,
        {
          segments: [
            { key: "goals", label: t.tabGoals },
            { key: "takt", label: t.tabTakt },
            { key: "settings", label: t.tabSettings }
          ],
          value: N,
          onChange: l,
          ariaLabel: t.appTitle
        }
      ) }),
      N === "settings" ? /* @__PURE__ */ e(Ie, { active: m, project: p }) : p ? N === "goals" ? /* @__PURE__ */ e(je, { project: p, active: m, onOpenRun: o }) : /* @__PURE__ */ e(
        Ee,
        {
          project: p,
          hasTakt: (L == null ? void 0 : L.hasTakt) ?? !1,
          active: m,
          runSlug: x,
          onSelectRun: a
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      V,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(v, { primary: !0, onClick: () => {
          F(null), g(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      W,
      {
        open: R,
        onClose: () => g(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(v, { onClick: () => g(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: !y.trim() || J.isPending,
              onClick: () => J.mutate(y.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            ie,
            {
              path: G,
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
              value: y,
              onChange: (c) => B(c.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          H ? /* @__PURE__ */ e($, { message: H }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      W,
      {
        open: u,
        onClose: () => T(!1),
        title: t.cloneTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(v, { onClick: () => T(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: !j.trim() || ee.isPending,
              onClick: () => ee.mutate({
                url: j.trim(),
                parent: G,
                name: E.trim() || void 0
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
              value: j,
              onChange: (c) => b(c.target.value),
              placeholder: t.cloneUrlHint,
              className: "w-full mb-2"
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-1", children: t.cloneParent }),
          /* @__PURE__ */ e(ie, { path: G, onNavigate: Y }),
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2 mb-1", children: t.cloneName }),
          /* @__PURE__ */ e(
            D,
            {
              value: E,
              onChange: (c) => h(c.target.value),
              placeholder: "repo-name",
              className: "w-full"
            }
          ),
          H ? /* @__PURE__ */ e($, { message: H }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      W,
      {
        open: O,
        onClose: () => s(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(q, { children: [
          /* @__PURE__ */ e(v, { onClick: () => s(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
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
          H ? /* @__PURE__ */ e($, { message: H }) : null
        ]
      }
    )
  ] });
}
function _e() {
  return /* @__PURE__ */ e(ye, { client: Ke, children: /* @__PURE__ */ e(Me, {}) });
}
export {
  _e as default
};
