import { S } from './strings'

export const API = '/api/apps/for-takt'

export const enc = encodeURIComponent

export function badgeVariant(
  status: string | null | undefined,
): 'ok' | 'err' | 'warn' | 'aim' | 'muted' {
  switch (status) {
    case 'active':
    case 'completed':
      return 'ok'
    case 'paused':
    case 'awaiting_merge':
      return 'warn'
    case 'running':
      return 'aim'
    case 'failed':
    case 'exceeded':
    case 'pr_failed':
    case 'aborted':
      return 'err'
    default:
      return 'muted'
  }
}

export function goalStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'draft':
      return S.statusDraft
    case 'active':
      return S.statusActive
    case 'paused':
      return S.statusPaused
    case 'awaiting_merge':
      return S.statusAwaitingMerge
    case 'completed':
      return S.statusCompleted
    case 'aborted':
      return S.statusAborted
    default:
      return status ?? ''
  }
}

export function shortSha(sha: string | null | undefined): string {
  return sha ? sha.slice(0, 8) : '—'
}

export function shortId(id: string | null | undefined): string {
  return id ? id.slice(0, 8) : '—'
}

/** Extract a displayable message from an AppApiError/Error/unknown. */
export function errMessage(e: unknown): string {
  if (e && typeof e === 'object') {
    const anyE = e as { status?: number; body?: string; message?: string }
    if (typeof anyE.body === 'string' && anyE.body) {
      try {
        const parsed = JSON.parse(anyE.body)
        if (parsed && typeof parsed.error === 'string') return parsed.error
      } catch {
        /* fall through */
      }
      return anyE.body
    }
    if (typeof anyE.message === 'string' && anyE.message) return anyE.message
  }
  return String(e)
}

export function errStatus(e: unknown): number | null {
  if (e && typeof e === 'object' && 'status' in e) {
    const s = (e as { status?: unknown }).status
    return typeof s === 'number' ? s : null
  }
  return null
}
