import { NextResponse } from 'next/server'
import { requireEventCapability, uniqueEventSlug, writeEventAudit } from '@/lib/eckeOrgEvents'

export async function POST(_request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'edit')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  const { data: source } = await gated.admin.from('events').select('*').eq('id', gated.event.id).single()
  if (!source) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

  const slug = await uniqueEventSlug(`${gated.event.title} copy`)
  const {
    id: _id,
    created_at: _created,
    views: _views,
    post_count: _posts,
    ...rest
  } = source as Record<string, unknown>
  const copy = {
    ...rest,
    title: `${gated.event.title} (copy)`,
    slug,
    status: 'draft',
    published_at: null,
    archived_at: null,
    views: 0,
    organization_id: gated.session.organization.id,
  }

  const { data, error } = await gated.admin.from('events').insert(copy).select('id, slug').single()
  if (error || !data) {
    console.error('ORG EVENT DUPLICATE', error)
    return NextResponse.json({ error: 'Could not duplicate event' }, { status: 500 })
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
    'duplicate',
    `Duplicated from ${gated.event.title}`,
  )
  return NextResponse.json({ ok: true, slug: data.slug })
}
