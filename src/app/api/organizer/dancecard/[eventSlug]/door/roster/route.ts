import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { registrantCheckInExtras } from '@/lib/dancecard/organizerRegistrantCheckIn'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const MAX_ROSTER = 5000

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const includeCheckInToken = organizerRole !== 'viewer'

    const { data: cats, error: catErr } = await admin
      .from('dancecard_registration_categories')
      .select('id, name, check_in_valid_from, check_in_valid_through')
      .eq('event_id', eventId)
    if (catErr) throw catErr
    const catById = new Map((cats ?? []).map((c) => [c.id as string, c]))

    const { data: rows, error, count } = await admin
      .from('dancecard_registrants')
      .select(
        'id, category_id, status, scene_display_name, pronouns, checked_in_at, checked_in_timing, check_in_token, vetting_status',
        { count: 'exact' },
      )
      .eq('event_id', eventId)
      .neq('status', 'cancelled')
      .order('scene_display_name', { ascending: true })
      .limit(MAX_ROSTER)
    if (error) throw error

    const truncated = typeof count === 'number' ? count > MAX_ROSTER : (rows?.length ?? 0) >= MAX_ROSTER

    const roster = (rows ?? []).map((r) => {
      const cat = catById.get(r.category_id as string)
      const extras = registrantCheckInExtras({
        status: r.status as string,
        checkedInAt: (r.checked_in_at as string | null) ?? null,
        checkedInTiming: (r.checked_in_timing as string | null) ?? null,
        category: cat ?? null,
        event,
      })
      const entry: Record<string, unknown> = {
        id: r.id as string,
        sceneDisplayName: r.scene_display_name as string,
        pronouns: (r.pronouns as string | null) ?? null,
        categoryId: r.category_id as string,
        categoryName: (cat?.name as string) ?? null,
        status: r.status as string,
        vettingStatus: (r.vetting_status as string) ?? 'none',
        checkInEligibility: extras.checkInEligibility,
        checkInTiming: extras.checkInTiming,
        checkedInAt: extras.checkedInAt,
      }
      if (includeCheckInToken) {
        entry.checkInToken = (r.check_in_token as string | null) ?? null
      }
      return entry
    })

    return NextResponse.json({
      eventTitle: event.event_title,
      timezone: event.timezone ?? 'America/New_York',
      roster,
      truncated: truncated || undefined,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
