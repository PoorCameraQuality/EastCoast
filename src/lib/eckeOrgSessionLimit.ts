/** Absolute organizer session window. Cookies persist across refresh; login ends after this. */
export const ORG_SESSION_MAX_MS = 2 * 60 * 60 * 1000
export const ORG_SESSION_MAX_AGE_SEC = 2 * 60 * 60
export const ORG_SESSION_STARTED_COOKIE = 'ecke_org_signed_in_at'

export function orgSessionCookieOptions(maxAge = ORG_SESSION_MAX_AGE_SEC) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export function parseOrgSessionStartedAt(raw: string | undefined | null): number | null {
  if (!raw) return null
  const startedAt = Number(raw)
  if (!Number.isFinite(startedAt) || startedAt <= 0) return null
  return startedAt
}

export function isOrgSessionExpired(startedAtMs: number, now = Date.now()): boolean {
  return now - startedAtMs > ORG_SESSION_MAX_MS
}

/** Allowlisted post-login destinations. Anything else goes to the dashboard. */
export function safeOrgNextPath(raw: string | null | undefined): string {
  const value = (raw || '').trim()
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || value.includes('://')) {
    return '/dashboard'
  }
  const path = value.split('?')[0].split('#')[0].toLowerCase()
  if (path === '/dashboard' || path === '/vendors/my-shop' || path === '/events/my-events' || path === '/events/create' || path === '/dungeons/my-place') {
    return path
  }
  return '/dashboard'
}

export function isOrgManagedPath(pathname: string): boolean {
  const path = pathname.toLowerCase()
  return (
    path.startsWith('/dashboard') ||
    path === '/events/create' ||
    path === '/events/my-events' ||
    /^\/events\/[^/]+\/(edit|manage|posts|media|settings)$/.test(path) ||
    path === '/vendors/my-shop' ||
    path.startsWith('/vendors/my-shop/') ||
    path === '/dungeons/my-place' ||
    path.startsWith('/dungeons/my-place/')
  )
}
