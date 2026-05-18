import { createHash, randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export const DANCECARD_SESSION_COOKIE = 'eck_dancecard_session'
/** Must include `/api/dancecard/*` so session is sent to route handlers (same-site). */
export const DANCECARD_COOKIE_PATH = '/'
export const SESSION_DAYS = 30

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

export function newSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function revokeSessionFromRequest(
  admin: SupabaseClient,
  request: NextRequest,
): Promise<void> {
  const token = request.cookies.get(DANCECARD_SESSION_COOKIE)?.value
  if (!token) return
  const tokenHash = hashToken(token)
  await admin.from('dancecard_sessions').delete().eq('token_hash', tokenHash)
}

export async function revokeAllSessionsForAccount(
  admin: SupabaseClient,
  accountId: string,
): Promise<void> {
  await admin.from('dancecard_sessions').delete().eq('account_id', accountId)
}
