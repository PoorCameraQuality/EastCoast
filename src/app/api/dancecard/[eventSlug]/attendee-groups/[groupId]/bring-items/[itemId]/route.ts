import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getMembership } from '@/lib/dancecard/attendeeGroupsCore'
import { patchBringItemSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { isMissingColumn, isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; itemId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const body = patchBringItemSchema.parse(await request.json())

    if (body.claim !== undefined) {
      const { data: item, error: itemErr } = await ctx.admin
        .from('dancecard_attendee_group_bring_items')
        .select('id, slots_needed, quantity, claimed_by_account_id')
        .eq('id', context.params.itemId)
        .eq('group_id', context.params.groupId)
        .maybeSingle()
      if (itemErr) throw itemErr
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

      const slotsNeeded = Math.max(
        1,
        (item.slots_needed as number | undefined) ?? (item.quantity as number | null) ?? 1,
      )

      if (body.claim) {
        const { count, error: countErr } = await ctx.admin
          .from('dancecard_attendee_group_bring_claims')
          .select('account_id', { count: 'exact', head: true })
          .eq('item_id', context.params.itemId)
        if (countErr && isMissingTable(countErr, 'dancecard_attendee_group_bring_claims')) {
          if (item.claimed_by_account_id) {
            return NextResponse.json({ error: 'This item is already claimed' }, { status: 409 })
          }
          await ctx.admin
            .from('dancecard_attendee_group_bring_items')
            .update({ claimed_by_account_id: ctx.session.accountId })
            .eq('id', context.params.itemId)
          return NextResponse.json({ ok: true })
        }
        if (countErr) throw countErr
        if ((count ?? 0) >= slotsNeeded) {
          return NextResponse.json({ error: 'All slots are filled' }, { status: 409 })
        }
        const { error: insErr } = await ctx.admin.from('dancecard_attendee_group_bring_claims').insert({
          item_id: context.params.itemId,
          account_id: ctx.session.accountId,
        })
        if (insErr && (insErr as { code?: string }).code !== '23505') throw insErr
      } else {
        const { error: delErr } = await ctx.admin
          .from('dancecard_attendee_group_bring_claims')
          .delete()
          .eq('item_id', context.params.itemId)
          .eq('account_id', ctx.session.accountId)
        if (delErr && isMissingTable(delErr, 'dancecard_attendee_group_bring_claims')) {
          await ctx.admin
            .from('dancecard_attendee_group_bring_items')
            .update({ claimed_by_account_id: null })
            .eq('id', context.params.itemId)
            .eq('claimed_by_account_id', ctx.session.accountId)
        } else if (delErr) {
          throw delErr
        }
      }
      return NextResponse.json({ ok: true })
    }

    if (body.claimedByAccountId !== undefined) {
      if (body.claimedByAccountId && body.claimedByAccountId !== ctx.session.accountId) {
        return NextResponse.json({ error: 'Can only claim for yourself' }, { status: 403 })
      }
    }

    const patch: Record<string, unknown> = {}
    if (body.itemLabel !== undefined) patch.item_label = body.itemLabel.trim()
    if (body.quantity !== undefined) patch.quantity = body.quantity
    if (body.notes !== undefined) patch.notes = body.notes.trim()
    if (body.slotsNeeded !== undefined) patch.slots_needed = body.slotsNeeded
    if (body.scheduleLabel !== undefined) patch.schedule_label = body.scheduleLabel.trim()
    if (body.claimedByAccountId !== undefined) patch.claimed_by_account_id = body.claimedByAccountId

    let { error } = await ctx.admin
      .from('dancecard_attendee_group_bring_items')
      .update(patch)
      .eq('id', context.params.itemId)
      .eq('group_id', context.params.groupId)
    if (error && isMissingColumn(error, 'slots_needed')) {
      delete patch.slots_needed
      delete patch.schedule_label
      const retry = await ctx.admin
        .from('dancecard_attendee_group_bring_items')
        .update(patch)
        .eq('id', context.params.itemId)
        .eq('group_id', context.params.groupId)
      error = retry.error
    }
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-bring-patch')
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string; itemId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 })

    const { error } = await ctx.admin
      .from('dancecard_attendee_group_bring_items')
      .delete()
      .eq('id', context.params.itemId)
      .eq('group_id', context.params.groupId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-bring-delete')
  }
}
