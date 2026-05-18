import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
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
    if (!session.isStaff) {
      return NextResponse.json({ error: 'Staff access required' }, { status: 403 })
    }
    const mapRow = (r: Record<string, unknown>) => ({
      id: String(r.id),
      role: String(r.role ?? ''),
      startsAt: String(r.starts_at),
      endsAt: String(r.ends_at),
      locationId: (r.location_id as string | null) ?? null,
    })
    const { data: openRows, error: openErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, role, starts_at, ends_at, location_id, shift_status')
      .eq('event_id', event.id)
      .eq('shift_status', 'open')
      .order('starts_at', { ascending: true })
    if (openErr) throw openErr
    const { data: mineRows, error: mineErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, role, starts_at, ends_at, location_id, shift_status')
      .eq('event_id', event.id)
      .eq('claimed_by_account_id', session.accountId)
      .neq('shift_status', 'dropped')
      .order('starts_at', { ascending: true })
    if (mineErr) throw mineErr
    return NextResponse.json({
      shifts: (openRows ?? []).map((r) => mapRow(r as Record<string, unknown>)),
      myShifts: (mineRows ?? []).map((r) => mapRow(r as Record<string, unknown>)),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-staff-open-shifts')
  }
}
