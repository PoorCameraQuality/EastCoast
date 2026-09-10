import { NextResponse } from 'next/server'
import {
  notifyPlaceIndex,
  orgPlaceSchema,
  placeWritePayload,
  requireOwnedPlace,
  takeRequestedPlaceSlug,
  uniquePlaceSlug,
} from '@/lib/eckeOrgDungeons'
import { slugifyPlaceSlug } from '@/lib/eckeOrgDungeonShared'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export async function GET() {
  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  return NextResponse.json({ ok: true, place: gated.place })
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.forms)
  if (limited) return limited

  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session || !gated.admin) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  if (gated.place) {
    return NextResponse.json({ error: 'This organization already has a dungeon or club listing' }, { status: 409 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = orgPlaceSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const requestedSlug = parsed.data.slug?.trim()
  const resolved = requestedSlug
    ? await takeRequestedPlaceSlug(requestedSlug)
    : { slug: await uniquePlaceSlug(parsed.data.name) }
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 409 })
  }

  const payload = placeWritePayload(parsed.data, gated.session.organization.id, resolved.slug)
  const { data, error } = await gated.admin
    .from('dungeon_venues')
    .insert(payload)
    .select('id, slug, status')
    .single()
  if (error || !data) {
    console.error('ORG PLACE CREATE', error)
    return NextResponse.json({ error: 'Could not create this location' }, { status: 500 })
  }

  if (data.status === 'published') {
    setImmediate(() => notifyPlaceIndex({ ...payload, slug: data.slug }, 'publish'))
  }
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug, status: data.status })
}

export async function PATCH(request: Request) {
  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session || !gated.admin || !gated.place) {
    return NextResponse.json(
      { error: gated.error || 'Create a dungeon or club first' },
      { status: gated.place ? gated.status : 404 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = orgPlaceSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const requestedSlug = parsed.data.slug?.trim()
  let slug = gated.place.slug
  if (requestedSlug && slugifyPlaceSlug(requestedSlug) !== gated.place.slug) {
    const resolved = await takeRequestedPlaceSlug(requestedSlug, gated.place.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 409 })
    }
    slug = resolved.slug
  }

  const payload = placeWritePayload(parsed.data, gated.session.organization.id, slug)
  const { error } = await gated.admin.from('dungeon_venues').update(payload).eq('id', gated.place.id)
  if (error) {
    console.error('ORG PLACE UPDATE', error)
    return NextResponse.json({ error: 'Could not update this location' }, { status: 500 })
  }
  if (slug !== gated.place.slug) {
    await gated.admin.from('events').update({ dungeon_slug: slug }).eq('dungeon_venue_id', gated.place.id)
  }

  const place = gated.place
  const wasPublic = place.status === 'published'
  const isPublic = payload.status === 'published'
  if (isPublic) {
    if (slug !== place.slug) {
      setImmediate(() => notifyPlaceIndex(place, 'delete'))
    }
    setImmediate(() => notifyPlaceIndex({ ...payload, slug }, wasPublic ? 'update' : 'publish'))
  } else if (wasPublic) {
    setImmediate(() => notifyPlaceIndex(place, 'unpublish'))
  }

  return NextResponse.json({ ok: true, slug, status: payload.status })
}

export async function DELETE() {
  const gated = await requireOwnedPlace()
  if (gated.error || !gated.session || !gated.admin || !gated.place) {
    return NextResponse.json({ error: gated.error || 'Location not found' }, { status: gated.place ? gated.status : 404 })
  }
  const { error } = await gated.admin.from('dungeon_venues').delete().eq('id', gated.place.id)
  if (error) {
    return NextResponse.json({ error: 'Could not delete this location' }, { status: 500 })
  }
  const place = gated.place
  if (place.status === 'published') {
    setImmediate(() => notifyPlaceIndex(place, 'delete'))
  }
  return NextResponse.json({ ok: true })
}
