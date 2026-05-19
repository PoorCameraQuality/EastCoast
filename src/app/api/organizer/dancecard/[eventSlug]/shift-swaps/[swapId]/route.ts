import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { executeShiftSwapApproval } from '@/lib/dancecard/shiftSwapApprove'

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
    const otherName = toClaim && toClaim !== rid ? await accountDisplayName(admin, toClaim) : null

    const result = await executeShiftSwapApproval({
      admin,
      swapId,
      fromId,
      toId,
      rid,
      toClaim,
      requesterName,
      otherName,
      from: {
        claimed_by_account_id: from.claimed_by_account_id as string | null,
        person_name: String(from.person_name ?? ''),
        shift_status: String(from.shift_status ?? 'assigned'),
        dropped_at: (from.dropped_at as string | null) ?? null,
      },
      to: {
        claimed_by_account_id: to.claimed_by_account_id as string | null,
        person_name: String(to.person_name ?? ''),
        shift_status: String(to.shift_status ?? 'assigned'),
        dropped_at: (to.dropped_at as string | null) ?? null,
      },
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, rollbackMessage: result.rollbackMessage },
        { status: result.status },
      )
    }

    return NextResponse.json({ ok: true, status: 'approved' })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
