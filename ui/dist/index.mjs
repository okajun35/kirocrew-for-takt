import { jsxs as r, jsx as e, Fragment as F } from "react/jsx-runtime";
import { useAppApi as B, fmtRelative as ie, fmtDateTime as W, fmtNumber as le, useAppInfo as de } from "@kirocrew/app-sdk";
import { Card as S, CardTitle as P, ErrorNotice as A, EmptyState as U, Clickable as J, Badge as I, Btn as v, Input as X, Modal as Y, MarkdownRenderer as ue, StatCard as me, PageHeader as pe, Select as he, SegmentedControl as ge } from "@kirocrew/app-sdk/ui";
import { useQuery as O, useQueryClient as re, useMutation as z, QueryClient as fe, QueryClientProvider as xe } from "@tanstack/react-query";
import { useState as k, useRef as Ne, useEffect as ne, useMemo as be } from "react";
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
}, C = "/api/apps/for-takt", M = encodeURIComponent;
function Z(n) {
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
function E(n) {
  if (n && typeof n == "object") {
    const i = n;
    if (typeof i.body == "string" && i.body) {
      try {
        const m = JSON.parse(i.body);
        if (m && typeof m.code == "string" && oe[m.code]) {
          const x = typeof m.error == "string" ? m.error : "";
          return `${oe[m.code]}${x ? `（${x}）` : ""}`;
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
function ve(n) {
  if (n && typeof n == "object" && "status" in n) {
    const i = n.status;
    return typeof i == "number" ? i : null;
  }
  return null;
}
const we = (n) => ve(n) === 409;
function Se({
  project: n,
  active: i,
  onOpenRun: m
}) {
  var R, p;
  const x = B(), [u, c] = k(null), N = O({
    queryKey: ["goals", n],
    queryFn: () => x.get(`${C}/goals?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), l = O({
    queryKey: ["takt-tasks", n],
    queryFn: () => x.get(`${C}/takt/tasks?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), f = ((R = N.data) == null ? void 0 : R.goals) ?? [], s = /* @__PURE__ */ new Map();
  for (const d of ((p = l.data) == null ? void 0 : p.tasks) ?? [])
    d.name && s.set(d.name, d);
  return /* @__PURE__ */ r("div", { className: "grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]", children: [
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.tabGoals }),
      N.error ? /* @__PURE__ */ e(A, { message: E(N.error) }) : null,
      f.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.objective, t.colStatus, t.goalBranch, t.tasks, t.questions, t.colCompleted].map((d) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: d }, d)) }) }),
        /* @__PURE__ */ e("tbody", { children: f.map((d) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => c(d.id),
            className: `cursor-pointer ${d.id === u ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: /* @__PURE__ */ e(J, { onClick: () => c(d.id), children: (d.objective || "").split(`
`)[0] }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(I, { variant: Z(d.status), children: ce(d.status) }) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: d.branch ?? t.goalNone }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: d.taskCount }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: d.pendingQuestions }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: ie(d.updatedAt) })
            ]
          },
          d.id
        )) })
      ] }) : /* @__PURE__ */ e(U, { icon: "🎯", title: t.goalListEmpty, subtitle: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ e("div", { className: "min-h-0", children: u ? /* @__PURE__ */ e(
      Ce,
      {
        id: u,
        active: i,
        taktByName: s,
        onOpenRun: m
      }
    ) : /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e(U, { icon: "🎯", title: t.goalSelectHint }) }) })
  ] });
}
function Ce({
  id: n,
  active: i,
  taktByName: m,
  onOpenRun: x
}) {
  var ee, V, g, H, te, se, ae;
  const u = B(), c = re(), [N, l] = k(null), [f, s] = k(null), [R, p] = k(""), [d, T] = k(null), [j, b] = k(""), K = O({
    queryKey: ["goal", n],
    queryFn: () => u.get(`${C}/goal?id=${M(n)}`),
    refetchInterval: i ? 5e3 : !1
  }), h = K.data, q = () => {
    c.invalidateQueries({ queryKey: ["goal", n] }), c.invalidateQueries({ queryKey: ["goals"] });
  }, a = (o) => {
    we(o) ? (l(t.conflictReloaded), q()) : l(E(o));
  }, y = z({
    mutationFn: (o) => u.post(`${C}/goal/status`, {
      id: n,
      status: o.status,
      reason: o.reason,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      s(null), p(""), l(null), q();
    },
    onError: a
  }), $ = z({
    mutationFn: (o) => u.post(`${C}/goal/answer`, {
      id: n,
      questionId: o.questionId,
      answer: o.answer,
      expectedRevision: o.revision
    }),
    onSuccess: () => {
      T(null), b(""), l(null), q();
    },
    onError: a
  });
  if (K.isPending && !h) return /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading }) });
  if (!h)
    return /* @__PURE__ */ e(S, { children: K.error ? /* @__PURE__ */ e(A, { message: E(K.error) }) : null });
  const _ = (h.questions ?? []).filter((o) => o.status === "pending"), G = [...h.workLog ?? []].reverse().slice(0, 50), D = h.status === "active" ? "paused" : h.status === "paused" ? "active" : null, Q = (o, w) => {
    const L = j.trim();
    L && $.mutate({ questionId: o, answer: L, revision: h.revision });
  };
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N ? /* @__PURE__ */ e(A, { message: N, onDismiss: () => l(null) }) : null,
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ r("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ r("div", { className: "min-w-0", children: [
          /* @__PURE__ */ e(P, { children: t.objective }),
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: h.objective })
        ] }),
        /* @__PURE__ */ r("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ e(I, { variant: Z(h.status), children: ce(h.status) }),
          D ? /* @__PURE__ */ e(v, { onClick: () => {
            p(""), s(D);
          }, children: D === "paused" ? t.pause : t.resume }) : null
        ] })
      ] }),
      /* @__PURE__ */ r("dl", { className: "mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.goalBranch }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: h.branch ?? t.goalNone }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "revision" }),
        /* @__PURE__ */ e("dd", { children: h.revision })
      ] })
    ] }),
    (ee = h.outOfScope) != null && ee.length || (V = h.acceptanceCriteria) != null && V.length || (g = h.constraints) != null && g.length ? /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ r(P, { children: [
        t.acceptance,
        " / ",
        t.outOfScope,
        " / ",
        t.constraints
      ] }),
      (H = h.acceptanceCriteria) != null && H.length ? /* @__PURE__ */ r(F, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-1", children: t.acceptance }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.acceptanceCriteria.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null,
      (te = h.outOfScope) != null && te.length ? /* @__PURE__ */ r(F, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.outOfScope }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.outOfScope.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null,
      (se = h.constraints) != null && se.length ? /* @__PURE__ */ r(F, { children: [
        /* @__PURE__ */ e("h4", { className: "text-sm font-medium mt-2", children: t.constraints }),
        /* @__PURE__ */ e("ul", { className: "list-disc pl-5 text-sm", children: h.constraints.map((o, w) => /* @__PURE__ */ e("li", { children: o }, w)) })
      ] }) : null
    ] }) : null,
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.tasks }),
      (ae = h.tasks) != null && ae.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.taskName, t.taskState, t.taskBranch, t.taskIntegrated, t.taktStatus].map((o) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: o }, o)) }) }),
        /* @__PURE__ */ e("tbody", { children: h.tasks.map((o) => {
          const w = o.taskName ? m.get(o.taskName) : void 0;
          return /* @__PURE__ */ r("tr", { children: [
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.taskName }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: o.state }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: o.branch ?? "—" }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: ye(o.integratedSha) }),
            /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: w ? /* @__PURE__ */ e(J, { onClick: () => w.runSlug && x(w.runSlug), children: /* @__PURE__ */ e(I, { variant: Z(w.status), children: w.status }) }) : "—" })
          ] }, o.taskName);
        }) })
      ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.goalListEmptyHint })
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.questions }),
      _.length ? /* @__PURE__ */ e("div", { className: "flex flex-col gap-3", children: _.map((o) => {
        var w;
        return /* @__PURE__ */ r("div", { className: "border border-border rounded p-3", children: [
          /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: o.body }),
          /* @__PURE__ */ e("div", { className: "mt-2 flex gap-2 items-center flex-wrap", children: (w = o.options) != null && w.length ? o.options.map((L) => /* @__PURE__ */ e(v, { onClick: () => {
            T(o.id), b(L);
          }, children: L }, L)) : /* @__PURE__ */ r(F, { children: [
            /* @__PURE__ */ e(
              X,
              {
                value: d === o.id ? j : "",
                onChange: (L) => {
                  T(o.id), b(L.target.value);
                },
                placeholder: t.questionAnswerPlaceholder,
                className: "flex-1 min-w-[160px]"
              }
            ),
            /* @__PURE__ */ e(v, { primary: !0, onClick: () => Q(o.id), children: t.submit })
          ] }) })
        ] }, o.id);
      }) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noQuestions })
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.workLog }),
      G.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: G.map((o) => /* @__PURE__ */ r("li", { className: "flex gap-2", children: [
        /* @__PURE__ */ e("span", { className: "text-muted shrink-0", children: ie(o.at) }),
        /* @__PURE__ */ e(I, { variant: "muted", children: o.kind }),
        /* @__PURE__ */ e("span", { className: "min-w-0", children: o.summary })
      ] }, o.id)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: "—" })
    ] }),
    /* @__PURE__ */ r(
      Y,
      {
        open: f !== null,
        onClose: () => s(null),
        title: f === "paused" ? t.pauseTitle : t.resumeTitle,
        footer: /* @__PURE__ */ r(F, { children: [
          /* @__PURE__ */ e(v, { onClick: () => s(null), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: !R.trim() || y.isPending,
              onClick: () => f && y.mutate({ status: f, reason: R.trim(), revision: h.revision }),
              children: t.confirm
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("label", { className: "text-sm font-medium", children: t.reasonRequired }),
          /* @__PURE__ */ e(
            X,
            {
              value: R,
              onChange: (o) => p(o.target.value),
              placeholder: t.reasonPlaceholder,
              className: "w-full mt-1"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ e(
      Y,
      {
        open: d !== null && _.some((o) => {
          var w;
          return o.id === d && ((w = o.options) == null ? void 0 : w.length);
        }),
        onClose: () => T(null),
        title: t.questions,
        footer: /* @__PURE__ */ r(F, { children: [
          /* @__PURE__ */ e(v, { onClick: () => T(null), children: t.cancel }),
          /* @__PURE__ */ e(v, { primary: !0, onClick: () => d && Q(d), children: t.submit })
        ] }),
        children: /* @__PURE__ */ e("p", { className: "text-sm whitespace-pre-wrap", children: d ? t.answerConfirm(j) : "" })
      }
    )
  ] });
}
function Te({
  project: n,
  slug: i,
  active: m
}) {
  var K, h, q;
  const x = B(), [u, c] = k(null), N = O({
    queryKey: ["takt-run", n, i],
    queryFn: () => x.get(
      `${C}/takt/run?project=${M(n)}&slug=${M(i)}`
    ),
    refetchInterval: m ? 3e3 : !1
  }), l = N.data, f = ((K = l == null ? void 0 : l.meta) == null ? void 0 : K.status) === "running", s = Ne({ offset: 0, file: "", records: [] }), [R, p] = k(0);
  ne(() => {
    s.current = { offset: 0, file: "", records: [] }, p((a) => a + 1);
  }, [n, i]);
  const d = O({
    queryKey: ["takt-run-log", n, i],
    queryFn: () => x.get(
      `${C}/takt/run/log?project=${M(n)}&slug=${M(i)}&offset=${s.current.offset}`
    ),
    refetchInterval: m && f ? 2e3 : !1,
    retry: 0
  });
  ne(() => {
    const a = d.data;
    if (!a) return;
    const y = s.current;
    (a.reset || y.file && y.file !== a.file) && (y.records = []), y.file = a.file, a.records.length && (y.records = y.records.concat(a.records).slice(-2e3), p(($) => $ + 1)), y.offset = a.nextOffset;
  }, [d.data]);
  const T = s.current.records, j = O({
    queryKey: ["takt-report", n, i, u],
    queryFn: () => x.get(
      `${C}/takt/run/report?project=${M(n)}&slug=${M(i)}&name=${M(u ?? "")}`
    ),
    enabled: u !== null
  }), b = l == null ? void 0 : l.meta;
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N.error ? /* @__PURE__ */ e(A, { message: E(N.error) }) : null,
    l != null && l.error ? /* @__PURE__ */ e(A, { message: l.error + (l.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.runMeta }),
      /* @__PURE__ */ r("dl", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm", children: [
        /* @__PURE__ */ e("dt", { className: "text-muted", children: "slug" }),
        /* @__PURE__ */ e("dd", { className: "font-mono text-[13px]", children: i }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStatus }),
        /* @__PURE__ */ e("dd", { children: b ? /* @__PURE__ */ e(I, { variant: Z(b.status), children: b.status }) : "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runCurrentStep }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.currentStep) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runIteration }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.currentIteration) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.runPhase }),
        /* @__PURE__ */ e("dd", { children: (b == null ? void 0 : b.phase) ?? "—" }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colStarted }),
        /* @__PURE__ */ e("dd", { children: W(b == null ? void 0 : b.startTime) }),
        /* @__PURE__ */ e("dt", { className: "text-muted", children: t.colCompleted }),
        /* @__PURE__ */ e("dd", { children: W(b == null ? void 0 : b.endTime) })
      ] })
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.runSteps }),
      (h = l == null ? void 0 : l.steps) != null && h.length ? /* @__PURE__ */ e("ol", { className: "flex flex-col gap-1 text-sm", children: l.steps.map((a, y) => /* @__PURE__ */ r("li", { className: "flex gap-2 items-baseline flex-wrap", children: [
        /* @__PURE__ */ e(I, { variant: a.type === "workflow_abort" ? "err" : a.type === "workflow_complete" ? "ok" : "muted", children: a.type }),
        /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: a.step ?? "—" }),
        a.status ? /* @__PURE__ */ e("span", { children: a.status }) : null,
        a.iteration != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "iter ",
          a.iteration
        ] }) : null,
        a.matchedRule != null ? /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "rule ",
          String(a.matchedRule)
        ] }) : null,
        a.reason ? /* @__PURE__ */ e("span", { className: "text-danger", children: a.reason }) : null,
        /* @__PURE__ */ e("span", { className: "text-muted", children: W(a.at) })
      ] }, y)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noSteps })
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.runLog }),
      /* @__PURE__ */ r("div", { className: "font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2", children: [
        d.error ? /* @__PURE__ */ e(A, { message: E(d.error) }) : null,
        T.length ? T.map((a, y) => /* @__PURE__ */ e(je, { rec: a }, y)) : /* @__PURE__ */ e("span", { className: "text-muted", children: t.loading })
      ] }),
      d.data ? /* @__PURE__ */ r("p", { className: "text-[12px] text-muted mt-1", children: [
        d.data.file,
        " — ",
        le(d.data.size),
        " B"
      ] }) : null
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.runReports }),
      (q = l == null ? void 0 : l.reports) != null && q.length ? /* @__PURE__ */ e("ul", { className: "flex flex-col gap-1 text-sm", children: l.reports.map((a) => /* @__PURE__ */ r("li", { children: [
        /* @__PURE__ */ e(J, { onClick: () => c(a.name), className: "text-accent underline", children: a.name }),
        /* @__PURE__ */ r("span", { className: "text-muted", children: [
          "（",
          le(a.size),
          " B）"
        ] })
      ] }, a.name)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.noReports })
    ] }),
    /* @__PURE__ */ r(
      Y,
      {
        open: u !== null,
        onClose: () => c(null),
        title: u,
        maxWidth: 880,
        children: [
          j.error ? /* @__PURE__ */ e(A, { message: E(j.error) }) : null,
          j.data ? /* @__PURE__ */ r(F, { children: [
            /* @__PURE__ */ e(ue, { content: j.data.text }),
            j.data.truncated ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-2", children: t.truncatedReport }) : null
          ] }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.loading })
        ]
      }
    )
  ] });
}
function je({ rec: n }) {
  const i = be(() => {
    if (typeof n.raw == "string") return n.raw;
    const m = n.type ?? n.event ?? "", x = n.step ? ` ${String(n.step)}` : "", u = typeof n.content == "string" ? n.content : typeof n.reason == "string" ? n.reason : typeof n.error == "string" ? n.error : JSON.stringify(n);
    return `${String(m)}${x} ${u}`.trim();
  }, [n]);
  return /* @__PURE__ */ e("div", { children: i });
}
const Re = ["pending", "running", "completed", "failed", "exceeded", "pr_failed"], $e = /* @__PURE__ */ new Set(["failed", "exceeded", "pr_failed"]);
function Ae({
  project: n,
  hasTakt: i,
  active: m,
  runSlug: x,
  onSelectRun: u
}) {
  const c = B(), N = O({
    queryKey: ["takt-tasks", n],
    queryFn: () => c.get(`${C}/takt/tasks?project=${M(n)}`),
    refetchInterval: m ? 5e3 : !1
  }), l = N.data, f = (l == null ? void 0 : l.tasks) ?? [];
  return !i && l && !l.hasTakt ? /* @__PURE__ */ e(U, { icon: "🗂", title: t.taktEmptyNoDir, subtitle: t.taktEmptyNoDirHint }) : /* @__PURE__ */ r("div", { className: "flex flex-col gap-4", children: [
    N.error ? /* @__PURE__ */ e(A, { message: E(N.error) }) : null,
    l != null && l.error ? /* @__PURE__ */ e(A, { message: l.error + (l.retryable ? `（${t.retrying}）` : "") }) : null,
    /* @__PURE__ */ e("div", { className: "grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", children: Re.map((s) => {
      var R;
      return /* @__PURE__ */ e(
        me,
        {
          label: s,
          value: ((R = l == null ? void 0 : l.counts) == null ? void 0 : R[s]) ?? 0,
          accent: s === "running"
        },
        s
      );
    }) }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.tabTakt }),
      f.length ? /* @__PURE__ */ r("table", { className: "w-full border-collapse table-striped", children: [
        /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ e("tr", { children: [t.colStatus, t.colName, t.colWorkflow, t.colBranch, t.colStarted, t.colCompleted, t.colGoals].map((s) => /* @__PURE__ */ e("th", { className: "text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium", children: s }, s)) }) }),
        /* @__PURE__ */ e("tbody", { children: f.map((s, R) => /* @__PURE__ */ r(
          "tr",
          {
            onClick: () => s.runSlug && u(s.runSlug),
            className: `cursor-pointer ${s.runSlug && s.runSlug === x ? "bg-accent/10" : "hover:bg-raised"}`,
            children: [
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2", children: /* @__PURE__ */ e(I, { variant: Z(s.status), children: s.status }) }),
              /* @__PURE__ */ r("td", { className: "px-2.5 py-2 text-sm", children: [
                s.runSlug ? /* @__PURE__ */ e(J, { onClick: () => u(s.runSlug), children: s.name }) : s.name,
                s.failure && $e.has(s.status ?? "") ? /* @__PURE__ */ r("div", { className: "text-[12px] text-danger", children: [
                  t.failureAt(s.failure.step),
                  s.failure.error ? `: ${s.failure.error.slice(0, 200)}` : ""
                ] }) : null
              ] }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: s.workflow ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm font-mono text-[13px]", children: s.branch ?? "—" }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: W(s.startedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm text-muted", children: W(s.completedAt) }),
              /* @__PURE__ */ e("td", { className: "px-2.5 py-2 text-sm", children: s.goalIds.map(ke).join(", ") || "—" })
            ]
          },
          s.name ?? R
        )) })
      ] }) : /* @__PURE__ */ e(U, { icon: "📋", title: t.taktEmptyNoTasks, subtitle: t.taktEmptyNoTasksHint })
    ] }),
    x ? /* @__PURE__ */ e(Te, { project: n, slug: x, active: m }) : f.length ? /* @__PURE__ */ e(S, { children: /* @__PURE__ */ e(U, { icon: "▶", title: t.runSelectHint }) }) : null,
    /* @__PURE__ */ e(qe, { project: n, active: m })
  ] });
}
function qe({ project: n, active: i }) {
  var l;
  const m = B(), [x, u] = k(!1), N = ((l = O({
    queryKey: ["takt-goal-files", n],
    queryFn: () => m.get(`${C}/takt/goal-files?project=${M(n)}`),
    refetchInterval: i ? 5e3 : !1,
    enabled: x
  }).data) == null ? void 0 : l.goals) ?? [];
  return /* @__PURE__ */ r(S, { children: [
    /* @__PURE__ */ r(J, { onClick: () => u((f) => !f), className: "flex items-center justify-between", children: [
      /* @__PURE__ */ e(P, { children: t.taktGoalFiles }),
      /* @__PURE__ */ e("span", { className: "text-muted text-sm", children: x ? "▾" : "▸" })
    ] }),
    x ? N.length ? /* @__PURE__ */ e("ul", { className: "mt-2 flex flex-col gap-2", children: N.map((f) => /* @__PURE__ */ r("li", { className: "border border-border rounded p-2.5 text-sm", children: [
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center flex-wrap", children: [
        /* @__PURE__ */ e(I, { variant: "muted", children: f.status ?? "—" }),
        f.executionStatus ? /* @__PURE__ */ e(I, { variant: "muted", children: f.executionStatus }) : null,
        f.branch ? /* @__PURE__ */ e("span", { className: "font-mono text-[13px]", children: f.branch }) : null
      ] }),
      /* @__PURE__ */ e("div", { className: "mt-1 whitespace-pre-wrap", children: f.objective ?? f.error ?? "—" }),
      /* @__PURE__ */ e("div", { className: "text-[12px] text-muted mt-1 font-mono", children: f.path })
    ] }, f.path)) }) : /* @__PURE__ */ e("p", { className: "text-sm text-muted mt-2", children: t.noReports }) : null
  ] });
}
function Pe({ active: n, project: i }) {
  var q;
  const m = B(), x = re(), [u, c] = k(""), [N, l] = k(null), f = O({
    queryKey: ["settings"],
    queryFn: () => m.get(`${C}/settings`),
    refetchInterval: n ? 5e3 : !1
  }), s = (q = f.data) == null ? void 0 : q.taktMcp, p = O({
    queryKey: ["takt-config", i],
    queryFn: () => m.get(
      `${C}/takt/config?project=${encodeURIComponent(i)}`
    ),
    refetchInterval: n ? 5e3 : !1
  }).data, [d, T] = k(null), [j, b] = k(""), K = z({
    mutationFn: (a) => m.post(`${C}/takt/config`, {
      changes: a,
      revision: (p == null ? void 0 : p.revision) ?? null
    }),
    onSuccess: () => {
      x.invalidateQueries({ queryKey: ["takt-config"] }), T(null), l(null);
    },
    onError: (a) => l(E(a))
  });
  ne(() => {
    s && c(s.pinned ?? "");
  }, [s == null ? void 0 : s.pinned]);
  const h = z({
    mutationFn: (a) => m.post(`${C}/settings/takt-mcp`, { path: a }),
    onSuccess: (a) => {
      x.setQueryData(["settings"], a), l(null);
    },
    onError: (a) => l(E(a))
  });
  return /* @__PURE__ */ r("div", { className: "flex flex-col gap-4 max-w-[760px]", children: [
    N ? /* @__PURE__ */ e(A, { message: N, onDismiss: () => l(null) }) : null,
    f.error ? /* @__PURE__ */ e(A, { message: E(f.error) }) : null,
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.settingsTaktMcp }),
      /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.settingsTaktMcpHint }),
      s ? s.path ? /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(I, { variant: "ok", children: t.settingsResolved(s.source ?? "") }),
        " ",
        /* @__PURE__ */ e("code", { className: "text-[13px]", children: s.path })
      ] }) : /* @__PURE__ */ r("p", { className: "text-sm mb-2", children: [
        /* @__PURE__ */ e(I, { variant: "err", children: t.settingsNotFound }),
        " ",
        s.error ? /* @__PURE__ */ e("span", { className: "text-muted", children: s.error }) : null
      ] }) : null,
      /* @__PURE__ */ r("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ e(
          X,
          {
            value: u,
            onChange: (a) => c(a.target.value),
            placeholder: t.settingsPathPlaceholder,
            className: "flex-1 font-mono text-[13px]"
          }
        ),
        /* @__PURE__ */ e(
          v,
          {
            primary: !0,
            disabled: h.isPending,
            onClick: () => h.mutate(u.trim() || null),
            children: t.settingsSave
          }
        ),
        /* @__PURE__ */ e(
          v,
          {
            disabled: h.isPending || !(s != null && s.pinned),
            onClick: () => h.mutate(null),
            children: t.settingsClear
          }
        )
      ] }),
      s != null && s.pinned ? /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsPinnedAt(s.pinned) }) : /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-1", children: t.settingsAuto })
    ] }),
    /* @__PURE__ */ r(S, { children: [
      /* @__PURE__ */ e(P, { children: t.configTitle }),
      p != null && p.global.error ? /* @__PURE__ */ e(A, { message: p.global.error }) : p != null && p.global.exists ? null : /* @__PURE__ */ e("p", { className: "text-sm text-muted", children: t.configNotFound }),
      /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configGlobal }),
      p ? /* @__PURE__ */ e("table", { className: "w-full text-[13px] mb-3", children: /* @__PURE__ */ e("tbody", { children: Object.entries(p.global.config).map(([a, y]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
        /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: a }),
        /* @__PURE__ */ e("td", { className: "py-1", children: d === a ? /* @__PURE__ */ r("div", { className: "flex gap-1 items-center", children: [
          /* @__PURE__ */ e(
            X,
            {
              value: j,
              onChange: ($) => b($.target.value),
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: K.isPending,
              onClick: () => K.mutate({ [a]: j }),
              children: t.configSave
            }
          )
        ] }) : typeof y == "object" ? /* @__PURE__ */ e("code", { className: "text-muted", children: JSON.stringify(y) }) : /* @__PURE__ */ e("code", { children: String(y) }) }),
        /* @__PURE__ */ e("td", { className: "py-1 w-[60px] text-right", children: p.writableKeys.includes(a) && d !== a ? /* @__PURE__ */ e(
          v,
          {
            onClick: () => {
              T(a), b(String(y));
            },
            children: t.configEdit
          }
        ) : null })
      ] }, a)) }) }) : null,
      p != null && p.project.exists ? /* @__PURE__ */ r(F, { children: [
        /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mb-1", children: t.configProject }),
        /* @__PURE__ */ e("table", { className: "w-full text-[13px]", children: /* @__PURE__ */ e("tbody", { children: Object.entries(p.project.config).map(([a, y]) => /* @__PURE__ */ r("tr", { className: "border-b border-subtle", children: [
          /* @__PURE__ */ e("td", { className: "py-1 font-mono w-[200px]", children: a }),
          /* @__PURE__ */ e("td", { className: "py-1", children: /* @__PURE__ */ e("code", { className: "text-muted", children: typeof y == "object" ? JSON.stringify(y) : String(y) }) })
        ] }, a)) }) })
      ] }) : null
    ] })
  ] });
}
function Ee({
  path: n,
  onNavigate: i,
  onPick: m
}) {
  const x = B(), u = O({
    queryKey: ["directories", n],
    queryFn: () => x.post(`${C}/directories`, { path: n })
  }), c = u.data;
  return /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ r("div", { className: "flex items-center gap-2 mb-1", children: [
      /* @__PURE__ */ e(
        v,
        {
          disabled: !(c != null && c.parent),
          onClick: () => (c == null ? void 0 : c.parent) && i(c.parent),
          children: t.browseUp
        }
      ),
      /* @__PURE__ */ e("code", { className: "text-[12px] text-muted truncate flex-1", children: (c == null ? void 0 : c.path) ?? n }),
      /* @__PURE__ */ e(v, { primary: !0, onClick: () => c && m(c.path), children: t.browsePick })
    ] }),
    /* @__PURE__ */ e("div", { className: "border border-subtle rounded max-h-[220px] overflow-y-auto", children: u.isLoading ? /* @__PURE__ */ e("p", { className: "text-sm text-muted p-2", children: "…" }) : u.error ? /* @__PURE__ */ e("p", { className: "text-sm p-2", children: E(u.error) }) : ((c == null ? void 0 : c.directories) ?? []).map((N) => /* @__PURE__ */ r(
      J,
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
  var V;
  const n = B(), m = de().active !== !1, x = re(), [u, c] = k(""), [N, l] = k("goals"), [f, s] = k(null), [R, p] = k(!1), [d, T] = k(!1), [j, b] = k(""), [K, h] = k("~"), [q, a] = k(null), y = O({
    queryKey: ["projects"],
    queryFn: () => n.get(`${C}/projects`),
    refetchInterval: m ? 5e3 : !1
  }), $ = ((V = y.data) == null ? void 0 : V.projects) ?? [];
  ne(() => {
    if (!$.length) {
      c("");
      return;
    }
    if (!$.some((H) => H.path === u && !H.missing)) {
      const H = $.find((te) => !te.missing) ?? $[0];
      c(H.path);
    }
  }, [$, u]);
  const _ = () => x.invalidateQueries({ queryKey: ["projects"] }), G = z({
    mutationFn: (g) => n.post(`${C}/projects/add`, { path: g }),
    onSuccess: (g) => {
      x.setQueryData(["projects"], g), _(), p(!1), b(""), a(null), g.projects.length && c(g.projects[g.projects.length - 1].path);
    },
    onError: (g) => a(E(g))
  }), D = z({
    mutationFn: (g) => n.post(`${C}/projects/remove`, { path: g }),
    onSuccess: (g) => {
      x.setQueryData(["projects"], g), _(), T(!1), a(null);
    },
    onError: (g) => a(E(g))
  }), Q = $.find((g) => g.path === u), ee = (g) => {
    s(g), l("takt");
  };
  return /* @__PURE__ */ r(F, { children: [
    /* @__PURE__ */ e(
      pe,
      {
        title: t.appTitle,
        subtitle: t.appSubtitle,
        actions: /* @__PURE__ */ r(F, { children: [
          /* @__PURE__ */ e(
            he,
            {
              "aria-label": t.projectLabel,
              options: $.map((g) => g.path),
              optionLabels: $.map((g) => g.missing ? `${g.name}（${t.projectMissing}）` : g.name),
              value: u,
              onChange: c,
              className: "min-w-[220px]"
            }
          ),
          /* @__PURE__ */ e(v, { onClick: () => {
            a(null), p(!0);
          }, children: t.projectAdd }),
          /* @__PURE__ */ e(
            v,
            {
              danger: !0,
              disabled: !Q,
              onClick: () => {
                a(null), T(!0);
              },
              children: t.projectRemove
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ e("div", { className: "px-6 pb-8 overflow-y-auto flex-1 min-h-0", children: $.length ? /* @__PURE__ */ r(F, { children: [
      y.error ? /* @__PURE__ */ e(A, { message: E(y.error) }) : null,
      /* @__PURE__ */ e("div", { className: "mb-4", children: /* @__PURE__ */ e(
        ge,
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
      N === "settings" ? /* @__PURE__ */ e(Pe, { active: m, project: u }) : u ? N === "goals" ? /* @__PURE__ */ e(Se, { project: u, active: m, onOpenRun: ee }) : /* @__PURE__ */ e(
        Ae,
        {
          project: u,
          hasTakt: (Q == null ? void 0 : Q.hasTakt) ?? !1,
          active: m,
          runSlug: f,
          onSelectRun: s
        }
      ) : null
    ] }) : /* @__PURE__ */ e(
      U,
      {
        icon: "📁",
        title: t.projectEmpty,
        subtitle: t.projectEmptyHint,
        action: /* @__PURE__ */ e(v, { primary: !0, onClick: () => {
          a(null), p(!0);
        }, children: t.projectAdd })
      }
    ) }),
    /* @__PURE__ */ r(
      Y,
      {
        open: R,
        onClose: () => p(!1),
        title: t.projectAddTitle,
        footer: /* @__PURE__ */ r(F, { children: [
          /* @__PURE__ */ e(v, { onClick: () => p(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              primary: !0,
              disabled: !j.trim() || G.isPending,
              onClick: () => G.mutate(j.trim()),
              children: t.projectAdd
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm text-muted mb-2", children: t.projectAddHint }),
          /* @__PURE__ */ e(
            Ee,
            {
              path: K,
              onNavigate: h,
              onPick: (g) => {
                G.mutate(g), p(!1);
              }
            }
          ),
          /* @__PURE__ */ e("p", { className: "text-[12px] text-muted mt-3 mb-1", children: t.browseOrType }),
          /* @__PURE__ */ e(
            X,
            {
              value: j,
              onChange: (g) => b(g.target.value),
              placeholder: "/abs/path/to/repo",
              className: "w-full"
            }
          ),
          q ? /* @__PURE__ */ e(A, { message: q }) : null
        ]
      }
    ),
    /* @__PURE__ */ r(
      Y,
      {
        open: d,
        onClose: () => T(!1),
        title: t.projectRemoveTitle,
        footer: /* @__PURE__ */ r(F, { children: [
          /* @__PURE__ */ e(v, { onClick: () => T(!1), children: t.cancel }),
          /* @__PURE__ */ e(
            v,
            {
              danger: !0,
              disabled: D.isPending,
              onClick: () => Q && D.mutate(Q.path),
              children: t.projectRemove
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ e("p", { className: "text-sm", children: Q ? t.projectRemoveConfirm(Q.name) : "" }),
          q ? /* @__PURE__ */ e(A, { message: q }) : null
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
