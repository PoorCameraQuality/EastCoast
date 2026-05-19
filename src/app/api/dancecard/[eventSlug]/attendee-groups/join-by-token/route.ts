import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  addMember,
  countActiveMembers,
  getMembership,
  syncRecruitmentFull,
} from '@/lib/dancecard/attendeeGroupsCore'
import { joinByTokenSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token } = joinByTokenSchema.parse(await request.json())
    const { data: group, error } = await ctx.admin
      .from('dancecard_attendee_groups')
      .select('id, status, join_mode, capacity_max, recruitment_status')
      .eq('event_id', ctx.event.id)
      .eq('invite_token', token)
      .eq('status', 'active')
      .maybeSingle()
    if (error) throw error
    if (!group) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })

    const existing = await getMembership(ctx.admin, group.id as string, ctx.session.accountId)
    if (existing) return NextResponse.json({ ok: true, groupId: group.id, alreadyMember: true })

    if (group.join_mode === 'apply') {
      return NextResponse.json({ ok: true, groupId: group.id, requiresApply: true })
    }
    if (group.join_mode === 'invite_only') {
      const memberCount = await countActiveMembers(ctx.admin, group.id as string)
      if (group.capacity_max != null && memberCount >= group.capacity_max) {
        return NextResponse.json({ error: 'This group is full.' }, { status: 409 })
      }
      await addMember(ctx.admin, group.id as string, ctx.session.accountId, 'member')
      await syncRecruitmentFull(ctx.admin, group.id as string, group.capacity_max as number | null)
      return NextResponse.json({ ok: true, groupId: group.id, joined: true })
    }

    return NextResponse.json({ ok: true, groupId: group.id, requiresJoin: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-groups-join-token')
  }
}
