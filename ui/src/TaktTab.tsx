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
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { S } from './strings'
import type { TaktGoalFilesResult, TaktTasksResult } from './types'
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
                  className={`cursor-pointer ${t.runSlug && t.runSlug === runSlug ? 'bg-accent/10' : 'hover:bg-raised'}`}
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
