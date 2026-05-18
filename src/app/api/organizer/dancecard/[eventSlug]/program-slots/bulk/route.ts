import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerProgramSlotsBulkSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = organizerProgramSlotsBulkSchema.parse(await request.json())

    const assertIdsBelong = async (ids: string[]) => {
      const { data, error } = await admin
        .from('dancecard_program_slots')
        .select('id')
        .eq('event_id', eventId)
        .in('id', ids)
      if (error) throw error
      const ok = new Set((data ?? []).map((r) => r.id as string))
      for (const id of ids) {
        if (!ok.has(id)) {
          return NextResponse.json({ error: `Slot not in event: ${id}` }, { status: 400 })
        }
      }
      return null
    }

    const gate = await assertIdsBelong(body.ids)
    if (gate) return gate

    if (body.op === 'publish') {
      const { error } = await admin
        .from('dancecard_program_slots')
        .update({ is_published: true })
        .eq('event_id', eventId)
        .in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'unpublish') {
      const { error } = await admin
        .from('dancecard_program_slots')
        .update({ is_published: false })
        .eq('event_id', eventId)
        .in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'setVisibility') {
      const { error } = await admin
        .from('dancecard_program_slots')
        .update({ visibility: body.visibility })
        .eq('event_id', eventId)
        .in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'freeze') {
      const { error } = await admin
        .from('dancecard_program_slots')
        .update({ is_frozen: true })
        .eq('event_id', eventId)
        .in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'unfreeze') {
      const { error } = await admin
        .from('dancecard_program_slots')
        .update({ is_frozen: false })
        .eq('event_id', eventId)
        .in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'delete') {
      const { error } = await admin.from('dancecard_program_slots').delete().eq('event_id', eventId).in('id', body.ids)
      if (error) throw error
    } else if (body.op === 'duplicate') {
      for (const id of body.ids) {
        const { data: row, error: rErr } = await admin
          .from('dancecard_program_slots')
          .select('*')
          .eq('id', id)
          .eq('event_id', eventId)
          .maybeSingle()
        if (rErr) throw rErr
        if (!row) continue
        const { id: _omit, ...rest } = row as Record<string, unknown> & { id: string }
        const insertPayload = {
          ...rest,
          event_id: eventId,
          title: `${String(rest.title)} (copy)`,
        }
        delete (insertPayload as { id?: string }).id
        const { data: ins, error: insErr } = await admin
          .from('dancecard_program_slots')
          .insert(insertPayload)
          .select('id')
          .single()
        if (insErr) throw insErr
        const newId = ins?.id as string
        const { data: tagLinks } = await admin.from('dancecard_program_slot_tags').select('tag_id').eq('slot_id', id)
        if (tagLinks?.length) {
          await admin
            .from('dancecard_program_slot_tags')
            .insert(tagLinks.map((l) => ({ slot_id: newId, tag_id: l.tag_id })))
        }
      }
    } else if (body.op === 'tagAdd') {
      const { data: tags, error: tErr } = await admin
        .from('dancecard_tags')
        .select('id')
        .eq('event_id', eventId)
        .eq('scope', 'session')
        .in('id', body.tagIds)
      if (tErr) throw tErr
      const okTags = new Set((tags ?? []).map((t) => t.id as string))
      for (const tid of body.tagIds) {
        if (!okTags.has(tid)) {
          return NextResponse.json({ error: `Unknown session tag for event: ${tid}` }, { status: 400 })
        }
      }
      const rows = body.ids.flatMap((sid) => body.tagIds.map((tag_id) => ({ slot_id: sid, tag_id })))
      const { error: insErr } = await admin
        .from('dancecard_program_slot_tags')
        .upsert(rows, { onConflict: 'slot_id,tag_id', ignoreDuplicates: true })
      if (insErr) throw insErr
    } else if (body.op === 'tagRemove') {
      const { error } = await admin
        .from('dancecard_program_slot_tags')
        .delete()
        .in('slot_id', body.ids)
        .in('tag_id', body.tagIds)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
