import type { SupabaseClient } from '@supabase/supabase-js'
import { mapProgramSlotRow, type OrganizerProgramSlotDto } from '@/lib/dancecard/organizerProgramSlotDto'
import { isMissingColumn } from '@/lib/dancecard/supabaseColumnFallback'

const PROGRAM_SLOT_SELECT_FULL =
  'id, starts_at, ends_at, title, track, room, description, sort_order, location_id, is_published, visibility, is_frozen, updated_at, track_id, photo_policy, organizer_notes_internal'

const PROGRAM_SLOT_SELECT_CORE =
  'id, starts_at, ends_at, title, track, room, description, sort_order, location_id, updated_at'

export async function fetchProgramSlotRowsForEvent(
  admin: SupabaseClient,
  eventId: string,
): Promise<Record<string, unknown>[]> {
  const full = await admin
    .from('dancecard_program_slots')
    .select(PROGRAM_SLOT_SELECT_FULL)
    .eq('event_id', eventId)
    .order('starts_at', { ascending: true })
    .order('sort_order', { ascending: true })

  if (full.error && isMissingColumn(full.error)) {
    const core = await admin
      .from('dancecard_program_slots')
      .select(PROGRAM_SLOT_SELECT_CORE)
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
      .order('sort_order', { ascending: true })
    if (core.error) throw core.error
    return (core.data ?? []) as Record<string, unknown>[]
  }

  if (full.error) throw full.error
  return (full.data ?? []) as Record<string, unknown>[]
}

export async function fetchOrganizerProgramSlotsForEvent(
  admin: SupabaseClient,
  eventId: string
): Promise<OrganizerProgramSlotDto[]> {
  const slots = await fetchProgramSlotRowsForEvent(admin, eventId)
  const list = slots
  const ids = list.map((s) => s.id as string)
  const trackIds = Array.from(new Set(list.map((s) => s.track_id as string | null).filter(Boolean))) as string[]
  const locationIds = Array.from(new Set(list.map((s) => s.location_id as string | null).filter(Boolean))) as string[]

  const trackNameById: Record<string, string> = {}
  const trackColorById: Record<string, string> = {}
  const locNameById: Record<string, string> = {}
  const tagsBySlot: Record<string, { tagId: string; name: string }[]> = {}

  const [tracksResult, locsResult, tagsResult] = await Promise.all([
    trackIds.length
      ? admin.from('dancecard_tracks').select('id,name,color').in('id', trackIds).eq('event_id', eventId)
      : Promise.resolve({ data: [], error: null }),
    locationIds.length
      ? admin.from('dancecard_locations').select('id,name').in('id', locationIds)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? admin
          .from('dancecard_program_slot_tags')
          .select('slot_id, tag:dancecard_tags(id,name)')
          .in('slot_id', ids)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (tracksResult.error) throw tracksResult.error
  for (const t of tracksResult.data ?? []) {
    trackNameById[t.id as string] = String(t.name)
    if (t.color) trackColorById[t.id as string] = String(t.color)
  }

  if (locsResult.error) throw locsResult.error
  for (const l of locsResult.data ?? []) locNameById[l.id as string] = String(l.name)

  if (!tagsResult.error && tagsResult.data) {
    for (const link of tagsResult.data) {
      const sid = link.slot_id as string
      const tagRaw = link.tag as unknown
      const tag = (Array.isArray(tagRaw) ? tagRaw[0] : tagRaw) as { id: string; name: string } | null | undefined
      if (!tag?.id) continue
      if (!tagsBySlot[sid]) tagsBySlot[sid] = []
      tagsBySlot[sid].push({ tagId: tag.id, name: tag.name })
    }
  }

  return list.map((s) =>
    mapProgramSlotRow(
      {
        ...s,
        track_row: s.track_id
          ? {
              name: trackNameById[s.track_id as string] ?? null,
              color: trackColorById[s.track_id as string] ?? null,
            }
          : null,
        location_row: s.location_id ? { name: locNameById[s.location_id as string] ?? null } : null,
      },
      tagsBySlot[s.id as string] ?? [],
    ),
  )
}

export async function fetchOrganizerProgramSlotById(
  admin: SupabaseClient,
  eventId: string,
  slotId: string,
): Promise<OrganizerProgramSlotDto | null> {
  const { data: s, error } = await admin
    .from('dancecard_program_slots')
    .select(
      'id, starts_at, ends_at, title, track, room, description, sort_order, location_id, is_published, visibility, is_frozen, updated_at, track_id, photo_policy, organizer_notes_internal',
    )
    .eq('event_id', eventId)
    .eq('id', slotId)
    .maybeSingle()
  if (error) throw error
  if (!s) return null

  let trackRow: { name: string | null; color?: string | null } | null = null
  if (s.track_id) {
    const { data: tr } = await admin.from('dancecard_tracks').select('name,color').eq('id', s.track_id).maybeSingle()
    trackRow = {
      name: tr?.name ? String(tr.name) : null,
      color: tr?.color ? String(tr.color) : null,
    }
  }
  let locationRow: { name: string | null } | null = null
  if (s.location_id) {
    const { data: loc } = await admin.from('dancecard_locations').select('name').eq('id', s.location_id).maybeSingle()
    locationRow = { name: loc?.name ? String(loc.name) : null }
  }
  const tagList: { tagId: string; name: string }[] = []
  const { data: links } = await admin
    .from('dancecard_program_slot_tags')
    .select('tag:dancecard_tags(id,name)')
    .eq('slot_id', slotId)
  for (const link of links ?? []) {
    const tagRaw = link.tag as unknown
    const tag = (Array.isArray(tagRaw) ? tagRaw[0] : tagRaw) as { id: string; name: string } | null | undefined
    if (tag?.id) tagList.push({ tagId: tag.id, name: tag.name })
  }
  return mapProgramSlotRow({ ...s, track_row: trackRow, location_row: locationRow }, tagList)
}
