import type { SupabaseClient } from '@supabase/supabase-js'
import { DANCECARD_MAPS_BUCKET } from '@/lib/dancecard/dancecardMapsConstants'

import type { MapZoneShape } from '@/lib/dancecard/mapPinZones'

export type VenueMapPinDto = {
  locationId: string
  x: number
  y: number
  label: string | null
  shape: MapZoneShape
  width: number
  height: number
  rotation: number
}
export type SignedVenueMapDto = {
  id: string
  title: string
  imageUrl: string | null
  pins: VenueMapPinDto[]
  locationNames: Record<string, string>
}

export async function fetchSignedVenueMapsForEvent(
  admin: SupabaseClient,
  eventId: string,
  limit = 20,
): Promise<SignedVenueMapDto[]> {
  const { data: maps, error: mErr } = await admin
    .from('dancecard_event_maps')
    .select('id, title, image_path, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .limit(limit)
  if (mErr) return []

  const { data: locRows } = await admin.from('dancecard_locations').select('id, name').eq('event_id', eventId)
  const locationNames: Record<string, string> = {}
  for (const l of locRows ?? []) {
    const name = String(l.name ?? '').trim()
    if (name) locationNames[l.id as string] = name
  }

  const mapList = maps ?? []
  const mapIds = mapList.map((m) => m.id as string)

  const pinsByMapId = new Map<string, VenueMapPinDto[]>()
  if (mapIds.length) {
    const { data: allPins } = await admin
      .from('dancecard_map_pins')
      .select('map_id, location_id, x, y, label, shape, width_frac, height_frac, rotation_deg')
      .in('map_id', mapIds)
    for (const p of allPins ?? []) {
      const mapId = p.map_id as string
      const list = pinsByMapId.get(mapId) ?? []
      list.push({
        locationId: p.location_id as string,
        x: Number(p.x),
        y: Number(p.y),
        label: (p.label as string | null) ?? null,
        shape: (p.shape as MapZoneShape) ?? 'circle',
        width: Number(p.width_frac ?? 0.12),
        height: Number(p.height_frac ?? 0.12),
        rotation: Number(p.rotation_deg ?? 0),
      })
      pinsByMapId.set(mapId, list)
    }
  }

  const out = await Promise.all(
    mapList.map(async (m) => {
      const path = m.image_path as string
      const signed = await admin.storage.from(DANCECARD_MAPS_BUCKET).createSignedUrl(path, 3600)
      return {
        id: m.id as string,
        title: String(m.title ?? 'Map'),
        imageUrl: signed.data?.signedUrl ?? null,
        locationNames,
        pins: pinsByMapId.get(m.id as string) ?? [],
      }
    }),
  )
  return out
}
