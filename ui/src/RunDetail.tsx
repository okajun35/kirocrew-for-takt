import { useAppApi } from '@kirocrew/app-sdk'
import {
  Badge,
  Card,
  CardTitle,
  Clickable,
  ErrorNotice,
  MarkdownRenderer,
  Modal,
} from '@kirocrew/app-sdk/ui'
import { fmtDateTime, fmtNumber } from '@kirocrew/app-sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState } from 'react'
import { S } from './strings'
import type { ReportResult, RunDetail as RunDetailT, RunLogRecord, RunLogResult } from './types'
import { API, badgeVariant, enc, errMessage } from './util'

const LOG_KEEP = 2000

export default function RunDetail({
  project,
  slug,
  active,
}: {
  project: string
  slug: string
  active: boolean
}) {
  const api = useAppApi()
  const [reportName, setReportName] = useState<string | null>(null)

  const detailQ = useQuery({
    queryKey: ['takt-run', project, slug],
    queryFn: () =>
      api.get<RunDetailT>(
        `${API}/takt/run?project=${enc(project)}&slug=${enc(slug)}`,
      ),
    refetchInterval: active ? 3000 : false,
  })
  const detail = detailQ.data
  const running = detail?.meta?.status === 'running'

  // Live log: page through the newest session log, appending records.
  const logState = useRef({ offset: 0, file: '', records: [] as RunLogRecord[] })
  const [logTick, setLogTick] = useState(0)
  useEffect(() => {
    logState.current = { offset: 0, file: '', records: [] }
    setLogTick((t) => t + 1)
  }, [project, slug])

  const logQ = useQuery({
    queryKey: ['takt-run-log', project, slug],
    queryFn: () =>
      api.get<RunLogResult>(
        `${API}/takt/run/log?project=${enc(project)}&slug=${enc(slug)}&offset=${logState.current.offset}`,
      ),
    refetchInterval: active && running ? 2000 : false,
    retry: 0,
  })
  useEffect(() => {
    const d = logQ.data
    if (!d) return
    const st = logState.current
    if (d.reset || (st.file && st.file !== d.file)) {
      st.records = []
    }
    st.file = d.file
    if (d.records.length) {
      st.records = st.records.concat(d.records).slice(-LOG_KEEP)
      setLogTick((t) => t + 1)
    }
    st.offset = d.nextOffset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logQ.data])
  void logTick
  const logRecords = logState.current.records

  const reportQ = useQuery({
    queryKey: ['takt-report', project, slug, reportName],
    queryFn: () =>
      api.get<ReportResult>(
        `${API}/takt/run/report?project=${enc(project)}&slug=${enc(slug)}&name=${enc(reportName ?? '')}`,
      ),
    enabled: reportName !== null,
  })

  const meta = detail?.meta

  return (
    <div className="flex flex-col gap-4">
      {detailQ.error ? <ErrorNotice message={errMessage(detailQ.error)} /> : null}
      {detail?.error ? (
        <ErrorNotice message={detail.error + (detail.retryable ? `（${S.retrying}）` : '')} />
      ) : null}

      <Card>
        <CardTitle>{S.runMeta}</CardTitle>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted">slug</dt>
          <dd className="font-mono text-[13px]">{slug}</dd>
          <dt className="text-muted">{S.colStatus}</dt>
          <dd>{meta ? <Badge variant={badgeVariant(meta.status)}>{meta.status}</Badge> : '—'}</dd>
          <dt className="text-muted">{S.runCurrentStep}</dt>
          <dd>{meta?.currentStep ?? '—'}</dd>
          <dt className="text-muted">{S.runIteration}</dt>
          <dd>{meta?.currentIteration ?? '—'}</dd>
          <dt className="text-muted">{S.runPhase}</dt>
          <dd>{meta?.phase ?? '—'}</dd>
          <dt className="text-muted">{S.colStarted}</dt>
          <dd>{fmtDateTime(meta?.startTime)}</dd>
          <dt className="text-muted">{S.colCompleted}</dt>
          <dd>{fmtDateTime(meta?.endTime)}</dd>
        </dl>
      </Card>

      <Card>
        <CardTitle>{S.runSteps}</CardTitle>
        {!detail?.steps?.length ? (
          <p className="text-sm text-muted">{S.noSteps}</p>
        ) : (
          <ol className="flex flex-col gap-1 text-sm">
            {detail.steps.map((s, i) => (
              <li key={i} className="flex gap-2 items-baseline flex-wrap">
                <Badge variant={s.type === 'workflow_abort' ? 'err' : s.type === 'workflow_complete' ? 'ok' : 'muted'}>
                  {s.type}
                </Badge>
                <span className="font-mono text-[13px]">{s.step ?? '—'}</span>
                {s.status ? <span>{s.status}</span> : null}
                {s.iteration != null ? <span className="text-muted">iter {s.iteration}</span> : null}
                {s.matchedRule != null ? <span className="text-muted">rule {String(s.matchedRule)}</span> : null}
                {s.reason ? <span className="text-danger">{s.reason}</span> : null}
                <span className="text-muted">{fmtDateTime(s.at)}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card>
        <CardTitle>{S.runLog}</CardTitle>
        <div className="font-mono text-[12px] whitespace-pre-wrap break-all max-h-[420px] overflow-y-auto border border-border rounded p-2">
          {logQ.error ? <ErrorNotice message={errMessage(logQ.error)} /> : null}
          {logRecords.length ? (
            logRecords.map((r, i) => <LogLine key={i} rec={r} />)
          ) : (
            <span className="text-muted">{S.loading}</span>
          )}
        </div>
        {logQ.data ? (
          <p className="text-[12px] text-muted mt-1">
            {logQ.data.file} — {fmtNumber(logQ.data.size)} B
          </p>
        ) : null}
      </Card>

      <Card>
        <CardTitle>{S.runReports}</CardTitle>
        {!detail?.reports?.length ? (
          <p className="text-sm text-muted">{S.noReports}</p>
        ) : (
          <ul className="flex flex-col gap-1 text-sm">
            {detail.reports.map((r) => (
              <li key={r.name}>
                <Clickable onClick={() => setReportName(r.name)} className="text-accent underline">
                  {r.name}
                </Clickable>
                <span className="text-muted">（{fmtNumber(r.size)} B）</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={reportName !== null}
        onClose={() => setReportName(null)}
        title={reportName}
        maxWidth={880}
      >
        {reportQ.error ? <ErrorNotice message={errMessage(reportQ.error)} /> : null}
        {reportQ.data ? (
          <>
            <MarkdownRenderer content={reportQ.data.text} />
            {reportQ.data.truncated ? (
              <p className="text-[12px] text-muted mt-2">{S.truncatedReport}</p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">{S.loading}</p>
        )}
      </Modal>
    </div>
  )
}

function LogLine({ rec }: { rec: RunLogRecord }) {
  const text = useMemo(() => {
    if (typeof rec.raw === 'string') return rec.raw
    const t = rec.type ?? rec.event ?? ''
    const step = rec.step ? ` ${String(rec.step)}` : ''
    const content =
      typeof rec.content === 'string'
        ? rec.content
        : typeof rec.reason === 'string'
          ? rec.reason
          : typeof rec.error === 'string'
            ? rec.error
            : JSON.stringify(rec)
    return `${String(t)}${step} ${content}`.trim()
  }, [rec])
  return <div>{text}</div>
}
