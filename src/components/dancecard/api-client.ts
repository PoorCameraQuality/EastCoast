import { supportCopy, toUserFacingErrorMessage } from '@/lib/dancecard/supportCopy'

export class DancecardApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

/** Short message for UI (handles JSON `{ error }` bodies from API routes). */
export function formatDancecardApiMessage(e: unknown): string {
  if (e instanceof DancecardApiError) {
    const raw = e.body?.trim() ?? ''
    if (!raw) return e.message || 'Request failed'
    try {
      const j = JSON.parse(raw) as { error?: string; message?: string; hint?: string }
      if (typeof j.error === 'string' && j.error) {
        const combined =
          typeof j.hint === 'string' && j.hint ? `${j.error} ${j.hint}` : j.error
        return toUserFacingErrorMessage(combined)
      }
      if (typeof j.message === 'string' && j.message) return toUserFacingErrorMessage(j.message)
    } catch {
      if (raw.length < 400 && !raw.startsWith('<')) return toUserFacingErrorMessage(raw)
    }
    return supportCopy.tryAgainLater
  }
  if (e instanceof Error && e.message.trim()) return toUserFacingErrorMessage(e.message.trim())
  return supportCopy.tryAgainLater
}

function apiBase(slug: string): string {
  return `/api/dancecard/${encodeURIComponent(slug)}`
}

export async function dancecardFetch<T>(
  slug: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers ?? {}),
  }
  const res = await fetch(`${apiBase(slug)}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  })
  const text = await res.text()
  if (!res.ok) {
    const t = text.trimStart()
    if (t.startsWith('<!') || t.startsWith('<html')) {
      throw new DancecardApiError(res.status, supportCopy.serviceUnavailable)
    }
    throw new DancecardApiError(res.status, text)
  }
  if (text) {
    const t = text.trimStart()
    if (t.startsWith('<!') || t.startsWith('<html')) {
      throw new DancecardApiError(res.status, supportCopy.serviceUnavailable)
    }
    return JSON.parse(text) as T
  }
  return undefined as T
}

/** Multipart upload (do not set Content-Type — browser sets boundary). */
export async function dancecardUpload<T>(slug: string, path: string, form: FormData): Promise<T> {
  const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
    headers: { Accept: 'application/json' },
  })
  const text = await res.text()
  if (!res.ok) {
    throw new DancecardApiError(res.status, text)
  }
  if (!text) return undefined as T
  return JSON.parse(text) as T
}
