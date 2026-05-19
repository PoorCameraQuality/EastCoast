import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership } from '@/lib/dancecard/attendeeGroupsCore'
import { patchChoreSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
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
    const patch: Record<string, unknown> = {}
    if (body.title !== undefined) patch.title = body.title.trim()
    if (body.assignedAccountId !== undefined) patch.assigned_account_id = body.assignedAccountId
    if (body.done !== undefined) patch.done = body.done
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_chores')
      .update(patch)
      .eq('id', context.params.choreId)
      .eq('group_id', context.params.groupId)
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
