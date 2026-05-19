import { NextResponse } from 'next/server'
import { computeDmCoverageGaps, type DmRequirementRow, type StaffShiftForDm } from '@/lib/dancecard/dmCoverageScanner'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { formatEventWindow } from '@/lib/dancecard/readinessHumanCopy'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const timezone = String(event.timezone ?? 'America/New_York')
    const now = Date.now()

    const { data: slots } = await admin
      .from('dancecard_program_slots')
      .select('id, title, starts_at, ends_at, location_id, room, is_published')
      .eq('event_id', eventId)
      .not('starts_at', 'is', null)
      .not('ends_at', 'is', null)

    const { data: locs } = await admin.from('dancecard_locations').select('id, name, capacity').eq('event_id', eventId)
    const locById = new Map((locs ?? []).map((l) => [l.id as string, l]))

    const happeningNow = (slots ?? []).filter((s) => {
      const a0 = new Date(s.starts_at as string).getTime()
      const a1 = new Date(s.ends_at as string).getTime()
      return a0 <= now && now < a1 && Boolean(s.is_published)
    })

    const byLocation: Record<
      string,
      { locationId: string | null; locationName: string; capacity: number | null; slots: unknown[] }
    > = {}
    for (const s of happeningNow) {
      const lid = (s.location_id as string | null) ?? '__none'
      if (!byLocation[lid]) {
        const loc = s.location_id ? locById.get(s.location_id as string) : null
        byLocation[lid] = {
          locationId: (s.location_id as string | null) ?? null,
          locationName: loc ? String(loc.name) : String(s.room ?? 'Unassigned'),
          capacity: loc?.capacity != null ? Number(loc.capacity) : null,
          slots: [],
        }
      }
      byLocation[lid]!.slots.push({
        id: s.id,
        title: s.title,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
      })
    }

    const { data: regRows } = await admin
      .from('dancecard_registrants')
      .select('status, checked_in_timing')
      .eq('event_id', eventId)
      .neq('status', 'cancelled')

    let onSite = 0
    let registered = regRows?.length ?? 0
    const checkInByTiming: Record<string, number> = {}
    for (const r of regRows ?? []) {
      if (r.status === 'checked_in') {
        onSite += 1
        const t = (r.checked_in_timing as string) ?? 'on_time'
        checkInByTiming[t] = (checkInByTiming[t] ?? 0) + 1
      }
    }

    const soonMs = 30 * 60 * 1000
    const startingSoon = (slots ?? []).filter((s) => {
      if (s.is_published) return false
      const a0 = new Date(s.starts_at as string).getTime()
      return a0 > now && a0 - now < soonMs
    })

    const dmReqs: DmRequirementRow[] = []
    const { data: reqRows } = await admin
      .from('dancecard_event_dm_requirements')
      .select('id, location_id, starts_at, ends_at, min_lead, min_float')
      .eq('event_id', eventId)
    for (const r of reqRows ?? []) {
      const s0 = new Date(r.starts_at as string).getTime()
      const s1 = new Date(r.ends_at as string).getTime()
      if (s0 <= now && now < s1) {
        dmReqs.push({
          id: r.id as string,
          locationId: r.location_id as string,
          startsAt: String(r.starts_at),
          endsAt: String(r.ends_at),
          minLead: Number(r.min_lead ?? 1),
          minFloat: Number(r.min_float ?? 0),
        })
      }
    }

    let dmGapsNow: ReturnType<typeof computeDmCoverageGaps> = []
    if (dmReqs.length) {
      const { data: staffRows } = await admin
        .from('dancecard_staff_shifts')
        .select('id, location_id, role, starts_at, ends_at, shift_status')
        .eq('event_id', eventId)
      const staffForDm: StaffShiftForDm[] = (staffRows ?? []).map((r) => ({
        id: r.id as string,
        locationId: (r.location_id as string | null) ?? null,
        role: String(r.role ?? ''),
        startsAt: String(r.starts_at),
        endsAt: String(r.ends_at),
        shiftStatus: String(r.shift_status ?? 'assigned'),
      }))
      const locationNames: Record<string, string> = {}
      for (const l of locs ?? []) locationNames[l.id as string] = String(l.name)
      dmGapsNow = computeDmCoverageGaps(dmReqs, staffForDm, {
        locationNames,
        formatWindow: (a, b) => formatEventWindow(a, b, timezone),
      })
    }

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      timezone,
      happeningNow: Object.values(byLocation),
      checkIn: { onSite, registered, byTiming: checkInByTiming },
      unpublishedStartingSoon: startingSoon.map((s) => ({
        id: s.id,
        title: s.title,
        startsAt: s.starts_at,
      })),
      dmGapsNow,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
