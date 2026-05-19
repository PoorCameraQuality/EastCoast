import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  getMembership,
  loadAccountsWithAvatars,
  loadBringClaimMap,
  mapSignupRows,
  readProfileConfigFromEvent,
} from '@/lib/dancecard/attendeeGroupsCore'
import { bringItemSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { isMissingColumn } from '@/lib/dancecard/supabaseColumnFallback'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const ITEM_SELECT = 'id, item_label, quantity, claimed_by_account_id, notes, created_at, slots_needed, schedule_label'

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
      .from('dancecard_attendee_group_bring_items')
      .select(ITEM_SELECT)
      .eq('group_id', context.params.groupId)
      .order('created_at', { ascending: true })

    let rows: Record<string, unknown>[] = []
    if (primary.error && isMissingColumn(primary.error, 'slots_needed')) {
      const legacy = await ctx.admin
        .from('dancecard_attendee_group_bring_items')
        .select('id, item_label, quantity, claimed_by_account_id, notes, created_at')
        .eq('group_id', context.params.groupId)
        .order('created_at', { ascending: true })
      if (legacy.error) {
        if ((legacy.error as { code?: string }).code === '42P01') return NextResponse.json({ items: [] })
        throw legacy.error
      }
      rows = (legacy.data ?? []) as Record<string, unknown>[]
    } else if (primary.error) {
      if ((primary.error as { code?: string }).code === '42P01') return NextResponse.json({ items: [] })
      throw primary.error
    } else {
      rows = (primary.data ?? []) as Record<string, unknown>[]
    }
    const itemIds = rows.map((i) => i.id as string)
    const claimMap = await loadBringClaimMap(ctx.admin, itemIds)
    const profileConfig = readProfileConfigFromEvent(ctx.event)
    const allAccountIds = new Set<string>()
    for (const i of rows) {
      const legacy = i.claimed_by_account_id as string | null
      if (legacy) allAccountIds.add(legacy)
      for (const id of claimMap.get(i.id as string) ?? []) allAccountIds.add(id)
    }
    const accounts = await loadAccountsWithAvatars(ctx.admin, Array.from(allAccountIds), profileConfig)

    const items = rows.map((i) => {
      const id = i.id as string
      let accountIds = claimMap.get(id) ?? []
      if (!accountIds.length && i.claimed_by_account_id) {
        accountIds = [i.claimed_by_account_id as string]
      }
      const slotsNeeded = Math.max(1, (i.slots_needed as number | undefined) ?? (i.quantity as number | null) ?? 1)
      const claims = mapSignupRows(accountIds, accounts)
      return {
        id,
        itemLabel: i.item_label as string,
        quantity: i.quantity as number | null,
        notes: i.notes as string,
        slotsNeeded,
        scheduleLabel: ((i.schedule_label as string) ?? '').trim(),
        claims,
        slotsOpen: Math.max(0, slotsNeeded - claims.length),
        myClaimed: accountIds.includes(ctx.session!.accountId),
      }
    })

    return NextResponse.json({ items })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-bring-get')
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

    const body = bringItemSchema.parse(await request.json())
    const insert: Record<string, unknown> = {
      group_id: context.params.groupId,
      item_label: body.itemLabel.trim(),
      quantity: body.quantity ?? null,
      notes: (body.notes ?? '').trim(),
    }
    if (body.slotsNeeded !== undefined) insert.slots_needed = body.slotsNeeded
    if (body.scheduleLabel !== undefined) insert.schedule_label = body.scheduleLabel.trim()

    let { data, error } = await ctx.admin.from('dancecard_attendee_group_bring_items').insert(insert).select('id').single()
    if (error && isMissingColumn(error, 'slots_needed')) {
      delete insert.slots_needed
      delete insert.schedule_label
      const retry = await ctx.admin.from('dancecard_attendee_group_bring_items').insert(insert).select('id').single()
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
    return jsonFromRouteError(e, 'attendee-group-bring-post')
  }
}
