import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerProgramSlotPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { assertSlotInsideWindow } from '@/lib/dancecard/organizerSlotValidation'
import { fetchOrganizerProgramSlotById } from '@/lib/dancecard/organizerProgramSlotsData'
import { insertProgramSlotAudit } from '@/lib/dancecard/programSlotAudit'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import {
  buildSlotSnapshots,
  computeScheduleChangeImpact,
} from '@/lib/dancecard/scheduleChangeImpact'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const dto = await fetchOrganizerProgramSlotById(admin, eventId, context.params.slotId)
    if (!dto) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }
    return NextResponse.json({ slot: dto })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; slotId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const slotId = context.params.slotId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_program_slots')
      .select(
        'id, starts_at, ends_at, title, track, room, description, sort_order, location_id, is_published, visibility, is_frozen, track_id, photo_policy, organizer_notes_internal',
      )
      .eq('id', slotId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    const body = organizerProgramSlotPatchSchema.parse(await request.json())
    const startsAt =
      body.startsAt !== undefined ? body.startsAt : (existing.starts_at as string | null)
    const endsAt = body.endsAt !== undefined ? body.endsAt : (existing.ends_at as string | null)
    if (startsAt != null && endsAt != null) {
      assertSlotInsideWindow({
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        startsAt,
        endsAt,
      })
    }

    const patch: Record<string, unknown> = {}
    if (body.startsAt !== undefined) {
      patch.starts_at = body.startsAt === null ? null : new Date(body.startsAt).toISOString()
    }
    if (body.endsAt !== undefined) {
      patch.ends_at = body.endsAt === null ? null : new Date(body.endsAt).toISOString()
    }
    if (body.title !== undefined) patch.title = body.title
    if (body.track !== undefined) patch.track = body.track
    if (body.trackId !== undefined) patch.track_id = body.trackId
    if (body.room !== undefined) patch.room = body.room
    if (body.locationId !== undefined) patch.location_id = body.locationId
    if (body.description !== undefined) patch.description = body.description
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
    if (body.isPublished !== undefined) patch.is_published = body.isPublished
    if (body.visibility !== undefined) patch.visibility = body.visibility
    if (body.isFrozen !== undefined) patch.is_frozen = body.isFrozen
    if (body.photoPolicy !== undefined) patch.photo_policy = body.photoPolicy
    if (body.organizerNotesInternal !== undefined) patch.organizer_notes_internal = body.organizerNotesInternal

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await admin.from('dancecard_program_slots').update(patch).eq('id', slotId).eq('event_id', eventId)
    if (error) throw error

    await insertProgramSlotAudit(admin, {
      eventId,
      slotId,
      actorUserId: ctx.userId ?? null,
      action: 'patch',
      beforeJson: existing as Record<string, unknown>,
      afterJson: { ...existing, ...patch } as Record<string, unknown>,
    })

    const dto = await fetchOrganizerProgramSlotById(admin, eventId, slotId)
    if (!dto) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    const afterRow = { ...existing, ...patch }
    const { before, after } = await buildSlotSnapshots(admin, eventId, existing as Record<string, unknown>, afterRow)
    const scheduleImpact = await computeScheduleChangeImpact(
      admin,
      eventId,
      slotId,
      before,
      after,
      event.timezone,
    )

    return NextResponse.json({
      slot: dto,
      ...(scheduleImpact.scheduleChanged ? { scheduleImpact } : {}),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const slotId = context.params.slotId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_program_slots')
      .select('id, title, starts_at, ends_at, location_id, room')
      .eq('id', slotId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    const { error } = await admin.from('dancecard_program_slots').delete().eq('id', slotId).eq('event_id', eventId)
    if (error) throw error

    await insertProgramSlotAudit(admin, {
      eventId,
      slotId,
      actorUserId: ctx.userId ?? null,
      action: 'delete',
      beforeJson: existing as Record<string, unknown>,
      afterJson: null,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
