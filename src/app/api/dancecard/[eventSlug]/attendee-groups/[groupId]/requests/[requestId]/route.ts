import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  addMember,
  countActiveMembers,
  getMembership,
  isGroupAdmin,
  syncRecruitmentFull,
} from '@/lib/dancecard/attendeeGroupsCore'
import { respondJoinRequestSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import type { AttendeeGroupRow } from '@/lib/dancecard/attendeeGroupsCore'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; requestId: string } },
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

    const body = respondJoinRequestSchema.parse(await request.json())
    const { data: row, error: fErr } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('id, from_account_id, status, group_id')
      .eq('id', context.params.requestId)
      .eq('group_id', context.params.groupId)
      .maybeSingle()
    if (fErr) throw fErr
    if (!row || row.status !== 'pending') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const status = body.action === 'accept' ? 'accepted' : 'declined'
    const { error: uErr } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', context.params.requestId)
    if (uErr) throw uErr

    if (status === 'accepted') {
      const g = group as AttendeeGroupRow
      const memberCount = await countActiveMembers(ctx.admin, g.id)
      if (g.capacity_max != null && memberCount >= g.capacity_max) {
        return NextResponse.json({ error: 'Group is at capacity' }, { status: 409 })
      }
      const existing = await getMembership(ctx.admin, g.id, row.from_account_id as string)
      if (!existing) {
        await addMember(ctx.admin, g.id, row.from_account_id as string, 'member')
        await syncRecruitmentFull(ctx.admin, g.id, g.capacity_max)
      }
    }

    return NextResponse.json({ ok: true, status })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-request-respond')
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; requestId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: row } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('from_account_id, status')
      .eq('id', context.params.requestId)
      .eq('group_id', context.params.groupId)
      .maybeSingle()
    if (!row || row.status !== 'pending') {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    if (row.from_account_id !== ctx.session.accountId) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('id', context.params.requestId)

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-request-withdraw')
  }
}
