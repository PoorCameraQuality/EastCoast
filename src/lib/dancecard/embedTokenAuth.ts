import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { verifyInboundBearer } from '@/lib/dancecard/externalApiAuth'
import { normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { isAllowedOrigin } from '@/lib/security/safeOrigin'

export type EmbedKind = 'schedule' | 'map' | 'ops_summary'

/** Origin header, or origin parsed from Referer (iframe navigation often omits Origin). */
export function embedRequestParentOrigin(request: NextRequest): string | null {
  const o = request.headers.get('origin')
  if (o) return o
  const ref = request.headers.get('referer')
  if (!ref) return null
  try {
    return new URL(ref).origin
  } catch {
    return null
  }
}

export async function verifyEmbedRequest(
  admin: SupabaseClient,
  eventSlug: string,
  tokenRaw: string | null,
  requestOrigin: string | null,
  embedKind: EmbedKind,
): Promise<{ eventId: string; title: string }> {
  if (!tokenRaw?.trim()) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const slug = normalizeEventSlug(eventSlug)
  const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id, event_title').eq('slug', slug).maybeSingle()
  if (evErr || !ev) {
    const err = new Error('NOT_FOUND')
    ;(err as Error & { status: number }).status = 404
    throw err
  }
  const eventId = (ev as { id: string }).id
  const { data: rows, error } = await admin
    .from('dancecard_embed_tokens')
    .select('id, token_hash, allowed_origins, revoked_at, embed_kind')
    .eq('event_id', eventId)
    .eq('embed_kind', embedKind)
    .is('revoked_at', null)
  if (error) {
    const msg = error.message ?? ''
    if (/dancecard_embed_tokens|42P01|does not exist/i.test(msg)) {
      const err = new Error('SERVICE_UNAVAILABLE')
      ;(err as Error & { status: number }).status = 503
      throw err
    }
    throw error
  }
  const row = (rows ?? []).find((r) => verifyInboundBearer(tokenRaw.trim(), (r as { token_hash: string }).token_hash))
  if (!row) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  const origins = (row as { allowed_origins: string[] | null }).allowed_origins ?? []
  if (process.env.NODE_ENV === 'production' && origins.length === 0) {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
  if (origins.length) {
    if (!requestOrigin?.trim()) {
      const err = new Error('FORBIDDEN')
      ;(err as Error & { status: number }).status = 403
      throw err
    }
    if (!isAllowedOrigin(requestOrigin, origins)) {
      const err = new Error('FORBIDDEN')
      ;(err as Error & { status: number }).status = 403
      throw err
    }
  }
  return { eventId, title: String((ev as { event_title?: string }).event_title ?? slug) }
}
