import { NextResponse } from 'next/server'
import { notifyEventIndex, requireEventCapability, writeEventAudit } from '@/lib/eckeOrgEvents'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['publish', 'unpublish', 'archive', 'restore']),
})

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const gated = await requireEventCapability(params.slug, 'settings')
  if (gated.error || !gated.session || !gated.admin || !gated.event) {
    return NextResponse.json({ error: gated.error }, { status: gated.status })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const now = new Date().toISOString()
  const patch =
    parsed.data.action === 'publish'
      ? { status: 'published', archived_at: null, published_at: now }
      : parsed.data.action === 'unpublish'
        ? { status: 'draft', archived_at: null }
        : parsed.data.action === 'archive'
          ? { status: 'archived', archived_at: now }
          : { status: 'draft', archived_at: null }

  const { error } = await gated.admin.from('events').update(patch).eq('id', gated.event.id)
  if (error) return NextResponse.json({ error: 'Could not update status' }, { status: 500 })
  await writeEventAudit(
    gated.event.id,
    gated.session.organization.id,
    gated.session.user.id,
    parsed.data.action,
    `${parsed.data.action} ${gated.event.title}`,
  )
  if (parsed.data.action === 'publish') notifyEventIndex(gated.event.slug, gated.event.state, 'publish')
  if (parsed.data.action === 'unpublish') notifyEventIndex(gated.event.slug, gated.event.state, 'unpublish')
  if (parsed.data.action === 'archive') notifyEventIndex(gated.event.slug, gated.event.state, 'archive')
  return NextResponse.json({ ok: true })
}
