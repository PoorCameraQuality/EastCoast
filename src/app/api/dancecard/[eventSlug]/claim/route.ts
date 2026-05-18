import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { publicClaimBodySchema } from '@/lib/dancecard/schemas'
import { loadAvailabilityRange, loadPrefs, loadReservationsForAccount, loadSelections, selectionsToBusyInput } from '@/lib/dancecard/data'
import { computeFreeGapsForAccount, eventWindowFromRow, intervalFullyInsideWindow, parseIso } from '@/lib/dancecard/busy'
import { resolveHostIdFromShareToken } from '@/lib/dancecard/mutualHostResolve'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'
import { toClientError } from '@/lib/security/safeApiError'
import { ZodError } from 'zod'

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

    const body = publicClaimBodySchema.parse(await request.json())
    const hostId = await resolveHostIdFromShareToken(admin, event.id, body.shareToken)
    if (!hostId) {
      return NextResponse.json({ error: 'Share token not found' }, { status: 404 })
    }
    const eventWindow = eventWindowFromRow({
      window_starts_at: event.window_starts_at,
      window_ends_at: event.window_ends_at,
    })
    const availability = await loadAvailabilityRange(admin, hostId)
    const window = availability
      ? {
          start: parseIso(availability.startsAt),
          end: parseIso(availability.endsAt),
        }
      : eventWindow

    const start = parseIso(body.startsAt)
    const end = new Date(start.getTime() + body.durationMinutes * 60_000)
    const proposed = { start, end }
    if (end <= start) {
      return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
    }
    if (start < window.start || end > window.end) {
      return NextResponse.json({ error: 'Outside availability window' }, { status: 400 })
    }

    const hb = await loadPrefs(admin, hostId)
    const hs = await loadSelections(admin, hostId)
    const hr = await loadReservationsForAccount(admin, event.id, hostId)
    const hostFree = computeFreeGapsForAccount(window, hb.bufferMinutes, selectionsToBusyInput(hs), hr, hostId)
    if (!intervalFullyInsideWindow(proposed, hostFree)) {
      const overlapsReservation = hr
        .filter((r) => r.status === 'confirmed')
        .some((r) => {
          const s = parseIso(r.starts_at).getTime()
          const e = parseIso(r.ends_at).getTime()
          return proposed.start.getTime() < e && proposed.end.getTime() > s
        })
      const reason = overlapsReservation
        ? 'That time was just claimed by someone else.'
        : 'That time overlaps an unavailable or buffered window.'
      return NextResponse.json({ error: `${reason} Pick another green block.` }, { status: 409 })
    }

    const description = body.description?.trim() ? body.description.trim().slice(0, 150) : null
    const guestName = body.guestName.trim().slice(0, 80)

    const { data: row, error: insErr } = await admin
      .from('dancecard_reservations')
      .insert({
        event_id: event.id,
        host_account_id: hostId,
        guest_account_id: null,
        guest_name: guestName,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
        status: 'confirmed',
        note: description,
      })
      .select('id, starts_at, ends_at, status, guest_name, note')
      .single()
    if (insErr) {
      if (insErr.code === '23505') {
        return NextResponse.json({ error: 'Could not claim (conflict)' }, { status: 409 })
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
            guestName: row.guest_name,
            description: row.note,
          }
        : null,
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const { status, body: errBody } = toClientError(e, 'dancecard-claim')
    return NextResponse.json(errBody, { status })
  }
}

