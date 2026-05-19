import { NextRequest, NextResponse } from 'next/server'
import { getMembership, isGroupAdmin, loadAccountsBrief } from '@/lib/dancecard/attendeeGroupsCore'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(
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
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_members')
      .select('account_id, role, joined_at')
      .eq('group_id', context.params.groupId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true })
    if (error) throw error

    const accounts = await loadAccountsBrief(
      ctx.admin,
      (data ?? []).map((m) => m.account_id as string),
    )

    const members = (data ?? []).map((m) => {
      const a = accounts.get(m.account_id as string)
      return {
        accountId: m.account_id as string,
        role: m.role as string,
        joinedAt: m.joined_at as string,
        displayName: a?.displayName ?? 'Attendee',
        username: a?.username ?? '',
      }
    })

    return NextResponse.json({ members })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-members')
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const accountId = url.searchParams.get('accountId')
    if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!isGroupAdmin(membership?.role)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_members')
      .update({ status: 'removed' })
      .eq('group_id', context.params.groupId)
      .eq('account_id', accountId)
      .eq('status', 'active')
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-member-remove')
  }
}
