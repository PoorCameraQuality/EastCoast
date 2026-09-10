import { NextResponse } from 'next/server'
import {
  listAllEventPosts,
  orgEventPostSchema,
  requireEventCapability,
  writeEventAudit,
} from '@/lib/eckeOrgEvents'

function asUrl(value?: string) {
  const raw = (value || '').trim()
  if (!raw) return null
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'view')
  if (gated.error || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }
  const posts = await listAllEventPosts(gated.event.id)
  return NextResponse.json({ ok: true, posts })
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'post')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = orgEventPostSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Validation failed' }, { status: 400 })
  }

  const scheduled = parsed.data.publishMode === 'schedule' && parsed.data.publishAt
  const publishedAt = scheduled ? new Date(parsed.data.publishAt!).toISOString() : new Date().toISOString()
  const { error } = await gated.admin.from('event_posts').insert({
    event_id: gated.event.id,
    organization_id: gated.session.organization.id,
    author_user_id: gated.session.user.id,
    title: parsed.data.title.trim(),
    body: parsed.data.body.trim(),
    image_url: asUrl(parsed.data.imageUrl),
    status: scheduled && new Date(publishedAt) > new Date() ? 'scheduled' : 'published',
    published_at: publishedAt,
  })
  if (error) {
    console.error('ORG EVENT POST', error)
    return NextResponse.json({ error: 'Could not publish update' }, { status: 500 })
  }
  await writeEventAudit(
    gated.event.id,
    gated.session.organization.id,
    gated.session.user.id,
    'post',
    `Published “${parsed.data.title.trim()}”`,
  )
  return NextResponse.json({ ok: true })
}
