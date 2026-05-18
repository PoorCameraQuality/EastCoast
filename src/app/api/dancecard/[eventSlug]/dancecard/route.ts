import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { dancecardPutSchema } from '@/lib/dancecard/schemas'
import { eventWindowFromRow, parseIso } from '@/lib/dancecard/busy'
import { slotVisibleToAttendee } from '@/lib/dancecard/programSlotPublication'
import { ZodError } from 'zod'

export async function PUT(
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
    const isStaff = Boolean(session.isStaff)
    const body = dancecardPutSchema.parse(await request.json())
    if (body.bufferMinutes % 15 !== 0) {
      return NextResponse.json({ error: 'bufferMinutes must be a multiple of 15' }, { status: 400 })
    }
    const eventWindow = eventWindowFromRow({
      window_starts_at: event.window_starts_at,
      window_ends_at: event.window_ends_at,
    })
    const requestedAvailabilityStart = parseIso(body.availabilityStartsAt)
    const requestedAvailabilityEnd = parseIso(body.availabilityEndsAt)
    if (requestedAvailabilityEnd <= requestedAvailabilityStart) {
      return NextResponse.json({ error: 'availabilityEndsAt must be after availabilityStartsAt' }, { status: 400 })
    }
    const availabilityStart = new Date(Math.max(requestedAvailabilityStart.getTime(), eventWindow.start.getTime()))
    const availabilityEnd = new Date(Math.min(requestedAvailabilityEnd.getTime(), eventWindow.end.getTime()))
    if (availabilityEnd <= availabilityStart) {
      return NextResponse.json({ error: 'Availability range must overlap the event window' }, { status: 400 })
    }

    const { data: currentRows, error: curErr } = await admin
      .from('dancecard_selections')
      .select('slot_id, kind')
      .eq('account_id', session.accountId)
    if (curErr) throw curErr
    const prevProgramSlotIds = new Set(
      (currentRows ?? [])
        .filter((r) => r.kind === 'program' && r.slot_id)
        .map((r) => r.slot_id as string),
    )
    const nextProgramSlotIds = new Set(
      body.selections.filter((s) => s.kind === 'program' && s.slotId).map((s) => s.slotId as string),
    )

    const normalized: {
      slot_id: string | null
      starts_at: string
      ends_at: string
      kind: string
      note: string | null
    }[] = []

    for (const sel of body.selections) {
      const start = parseIso(sel.startsAt)
      const end = parseIso(sel.endsAt)
      if (end <= start) {
        return NextResponse.json({ error: 'Each selection needs endsAt > startsAt' }, { status: 400 })
      }
      if (start < availabilityStart || end > availabilityEnd) {
        return NextResponse.json({ error: 'Selections must fall inside your availability range' }, { status: 400 })
      }
      if (sel.kind === 'program') {
        if (!sel.slotId) {
          return NextResponse.json({ error: 'program selections require slotId' }, { status: 400 })
        }
        const { data: slot, error: slotErr } = await admin
          .from('dancecard_program_slots')
          .select('id, starts_at, ends_at, is_published, visibility, is_frozen')
          .eq('id', sel.slotId)
          .eq('event_id', event.id)
          .maybeSingle()
        if (slotErr) throw slotErr
        if (!slot) {
          return NextResponse.json({ error: `Unknown slot ${sel.slotId}` }, { status: 400 })
        }
        const pub = {
          is_published: slot.is_published !== undefined ? Boolean(slot.is_published) : true,
          visibility: (slot.visibility as string) || 'public',
          is_frozen: Boolean(slot.is_frozen),
        }
        if (!slotVisibleToAttendee(pub, isStaff)) {
          return NextResponse.json({ error: `Slot ${sel.slotId} is not available for your account` }, { status: 400 })
        }
        const slotStart = parseIso(slot.starts_at as string)
        const slotEnd = parseIso(slot.ends_at as string)
        if (slotStart.getTime() !== start.getTime() || slotEnd.getTime() !== end.getTime()) {
          return NextResponse.json(
            { error: 'Program selection times must match the official slot' },
            { status: 400 }
          )
        }
        const note = sel.note?.trim() ? sel.note.trim().slice(0, 1000) : null
        normalized.push({
          slot_id: slot.id,
          starts_at: sel.startsAt,
          ends_at: sel.endsAt,
          kind: 'program',
          note,
        })
      } else {
        const note = sel.note?.trim() ? sel.note.trim().slice(0, 1000) : null
        normalized.push({
          slot_id: null,
          starts_at: sel.startsAt,
          ends_at: sel.endsAt,
          kind: 'manual',
          note,
        })
      }
    }

    for (const id of Array.from(prevProgramSlotIds)) {
      if (nextProgramSlotIds.has(id)) continue
      const { data: slot, error: sErr } = await admin
        .from('dancecard_program_slots')
        .select('is_frozen')
        .eq('id', id)
        .eq('event_id', event.id)
        .maybeSingle()
      if (sErr) throw sErr
      if (slot?.is_frozen) {
        return NextResponse.json(
          { error: 'Cannot remove frozen program sessions from your dancecard. Ask an organizer to unfreeze first.' },
          { status: 400 },
        )
      }
    }
    for (const id of Array.from(nextProgramSlotIds)) {
      if (prevProgramSlotIds.has(id)) continue
      const { data: slot, error: sErr } = await admin
        .from('dancecard_program_slots')
        .select('is_frozen')
        .eq('id', id)
        .eq('event_id', event.id)
        .maybeSingle()
      if (sErr) throw sErr
      if (slot?.is_frozen) {
        return NextResponse.json(
          { error: 'Cannot add frozen program sessions to your dancecard. Ask an organizer to unfreeze first.' },
          { status: 400 },
        )
      }
    }

    const { error: delErr } = await admin
      .from('dancecard_selections')
      .delete()
      .eq('account_id', session.accountId)
    if (delErr) throw delErr

    const { error: upPref } = await admin
      .from('dancecard_prefs')
      .update({
        buffer_minutes: body.bufferMinutes,
        availability_starts_at: availabilityStart.toISOString(),
        availability_ends_at: availabilityEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('account_id', session.accountId)
    if (upPref) throw upPref

    if (normalized.length) {
      const { error: insErr } = await admin.from('dancecard_selections').insert(
        normalized.map((n) => ({
          account_id: session.accountId,
          slot_id: n.slot_id,
          starts_at: n.starts_at,
          ends_at: n.ends_at,
          kind: n.kind,
          note: n.note,
        })),
      )
      if (insErr) throw insErr
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-dancecard')
  }
}
