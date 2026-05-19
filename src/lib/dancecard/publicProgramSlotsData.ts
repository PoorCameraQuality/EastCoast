import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchProgramSlotRowsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { slotVisibleToAttendee } from '@/lib/dancecard/programSlotPublication'

export type PublicProgramSlotDto = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  track: string | null
  trackId: string | null
  trackDisplay: string | null
  room: string | null
  locationId: string | null
  description: string | null
  sortOrder: number
  tagNames: string[]
  presenters: {
    personId: string
    sceneName: string
    role: string
    publicBio: string | null
    photoUrl: string | null
  }[]
  photoPolicy: 'allowed' | 'restricted' | 'none'
  locationName: string | null
}

export async function fetchPublicProgramSlotsForEvent(
  admin: SupabaseClient,
  eventId: string,
  isStaff: boolean,
): Promise<PublicProgramSlotDto[]> {
  const slots = await fetchProgramSlotRowsForEvent(admin, eventId)
  const list = slots.filter((s) => s.starts_at != null && s.ends_at != null).filter((s) =>
    slotVisibleToAttendee(
      {
        is_published: s.is_published !== undefined ? Boolean(s.is_published) : true,
        visibility: (s.visibility as string) || 'public',
        is_frozen: Boolean(s.is_frozen),
      },
      isStaff,
    ),
  )

  const ids = list.map((s) => s.id as string)
  const locationIds = Array.from(new Set(list.map((s) => s.location_id as string | null).filter(Boolean))) as string[]
  const trackIds = Array.from(new Set(list.map((s) => s.track_id as string | null).filter(Boolean))) as string[]

  const locNameById: Record<string, string> = {}
  const trackNameById: Record<string, string> = {}
  const tagNamesBySlot: Record<string, string[]> = {}
  const presentersBySlot: Record<
    string,
    { personId: string; sceneName: string; role: string; publicBio: string | null; photoUrl: string | null }[]
  > = {}

  const [locsResult, tracksResult, tagsResult, assignsResult] = await Promise.all([
    locationIds.length
      ? admin.from('dancecard_locations').select('id,name').in('id', locationIds).eq('event_id', eventId)
      : Promise.resolve({ data: [], error: null }),
    trackIds.length
      ? admin.from('dancecard_tracks').select('id,name').in('id', trackIds).eq('event_id', eventId)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? admin.from('dancecard_program_slot_tags').select('slot_id, tag:dancecard_tags(name)').in('slot_id', ids)
      : Promise.resolve({ data: [], error: null }),
    ids.length
      ? admin
          .from('dancecard_program_slot_persons')
          .select('slot_id, person_id, role, is_public_on_schedule')
          .in('slot_id', ids)
          .eq('is_public_on_schedule', true)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (locsResult.error) throw locsResult.error
  for (const loc of locsResult.data ?? []) locNameById[loc.id as string] = String(loc.name)

  if (tracksResult.error) throw tracksResult.error
  for (const t of tracksResult.data ?? []) trackNameById[t.id as string] = String(t.name)

  if (!tagsResult.error && tagsResult.data) {
    for (const link of tagsResult.data) {
      const sid = link.slot_id as string
      const tagRaw = link.tag as unknown
      const tag = (Array.isArray(tagRaw) ? tagRaw[0] : tagRaw) as { name: string } | null | undefined
      if (!tag?.name) continue
      if (!tagNamesBySlot[sid]) tagNamesBySlot[sid] = []
      tagNamesBySlot[sid].push(tag.name)
    }
  }

  if (!assignsResult.error && assignsResult.data?.length) {
    const assigns = assignsResult.data
    const pids = Array.from(new Set(assigns.map((a) => a.person_id as string)))
    const { data: people, error: peopleErr } = await admin
      .from('dancecard_persons')
      .select('id, scene_name, legal_name, show_legal_name_on_public, public_bio, photo_url')
      .in('id', pids)
      .eq('event_id', eventId)
    if (!peopleErr && people) {
      const pubName: Record<string, string> = {}
      const personMeta: Record<string, { publicBio: string | null; photoUrl: string | null }> = {}
      for (const p of people) {
        const id = p.id as string
        const showLegal = Boolean(p.show_legal_name_on_public)
        const legal = (p.legal_name as string | null) ?? ''
        const scene = String(p.scene_name ?? '')
        pubName[id] = showLegal && legal.trim() ? legal.trim() : scene
        personMeta[id] = {
          publicBio: (p.public_bio as string | null) ?? null,
          photoUrl: (p.photo_url as string | null) ?? null,
        }
      }
      for (const a of assigns) {
        const sid = a.slot_id as string
        const pid = a.person_id as string
        const name = pubName[pid]
        if (!name) continue
        const meta = personMeta[pid] ?? { publicBio: null, photoUrl: null }
        if (!presentersBySlot[sid]) presentersBySlot[sid] = []
        presentersBySlot[sid].push({
          personId: pid,
          sceneName: name,
          role: String(a.role),
          publicBio: meta.publicBio,
          photoUrl: meta.photoUrl,
        })
      }
    }
  }

  return list.map((s) => {
    const tn = s.track_id ? trackNameById[s.track_id as string] ?? null : null
    const legacy = (s.track as string | null) ?? null
    const trackDisplay = tn ?? legacy
    const locId = (s.location_id as string | null) ?? null
    const rawPhoto = String((s as { photo_policy?: string }).photo_policy ?? 'allowed')
    const photoPolicy: PublicProgramSlotDto['photoPolicy'] =
      rawPhoto === 'restricted' || rawPhoto === 'none' ? rawPhoto : 'allowed'
    return {
      id: s.id as string,
      startsAt: s.starts_at as string,
      endsAt: s.ends_at as string,
      title: s.title as string,
      track: legacy,
      trackId: (s.track_id as string | null) ?? null,
      trackDisplay,
      room: (s.room as string | null) ?? null,
      locationId: locId,
      locationName: locId ? locNameById[locId] ?? null : null,
      description: (s.description as string | null) ?? null,
      sortOrder: Number(s.sort_order ?? 0),
      tagNames: tagNamesBySlot[s.id as string] ?? [],
      presenters: presentersBySlot[s.id as string] ?? [],
      photoPolicy,
    }
  })
}
