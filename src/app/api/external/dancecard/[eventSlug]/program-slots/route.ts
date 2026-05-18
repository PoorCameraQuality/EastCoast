import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse } from '@/lib/dancecard/organizerAuth'
import { verifyDancecardApiKey, assertScope } from '@/lib/dancecard/externalApiAuth'
import { fetchOrganizerProgramSlotsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, scopes, apiKeyId } = await verifyDancecardApiKey(request, context.params.eventSlug)
    assertScope(scopes, 'read:program')
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slots = await fetchOrganizerProgramSlotsForEvent(admin, eventId)
    await admin.from('dancecard_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', apiKeyId)
    return NextResponse.json({
      timezone: event.timezone,
      windowStartsAt: event.window_starts_at,
      windowEndsAt: event.window_ends_at,
      slots,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
