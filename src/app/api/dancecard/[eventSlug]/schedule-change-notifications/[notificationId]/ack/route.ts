import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string; notificationId: string } }) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const status = body.status === 'dismissed' ? 'dismissed' : 'acknowledged'
    const { error } = await admin
      .from('dancecard_schedule_change_notifications')
      .update({ status, acknowledged_at: new Date().toISOString() })
      .eq('id', context.params.notificationId)
      .eq('event_id', account.eventId)
      .eq('account_id', account.accountId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-schedule-change-notifications-[notificationId]-ack')
  }
}
