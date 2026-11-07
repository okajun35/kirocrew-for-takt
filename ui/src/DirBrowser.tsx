import { useAppApi } from '@kirocrew/app-sdk'
import { Badge, Btn, Clickable } from '@kirocrew/app-sdk/ui'
import { useQuery } from '@tanstack/react-query'
import { S } from './strings'
import type { DirectoriesResult } from './types'
import { API, errMessage } from './util'

export default function DirBrowser({
  path,
  onNavigate,
  onPick,
}: {
  path: string
  onNavigate: (p: string) => void
  onPick: (p: string) => void
}) {
  const api = useAppApi()
  const q = useQuery({
    queryKey: ['directories', path],
    queryFn: () =>
      api.post<DirectoriesResult>(`${API}/directories`, { path }),
  })
  const d = q.data

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Btn
          disabled={!d?.parent}
          onClick={() => d?.parent && onNavigate(d.parent)}
        >
          {S.browseUp}
        </Btn>
        <code className="text-[12px] text-muted truncate flex-1">
          {d?.path ?? path}
        </code>
        <Btn primary onClick={() => d && onPick(d.path)}>
          {S.browsePick}
        </Btn>
      </div>
      <div className="border border-subtle rounded max-h-[220px] overflow-y-auto">
        {q.isLoading ? (
          <p className="text-sm text-muted p-2">…</p>
        ) : q.error ? (
          <p className="text-sm p-2">{errMessage(q.error)}</p>
        ) : (
          (d?.directories ?? []).map((e) => (
            <Clickable
              key={e.path}
              className="flex items-center gap-2 px-2 py-1 text-[13px] hover:bg-hover"
              onClick={() => onNavigate(e.path)}
            >
              <span className="truncate">{e.name}</span>
              <span className="ml-auto flex gap-1">
                {e.hasGit ? <Badge variant="ok">{S.browseGit}</Badge> : null}
                {e.hasTakt ? <Badge variant="aim">{S.browseTakt}</Badge> : null}
              </span>
            </Clickable>
          ))
        )}
      </div>
      {d?.truncated ? (
        <p className="text-[12px] text-muted mt-1">{S.browseTruncated}</p>
      ) : null}
    </div>
  )
}
