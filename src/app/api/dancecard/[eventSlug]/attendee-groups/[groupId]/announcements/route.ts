import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership, loadAccountsBrief } from '@/lib/dancecard/attendeeGroupsCore'
import { announcementSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

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
      .from('dancecard_attendee_group_announcements')
      .select('id, account_id, body, pinned, created_at')
      .eq('group_id', context.params.groupId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      if ((error as { code?: string }).code === '42P01') return NextResponse.json({ announcements: [] })
      throw error
    }

    const accounts = await loadAccountsBrief(ctx.admin, (data ?? []).map((a) => a.account_id as string))

    const announcements = (data ?? []).map((a) => {
      const acc = accounts.get(a.account_id as string)
      return {
        id: a.id as string,
        body: a.body as string,
        pinned: Boolean(a.pinned),
        createdAt: a.created_at as string,
        authorDisplayName: acc?.displayName ?? 'Attendee',
      }
    })

    return NextResponse.json({ announcements })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-announcements-get')
  }
}

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

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const body = announcementSchema.parse(await request.json())
    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_announcements')
      .insert({
        group_id: context.params.groupId,
        account_id: ctx.session.accountId,
        body: body.body.trim(),
        pinned: body.pinned ?? false,
      })
      .select('id')
      .single()
    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-announcements-post')
  }
}
