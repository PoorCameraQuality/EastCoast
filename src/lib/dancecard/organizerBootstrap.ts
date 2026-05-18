import type { SupabaseClient } from '@supabase/supabase-js'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { organizerEventDtoFromRow } from '@/lib/dancecard/organizerEventDto'
import type { OrganizerProgramSlotDto } from '@/lib/dancecard/organizerProgramSlotDto'
import { fetchOrganizerProgramSlotsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { mapStaffShiftRow, type OrganizerStaffShiftDto } from '@/lib/dancecard/organizerStaffShiftDto'
import { fetchStaffShiftRowsForEvent } from '@/lib/dancecard/organizerStaffShiftsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export type OrganizerBootstrapPayload = {
  organizerRole: OrganizerRoleForClient
  event: ReturnType<typeof organizerEventDtoFromRow>
  slots: OrganizerProgramSlotDto[]
  shifts: OrganizerStaffShiftDto[]
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
}

type LoadedEvent = NonNullable<Awaited<ReturnType<typeof loadEventBySlugAnyStatus>>>

/** One auth pass + parallel Supabase reads for organizer shell initial load. */
export async function fetchOrganizerBootstrap(
  admin: SupabaseClient,
  organizerRole: OrganizerRoleForClient,
  event: LoadedEvent,
): Promise<OrganizerBootstrapPayload> {
  const eventId = event.id

  const [slots, staffRows] = await Promise.all([
    fetchOrganizerProgramSlotsForEvent(admin, eventId),
    fetchStaffShiftRowsForEvent(admin, eventId),
  ])

  return {
    organizerRole,
    event: organizerEventDtoFromRow(event as Record<string, unknown>),
    slots,
    shifts: staffRows.map((r) => mapStaffShiftRow(r)),
    timezone: event.timezone,
    windowStartsAt: event.window_starts_at,
    windowEndsAt: event.window_ends_at,
  }
}
