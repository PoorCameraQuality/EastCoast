import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership, isGroupOwner } from '@/lib/dancecard/attendeeGroupsCore'
import { transferOwnerSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!isGroupOwner(membership?.role)) {
      return NextResponse.json({ error: 'Only the owner can transfer ownership' }, { status: 403 })
    }

    const { accountId } = transferOwnerSchema.parse(await request.json())
    const target = await getMembership(ctx.admin, context.params.groupId, accountId)
    if (!target) return NextResponse.json({ error: 'That person is not an active member' }, { status: 400 })

    await ctx.admin
      .from('dancecard_attendee_group_members')
      .update({ role: 'owner' })
      .eq('group_id', context.params.groupId)
      .eq('account_id', accountId)
      .eq('status', 'active')

    await ctx.admin
      .from('dancecard_attendee_group_members')
      .update({ role: 'admin' })
      .eq('group_id', context.params.groupId)
      .eq('account_id', ctx.session.accountId)
      .eq('status', 'active')

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-transfer')
  }
}
