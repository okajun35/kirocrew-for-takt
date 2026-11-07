import { useAppApi } from '@kirocrew/app-sdk'
import {
  Badge,
  Btn,
  Card,
  CardTitle,
  Clickable,
  EmptyState,
  ErrorNotice,
  Input,
  Modal,
} from '@kirocrew/app-sdk/ui'
import { fmtRelative } from '@kirocrew/app-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { S } from './strings'
import type { Goal, GoalSummary, TaktTasksResult, TaktTaskSummary } from './types'
import { API, badgeVariant, enc, errMessage, errStatus, goalStatusLabel, shortSha } from './util'

const isConflict = (e: unknown) => errStatus(e) === 409

export default function GoalsTab({
  project,
  active,
  onOpenRun,
}: {
  project: string
  active: boolean
  onOpenRun: (slug: string) => void
}) {
  const api = useAppApi()
  const [goalId, setGoalId] = useState<string | null>(null)

  const goalsQ = useQuery({
    queryKey: ['goals', project],
    queryFn: () =>
      api.get<{ goals: GoalSummary[] }>(`${API}/goals?project=${enc(project)}`),
    refetchInterval: active ? 5000 : false,
  })
  const tasksQ = useQuery({
    queryKey: ['takt-tasks', project],
    queryFn: () =>
      api.get<TaktTasksResult>(`${API}/takt/tasks?project=${enc(project)}`),
    refetchInterval: active ? 5000 : false,
  })
  const goals = goalsQ.data?.goals ?? []
  const taktByName = new Map<string, TaktTaskSummary>()
  for (const t of tasksQ.data?.tasks ?? []) {
    if (t.name) taktByName.set(t.name, t)
  }

  return (
    <div className="grid gap-4 grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <Card>
        <CardTitle>{S.tabGoals}</CardTitle>
        {goalsQ.error ? <ErrorNotice message={errMessage(goalsQ.error)} /> : null}
        {!goals.length ? (
          <EmptyState icon="🎯" title={S.goalListEmpty} subtitle={S.goalListEmptyHint} />
        ) : (
          <table className="w-full border-collapse table-striped">
            <thead>
              <tr>
                {[S.objective, S.colStatus, S.goalBranch, S.tasks, S.questions, S.colCompleted].map((h) => (
                  <th key={h} className="text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goals.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  className={`cursor-pointer ${g.id === goalId ? 'bg-accent/10' : 'hover:bg-raised'}`}
                >
                  <td className="px-2.5 py-2 text-sm">
                    <Clickable onClick={() => setGoalId(g.id)}>{(g.objective || '').split('\n')[0]}</Clickable>
                  </td>
                  <td className="px-2.5 py-2"><Badge variant={badgeVariant(g.status)}>{goalStatusLabel(g.status)}</Badge></td>
                  <td className="px-2.5 py-2 text-sm text-muted">{g.branch ?? S.goalNone}</td>
                  <td className="px-2.5 py-2 text-sm">{g.taskCount}</td>
                  <td className="px-2.5 py-2 text-sm">{g.pendingQuestions}</td>
                  <td className="px-2.5 py-2 text-sm text-muted">{fmtRelative(g.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="min-h-0">
        {goalId ? (
          <GoalDetail
            id={goalId}
            active={active}
            taktByName={taktByName}
            onOpenRun={onOpenRun}
          />
        ) : (
          <Card>
            <EmptyState icon="🎯" title={S.goalSelectHint} />
          </Card>
        )}
      </div>
    </div>
  )
}

function GoalDetail({
  id,
  active,
  taktByName,
  onOpenRun,
}: {
  id: string
  active: boolean
  taktByName: Map<string, TaktTaskSummary>
  onOpenRun: (slug: string) => void
}) {
  const api = useAppApi()
  const qc = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)
  const [statusModal, setStatusModal] = useState<'paused' | 'active' | null>(null)
  const [reason, setReason] = useState('')
  const [answerFor, setAnswerFor] = useState<string | null>(null)
  const [answerText, setAnswerText] = useState('')

  const goalQ = useQuery({
    queryKey: ['goal', id],
    queryFn: () => api.get<Goal>(`${API}/goal?id=${enc(id)}`),
    refetchInterval: active ? 5000 : false,
  })
  const goal = goalQ.data

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['goal', id] })
    qc.invalidateQueries({ queryKey: ['goals'] })
  }

  const onMutateError = (e: unknown) => {
    if (isConflict(e)) {
      setNotice(S.conflictReloaded)
      refresh()
    } else {
      setNotice(errMessage(e))
    }
  }

  const statusMut = useMutation({
    mutationFn: (input: { status: 'active' | 'paused'; reason: string; revision: number }) =>
      api.post<Goal>(`${API}/goal/status`, {
        id,
        status: input.status,
        reason: input.reason,
        expectedRevision: input.revision,
      }),
    onSuccess: () => {
      setStatusModal(null)
      setReason('')
      setNotice(null)
      refresh()
    },
    onError: onMutateError,
  })

  const answerMut = useMutation({
    mutationFn: (input: { questionId: string; answer: string; revision: number }) =>
      api.post<Goal>(`${API}/goal/answer`, {
        id,
        questionId: input.questionId,
        answer: input.answer,
        expectedRevision: input.revision,
      }),
    onSuccess: () => {
      setAnswerFor(null)
      setAnswerText('')
      setNotice(null)
      refresh()
    },
    onError: onMutateError,
  })

  if (goalQ.isPending && !goal) return <Card><p className="text-sm text-muted">{S.loading}</p></Card>
  if (!goal) {
    return (
      <Card>
        {goalQ.error ? <ErrorNotice message={errMessage(goalQ.error)} /> : null}
      </Card>
    )
  }

  const pendingQs = (goal.questions ?? []).filter((q) => q.status === 'pending')
  const workLog = [...(goal.workLog ?? [])].reverse().slice(0, 50)
  const nextStatus = goal.status === 'active' ? 'paused' : goal.status === 'paused' ? 'active' : null

  const submitAnswer = (qid: string, value?: string) => {
    const answer = (value ?? answerText).trim()
    if (!answer) return
    answerMut.mutate({ questionId: qid, answer, revision: goal.revision })
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? <ErrorNotice message={notice} onDismiss={() => setNotice(null)} /> : null}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle>{S.objective}</CardTitle>
            <p className="text-sm whitespace-pre-wrap">{goal.objective}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={badgeVariant(goal.status)}>{goalStatusLabel(goal.status)}</Badge>
            {nextStatus ? (
              <Btn onClick={() => { setReason(''); setStatusModal(nextStatus) }}>
                {nextStatus === 'paused' ? S.pause : S.resume}
              </Btn>
            ) : null}
          </div>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">{S.goalBranch}</dt>
          <dd className="font-mono text-[13px]">{goal.branch ?? S.goalNone}</dd>
          <dt className="text-muted">revision</dt>
          <dd>{goal.revision}</dd>
        </dl>
      </Card>

      {(goal.outOfScope?.length || goal.acceptanceCriteria?.length || goal.constraints?.length) ? (
        <Card>
          <CardTitle>{S.acceptance} / {S.outOfScope} / {S.constraints}</CardTitle>
          {goal.acceptanceCriteria?.length ? (
            <>
              <h4 className="text-sm font-medium mt-1">{S.acceptance}</h4>
              <ul className="list-disc pl-5 text-sm">
                {goal.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          ) : null}
          {goal.outOfScope?.length ? (
            <>
              <h4 className="text-sm font-medium mt-2">{S.outOfScope}</h4>
              <ul className="list-disc pl-5 text-sm">
                {goal.outOfScope.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          ) : null}
          {goal.constraints?.length ? (
            <>
              <h4 className="text-sm font-medium mt-2">{S.constraints}</h4>
              <ul className="list-disc pl-5 text-sm">
                {goal.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CardTitle>{S.tasks}</CardTitle>
        {!goal.tasks?.length ? (
          <p className="text-sm text-muted">{S.goalListEmptyHint}</p>
        ) : (
          <table className="w-full border-collapse table-striped">
            <thead>
              <tr>
                {[S.taskName, S.taskState, S.taskBranch, S.taskIntegrated, S.taktStatus].map((h) => (
                  <th key={h} className="text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {goal.tasks.map((t) => {
                const tk = t.taskName ? taktByName.get(t.taskName) : undefined
                return (
                  <tr key={t.taskName}>
                    <td className="px-2.5 py-2 text-sm">{t.taskName}</td>
                    <td className="px-2.5 py-2 text-sm">{t.state}</td>
                    <td className="px-2.5 py-2 text-sm font-mono text-[13px]">{t.branch ?? '—'}</td>
                    <td className="px-2.5 py-2 text-sm font-mono text-[13px]">{shortSha(t.integratedSha)}</td>
                    <td className="px-2.5 py-2 text-sm">
                      {tk ? (
                        <Clickable onClick={() => tk.runSlug && onOpenRun(tk.runSlug)}>
                          <Badge variant={badgeVariant(tk.status)}>{tk.status}</Badge>
                        </Clickable>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Card>

      <Card>
        <CardTitle>{S.questions}</CardTitle>
        {!pendingQs.length ? (
          <p className="text-sm text-muted">{S.noQuestions}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingQs.map((q) => (
              <div key={q.id} className="border border-border rounded p-3">
                <p className="text-sm whitespace-pre-wrap">{q.body}</p>
                <div className="mt-2 flex gap-2 items-center flex-wrap">
                  {q.options?.length ? (
                    q.options.map((opt) => (
                      <Btn key={opt} onClick={() => { setAnswerFor(q.id); setAnswerText(opt) }}>
                        {opt}
                      </Btn>
                    ))
                  ) : (
                    <>
                      <Input
                        value={answerFor === q.id ? answerText : ''}
                        onChange={(e) => { setAnswerFor(q.id); setAnswerText(e.target.value) }}
                        placeholder={S.questionAnswerPlaceholder}
                        className="flex-1 min-w-[160px]"
                      />
                      <Btn primary onClick={() => submitAnswer(q.id)}>{S.submit}</Btn>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>{S.workLog}</CardTitle>
        {!workLog.length ? (
          <p className="text-sm text-muted">—</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {workLog.map((w) => (
              <li key={w.id} className="flex gap-2">
                <span className="text-muted shrink-0">{fmtRelative(w.at)}</span>
                <Badge variant="muted">{w.kind}</Badge>
                <span className="min-w-0">{w.summary}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={statusModal !== null}
        onClose={() => setStatusModal(null)}
        title={statusModal === 'paused' ? S.pauseTitle : S.resumeTitle}
        footer={
          <>
            <Btn onClick={() => setStatusModal(null)}>{S.cancel}</Btn>
            <Btn
              primary
              disabled={!reason.trim() || statusMut.isPending}
              onClick={() => statusModal && statusMut.mutate({ status: statusModal, reason: reason.trim(), revision: goal.revision })}
            >
              {S.confirm}
            </Btn>
          </>
        }
      >
        <label className="text-sm font-medium">{S.reasonRequired}</label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={S.reasonPlaceholder}
          className="w-full mt-1"
        />
      </Modal>

      <Modal
        open={answerFor !== null && pendingQs.some((q) => q.id === answerFor && q.options?.length)}
        onClose={() => setAnswerFor(null)}
        title={S.questions}
        footer={
          <>
            <Btn onClick={() => setAnswerFor(null)}>{S.cancel}</Btn>
            <Btn primary onClick={() => answerFor && submitAnswer(answerFor)}>
              {S.submit}
            </Btn>
          </>
        }
      >
        <p className="text-sm whitespace-pre-wrap">
          {answerFor ? S.answerConfirm(answerText) : ''}
        </p>
      </Modal>
    </div>
  )
}
