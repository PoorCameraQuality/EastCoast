import type { SupabaseClient } from '@supabase/supabase-js'
import { withPgTransaction } from '@/lib/dancecard/pgTransaction'

export const OPEN_SHIFT_PERSON_NAME = 'Open'

type ShiftRow = {
  claimed_by_account_id: string | null
  person_name: string
  shift_status: string
  dropped_at: string | null
}

export type ShiftSwapApproveResult =
  | { ok: true }
  | { ok: false; status: number; error: string; rollbackMessage?: string }

async function updateShift(
  admin: SupabaseClient,
  shiftId: string,
  patch: Record<string, unknown>,
): Promise<{ error: Error | null }> {
  const { error } = await admin.from('dancecard_staff_shifts').update(patch).eq('id', shiftId)
  return { error: error ? new Error(error.message) : null }
}

async function approveViaPg(
  fromId: string,
  toId: string,
  swapId: string,
  rid: string,
  toClaim: string | null,
  requesterName: string,
  otherName: string | null,
  now: string,
): Promise<boolean> {
  const ran = await withPgTransaction(async (query) => {
    if (!toClaim) {
      await query(
        `UPDATE dancecard_staff_shifts
         SET claimed_by_account_id = NULL, person_name = $1, shift_status = 'open', dropped_at = NULL
         WHERE id = $2`,
        [OPEN_SHIFT_PERSON_NAME, fromId],
      )
      await query(
        `UPDATE dancecard_staff_shifts
         SET claimed_by_account_id = $1, person_name = $2, shift_status = 'assigned', dropped_at = NULL
         WHERE id = $3`,
        [rid, requesterName, toId],
      )
    } else {
      await query(
        `UPDATE dancecard_staff_shifts
         SET claimed_by_account_id = $1, person_name = $2, shift_status = 'assigned'
         WHERE id = $3`,
        [toClaim, otherName!, fromId],
      )
      await query(
        `UPDATE dancecard_staff_shifts
         SET claimed_by_account_id = $1, person_name = $2, shift_status = 'assigned'
         WHERE id = $3`,
        [rid, requesterName, toId],
      )
    }
    await query(
      `UPDATE dancecard_shift_swap_requests SET status = 'approved', updated_at = $1 WHERE id = $2`,
      [now, swapId],
    )
  })
  return ran !== null
}

async function rollbackShift(admin: SupabaseClient, shiftId: string, snapshot: ShiftRow) {
  await admin
    .from('dancecard_staff_shifts')
    .update({
      claimed_by_account_id: snapshot.claimed_by_account_id,
      person_name: snapshot.person_name,
      shift_status: snapshot.shift_status,
      dropped_at: snapshot.dropped_at,
    })
    .eq('id', shiftId)
}

export async function executeShiftSwapApproval(input: {
  admin: SupabaseClient
  swapId: string
  fromId: string
  toId: string
  rid: string
  toClaim: string | null
  requesterName: string
  otherName: string | null
  from: ShiftRow
  to: ShiftRow
}): Promise<ShiftSwapApproveResult> {
  const { admin, swapId, fromId, toId, rid, toClaim, requesterName, otherName, from, to } = input
  const now = new Date().toISOString()

  if (toClaim === rid) {
    return { ok: false, status: 409, error: 'Invalid swap state' }
  }

  try {
    const usedPg = await approveViaPg(fromId, toId, swapId, rid, toClaim, requesterName, otherName, now)
    if (usedPg) return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Transaction failed'
    return { ok: false, status: 500, error: `Shift swap approval failed: ${msg}` }
  }

  const steps: Array<{ id: string; patch: Record<string, unknown>; snapshot: ShiftRow }> = []

  if (!toClaim) {
    steps.push({
      id: fromId,
      snapshot: from,
      patch: {
        claimed_by_account_id: null,
        person_name: OPEN_SHIFT_PERSON_NAME,
        shift_status: 'open',
        dropped_at: null,
      },
    })
    steps.push({
      id: toId,
      snapshot: to,
      patch: {
        claimed_by_account_id: rid,
        person_name: requesterName,
        shift_status: 'assigned',
        dropped_at: null,
      },
    })
  } else {
    steps.push({
      id: fromId,
      snapshot: from,
      patch: {
        claimed_by_account_id: toClaim,
        person_name: otherName!,
        shift_status: 'assigned',
      },
    })
    steps.push({
      id: toId,
      snapshot: to,
      patch: {
        claimed_by_account_id: rid,
        person_name: requesterName,
        shift_status: 'assigned',
      },
    })
  }

  const applied: typeof steps = []
  for (const step of steps) {
    const { error } = await updateShift(admin, step.id, step.patch)
    if (error) {
      for (const prev of [...applied].reverse()) {
        await rollbackShift(admin, prev.id, prev.snapshot)
      }
      return {
        ok: false,
        status: 500,
        error: error.message,
        rollbackMessage:
          applied.length > 0
            ? 'Partial shift updates were rolled back; please retry approval.'
            : 'No shift rows were updated.',
      }
    }
    applied.push(step)
  }

  const { error: fin } = await admin
    .from('dancecard_shift_swap_requests')
    .update({ status: 'approved', updated_at: now })
    .eq('id', swapId)

  if (fin) {
    for (const prev of [...applied].reverse()) {
      await rollbackShift(admin, prev.id, prev.snapshot)
    }
    return {
      ok: false,
      status: 500,
      error: fin.message,
      rollbackMessage: 'Shift rows were rolled back after swap status update failed.',
    }
  }

  return { ok: true }
}
