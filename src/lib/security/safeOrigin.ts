function normalizeOrigin(origin: string): string | null {
  try {
    const u = new URL(origin.trim())
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.origin
  } catch {
    return null
  }
}

function hostMatchesWildcard(requestHost: string, pattern: string): boolean {
  const p = pattern.trim().toLowerCase()
  if (!p.startsWith('*.')) return false
  const base = p.slice(2)
  if (!base || requestHost === base) return requestHost === base
  return requestHost.endsWith(`.${base}`)
}

/**
 * Validates request Origin against an allowlist.
 * Supports exact origins (https://example.com) and *.example.com wildcards.
 */
export function isAllowedOrigin(requestOrigin: string | null | undefined, allowedOrigins: string[]): boolean {
  if (!allowedOrigins.length) return true
  const normalized = requestOrigin ? normalizeOrigin(requestOrigin) : null
  if (!normalized) return false

  let requestHost: string
  try {
    requestHost = new URL(normalized).host.toLowerCase()
  } catch {
    return false
  }

  for (const entry of allowedOrigins) {
    const raw = entry?.trim()
    if (!raw) continue

    if (raw.includes('://')) {
      const allowed = normalizeOrigin(raw.replace(/\*$/, ''))
      if (allowed && normalized === allowed) return true
      if (raw.endsWith('*')) {
        const hostPart = new URL(raw.replace(/\*$/, 'https://x')).host.replace(/^x\.?/, '')
        if (hostPart && hostMatchesWildcard(requestHost, `*.${hostPart}`)) return true
      }
      continue
    }

    if (raw.startsWith('*.')) {
      if (hostMatchesWildcard(requestHost, raw)) return true
      continue
    }

    if (requestHost === raw.toLowerCase()) return true
  }

  return false
}
