import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { z, ZodError } from 'zod'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { toClientError } from '@/lib/security/safeApiError'

const revokeSchema = z.object({
  token: z.string().min(1).max(128).optional(),
  revokeAll: z.boolean().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardToken)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = nanoid(21)
    const { error } = await admin.from('dancecard_share_links').insert({
      account_id: session.accountId,
      token,
    })
    if (error) {
      const code = (error as { code?: string }).code
      const msg = (error as { message?: string }).message ?? ''
      if (code === 'PGRST205' || /dancecard_share_links/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              'Share links are not available on this database yet. Apply dancecard migrations (dancecard_000_schema or dancecard_full_bundle.sql).',
          },
          { status: 503 }
        )
      }
      throw error
    }
    const u = new URL(request.url)
    const requestOrigin = `${u.protocol}//${u.host}`
    const requestIsVercelPreview = u.host.endsWith('.vercel.app')
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      (!requestIsVercelPreview
        ? requestOrigin
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : requestOrigin)
    const url = `${origin}/dancecard/${slug}/s/${token}`
    return NextResponse.json({ token, url })
  } catch (e) {
    const { status, body } = toClientError(e, 'dancecard-share-create')
    return NextResponse.json(body, { status })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardToken)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = revokeSchema.parse(await request.json().catch(() => ({})))
    if (!body.revokeAll && !body.token?.trim()) {
      return NextResponse.json({ error: 'Provide token or revokeAll' }, { status: 400 })
    }
    const revokedAt = new Date().toISOString()
    let q = admin
      .from('dancecard_share_links')
      .update({ revoked_at: revokedAt })
      .eq('account_id', session.accountId)
      .is('revoked_at', null)
    if (!body.revokeAll && body.token) {
      q = q.eq('token', body.token.trim())
    }
    const { error } = await q
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const { status, body } = toClientError(e, 'dancecard-share-revoke')
    return NextResponse.json(body, { status })
  }
}
