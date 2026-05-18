import { NextRequest, NextResponse } from 'next/server'
import { ZodError, z } from 'zod'
import { parseAgreementsConfig } from '@/lib/dancecard/agreementsConfig'
import { getDancecardAdmin, jsonFromRouteError, loadEventBySlugAnyStatus, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  eventSlug: z.string().min(1).max(120),
  registrantId: z.string().uuid(),
  status: z.enum(['pending', 'signed', 'declined']),
  secret: z.string().min(1).max(500),
})

export async function POST(request: NextRequest) {
  const limited = await withRateLimit(request, rateLimiters.dancecardWebhook)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const body = bodySchema.parse(await request.json())
    const slug = normalizeEventSlug(body.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const row = event as Record<string, unknown>
    const cfg = parseAgreementsConfig(row.agreements_config)
    const expected =
      (cfg.webhookSecret && cfg.webhookSecret.trim()) ||
      (typeof process.env.DANCECARD_RABBITSIGN_WEBHOOK_SECRET === 'string'
        ? process.env.DANCECARD_RABBITSIGN_WEBHOOK_SECRET
        : null)
    if (!expected || body.secret !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: reg, error: rErr } = await admin
      .from('dancecard_registrants')
      .select('id')
      .eq('id', body.registrantId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (rErr) throw rErr
    if (!reg) return NextResponse.json({ error: 'Registrant not found' }, { status: 404 })

    const { error: uErr } = await admin
      .from('dancecard_registrants')
      .update({
        rabbitsign_status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.registrantId)
      .eq('event_id', event.id)
    if (uErr) throw uErr

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'webhooks-rabbitsign')
  }
}
