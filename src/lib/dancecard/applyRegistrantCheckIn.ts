import type { SupabaseClient } from '@supabase/supabase-js'
import { assertCheckInAllowed, registrantCheckInExtras } from '@/lib/dancecard/organizerRegistrantCheckIn'
import { mapOrganizerRegistrantRow } from '@/lib/dancecard/organizerRegistrantDto'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'

type EventRow = {
  timezone?: string | null
  window_starts_at?: string | null
  window_ends_at?: string | null
}

export type ApplyCheckInResult =
  | { ok: true; registrant: ReturnType<typeof mapOrganizerRegistrantRow> }
  | { ok: false; code: 'NOT_FOUND' }
  | { ok: false; code: 'EARLY_CHECK_IN'; validFrom: string | null; eligibility: string }

export async function applyRegistrantCheckIn(input: {
  admin: SupabaseClient
  eventId: string
  registrantId: string
  event: EventRow
  earlyCheckInOverride: boolean
  organizerRole: OrganizerRoleForClient
  categoryName?: string
}): Promise<ApplyCheckInResult> {
  const { data: existing, error: exErr } = await input.admin
    .from('dancecard_registrants')
    .select('id, category_id, status, checked_in_at, checked_in_timing')
    .eq('id', input.registrantId)
    .eq('event_id', input.eventId)
    .maybeSingle()
  if (exErr) throw exErr
  if (!existing) return { ok: false, code: 'NOT_FOUND' }

  const categoryId = existing.category_id as string
  const { data: catRow, error: catRowErr } = await input.admin
    .from('dancecard_registration_categories')
    .select('name, capacity, check_in_valid_from, check_in_valid_through')
    .eq('id', categoryId)
    .eq('event_id', input.eventId)
    .maybeSingle()
  if (catRowErr) throw catRowErr

  let checkInTiming: string
  try {
    const check = await assertCheckInAllowed({
      admin: input.admin,
      eventId: input.eventId,
      categoryId,
      event: input.event,
      earlyCheckInOverride: input.earlyCheckInOverride,
    })
    checkInTiming = check.timing
  } catch (e) {
    if (e instanceof Error && e.message === 'EARLY_CHECK_IN') {
      const ex = e as Error & { validFrom?: string | null; eligibility?: string }
      return {
        ok: false,
        code: 'EARLY_CHECK_IN',
        validFrom: ex.validFrom ?? null,
        eligibility: ex.eligibility ?? 'early',
      }
    }
    throw e
  }

  const { data: row, error } = await input.admin
    .from('dancecard_registrants')
    .update({
      status: 'checked_in',
      checked_in_at: new Date().toISOString(),
      checked_in_timing: checkInTiming,
      updated_at: new Date().toISOString(),
    })
    .eq('id', input.registrantId)
    .eq('event_id', input.eventId)
    .select(
      'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, external_source, external_id, last_synced_at, rabbitsign_status, checked_in_at, checked_in_timing, created_at, updated_at',
    )
    .single()
  if (error) throw error

  const extras = registrantCheckInExtras({
    status: row.status as string,
    checkedInAt: (row.checked_in_at as string | null) ?? null,
    checkedInTiming: (row.checked_in_timing as string | null) ?? checkInTiming,
    category: catRow,
    event: input.event,
  })

  return {
    ok: true,
    registrant: mapOrganizerRegistrantRow(
      row as Record<string, unknown>,
      input.categoryName ?? (catRow?.name as string | undefined),
      input.organizerRole,
      extras,
    ),
  }
}
