/** Normalize pathname for shell routing (lowercase, no trailing slash). */
export function normalizeShellPath(pathname: string | null | undefined): string {
  if (!pathname) return ''
  const base = pathname.split('?')[0] ?? ''
  const trimmed = base.replace(/\/+$/, '') || '/'
  return trimmed.toLowerCase()
}

/** Product marketing pages keep ECKE header/footer for directory navigation. */
export function isDancecardMarketingRoute(pathname: string | null | undefined): boolean {
  const p = normalizeShellPath(pathname)
  return p === '/dancecard' || p === '/dancecard/organizers' || p === '/products/dancecard'
}

/** In-app organizer console (`OrganizerDancecardChrome` only). */
export function isOrganizerDancecardShell(pathname: string | null | undefined): boolean {
  const p = normalizeShellPath(pathname)
  return p === '/organizer/dancecard' || p.startsWith('/organizer/dancecard/')
}

/** Organizer sign-in and password flows (minimal auth shell, no ECKE marketing chrome). */
export function isOrganizerAuthShell(pathname: string | null | undefined): boolean {
  const p = normalizeShellPath(pathname)
  return p === '/organizer/login' || p.startsWith('/organizer/login/')
}

/** In-app attendee experience (`DancecardTopBar` only). */
export function isDancecardAttendeeShell(pathname: string | null | undefined): boolean {
  const p = normalizeShellPath(pathname)
  if (!p.startsWith('/dancecard/')) return false
  if (isDancecardMarketingRoute(p)) return false
  return true
}

export function suppressEckeHeader(pathname: string | null | undefined): boolean {
  return (
    isDancecardAttendeeShell(pathname) ||
    isOrganizerDancecardShell(pathname) ||
    isOrganizerAuthShell(pathname)
  )
}

export function suppressEckeFooter(pathname: string | null | undefined): boolean {
  return suppressEckeHeader(pathname)
}

export function suppressSupportBanner(pathname: string | null | undefined): boolean {
  return suppressEckeHeader(pathname)
}
