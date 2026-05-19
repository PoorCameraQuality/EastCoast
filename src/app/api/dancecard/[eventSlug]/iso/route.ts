import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { assertHttpsUrl } from '@/lib/security/safeUrl'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().max(2000).optional(),
  tags: z.array(z.string().max(40)).max(8).optional(),
  visibility: z.enum(['public', 'organizers_only', 'hidden']).optional(),
  contactReveal: z.enum(['on_interest', 'never']).optional(),
  contactLink: z.string().max(2000).nullable().optional(),
})

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)

    let q = admin
      .from('dancecard_iso_posts')
      .select(
        'id, account_id, title, body, tags, visibility, contact_reveal, contact_link, status, curated_pin, created_at, updated_at'
      )
      .eq('event_id', event.id)
      .eq('status', 'active')
      .order('curated_pin', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await q
    if (error) {
      const code = (error as { code?: string }).code
      if (code === '42P01') return NextResponse.json({ posts: [] })
      throw error
    }

    const visible = (data ?? []).filter((p) => {
      if (p.visibility === 'hidden') return session?.accountId === p.account_id
      if (p.visibility === 'organizers_only') return false
      return p.visibility === 'public'
    })

    const authorIds = Array.from(new Set(visible.map((p) => p.account_id as string)))
    const { data: authors } = authorIds.length
      ? await admin.from('dancecard_accounts').select('id, display_name, username').in('id', authorIds)
      : { data: [] }
    const byAuthor = new Map((authors ?? []).map((a) => [a.id as string, a]))

    const postIds = visible.map((p) => p.id as string)
    const commentCounts = new Map<string, number>()
    if (postIds.length) {
      const { data: commentRows, error: cErr } = await admin
        .from('dancecard_iso_comments')
        .select('iso_post_id')
        .in('iso_post_id', postIds)
        .eq('status', 'active')
      if (cErr && (cErr as { code?: string }).code !== '42P01') throw cErr
      for (const row of commentRows ?? []) {
        const pid = row.iso_post_id as string
        commentCounts.set(pid, (commentCounts.get(pid) ?? 0) + 1)
      }
    }

    const posts = visible.map((p) => {
      const a = byAuthor.get(p.account_id as string)
      const contactLinkRaw = (p as { contact_link?: string | null }).contact_link
      return {
        id: p.id as string,
        title: p.title as string,
        body: p.body as string,
        tags: (p.tags as string[]) ?? [],
        contactReveal: p.contact_reveal as string,
        contactLink: contactLinkRaw ? assertHttpsUrl(contactLinkRaw) : null,
        curatedPin: Boolean(p.curated_pin),
        createdAt: p.created_at as string,
        commentCount: commentCounts.get(p.id as string) ?? 0,
        isMine: session?.accountId === p.account_id,
        authorSceneName: (a?.display_name as string) ?? 'Attendee',
        ...(session?.accountId === p.account_id
          ? {
              authorAccountId: p.account_id as string,
              authorUsername: a?.username as string,
            }
          : {}),
      }
    })

    return NextResponse.json({ posts })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled for this event' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-get')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = postSchema.parse(await request.json())
    const contactLink =
      body.contactLink === undefined || body.contactLink === null
        ? null
        : assertHttpsUrl(body.contactLink.trim())

    const { data, error } = await admin
      .from('dancecard_iso_posts')
      .insert({
        event_id: event.id,
        account_id: session.accountId,
        title: body.title.trim(),
        body: (body.body ?? '').trim(),
        tags: body.tags ?? [],
        visibility: body.visibility ?? 'public',
        contact_reveal: body.contactReveal ?? 'on_interest',
        contact_link: contactLink,
        status: 'active',
      })
      .select('id')
      .single()
    if (error) throw error

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-post')
  }
}
