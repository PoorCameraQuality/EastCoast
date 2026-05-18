const ALLOWED_PROTOCOLS = new Set(['https:', 'mailto:'])

/**
 * Returns normalized URL if safe for href/src, otherwise null.
 * Profile photos and external links should be https only (mailto allowed for email links).
 */
export function assertHttpsUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (!ALLOWED_PROTOCOLS.has(u.protocol)) return null
    return u.toString()
  } catch {
    return null
  }
}

/** Stricter check for image sources (https only). */
export function assertHttpsImageUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}
