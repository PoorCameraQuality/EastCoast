import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { reserveBodySchema } from '@/lib/dancecard/schemas'
import { resolveReserveHostId } from '@/lib/dancecard/mutualHostResolve'
import { loadPrefs, loadReservationsForAccount, loadSelections, selectionsToBusyInput } from '@/lib/dancecard/data'
import { computeMutualFree, eventWindowFromRow, parseIso, intervalFullyInsideWindow } from '@/lib/dancecard/busy'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { toClientError } from '@/lib/security/safeApiError'
import { ZodError } from 'zod'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardToken)
  if (limited) return limited

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
    const body = reserveBodySchema.parse(await request.json())
    const resolved = await resolveReserveHostId(admin, event.id, body, session.accountId)
    if (!resolved.ok) {
      if (resolved.reason === 'self') {
        return NextResponse.json({ error: 'Cannot book yourself' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Could not load host for this request.' }, { status: 404 })
    }
    const hostId = resolved.hostId

    const window = eventWindowFromRow({
      window_starts_at: event.window_starts_at,
      window_ends_at: event.window_ends_at,
    })
    const proposed = { start: parseIso(body.startsAt), end: parseIso(body.endsAt) }
    if (proposed.end <= proposed.start) {
      return NextResponse.json({ error: 'Invalid window' }, { status: 400 })
    }
    if (proposed.start < window.start || proposed.end > window.end) {
      return NextResponse.json({ error: 'Outside event window' }, { status: 400 })
    }

    const hb = await loadPrefs(admin, hostId)
    const hs = await loadSelections(admin, hostId)
    const hr = await loadReservationsForAccount(admin, event.id, hostId)
    const vb = await loadPrefs(admin, session.accountId)
    const vs = await loadSelections(admin, session.accountId)
    const vr = await loadReservationsForAccount(admin, event.id, session.accountId)
    const mutual = computeMutualFree(
      window,
      hb.bufferMinutes,
      selectionsToBusyInput(hs),
      hr,
      hostId,
      vb.bufferMinutes,
      selectionsToBusyInput(vs),
      vr,
      session.accountId
    )
    if (!intervalFullyInsideWindow(proposed, mutual)) {
      return NextResponse.json({ error: 'That time is not mutually free' }, { status: 400 })
    }

    const { data: row, error: insErr } = await admin
      .from('dancecard_reservations')
      .insert({
        event_id: event.id,
        host_account_id: hostId,
        guest_account_id: session.accountId,
        guest_name: null,
        starts_at: body.startsAt,
        ends_at: body.endsAt,
        status: 'confirmed',
        note: body.note ?? null,
      })
      .select('id, starts_at, ends_at, status')
      .single()
    if (insErr) {
      if (insErr.code === '23505') {
        return NextResponse.json({ error: 'Could not reserve (conflict)' }, { status: 409 })
      }
      throw insErr
    }

    return NextResponse.json({
      reservation: row
        ? {
            id: row.id,
            status: row.status,
            startsAt: row.starts_at,
            endsAt: row.ends_at,
          }
        : null,
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const { status, body } = toClientError(e, 'dancecard-reserve')
    return NextResponse.json(body, { status })
  }
}
