import type { SupabaseClient } from '@supabase/supabase-js'
import type { PublicProgramSlotDto } from '@/lib/dancecard/publicProgramSlotsData'

export async function filterPublicSlotsForCalendarFeed(
  admin: SupabaseClient,
  slots: PublicProgramSlotDto[],
  scope: string,
  filterTrackId: string | null,
  filterLocationId: string | null,
  filterPersonId: string | null,
): Promise<PublicProgramSlotDto[]> {
  if (scope === 'full') return slots
  if (scope === 'track' && filterTrackId) return slots.filter((s) => s.trackId === filterTrackId)
  if (scope === 'room' && filterLocationId) return slots.filter((s) => s.locationId === filterLocationId)
  if (scope === 'presenter' && filterPersonId) {
    const { data, error } = await admin
      .from('dancecard_program_slot_persons')
      .select('slot_id')
      .eq('person_id', filterPersonId)
      .eq('is_public_on_schedule', true)
    if (error) throw error
    const allowed = new Set((data ?? []).map((r) => r.slot_id as string))
    return slots.filter((s) => allowed.has(s.id))
  }
  return []
}
