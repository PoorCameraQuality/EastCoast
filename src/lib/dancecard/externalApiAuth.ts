import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getDancecardAdmin, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw, 'utf8').digest('hex')
}

export function mintApiKeyRaw(): string {
  return `dk_${randomBytes(24).toString('hex')}`
}

export function mintWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString('hex')}`
}

/** Plaintext shown once; stored as SHA-256 hex like API keys. */
export function mintInboundRegistrantSecret(): string {
  return `dca_${randomBytes(24).toString('hex')}`
}

export function mintEmbedTokenRaw(): string {
  return `emb_${randomBytes(24).toString('hex')}`
}

export async function verifyDancecardApiKey(
  request: NextRequest,
  eventSlug: string,
): Promise<{ admin: SupabaseClient; eventId: string; apiKeyId: string; scopes: string[] }> {
  const auth = request.headers.get('authorization') ?? request.headers.get('Authorization')
  if (!auth?.toLowerCase().startsWith('bearer ')) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const raw = auth.slice(7).trim()
  if (!raw.startsWith('dk_')) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const hash = hashApiKey(raw)
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)
  const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
  if (evErr || !ev) {
    const err = new Error('NOT_FOUND')
    ;(err as Error & { status: number }).status = 404
    throw err
  }
  const eventId = (ev as { id: string }).id
  const { data: row, error } = await admin
    .from('dancecard_api_keys')
    .select('id, scopes')
    .eq('event_id', eventId)
    .eq('secret_hash', hash)
    .is('revoked_at', null)
    .maybeSingle()
  if (error || !row) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const scopes = ((row as { scopes?: string[] }).scopes ?? []) as string[]
  return { admin, eventId, apiKeyId: (row as { id: string }).id, scopes }
}

export function assertScope(scopes: string[], need: string) {
  if (!scopes.includes(need)) {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}

export function verifyInboundBearer(provided: string, storedHash: string): boolean {
  const h = hashApiKey(provided)
  try {
    return timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(storedHash, 'hex'))
  } catch {
    return false
  }
}
