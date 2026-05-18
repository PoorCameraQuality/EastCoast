import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { defaultZoneSizeForShape, isMapZoneShape } from '@/lib/dancecard/mapPinZones'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; mapId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { data: map, error: mErr } = await admin
      .from('dancecard_event_maps')
      .select('id')
      .eq('id', context.params.mapId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (mErr) throw mErr
    if (!map) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { data: pins, error } = await admin
      .from('dancecard_map_pins')
      .select('id, location_id, x, y, label, shape, width_frac, height_frac, rotation_deg')
      .eq('map_id', context.params.mapId)
    if (error) throw error
    return NextResponse.json({
      pins: (pins ?? []).map((p) => ({
        id: p.id,
        locationId: p.location_id,
        x: Number(p.x),
        y: Number(p.y),
        label: p.label,
        shape: p.shape ?? 'circle',
        width: Number(p.width_frac ?? 0.12),
        height: Number(p.height_frac ?? 0.12),
        rotation: Number(p.rotation_deg ?? 0),
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PUT(request: NextRequest, context: { params: { eventSlug: string; mapId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { data: map, error: mErr } = await admin
      .from('dancecard_event_maps')
      .select('id')
      .eq('id', context.params.mapId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (mErr) throw mErr
    if (!map) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const pinsIn: unknown[] = Array.isArray(body.pins) ? body.pins : []
    type PinNorm = {
      location_id: string
      x: number
      y: number
      label: string | null
      shape: string
      width_frac: number
      height_frac: number
      rotation_deg: number
    }
    const normalized: PinNorm[] = []
    for (const raw of pinsIn) {
      const p = raw as {
        locationId?: string
        x?: number
        y?: number
        label?: string | null
        shape?: string
        width?: number
        height?: number
        rotation?: number
      }
      const location_id = String(p.locationId ?? '').trim()
      if (!location_id) continue
      const shape = isMapZoneShape(p.shape) ? p.shape : 'circle'
      const defaults = defaultZoneSizeForShape(shape)
      normalized.push({
        location_id,
        x: Math.max(0, Math.min(1, Number(p.x) || 0)),
        y: Math.max(0, Math.min(1, Number(p.y) || 0)),
        label: p.label != null ? String(p.label).trim() || null : null,
        shape,
        width_frac: Math.max(0.04, Math.min(0.75, Number(p.width) || defaults.width)),
        height_frac: Math.max(0.04, Math.min(0.75, Number(p.height) || defaults.height)),
        rotation_deg: Math.max(-180, Math.min(180, Number(p.rotation) || 0)),
      })
    }

    const locIds = Array.from(new Set(normalized.map((p) => p.location_id)))
    if (locIds.length) {
      const { data: locs, error: lErr } = await admin
        .from('dancecard_locations')
        .select('id')
        .eq('event_id', eventId)
        .in('id', locIds)
      if (lErr) throw lErr
      if ((locs ?? []).length !== locIds.length) {
        return NextResponse.json({ error: 'One or more locations are not in this event' }, { status: 400 })
      }
    }

    const { error: delErr } = await admin.from('dancecard_map_pins').delete().eq('map_id', context.params.mapId)
    if (delErr) throw delErr

    if (normalized.length) {
      const inserts = normalized.map((p) => ({
        map_id: context.params.mapId,
        location_id: p.location_id,
        x: p.x,
        y: p.y,
        label: p.label,
        shape: p.shape,
        width_frac: p.width_frac,
        height_frac: p.height_frac,
        rotation_deg: p.rotation_deg,
      }))
      const { error: insErr } = await admin.from('dancecard_map_pins').insert(inserts)
      if (insErr) throw insErr
    }

    return NextResponse.json({ ok: true, count: normalized.length })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
