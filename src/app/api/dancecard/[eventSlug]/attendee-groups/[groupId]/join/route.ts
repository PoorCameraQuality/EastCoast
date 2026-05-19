import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  addMember,
  countActiveMembers,
  getMembership,
  syncRecruitmentFull,
  type AttendeeGroupRow,
} from '@/lib/dancecard/attendeeGroupsCore'
import { joinAttendeeGroupSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group, missingMigration } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (missingMigration) {
      return NextResponse.json({ error: 'Apply migration dancecard_054_attendee_groups.sql first.' }, { status: 409 })
    }
    if (!group || (group as AttendeeGroupRow).status !== 'active') {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const g = group as AttendeeGroupRow
    const existing = await getMembership(ctx.admin, g.id, ctx.session.accountId)
    if (existing) return NextResponse.json({ ok: true, alreadyMember: true })

    const body = joinAttendeeGroupSchema.parse(await request.json())
    const memberCount = await countActiveMembers(ctx.admin, g.id)
    if (g.capacity_max != null && memberCount >= g.capacity_max) {
      return NextResponse.json({ error: 'This group is full.' }, { status: 409 })
    }

    if (g.join_mode === 'invite_only') {
      return NextResponse.json({ error: 'This group is invite-only. Use an invite link.' }, { status: 403 })
    }

    if (g.join_mode === 'open') {
      await addMember(ctx.admin, g.id, ctx.session.accountId, 'member')
      await syncRecruitmentFull(ctx.admin, g.id, g.capacity_max)
      return NextResponse.json({ ok: true, joined: true })
    }

    const { count: pendingApps } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('id', { count: 'exact', head: true })
      .eq('from_account_id', ctx.session.accountId)
      .eq('status', 'pending')
    if ((pendingApps ?? 0) >= 10) {
      return NextResponse.json({ error: 'Too many pending applications.' }, { status: 429 })
    }

    const { data: questions } = await ctx.admin
      .from('dancecard_attendee_group_questions')
      .select('id, required')
      .eq('group_id', g.id)
    const requiredIds = new Set((questions ?? []).filter((q) => q.required).map((q) => q.id as string))
    for (const qid of Array.from(requiredIds)) {
      const answered = (body.answers ?? []).some((a) => a.questionId === qid && a.value.trim())
      if (!answered) {
        return NextResponse.json({ error: 'Please answer all required questions.' }, { status: 400 })
      }
    }

    const { data: priorDeclined } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .select('updated_at')
      .eq('group_id', g.id)
      .eq('from_account_id', ctx.session.accountId)
      .eq('status', 'declined')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (priorDeclined?.updated_at) {
      const waitUntil = new Date(priorDeclined.updated_at as string).getTime() + 24 * 60 * 60 * 1000
      if (Date.now() < waitUntil) {
        return NextResponse.json({ error: 'You can re-apply 24 hours after a declined application.' }, { status: 429 })
      }
    }

    const { data: req, error } = await ctx.admin
      .from('dancecard_attendee_group_join_requests')
      .upsert(
        {
          group_id: g.id,
          from_account_id: ctx.session.accountId,
          status: 'pending',
          answers_json: body.answers ?? [],
          message: (body.message ?? '').trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'group_id,from_account_id', ignoreDuplicates: false },
      )
      .select('id, status')
      .single()
    if (error) throw error

    return NextResponse.json({ ok: true, requestId: req.id, status: req.status, applied: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-join')
  }
}
