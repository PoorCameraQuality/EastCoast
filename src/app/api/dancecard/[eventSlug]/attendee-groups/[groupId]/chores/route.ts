import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  getMembership,
  loadAccountsWithAvatars,
  loadChoreSignupMap,
  mapSignupRows,
  readProfileConfigFromEvent,
} from '@/lib/dancecard/attendeeGroupsCore'
import { choreSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { isMissingColumn } from '@/lib/dancecard/supabaseColumnFallback'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const CHORE_SELECT =
  'id, title, assigned_account_id, done, sort_order, slots_needed, schedule_label'

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

    const primary = await ctx.admin
      .from('dancecard_attendee_group_chores')
      .select(CHORE_SELECT)
      .eq('group_id', context.params.groupId)
      .order('sort_order', { ascending: true })

    let rows: Record<string, unknown>[] = []
    if (primary.error && isMissingColumn(primary.error, 'slots_needed')) {
      const legacy = await ctx.admin
        .from('dancecard_attendee_group_chores')
        .select('id, title, assigned_account_id, done, sort_order')
        .eq('group_id', context.params.groupId)
        .order('sort_order', { ascending: true })
      if (legacy.error) {
        if ((legacy.error as { code?: string }).code === '42P01') return NextResponse.json({ chores: [] })
        throw legacy.error
      }
      rows = (legacy.data ?? []) as Record<string, unknown>[]
    } else if (primary.error) {
      if ((primary.error as { code?: string }).code === '42P01') return NextResponse.json({ chores: [] })
      throw primary.error
    } else {
      rows = (primary.data ?? []) as Record<string, unknown>[]
    }
    const choreIds = rows.map((c) => c.id as string)
    const signupMap = await loadChoreSignupMap(ctx.admin, choreIds)
    const profileConfig = readProfileConfigFromEvent(ctx.event)
    const allAccountIds = new Set<string>()
    for (const c of rows) {
      const legacy = c.assigned_account_id as string | null
      if (legacy) allAccountIds.add(legacy)
      for (const id of signupMap.get(c.id as string) ?? []) allAccountIds.add(id)
    }
    const accounts = await loadAccountsWithAvatars(ctx.admin, Array.from(allAccountIds), profileConfig)

    const chores = rows.map((c) => {
      const id = c.id as string
      let accountIds = signupMap.get(id) ?? []
      if (!accountIds.length && c.assigned_account_id) {
        accountIds = [c.assigned_account_id as string]
      }
      const slotsNeeded = Math.max(1, (c.slots_needed as number | undefined) ?? 1)
      const signups = mapSignupRows(accountIds, accounts)
      return {
        id,
        title: c.title as string,
        done: Boolean(c.done),
        sortOrder: c.sort_order as number,
        slotsNeeded,
        scheduleLabel: ((c.schedule_label as string) ?? '').trim(),
        signups,
        slotsOpen: Math.max(0, slotsNeeded - signups.length),
        mySignedUp: accountIds.includes(ctx.session!.accountId),
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
    const insert: Record<string, unknown> = {
      group_id: context.params.groupId,
      title: body.title.trim(),
      assigned_account_id: body.assignedAccountId ?? null,
      done: body.done ?? false,
      sort_order: body.sortOrder ?? 0,
      created_by_account_id: ctx.session.accountId,
    }
    if (body.slotsNeeded !== undefined) insert.slots_needed = body.slotsNeeded
    if (body.scheduleLabel !== undefined) insert.schedule_label = body.scheduleLabel.trim()

    let { data, error } = await ctx.admin.from('dancecard_attendee_group_chores').insert(insert).select('id').single()
    if (error && isMissingColumn(error, 'slots_needed')) {
      delete insert.slots_needed
      delete insert.schedule_label
      const retry = await ctx.admin.from('dancecard_attendee_group_chores').insert(insert).select('id').single()
      data = retry.data
      error = retry.error
    }
    if (error) throw error
    if (!data?.id) throw new Error('Insert failed')

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
