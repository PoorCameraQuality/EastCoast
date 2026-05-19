import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { createSignedStorageUrl, DANCECARD_MAPS_BUCKET } from '@/lib/dancecard/dancecardStorage'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function missingMaps(error: unknown) {
  const e = error as { code?: string; message?: string }
  return e?.code === '42P01' || /dancecard_event_maps|relation .* does not exist/i.test(e?.message ?? '')
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await admin
      .from('dancecard_event_maps')
      .select('id, title, image_path, width_px, height_px, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
    if (error) {
      if (missingMaps(error)) return NextResponse.json({ maps: [], needsMigration: true })
      throw error
    }
    const out: {
      id: string
      title: string
      imagePath: string
      imageUrl: string | null
      widthPx: number | null
      heightPx: number | null
      sortOrder: number
    }[] = []
    for (const row of data ?? []) {
      const path = row.image_path as string
      const imageUrl = await createSignedStorageUrl(admin, path, DANCECARD_MAPS_BUCKET, 3600)
      out.push({
        id: row.id as string,
        title: row.title as string,
        imagePath: path,
        imageUrl,
        widthPx: (row.width_px as number | null) ?? null,
        heightPx: (row.height_px as number | null) ?? null,
        sortOrder: Number(row.sort_order ?? 0),
      })
    }
    return NextResponse.json({ maps: out })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await request.json()
    const imagePath = String(body.imagePath ?? '').trim()
    if (!imagePath) return NextResponse.json({ error: 'imagePath is required' }, { status: 400 })
    const title = body.title != null ? String(body.title).trim() || 'Venue map' : 'Venue map'
    const { data, error } = await admin
      .from('dancecard_event_maps')
      .insert({
        event_id: eventId,
        title,
        image_path: imagePath,
        width_px: Number.isFinite(Number(body.widthPx)) ? Number(body.widthPx) : null,
        height_px: Number.isFinite(Number(body.heightPx)) ? Number(body.heightPx) : null,
        sort_order: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      })
      .select('id, title, image_path, width_px, height_px, sort_order')
      .single()
    if (error) {
      if (missingMaps(error)) {
        return NextResponse.json({ error: 'Apply dancecard_014_venue_maps_pins.sql migration first.' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ map: data })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
