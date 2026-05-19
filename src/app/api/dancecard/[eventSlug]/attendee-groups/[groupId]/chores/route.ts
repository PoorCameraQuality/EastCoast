import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership, loadAccountsBrief } from '@/lib/dancecard/attendeeGroupsCore'
import { choreSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
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
      .from('dancecard_attendee_group_chores')
      .select('id, title, assigned_account_id, done, sort_order')
      .eq('group_id', context.params.groupId)
      .order('sort_order', { ascending: true })
    if (error) {
      if ((error as { code?: string }).code === '42P01') return NextResponse.json({ chores: [] })
      throw error
    }

    const accounts = await loadAccountsBrief(
      ctx.admin,
      (data ?? []).map((c) => c.assigned_account_id as string).filter(Boolean),
    )

    const chores = (data ?? []).map((c) => {
      const a = c.assigned_account_id ? accounts.get(c.assigned_account_id as string) : undefined
      return {
        id: c.id as string,
        title: c.title as string,
        done: Boolean(c.done),
        sortOrder: c.sort_order as number,
        assignedAccountId: (c.assigned_account_id as string) ?? null,
        assignedDisplayName: a?.displayName ?? null,
      }
    })

    return NextResponse.json({ chores })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-chores-get')
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

    const body = choreSchema.parse(await request.json())
    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_chores')
      .insert({
        group_id: context.params.groupId,
        title: body.title.trim(),
        assigned_account_id: body.assignedAccountId ?? null,
        done: body.done ?? false,
        sort_order: body.sortOrder ?? 0,
        created_by_account_id: ctx.session.accountId,
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
    return jsonFromRouteError(e, 'attendee-group-chores-post')
  }
}
