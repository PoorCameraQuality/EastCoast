import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { toClientError } from '@/lib/security/safeApiError'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string; shiftId: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardStaffClaim)
  if (limited) return limited

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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const shiftId = context.params.shiftId
    const displayName = session.displayName.trim() || session.username

    const { data: updated, error } = await admin
      .from('dancecard_staff_shifts')
      .update({
        person_name: displayName,
        claimed_by_account_id: session.accountId,
        shift_status: 'assigned',
        person_id: null,
        dropped_at: null,
      })
      .eq('id', shiftId)
      .eq('event_id', event.id)
      .eq('shift_status', 'open')
      .select('id')
      .maybeSingle()

    if (error) throw error
    if (!updated) {
      return NextResponse.json({ error: 'Shift is not open for claiming' }, { status: 409 })
    }
    return NextResponse.json({ ok: true, shiftId: updated.id })
  } catch (e) {
    const { status, body } = toClientError(e, 'staff-shift-claim')
    return NextResponse.json(body, { status })
  }
}
