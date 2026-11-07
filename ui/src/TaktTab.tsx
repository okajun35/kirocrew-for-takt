import { useAppApi } from '@kirocrew/app-sdk'
import {
  Badge,
  Card,
  CardTitle,
  Clickable,
  EmptyState,
  ErrorNotice,
  StatCard,
} from '@kirocrew/app-sdk/ui'
import { fmtDateTime } from '@kirocrew/app-sdk'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Btn, Input, Modal } from '@kirocrew/app-sdk/ui'
import { S } from './strings'
import type { RunnerStatus, TaktGoalFilesResult, TaktTasksResult } from './types'
import { API, badgeVariant, enc, errMessage, shortId } from './util'
import RunDetail from './RunDetail'

const COUNT_ORDER = ['pending', 'running', 'completed', 'failed', 'exceeded', 'pr_failed']
const FAILED = new Set(['failed', 'exceeded', 'pr_failed'])

export default function TaktTab({
  project,
  hasTakt,
  active,
  runSlug,
  onSelectRun,
}: {
  project: string
  hasTakt: boolean
  active: boolean
  runSlug: string | null
  onSelectRun: (slug: string | null) => void
}) {
  const api = useAppApi()

  const tasksQ = useQuery({
    queryKey: ['takt-tasks', project],
    queryFn: () =>
      api.get<TaktTasksResult>(`${API}/takt/tasks?project=${enc(project)}`),
    refetchInterval: active ? 5000 : false,
  })
  const data = tasksQ.data
  const tasks = data?.tasks ?? []

  if (!hasTakt && data && !data.hasTakt) {
    return <EmptyState icon="🗂" title={S.taktEmptyNoDir} subtitle={S.taktEmptyNoDirHint} />
  }

  return (
    <div className="flex flex-col gap-4">
      {tasksQ.error ? <ErrorNotice message={errMessage(tasksQ.error)} /> : null}
      {data?.error ? (
        <ErrorNotice message={data.error + (data.retryable ? `（${S.retrying}）` : '')} />
      ) : null}

      <div className="grid gap-3.5 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
        {COUNT_ORDER.map((status) => (
          <StatCard
            key={status}
            label={status}
            value={data?.counts?.[status] ?? 0}
            accent={status === 'running'}
          />
        ))}
      </div>

      <EnqueueButton project={project} active={active} />

      <Card>
        <CardTitle>{S.tabTakt}</CardTitle>
        {!tasks.length ? (
          <EmptyState icon="📋" title={S.taktEmptyNoTasks} subtitle={S.taktEmptyNoTasksHint} />
        ) : (
          <table className="w-full border-collapse table-striped">
            <thead>
              <tr>
                {[S.colStatus, S.colName, S.colWorkflow, S.colBranch, S.colStarted, S.colCompleted, S.colGoals].map((h) => (
                  <th key={h} className="text-left text-muted text-[12px] uppercase tracking-[.04em] px-2.5 py-2 border-b border-border font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr
                  key={t.name ?? i}
                  onClick={() => t.runSlug && onSelectRun(t.runSlug)}
                  title={t.runSlug ? undefined : S.runNotStarted}
                  className={
                    t.runSlug
                      ? `cursor-pointer ${t.runSlug === runSlug ? 'bg-accent/10' : 'hover:bg-raised'}`
                      : 'opacity-60 cursor-default'
                  }
                >
                  <td className="px-2.5 py-2"><Badge variant={badgeVariant(t.status)}>{t.status}</Badge></td>
                  <td className="px-2.5 py-2 text-sm">
                    {t.runSlug ? (
                      <Clickable onClick={() => onSelectRun(t.runSlug)}>{t.name}</Clickable>
                    ) : (
                      t.name
                    )}
                    {t.failure && FAILED.has(t.status ?? '') ? (
                      <div className="text-[12px] text-danger">
                        {S.failureAt(t.failure.step)}
                        {t.failure.error ? `: ${t.failure.error.slice(0, 200)}` : ''}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-2.5 py-2 text-sm">{t.workflow ?? '—'}</td>
                  <td className="px-2.5 py-2 text-sm font-mono text-[13px]">{t.branch ?? '—'}</td>
                  <td className="px-2.5 py-2 text-sm text-muted">{fmtDateTime(t.startedAt)}</td>
                  <td className="px-2.5 py-2 text-sm text-muted">{fmtDateTime(t.completedAt)}</td>
                  <td className="px-2.5 py-2 text-sm">{t.goalIds.map(shortId).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <RunnerCard project={project} active={active} tasks={tasks} />

      {runSlug ? (
        <RunDetail project={project} slug={runSlug} active={active} />
      ) : tasks.length ? (
        <Card>
          <EmptyState icon="▶" title={S.runSelectHint} />
        </Card>
      ) : null}

      <TaktGoalFiles project={project} active={active} />
    </div>
  )
}

function EnqueueButton({ project, active }: { project: string; active: boolean }) {
  const api = useAppApi()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [task, setTask] = useState('')
  const [workflow, setWorkflow] = useState('default')
  const [err, setErr] = useState<string | null>(null)
  const mut = useMutation({
    mutationFn: () =>
      api.post<{ result: unknown; taskName: string | null }>(`${API}/takt/enqueue`, {
        project, task, workflow, autoPr: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['takt-tasks', project] })
      setOpen(false); setTask(''); setErr(null)
    },
    onError: (e) => setErr(errMessage(e)),
  })
  return (
    <div className="flex justify-end">
      <Btn primary onClick={() => setOpen(true)}>{S.enqueueTitle}</Btn>
      <Modal
        open={open} onClose={() => setOpen(false)} title={S.enqueueTitle}
        footer={
          <>
            <Btn onClick={() => setOpen(false)}>{S.cancel}</Btn>
            <Btn primary disabled={!task.trim() || mut.isPending} onClick={() => mut.mutate()}>
              {S.enqueueSubmit}
            </Btn>
          </>
        }
      >
        <p className="text-sm text-muted mb-1">{S.enqueueTask}</p>
        <Input value={task} onChange={(e) => setTask(e.target.value)} className="w-full mb-2" />
        <p className="text-sm text-muted mb-1">{S.colWorkflow}</p>
        <Input value={workflow} onChange={(e) => setWorkflow(e.target.value)} className="w-full" />
        {err ? <ErrorNotice message={err} /> : null}
      </Modal>
    </div>
  )
}


function RunnerCard({ project, active, tasks }: { project: string; active: boolean; tasks: TaktTasksResult['tasks'] }) {
  const api = useAppApi()
  const qc = useQueryClient()
  const [err, setErr] = useState<string | null>(null)
  const [confirmMode, setConfirmMode] = useState<'once' | 'watch' | null>(null)
  const pendingNames = tasks
    .filter((t) => t.status === 'pending' && t.name)
    .map((t) => t.name as string)
  const q = useQuery({
    queryKey: ['runner', project],
    queryFn: () => api.get<RunnerStatus>(`${API}/takt/runner?project=${enc(project)}`),
    refetchInterval: active ? 5000 : false,
  })
  const r = q.data?.runner
  const start = useMutation({
    mutationFn: (mode: 'once' | 'watch') =>
      api.post(`${API}/takt/runner/start`, {
        project,
        mode,
        allowAll: true,
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runner', project] }); setErr(null) },
    onError: (e) => setErr(errMessage(e)),
  })
  const stop = useMutation({
    mutationFn: () => api.post(`${API}/takt/runner/stop`, { project }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['runner', project] }); setErr(null) },
    onError: (e) => setErr(errMessage(e)),
  })
  return (
    <Card>
      <div className="flex items-center gap-2 flex-wrap">
        <CardTitle>{S.runnerTitle}</CardTitle>
        {q.data?.running ? (
          <Badge variant="ok">{S.runnerRunning(r?.pid ?? 0, r?.mode ?? '')}</Badge>
        ) : (
          <Badge variant="muted">{S.runnerStopped}</Badge>
        )}
        <span className="ml-auto flex gap-2">
          <Btn
            disabled={q.data?.running || start.isPending}
            onClick={() =>
              pendingNames.length ? setConfirmMode('once') : start.mutate('once')
            }
          >
            {S.runnerStartOnce}
          </Btn>
          <Btn
            disabled={q.data?.running || start.isPending}
            onClick={() =>
              pendingNames.length ? setConfirmMode('watch') : start.mutate('watch')
            }
          >
            {S.runnerStartWatch}
          </Btn>
          <Btn danger disabled={!q.data?.running || stop.isPending} onClick={() => stop.mutate()}>
            {S.runnerStop}
          </Btn>
        </span>
      </div>
      {err ? <ErrorNotice message={err} /> : null}
      {r?.logTail?.length ? (
        <pre className="mt-2 text-[12px] text-muted whitespace-pre-wrap max-h-[160px] overflow-y-auto font-mono">
          {r.logTail.join('\n')}
        </pre>
      ) : null}
      <Modal
        open={confirmMode !== null}
        onClose={() => setConfirmMode(null)}
        title={S.runnerConfirmTitle}
        footer={
          <>
            <Btn onClick={() => setConfirmMode(null)}>{S.cancel}</Btn>
            <Btn
              primary
              disabled={start.isPending}
              onClick={() => {
                if (confirmMode) start.mutate(confirmMode)
                setConfirmMode(null)
              }}
            >
              {S.runnerConfirmRun}
            </Btn>
          </>
        }
      >
        <p className="text-sm">{S.runnerConfirmBody(pendingNames.length)}</p>
        <ul className="text-[13px] font-mono mt-2 max-h-[140px] overflow-y-auto">
          {pendingNames.map((n) => (
            <li key={n}>・{n}</li>
          ))}
        </ul>
      </Modal>
    </Card>
  )
}


function TaktGoalFiles({ project, active }: { project: string; active: boolean }) {
  const api = useAppApi()
  const [open, setOpen] = useState(false)
  const q = useQuery({
    queryKey: ['takt-goal-files', project],
    queryFn: () =>
      api.get<TaktGoalFilesResult>(`${API}/takt/goal-files?project=${enc(project)}`),
    refetchInterval: active ? 5000 : false,
    enabled: open,
  })
  const goals = q.data?.goals ?? []

  return (
    <Card>
      <Clickable onClick={() => setOpen((v) => !v)} className="flex items-center justify-between">
        <CardTitle>{S.taktGoalFiles}</CardTitle>
        <span className="text-muted text-sm">{open ? '▾' : '▸'}</span>
      </Clickable>
      {open ? (
        goals.length ? (
          <ul className="mt-2 flex flex-col gap-2">
            {goals.map((g) => (
              <li key={g.path} className="border border-border rounded p-2.5 text-sm">
                <div className="flex gap-2 items-center flex-wrap">
                  <Badge variant="muted">{g.status ?? '—'}</Badge>
                  {g.executionStatus ? <Badge variant="muted">{g.executionStatus}</Badge> : null}
                  {g.branch ? <span className="font-mono text-[13px]">{g.branch}</span> : null}
                </div>
                <div className="mt-1 whitespace-pre-wrap">{g.objective ?? g.error ?? '—'}</div>
                <div className="text-[12px] text-muted mt-1 font-mono">{g.path}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted mt-2">{S.noReports}</p>
        )
      ) : null}
    </Card>
  )
}
