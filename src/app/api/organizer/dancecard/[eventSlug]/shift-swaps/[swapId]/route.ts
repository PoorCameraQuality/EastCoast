import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

async function accountDisplayName(admin: SupabaseClient, accountId: string) {
  const { data } = await admin.from('dancecard_accounts').select('display_name, username').eq('id', accountId).maybeSingle()
  if (!data) return 'Volunteer'
  return String((data as { display_name?: string; username?: string }).display_name?.trim() || (data as { username?: string }).username || 'Volunteer')
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; swapId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = patchSchema.parse(await request.json())
    const { admin, eventId } = ctx
    const swapId = context.params.swapId
    const { data: swap, error: sErr } = await admin
      .from('dancecard_shift_swap_requests')
      .select('*')
      .eq('id', swapId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (sErr) throw sErr
    if (!swap || (swap as { status: string }).status !== 'pending') {
      return NextResponse.json({ error: 'Swap not found or not pending' }, { status: 404 })
    }
    const rid = (swap as { requester_account_id: string }).requester_account_id
    const fromId = (swap as { from_shift_id: string }).from_shift_id
    const toId = (swap as { to_shift_id: string }).to_shift_id

    if (body.status === 'rejected') {
      const { error } = await admin
        .from('dancecard_shift_swap_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', swapId)
      if (error) throw error
      return NextResponse.json({ ok: true, status: 'rejected' })
    }

    const { data: from, error: fErr } = await admin.from('dancecard_staff_shifts').select('*').eq('id', fromId).maybeSingle()
    const { data: to, error: tErr } = await admin.from('dancecard_staff_shifts').select('*').eq('id', toId).maybeSingle()
    if (fErr || tErr) throw fErr || tErr
    if (!from || !to) return NextResponse.json({ error: 'Shift missing' }, { status: 409 })
    if (from.claimed_by_account_id !== rid) {
      return NextResponse.json({ error: 'Requester no longer holds the source shift' }, { status: 409 })
    }

    const toClaim = to.claimed_by_account_id as string | null
    const requesterName = await accountDisplayName(admin, rid)

    if (!toClaim) {
      const pn = requesterName
      const { error: e1 } = await admin
        .from('dancecard_staff_shifts')
        .update({
          claimed_by_account_id: null,
          person_name: null,
          shift_status: 'open',
          dropped_at: new Date().toISOString(),
        })
        .eq('id', fromId)
      if (e1) throw e1
      const { error: e2 } = await admin
        .from('dancecard_staff_shifts')
        .update({
          claimed_by_account_id: rid,
          person_name: pn,
          shift_status: 'assigned',
          dropped_at: null,
        })
        .eq('id', toId)
      if (e2) throw e2
    } else if (toClaim !== rid) {
      const otherName = await accountDisplayName(admin, toClaim)
      const { error: e1 } = await admin
        .from('dancecard_staff_shifts')
        .update({
          claimed_by_account_id: toClaim,
          person_name: otherName,
          shift_status: 'assigned',
        })
        .eq('id', fromId)
      if (e1) throw e1
      const { error: e2 } = await admin
        .from('dancecard_staff_shifts')
        .update({
          claimed_by_account_id: rid,
          person_name: requesterName,
          shift_status: 'assigned',
        })
        .eq('id', toId)
      if (e2) throw e2
    } else {
      return NextResponse.json({ error: 'Invalid swap state' }, { status: 409 })
    }

    const { error: fin } = await admin
      .from('dancecard_shift_swap_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', swapId)
    if (fin) throw fin
    return NextResponse.json({ ok: true, status: 'approved' })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
