import { NextResponse } from 'next/server'
import {
  assertOrganizerCanExportPii,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

/** Organizer-only: registrants without photo consent timestamp (planning no-photo list). */
export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExportPii(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_registrants')
      .select('id, scene_display_name, email, status, consent_photo_ack_at')
      .eq('event_id', eventId)
      .is('consent_photo_ack_at', null)
      .neq('status', 'cancelled')
      .order('scene_display_name', { ascending: true })
    if (error) throw error
    return NextResponse.json({
      registrants: (rows ?? []).map((r) => ({
        id: r.id as string,
        sceneDisplayName: r.scene_display_name as string,
        email: (r.email as string | null) ?? null,
        status: r.status as string,
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
