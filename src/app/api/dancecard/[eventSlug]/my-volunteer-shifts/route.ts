import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { resolveRegistrantForDancecardAccount, DANCECARD_ACCOUNT_REGISTRANT_SOURCE } from '@/lib/dancecard/ensureSelfServiceRegistrant'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const account = await resolveAccountFromSession(admin, request, slug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const mapRow = (r: Record<string, unknown>) => ({
      id: String(r.id),
      role: String(r.role ?? ''),
      startsAt: String(r.starts_at),
      endsAt: String(r.ends_at),
      status: String(r.shift_status ?? ''),
      locationName: null as string | null,
    })

    const { data: mineRows, error: mineErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, role, starts_at, ends_at, shift_status, location_id')
      .eq('event_id', event.id)
      .eq('claimed_by_account_id', account.accountId)
      .neq('shift_status', 'dropped')
      .order('starts_at', { ascending: true })
    if (mineErr) throw mineErr

    let openRows: Record<string, unknown>[] = []
    if (account.isStaff) {
      const { data, error } = await admin
        .from('dancecard_staff_shifts')
        .select('id, role, starts_at, ends_at, shift_status, location_id')
        .eq('event_id', event.id)
        .eq('shift_status', 'open')
        .order('starts_at', { ascending: true })
      if (error) throw error
      openRows = (data ?? []) as Record<string, unknown>[]
    }

    let hoursRequired: number | null = null
    let hoursClaimed = 0
    const linked = await resolveRegistrantForDancecardAccount(admin, event.id, account.accountId, account.displayName, {
      ensure: false,
    })
    if (linked?.id) {
      const { data: reg } = await admin
        .from('dancecard_registrants')
        .select('category_id')
        .eq('id', linked.id)
        .eq('external_source', DANCECARD_ACCOUNT_REGISTRANT_SOURCE)
        .maybeSingle()
      if (reg?.category_id) {
        const { data: cat } = await admin
          .from('dancecard_registration_categories')
          .select('expected_hours')
          .eq('id', reg.category_id)
          .maybeSingle()
        const expected = cat?.expected_hours != null ? Number(cat.expected_hours) : null
        if (expected != null && expected > 0) {
          hoursRequired = expected
          for (const sh of mineRows ?? []) {
            const ms =
              new Date(String(sh.ends_at)).getTime() - new Date(String(sh.starts_at)).getTime()
            if (ms > 0) hoursClaimed += ms / 3_600_000
          }
          hoursClaimed = Math.round(hoursClaimed * 10) / 10
        }
      }
    }

    return NextResponse.json({
      myShifts: (mineRows ?? []).map((r) => mapRow(r as Record<string, unknown>)),
      openShifts: openRows.map(mapRow),
      compliance:
        hoursRequired != null
          ? {
              requiredHours: hoursRequired,
              claimedHours: hoursClaimed,
              deficitHours: Math.max(0, Math.round((hoursRequired - hoursClaimed) * 10) / 10),
            }
          : null,
    })
  } catch (e) {
    return jsonFromRouteError(e, 'my-volunteer-shifts')
  }
}
