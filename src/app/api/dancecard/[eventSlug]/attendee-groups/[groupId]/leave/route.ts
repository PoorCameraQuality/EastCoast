import { NextRequest, NextResponse } from 'next/server'
import { getMembership, isGroupOwner } from '@/lib/dancecard/attendeeGroupsCore'
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
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 400 })

    if (isGroupOwner(membership.role)) {
      const { count } = await ctx.admin
        .from('dancecard_attendee_group_members')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', context.params.groupId)
        .eq('status', 'active')
        .eq('role', 'owner')
      if ((count ?? 0) <= 1) {
        const { count: otherAdmins } = await ctx.admin
          .from('dancecard_attendee_group_members')
          .select('id', { count: 'exact', head: true })
          .eq('group_id', context.params.groupId)
          .eq('status', 'active')
          .neq('account_id', ctx.session.accountId)
        if ((otherAdmins ?? 0) === 0) {
          return NextResponse.json(
            { error: 'Transfer ownership or archive the group before leaving.' },
            { status: 400 },
          )
        }
      }
    }

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_members')
      .update({ status: 'left' })
      .eq('group_id', context.params.groupId)
      .eq('account_id', ctx.session.accountId)
      .eq('status', 'active')
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-leave')
  }
}
