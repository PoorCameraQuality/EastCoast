import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { organizerErrorResponse } from '@/lib/dancecard/organizerAuth'
import { verifyDancecardApiKey, assertScope } from '@/lib/dancecard/externalApiAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { organizerRegistrantImportSchema } from '@/lib/dancecard/organizerSchemas'
import { runRegistrantImportBatch } from '@/lib/dancecard/registrantImportCore'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'
import { dispatchDancecardWebhooks } from '@/lib/dancecard/webhookOutbound'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, scopes, apiKeyId } = await verifyDancecardApiKey(request, context.params.eventSlug)
    assertScope(scopes, 'write:registrants')
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerRegistrantImportSchema.parse(await request.json())
    const { created, updated, errors } = await runRegistrantImportBatch(admin, eventId, body.rows)

    await insertDancecardAuditLog(admin, {
      actorApiKeyId: apiKeyId,
      eventId,
      action: 'registrants.import',
      metadata: { created, updated, rowCount: body.rows.length, via: 'api_key' },
    })

    void dispatchDancecardWebhooks(admin, eventId, 'registrants.imported', {
      created,
      updated,
      errorCount: errors.length,
      source: 'external_api',
    }).catch(() => {})

    await admin.from('dancecard_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', apiKeyId)

    return NextResponse.json({ created, updated, errors })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
