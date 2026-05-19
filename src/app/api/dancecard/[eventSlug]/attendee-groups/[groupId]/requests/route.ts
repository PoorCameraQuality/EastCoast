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
    if (!isGroupAdmin(membership?.role)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('id, from_account_id, status, message, answers_json, created_at')
      .eq('group_id', context.params.groupId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) throw error

    const accounts = await loadAccountsBrief(
      ctx.admin,
      (data ?? []).map((r) => r.from_account_id as string),
    )

    const requests = (data ?? []).map((r) => {
      const a = accounts.get(r.from_account_id as string)
      return {
        id: r.id as string,
        status: r.status as string,
        message: r.message as string,
        answers: r.answers_json,
        createdAt: r.created_at as string,
        fromDisplayName: a?.displayName ?? 'Attendee',
        fromUsername: a?.username ?? '',
      }
    })

    return NextResponse.json({ requests })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-requests')
  }
}
