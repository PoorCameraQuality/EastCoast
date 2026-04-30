import type { SupabaseClient } from '@supabase/supabase-js'
import { loadPrefs } from '@/lib/dancecard/data'

export async function resolveHostIdFromShareToken(
  admin: SupabaseClient,
  shareToken: string
): Promise<string | null> {
  const { data: link, error } = await admin
    .from('dancecard_share_links')
    .select('account_id')
    .eq('token', shareToken.trim())
    .is('revoked_at', null)
    .maybeSingle()
  if (error) throw error
  return link?.account_id ?? null
}

/**
 * Host account id for username-based compare when the host opted in.
 * Returns null if not found, self-compare, or not opted in (same response for privacy).
 */
export async function resolveHostIdFromCompareUsername(
  admin: SupabaseClient,
  eventId: string,
  rawUsername: string,
  viewerAccountId: string
): Promise<string | null> {
  const username = rawUsername.trim().toLowerCase()
  if (!username) return null
  const { data: acc, error } = await admin
    .from('dancecard_accounts')
    .select('id')
    .eq('event_id', eventId)
    .eq('username', username)
    .maybeSingle()
  if (error) throw error
  if (!acc?.id || acc.id === viewerAccountId) return null
  const prefs = await loadPrefs(admin, acc.id)
  if (!prefs.allowCompareByUsername) return null
  return acc.id
}

export type ReserveHostResolution =
  | { ok: true; hostId: string }
  | { ok: false; reason: 'not_found' | 'self' }

/** Resolve host for authenticated preview/reserve: share token or opted-in username. */
export async function resolveReserveHostId(
  admin: SupabaseClient,
  eventId: string,
  body: { shareToken?: string | undefined; hostUsername?: string | undefined },
  sessionAccountId: string
): Promise<ReserveHostResolution> {
  const tok = body.shareToken?.trim()
  if (tok) {
    const hostId = await resolveHostIdFromShareToken(admin, tok)
    if (!hostId) return { ok: false, reason: 'not_found' }
    if (hostId === sessionAccountId) return { ok: false, reason: 'self' }
    return { ok: true, hostId }
  }
  const user = body.hostUsername?.trim()
  if (user) {
    const hostId = await resolveHostIdFromCompareUsername(admin, eventId, user, sessionAccountId)
    if (!hostId) return { ok: false, reason: 'not_found' }
    return { ok: true, hostId }
  }
  return { ok: false, reason: 'not_found' }
}
