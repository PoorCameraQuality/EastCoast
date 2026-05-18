import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse } from '@/lib/dancecard/organizerAuth'
import { getDancecardAdmin, loadEventBySlugAnyStatus, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { verifyInboundBearer } from '@/lib/dancecard/externalApiAuth'
import { runRegistrantImportBatch } from '@/lib/dancecard/registrantImportCore'
import { parseInboundRegistrantPayload } from '@/lib/dancecard/inboundRegistrantBody'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'
import { dispatchDancecardWebhooks } from '@/lib/dancecard/webhookOutbound'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardWebhook)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const eventId = event.id as string

    const auth = request.headers.get('authorization') ?? request.headers.get('Authorization')
    if (!auth?.toLowerCase().startsWith('bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = auth.slice(7).trim()

    const { data: secrets, error: sErr } = await admin
      .from('dancecard_registrant_inbound_secrets')
      .select('id, secret_hash')
      .eq('event_id', eventId)
    if (sErr) throw sErr
    let authorized = false
    for (const row of secrets ?? []) {
      const h = (row as { secret_hash: string }).secret_hash
      if (verifyInboundBearer(token, h)) {
        authorized = true
        break
      }
    }
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const raw = await request.json()
    const parsed = parseInboundRegistrantPayload(raw)
    const { created, updated, errors } = await runRegistrantImportBatch(admin, eventId, parsed.rows)

    await insertDancecardAuditLog(admin, {
      actorUserId: null,
      eventId,
      action: 'registrants.inbound_webhook',
      metadata: { created, updated, errorCount: errors.length },
    })

    void dispatchDancecardWebhooks(admin, eventId, 'registrants.imported', {
      created,
      updated,
      errorCount: errors.length,
      source: 'inbound_webhook',
    }).catch(() => {})

    return NextResponse.json({ ok: true, created, updated, errors })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
