import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await admin
      .from('dancecard_account_notifications')
      .select('id, kind, payload, status, created_at')
      .eq('event_id', account.eventId)
      .eq('account_id', account.accountId)
      .neq('status', 'dismissed')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error?.code === '42P01') {
      return NextResponse.json({ notifications: [], needsMigration: 'dancecard_056_account_notifications.sql' })
    }
    if (error) throw error

    return NextResponse.json({
      notifications: (data ?? []).map((r) => ({
        id: r.id,
        kind: r.kind,
        payload: r.payload,
        status: r.status,
        createdAt: r.created_at,
      })),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'notifications-get')
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await request.json()) as { markAllRead?: boolean; dismissIds?: string[] }
    const now = new Date().toISOString()

    if (body.markAllRead) {
      await admin
        .from('dancecard_account_notifications')
        .update({ status: 'read', read_at: now })
        .eq('event_id', account.eventId)
        .eq('account_id', account.accountId)
        .eq('status', 'unread')
    }

    if (body.dismissIds?.length) {
      await admin
        .from('dancecard_account_notifications')
        .update({ status: 'dismissed' })
        .eq('event_id', account.eventId)
        .eq('account_id', account.accountId)
        .in('id', body.dismissIds)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'notifications-patch')
  }
}
