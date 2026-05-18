import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerSlotPeoplePutSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

async function assertSlotForEvent(
  admin: Awaited<ReturnType<typeof requireOrganizerForSlug>>['admin'],
  eventId: string,
  slotId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from('dancecard_program_slots')
    .select('id')
    .eq('id', slotId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slotId = context.params.slotId
    const ok = await assertSlotForEvent(admin, eventId, slotId)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: rows, error } = await admin
      .from('dancecard_program_slot_persons')
      .select('id, person_id, role, sort_order, is_public_on_schedule')
      .eq('slot_id', slotId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    const pids = Array.from(new Set((rows ?? []).map((r) => r.person_id as string)))
    const nameById: Record<string, string> = {}
    if (pids.length) {
      const { data: people, error: pe } = await admin.from('dancecard_persons').select('id, scene_name').in('id', pids)
      if (pe) throw pe
      for (const p of people ?? []) nameById[p.id as string] = String(p.scene_name ?? '')
    }

    const assignments = (rows ?? []).map((r) => ({
      id: r.id as string,
      personId: r.person_id as string,
      sceneName: nameById[r.person_id as string] ?? '',
      role: r.role as string,
      sortOrder: Number(r.sort_order ?? 0),
      isPublicOnSchedule: Boolean(r.is_public_on_schedule),
    }))
    return NextResponse.json({ assignments })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PUT(request: NextRequest, context: { params: { eventSlug: string; slotId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slotId = context.params.slotId
    const ok = await assertSlotForEvent(admin, eventId, slotId)
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = organizerSlotPeoplePutSchema.parse(await request.json())
    const personIds = Array.from(new Set(body.assignments.map((a) => a.personId)))
    if (personIds.length) {
      const { data: people, error: pErr } = await admin
        .from('dancecard_persons')
        .select('id')
        .eq('event_id', eventId)
        .in('id', personIds)
      if (pErr) throw pErr
      if ((people ?? []).length !== personIds.length) {
        return NextResponse.json({ error: 'One or more people are not in this event' }, { status: 400 })
      }
    }

    const { error: delErr } = await admin.from('dancecard_program_slot_persons').delete().eq('slot_id', slotId)
    if (delErr) throw delErr

    if (body.assignments.length) {
      const inserts = body.assignments.map((a, i) => ({
        slot_id: slotId,
        person_id: a.personId,
        role: a.role,
        sort_order: a.sortOrder ?? i,
        is_public_on_schedule: a.isPublicOnSchedule ?? true,
      }))
      const { error: insErr } = await admin.from('dancecard_program_slot_persons').insert(inserts)
      if (insErr) throw insErr
    }

    const { data: rows, error } = await admin
      .from('dancecard_program_slot_persons')
      .select('id, person_id, role, sort_order, is_public_on_schedule')
      .eq('slot_id', slotId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    const pids = Array.from(new Set((rows ?? []).map((r) => r.person_id as string)))
    const nameById: Record<string, string> = {}
    if (pids.length) {
      const { data: people, error: pe } = await admin.from('dancecard_persons').select('id, scene_name').in('id', pids)
      if (pe) throw pe
      for (const p of people ?? []) nameById[p.id as string] = String(p.scene_name ?? '')
    }
    const assignments = (rows ?? []).map((r) => ({
      id: r.id as string,
      personId: r.person_id as string,
      sceneName: nameById[r.person_id as string] ?? '',
      role: r.role as string,
      sortOrder: Number(r.sort_order ?? 0),
      isPublicOnSchedule: Boolean(r.is_public_on_schedule),
    }))
    return NextResponse.json({ assignments })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
