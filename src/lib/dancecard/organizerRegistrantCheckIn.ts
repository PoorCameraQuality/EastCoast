import type { SupabaseClient } from '@supabase/supabase-js'
import {
  evaluateCheckInEligibility,
  resolveRegistrantAccessWindow,
  todayInEventTimezone,
  timingFromEligibility,
  type CheckInEligibility,
  type CheckInTiming,
} from '@/lib/dancecard/registrantCheckIn'
import type { OrganizerRegistrantExtras } from '@/lib/dancecard/organizerRegistrantDto'

type EventRow = {
  timezone?: string | null
  window_starts_at?: string | null
  window_ends_at?: string | null
}

type CategoryRow = {
  check_in_valid_from?: string | null
  check_in_valid_through?: string | null
}

export function registrantCheckInExtras(input: {
  status: string
  checkedInAt?: string | null
  checkedInTiming?: string | null
  category: CategoryRow | null
  event: EventRow
  now?: Date
}): OrganizerRegistrantExtras {
  const timezone = input.event.timezone?.trim() || 'America/New_York'
  const access = resolveRegistrantAccessWindow({
    categoryValidFrom: input.category?.check_in_valid_from,
    categoryValidThrough: input.category?.check_in_valid_through,
    eventWindowStartsAt: input.event.window_starts_at,
    eventWindowEndsAt: input.event.window_ends_at,
    timezone,
  })
  const validFrom = access?.validFrom ?? null
  const validThrough = access?.validThrough ?? null
  const today = todayInEventTimezone(timezone, input.now)
  const eligibility = evaluateCheckInEligibility(today, access)

  if (input.status === 'checked_in') {
    const timing = (input.checkedInTiming as CheckInTiming | null) ?? 'on_time'
    return {
      checkInValidFrom: validFrom,
      checkInValidThrough: validThrough,
      checkInEligibility: eligibility,
      checkInTiming: timing,
      checkedInAt: input.checkedInAt ?? null,
    }
  }

  return {
    checkInValidFrom: validFrom,
    checkInValidThrough: validThrough,
    checkInEligibility: eligibility,
    checkInTiming: null,
    checkedInAt: null,
  }
}

export async function assertCheckInAllowed(input: {
  admin: SupabaseClient
  eventId: string
  categoryId: string
  event: EventRow
  earlyCheckInOverride: boolean
  now?: Date
}): Promise<{ timing: CheckInTiming; eligibility: CheckInEligibility }> {
  const { data: cat, error } = await input.admin
    .from('dancecard_registration_categories')
    .select('check_in_valid_from, check_in_valid_through')
    .eq('id', input.categoryId)
    .eq('event_id', input.eventId)
    .maybeSingle()
  if (error) throw error

  const timezone = input.event.timezone?.trim() || 'America/New_York'
  const access = resolveRegistrantAccessWindow({
    categoryValidFrom: cat?.check_in_valid_from as string | null,
    categoryValidThrough: cat?.check_in_valid_through as string | null,
    eventWindowStartsAt: input.event.window_starts_at,
    eventWindowEndsAt: input.event.window_ends_at,
    timezone,
  })
  const today = todayInEventTimezone(timezone, input.now)
  const eligibility = evaluateCheckInEligibility(today, access)

  if (eligibility === 'early' && !input.earlyCheckInOverride) {
    const err = new Error('EARLY_CHECK_IN') as Error & {
      status: number
      eligibility: CheckInEligibility
      validFrom: string | null
    }
    err.status = 409
    err.eligibility = eligibility
    err.validFrom = access?.validFrom ?? null
    throw err
  }

  return {
    eligibility,
    timing: timingFromEligibility(eligibility, input.earlyCheckInOverride),
  }
}
