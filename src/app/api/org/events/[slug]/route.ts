import { NextResponse } from 'next/server'
import {
  applyPlaceLinkToEventInput,
  eventWritePayload,
  fetchOwnedPlaceLink,
  notifyEventIndex,
  orgEventSchema,
  requireEventCapability,
  takeRequestedEventSlug,
  toOrgEventInput,
  writeEventAudit,
} from '@/lib/eckeOrgEvents'
import { slugifyEventSlug } from '@/lib/eckeOrgEventShared'

export async function PATCH(request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'edit')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = orgEventSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const requestedSlug = parsed.data.slug?.trim()
  let slug = gated.event.slug
  if (requestedSlug && slugifyEventSlug(requestedSlug) !== gated.event.slug) {
    const resolved = await takeRequestedEventSlug(requestedSlug, gated.event.id)
    if ('error' in resolved) {
      return NextResponse.json({ error: resolved.error }, { status: 409 })
    }
    slug = resolved.slug
  }
  const place = await fetchOwnedPlaceLink(gated.admin, gated.session.organization.id)
  const hostAtPlace = parsed.data.hostAtPlace ?? Boolean(gated.event.dungeon_venue_id || gated.event.dungeon_slug)
  const linked = applyPlaceLinkToEventInput(toOrgEventInput(parsed.data), place, hostAtPlace)
  if (!linked.input.isOnline && (!linked.input.city?.trim() || !linked.input.state?.trim())) {
    return NextResponse.json({ error: 'City and state are required' }, { status: 400 })
  }
  const payload = eventWritePayload(linked.input, gated.session.organization, slug, linked.placeLink)
  const { logo: _logo, images: _images, ...details } = payload
  const { error } = await gated.admin.from('events').update(details).eq('id', gated.event.id)
  if (error) {
    console.error('ORG EVENT UPDATE', error)
    return NextResponse.json({ error: 'Could not update event' }, { status: 500 })
  }
  await writeEventAudit(
    gated.event.id,
    gated.session.organization.id,
    gated.session.user.id,
    'edit',
    'Updated event details',
  )
  if (payload.status === 'published') {
    if (slug !== gated.event.slug) notifyEventIndex(gated.event.slug, payload.state, 'delete')
    notifyEventIndex(slug, payload.state, 'update')
  }
  return NextResponse.json({ ok: true, slug })
}

export async function DELETE(_request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'delete')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  const { error } = await gated.admin.from('events').delete().eq('id', gated.event.id)
  if (error) {
    return NextResponse.json({ error: 'Could not delete event' }, { status: 500 })
  }
  notifyEventIndex(gated.event.slug, gated.event.state, 'delete')
  return NextResponse.json({ ok: true })
}
