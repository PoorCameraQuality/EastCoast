import type { SupabaseClient } from '@supabase/supabase-js'
import {
  computeDancecardConflicts,
  type ConflictScannerPersonLink,
  type ConflictScannerSlot,
  type DancecardConflict,
} from '@/lib/dancecard/conflictScanner'
import { fetchProgramSlotRowsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'

/**
 * Loads program slots + slot-person links and returns conflict scanner output (Phase 7 facade).
 */
export async function scanDancecardConflictsForEvent(
  admin: SupabaseClient,
  eventId: string,
): Promise<DancecardConflict[]> {
  const slotRows = await fetchProgramSlotRowsForEvent(admin, eventId)

  const scannerSlots: ConflictScannerSlot[] = slotRows.map((s) => ({
    id: s.id as string,
    startsAt: String(s.starts_at),
    endsAt: String(s.ends_at),
    locationId: (s.location_id as string | null) ?? null,
    room: (s.room as string | null) ?? null,
    isPublished: Boolean((s as { is_published?: boolean }).is_published),
    visibility: ((s as { visibility?: string }).visibility as string | null) ?? 'public',
    photoPolicy: ((s as { photo_policy?: string }).photo_policy as ConflictScannerSlot['photoPolicy']) ?? 'allowed',
  }))

  let slotPeople: ConflictScannerPersonLink[] = []
  if (slotRows.length) {
    const ids = slotRows.map((s) => s.id as string)
    const { data: spRows, error: spErr } = await admin
      .from('dancecard_program_slot_persons')
      .select('slot_id, person_id, role')
      .in('slot_id', ids)
    if (!spErr && spRows) {
      slotPeople = spRows.map((r) => ({
        slotId: r.slot_id as string,
        personId: r.person_id as string,
        role: String(r.role ?? ''),
      }))
    }
  }

  const locationCapacity: Record<string, number> = {}
  const { data: locRows } = await admin.from('dancecard_locations').select('id, capacity').eq('event_id', eventId)
  for (const loc of locRows ?? []) {
    const cap = loc.capacity as number | null
    if (cap != null && cap > 0) locationCapacity[loc.id as string] = cap
  }

  return computeDancecardConflicts({ slots: scannerSlots, slotPeople, locationCapacity })
}
