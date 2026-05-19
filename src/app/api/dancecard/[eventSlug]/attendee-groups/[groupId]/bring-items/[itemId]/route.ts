import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership } from '@/lib/dancecard/attendeeGroupsCore'
import { patchBringItemSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; itemId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const body = patchBringItemSchema.parse(await request.json())
    const patch: Record<string, unknown> = {}
    if (body.itemLabel !== undefined) patch.item_label = body.itemLabel.trim()
    if (body.quantity !== undefined) patch.quantity = body.quantity
    if (body.notes !== undefined) patch.notes = body.notes.trim()
    if (body.claimedByAccountId !== undefined) {
      if (body.claimedByAccountId && body.claimedByAccountId !== ctx.session.accountId) {
        return NextResponse.json({ error: 'Can only claim for yourself' }, { status: 403 })
      }
      patch.claimed_by_account_id = body.claimedByAccountId
    }

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_bring_items')
      .update(patch)
      .eq('id', context.params.itemId)
      .eq('group_id', context.params.groupId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-bring-patch')
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; itemId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_bring_items')
      .delete()
      .eq('id', context.params.itemId)
      .eq('group_id', context.params.groupId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-bring-delete')
  }
}
