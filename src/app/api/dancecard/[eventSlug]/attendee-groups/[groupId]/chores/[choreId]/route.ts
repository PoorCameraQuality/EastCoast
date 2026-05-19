import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership } from '@/lib/dancecard/attendeeGroupsCore'
import { patchChoreSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { isMissingColumn, isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; choreId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const body = patchChoreSchema.parse(await request.json())

    if (body.signUp !== undefined) {
      const { data: chore, error: choreErr } = await ctx.admin
        .from('dancecard_attendee_group_chores')
        .select('id, slots_needed, assigned_account_id')
        .eq('id', context.params.choreId)
        .eq('group_id', context.params.groupId)
        .maybeSingle()
      if (choreErr) throw choreErr
      if (!chore) return NextResponse.json({ error: 'Chore not found' }, { status: 404 })

      const slotsNeeded = Math.max(1, (chore.slots_needed as number | undefined) ?? 1)

      if (body.signUp) {
        const { count, error: countErr } = await ctx.admin
          .from('dancecard_attendee_group_chore_signups')
          .select('account_id', { count: 'exact', head: true })
          .eq('chore_id', context.params.choreId)
        if (countErr && isMissingTable(countErr, 'dancecard_attendee_group_chore_signups')) {
          if (chore.assigned_account_id) {
            return NextResponse.json({ error: 'This chore is already taken' }, { status: 409 })
          }
          await ctx.admin
            .from('dancecard_attendee_group_chores')
            .update({ assigned_account_id: ctx.session.accountId })
            .eq('id', context.params.choreId)
          return NextResponse.json({ ok: true })
        }
        if (countErr) throw countErr
        if ((count ?? 0) >= slotsNeeded) {
          return NextResponse.json({ error: 'All slots are filled' }, { status: 409 })
        }
        const { error: insErr } = await ctx.admin.from('dancecard_attendee_group_chore_signups').insert({
          chore_id: context.params.choreId,
          account_id: ctx.session.accountId,
        })
        if (insErr && (insErr as { code?: string }).code !== '23505') throw insErr
      } else {
        const { error: delErr } = await ctx.admin
          .from('dancecard_attendee_group_chore_signups')
          .delete()
          .eq('chore_id', context.params.choreId)
          .eq('account_id', ctx.session.accountId)
        if (delErr && isMissingTable(delErr, 'dancecard_attendee_group_chore_signups')) {
          await ctx.admin
            .from('dancecard_attendee_group_chores')
            .update({ assigned_account_id: null })
            .eq('id', context.params.choreId)
            .eq('assigned_account_id', ctx.session.accountId)
        } else if (delErr) {
          throw delErr
        }
      }
      return NextResponse.json({ ok: true })
    }

    const patch: Record<string, unknown> = {}
    if (body.title !== undefined) patch.title = body.title.trim()
    if (body.assignedAccountId !== undefined) patch.assigned_account_id = body.assignedAccountId
    if (body.done !== undefined) patch.done = body.done
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
    if (body.slotsNeeded !== undefined) patch.slots_needed = body.slotsNeeded
    if (body.scheduleLabel !== undefined) patch.schedule_label = body.scheduleLabel.trim()

    let { error } = await ctx.admin
      .from('dancecard_attendee_group_chores')
      .update(patch)
      .eq('id', context.params.choreId)
      .eq('group_id', context.params.groupId)
    if (error && isMissingColumn(error, 'slots_needed')) {
      delete patch.slots_needed
      delete patch.schedule_label
      const retry = await ctx.admin
        .from('dancecard_attendee_group_chores')
        .update(patch)
        .eq('id', context.params.choreId)
        .eq('group_id', context.params.groupId)
      error = retry.error
    }
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-chore-patch')
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; choreId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_chores')
      .delete()
      .eq('id', context.params.choreId)
      .eq('group_id', context.params.groupId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-chore-delete')
  }
}
