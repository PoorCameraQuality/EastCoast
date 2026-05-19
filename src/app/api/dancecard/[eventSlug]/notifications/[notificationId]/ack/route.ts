import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; notificationId: string } },
) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date().toISOString()
    const { error } = await admin
      .from('dancecard_account_notifications')
      .update({ status: 'read', read_at: now })
      .eq('id', context.params.notificationId)
      .eq('account_id', account.accountId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'notification-ack')
  }
}
