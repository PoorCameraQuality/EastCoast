import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership, loadAccountsBrief } from '@/lib/dancecard/attendeeGroupsCore'
import { bringItemSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
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
      .from('dancecard_attendee_group_bring_items')
      .select('id, item_label, quantity, claimed_by_account_id, notes, created_at')
      .eq('group_id', context.params.groupId)
      .order('created_at', { ascending: true })
    if (error) {
      if ((error as { code?: string }).code === '42P01') return NextResponse.json({ items: [] })
      throw error
    }

    const accounts = await loadAccountsBrief(
      ctx.admin,
      (data ?? []).map((i) => i.claimed_by_account_id as string).filter(Boolean),
    )

    const items = (data ?? []).map((i) => {
      const a = i.claimed_by_account_id ? accounts.get(i.claimed_by_account_id as string) : undefined
      return {
        id: i.id as string,
        itemLabel: i.item_label as string,
        quantity: i.quantity as number | null,
        notes: i.notes as string,
        claimedByAccountId: (i.claimed_by_account_id as string) ?? null,
        claimedDisplayName: a?.displayName ?? null,
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
    const { data, error } = await ctx.admin
      .from('dancecard_attendee_group_bring_items')
      .insert({
        group_id: context.params.groupId,
        item_label: body.itemLabel.trim(),
        quantity: body.quantity ?? null,
        notes: (body.notes ?? '').trim(),
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
    return jsonFromRouteError(e, 'attendee-group-bring-post')
  }
}
