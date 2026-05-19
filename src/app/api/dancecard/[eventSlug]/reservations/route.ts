import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { cancelReservationBodySchema } from '@/lib/dancecard/schemas'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_reservations')
      .select('id, host_account_id, guest_account_id, guest_name, starts_at, ends_at, status, note, created_at')
      .eq('event_id', event.id)
      .or(`host_account_id.eq.${session.accountId},guest_account_id.eq.${session.accountId}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    const list = rows ?? []
    if (!list.length) {
      return NextResponse.json({ reservations: [] })
    }
    const ids = Array.from(
      new Set(list.flatMap((r) => [r.host_account_id, r.guest_account_id]).filter((x): x is string => Boolean(x)))
    )
    const { data: names } = await admin.from('dancecard_accounts').select('id, display_name').in('id', ids)
    const nameBy = new Map((names ?? []).map((n) => [n.id, n.display_name as string]))
    return NextResponse.json({
      reservations: list.map((b) => ({
        id: b.id,
        status: b.status,
        startsAt: b.starts_at,
        endsAt: b.ends_at,
        note: b.note,
        role: b.host_account_id === session.accountId ? 'host' : 'guest',
        host: { id: b.host_account_id, displayName: nameBy.get(b.host_account_id) ?? '?' },
        guest: {
          id: b.guest_account_id ?? `guest:${b.id}`,
          displayName: b.guest_account_id
            ? nameBy.get(b.guest_account_id) ?? '?'
            : (b.guest_name as string | null) ?? 'Guest',
        },
        createdAt: b.created_at,
      })),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-reservations')
  }
}

/** Soft-cancel a reservation (host or guest on that row). */
export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = cancelReservationBodySchema.parse(await request.json())

    const { data: row, error: fetchErr } = await admin
      .from('dancecard_reservations')
      .select('id, host_account_id, guest_account_id, status')
      .eq('id', body.reservationId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (fetchErr) throw fetchErr
    if (!row) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }
    const isHost = row.host_account_id === session.accountId
    const isGuest = row.guest_account_id === session.accountId
    if (!isHost && !isGuest) {
      return NextResponse.json({ error: 'Not allowed to cancel this reservation' }, { status: 403 })
    }
    if (row.status !== 'confirmed') {
      return NextResponse.json({ error: 'Reservation is not active' }, { status: 400 })
    }

    const { error: updErr } = await admin
      .from('dancecard_reservations')
      .update({ status: 'cancelled' })
      .eq('id', body.reservationId)
      .eq('event_id', event.id)
    if (updErr) throw updErr

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-reservations-post')
  }
}
