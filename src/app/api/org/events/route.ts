import { NextResponse } from 'next/server'
import {
  eventWritePayload,
  fetchOwnedPlaceLink,
  listManagedEvents,
  notifyEventIndex,
  orgEventSchema,
  requireOrgApiSession,
  takeRequestedEventSlug,
  uniqueEventSlug,
  writeEventAudit,
  applyPlaceLinkToEventInput,
  toOrgEventInput,
} from '@/lib/eckeOrgEvents'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

export async function GET() {
  const gated = await requireOrgApiSession()
  if (gated.error || !gated.session) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  const events = await listManagedEvents(gated.session.organization.id)
  return NextResponse.json({ ok: true, events })
}

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.forms)
  if (limited) return limited

  const gated = await requireOrgApiSession()
  if (gated.error || !gated.session || !gated.admin) {
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
  const resolved = requestedSlug
    ? await takeRequestedEventSlug(requestedSlug)
    : { slug: await uniqueEventSlug(parsed.data.title) }
  if ('error' in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 409 })
  }
  const slug = resolved.slug
  const place = await fetchOwnedPlaceLink(gated.admin, gated.session.organization.id)
  const hostAtPlace = parsed.data.hostAtPlace ?? Boolean(place)
  const linked = applyPlaceLinkToEventInput(toOrgEventInput(parsed.data), place, hostAtPlace)
  if (!linked.input.isOnline && (!linked.input.city?.trim() || !linked.input.state?.trim())) {
    return NextResponse.json({ error: 'City and state are required' }, { status: 400 })
  }
  const payload = eventWritePayload(linked.input, gated.session.organization, slug, linked.placeLink)
  const { data, error } = await gated.admin.from('events').insert(payload).select('id, slug, title, status').single()
  if (error || !data) {
    console.error('ORG EVENT CREATE', error)
    return NextResponse.json({ error: 'Could not create event' }, { status: 500 })
  }

  await gated.admin.from('event_members').insert({
    event_id: data.id,
    user_id: gated.session.user.id,
    organization_id: gated.session.organization.id,
    role: 'owner',
  })
  await writeEventAudit(
    data.id,
    gated.session.organization.id,
    gated.session.user.id,
    'create',
    `Created ${data.title}`,
  )
  if (data.status === 'published') notifyEventIndex(data.slug, payload.state, 'publish')
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug, status: data.status })
}
