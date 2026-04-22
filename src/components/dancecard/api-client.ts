export class DancecardApiError extends Error {
  status: number
  body: string
  constructor(status: number, body: string) {
    super(body || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
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
    throw new DancecardApiError(res.status, text)
  }
  return text ? (JSON.parse(text) as T) : (undefined as T)
}
