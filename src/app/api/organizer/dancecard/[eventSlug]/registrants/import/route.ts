import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrantImportSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'
import { dispatchDancecardWebhooks } from '@/lib/dancecard/webhookOutbound'
import { runRegistrantImportBatch } from '@/lib/dancecard/registrantImportCore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, userId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerRegistrantImportSchema.parse(await request.json())
    const { created, updated, errors } = await runRegistrantImportBatch(admin, eventId, body.rows)

    await insertDancecardAuditLog(admin, {
      actorUserId: userId,
      eventId,
      action: 'registrants.import',
      metadata: { created, updated, rowCount: body.rows.length },
    })

    void dispatchDancecardWebhooks(admin, eventId, 'registrants.imported', {
      created,
      updated,
      errorCount: errors.length,
    }).catch(() => {})

    return NextResponse.json({ created, updated, errors })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
