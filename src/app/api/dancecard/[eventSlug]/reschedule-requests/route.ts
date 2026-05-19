import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getDancecardAdmin, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { toClientError } from '@/lib/security/safeApiError'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  recipientAccountId: z.string().uuid(),
  reservationId: z.string().uuid().optional().nullable(),
  proposedStartsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid start'),
  proposedEndsAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid end'),
  note: z.string().max(1000).optional().nullable(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardToken)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const account = await resolveAccountFromSession(admin, request, context.params.eventSlug)
    if (!account) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = bodySchema.parse(await request.json())
    if (Date.parse(body.proposedEndsAt) <= Date.parse(body.proposedStartsAt)) {
      return NextResponse.json({ error: 'End must be after start' }, { status: 400 })
    }

    const { data: recipient, error: recErr } = await admin
      .from('dancecard_accounts')
      .select('id')
      .eq('id', body.recipientAccountId)
      .eq('event_id', account.eventId)
      .maybeSingle()
    if (recErr) throw recErr
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

    const requesterId = account.accountId
    if (body.reservationId) {
      const { data: reservation, error: resErr } = await admin
        .from('dancecard_reservations')
        .select('id, host_account_id, guest_account_id')
        .eq('id', body.reservationId)
        .eq('event_id', account.eventId)
        .maybeSingle()
      if (resErr) throw resErr
      if (!reservation) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
      }
      const hostId = reservation.host_account_id as string
      const guestId = reservation.guest_account_id as string | null
      const involved =
        requesterId === hostId ||
        requesterId === guestId ||
        body.recipientAccountId === hostId ||
        body.recipientAccountId === guestId
      if (!involved) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      const { data: shared, error: sharedErr } = await admin
        .from('dancecard_reservations')
        .select('id')
        .eq('event_id', account.eventId)
        .or(
          `and(host_account_id.eq.${requesterId},guest_account_id.eq.${body.recipientAccountId}),and(host_account_id.eq.${body.recipientAccountId},guest_account_id.eq.${requesterId})`
        )
        .limit(1)
      if (sharedErr) throw sharedErr
      if (!shared?.length) {
        return NextResponse.json({ error: 'reservationId required' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('dancecard_reschedule_requests')
      .insert({
        event_id: account.eventId,
        requester_account_id: account.accountId,
        recipient_account_id: body.recipientAccountId,
        reservation_id: body.reservationId ?? null,
        proposed_starts_at: new Date(body.proposedStartsAt).toISOString(),
        proposed_ends_at: new Date(body.proposedEndsAt).toISOString(),
        note: body.note ?? null,
      })
      .select('id, status, created_at')
      .single()
    if (error) throw error
    return NextResponse.json({ request: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const { status, body } = toClientError(e, 'reschedule-request')
    return NextResponse.json(body, { status })
  }
}
