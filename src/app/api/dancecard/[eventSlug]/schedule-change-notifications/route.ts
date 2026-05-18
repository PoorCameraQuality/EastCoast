import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data, error } = await admin
      .from('dancecard_schedule_change_notifications')
      .select('id, program_slot_id, old_snapshot, new_snapshot, conflict_summary, status, created_at')
      .eq('event_id', account.eventId)
      .eq('account_id', account.accountId)
      .neq('status', 'dismissed')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return NextResponse.json({ notifications: data ?? [] })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-schedule-change-notifications')
  }
}
