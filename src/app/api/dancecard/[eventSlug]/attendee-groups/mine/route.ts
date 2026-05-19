import { NextRequest, NextResponse } from 'next/server'
import {
  countActiveMembers,
  loadAccountsBrief,
  mapPublicGroupListItem,
  type AttendeeGroupRow,
} from '@/lib/dancecard/attendeeGroupsCore'
import { loadAttendeeGroupsContext } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: memberships, error: mErr } = await ctx.admin
      .from('dancecard_attendee_group_members')
      .select('group_id, role')
      .eq('account_id', ctx.session.accountId)
      .eq('status', 'active')
    if (mErr) {
      if ((mErr as { code?: string }).code === '42P01') {
        return NextResponse.json({ memberships: [], pendingApplications: [], pendingOwnerCount: 0 })
      }
      throw mErr
    }

    const groupIds = (memberships ?? []).map((m) => m.group_id as string)
    let memberGroups: ReturnType<typeof mapPublicGroupListItem>[] = []
    if (groupIds.length) {
      const { data: groups } = await ctx.admin
        .from('dancecard_attendee_groups')
        .select('*')
        .in('id', groupIds)
        .eq('event_id', ctx.event.id)
        .neq('status', 'removed_by_mod')
      const rows = (groups ?? []) as AttendeeGroupRow[]
      const owners = await loadAccountsBrief(ctx.admin, rows.map((g) => g.created_by_account_id))
      const counts = await Promise.all(rows.map((g) => countActiveMembers(ctx.admin, g.id)))
      memberGroups = rows.map((g, i) => ({
        ...mapPublicGroupListItem(g, counts[i], owners.get(g.created_by_account_id), ctx.session!.accountId),
        myRole: memberships!.find((m) => m.group_id === g.id)?.role as string,
      }))
    }

    const { data: pending } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('id, group_id, status, created_at')
      .eq('from_account_id', ctx.session.accountId)
      .eq('status', 'pending')

    let ownerPending = 0
    if (groupIds.length) {
      const adminGroupIds = (memberships ?? [])
        .filter((m) => m.role === 'owner' || m.role === 'admin')
        .map((m) => m.group_id as string)
      if (adminGroupIds.length) {
        const { count } = await ctx.admin
          .from('dancecard_attendee_group_join_requests')
          .select('id', { count: 'exact', head: true })
          .in('group_id', adminGroupIds)
          .eq('status', 'pending')
        ownerPending = count ?? 0
      }
    }

    return NextResponse.json({
      memberships: memberGroups,
      pendingApplications: pending ?? [],
      pendingOwnerCount: ownerPending,
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-groups-mine')
  }
}
