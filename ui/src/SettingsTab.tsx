import { useAppApi } from '@kirocrew/app-sdk'
import {
  Badge,
  Btn,
  Card,
  CardTitle,
  ErrorNotice,
  Input,
} from '@kirocrew/app-sdk/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { S } from './strings'
import type { SettingsResult } from './types'
import { API, errMessage } from './util'

export default function SettingsTab({ active, project }: { active: boolean; project: string }) {
  const api = useAppApi()
  const qc = useQueryClient()
  const [path, setPath] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  const settingsQ = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<SettingsResult>(`${API}/settings`),
    refetchInterval: active ? 5000 : false,
  })
  const tool = settingsQ.data?.taktMcp

  useEffect(() => {
    if (tool) setPath(tool.pinned ?? '')
  }, [tool?.pinned]) // eslint-disable-line react-hooks/exhaustive-deps

  const mut = useMutation({
    mutationFn: (p: string | null) =>
      api.post<SettingsResult>(`${API}/settings/takt-mcp`, { path: p }),
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data)
      setNotice(null)
    },
    onError: (e) => setNotice(errMessage(e)),
  })

  return (
    <div className="flex flex-col gap-4 max-w-[760px]">
      {notice ? <ErrorNotice message={notice} onDismiss={() => setNotice(null)} /> : null}
      {settingsQ.error ? <ErrorNotice message={errMessage(settingsQ.error)} /> : null}

      <Card>
        <CardTitle>{S.settingsTaktMcp}</CardTitle>
        <p className="text-sm text-muted mb-2">{S.settingsTaktMcpHint}</p>
        {tool ? (
          tool.path ? (
            <p className="text-sm mb-2">
              <Badge variant="ok">{S.settingsResolved(tool.source ?? '')}</Badge>{' '}
              <code className="text-[13px]">{tool.path}</code>
            </p>
          ) : (
            <p className="text-sm mb-2">
              <Badge variant="err">{S.settingsNotFound}</Badge>{' '}
              {tool.error ? <span className="text-muted">{tool.error}</span> : null}
            </p>
          )
        ) : null}
        <div className="flex gap-2 items-center">
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder={S.settingsPathPlaceholder}
            className="flex-1 font-mono text-[13px]"
          />
          <Btn
            primary
            disabled={mut.isPending}
            onClick={() => mut.mutate(path.trim() || null)}
          >
            {S.settingsSave}
          </Btn>
          <Btn
            disabled={mut.isPending || !tool?.pinned}
            onClick={() => mut.mutate(null)}
          >
            {S.settingsClear}
          </Btn>
        </div>
        {tool?.pinned ? (
          <p className="text-[12px] text-muted mt-1">
            {S.settingsPinnedAt(tool.pinned)}
          </p>
        ) : (
          <p className="text-[12px] text-muted mt-1">{S.settingsAuto}</p>
        )}
      </Card>
    </div>
  )
}
