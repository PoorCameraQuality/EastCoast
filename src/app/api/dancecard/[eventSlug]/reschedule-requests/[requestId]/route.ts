import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDancecardAdmin, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { insertAccountNotification } from '@/lib/dancecard/accountNotifications'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  action: z.enum(['accept', 'decline', 'cancel']),
})

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; requestId: string } },
) {
  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = bodySchema.parse(await request.json())
    const { data: row, error: fetchErr } = await admin
      .from('dancecard_reschedule_requests')
      .select('*')
      .eq('id', context.params.requestId)
      .eq('event_id', account.eventId)
      .maybeSingle()

    if (fetchErr) throw fetchErr
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const requesterId = row.requester_account_id as string
    const recipientId = row.recipient_account_id as string
    const isRequester = account.accountId === requesterId
    const isRecipient = account.accountId === recipientId

    if (body.action === 'cancel' && !isRequester) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if ((body.action === 'accept' || body.action === 'decline') && !isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status =
      body.action === 'accept' ? 'accepted' : body.action === 'decline' ? 'declined' : 'cancelled'

    const { error: updErr } = await admin
      .from('dancecard_reschedule_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', context.params.requestId)

    if (updErr) throw updErr

    if (body.action === 'accept' && row.reservation_id) {
      await admin
        .from('dancecard_reservations')
        .update({
          starts_at: row.proposed_starts_at,
          ends_at: row.proposed_ends_at,
        })
        .eq('id', row.reservation_id)
        .eq('event_id', account.eventId)
    }

    const notifyId = isRequester ? recipientId : requesterId
    await insertAccountNotification(admin, {
      eventId: account.eventId,
      accountId: notifyId,
      kind: 'reschedule',
      payload: { requestId: context.params.requestId, action: body.action },
    })

    return NextResponse.json({ ok: true, status })
  } catch (e) {
    return jsonFromRouteError(e, 'reschedule-request-patch')
  }
}
