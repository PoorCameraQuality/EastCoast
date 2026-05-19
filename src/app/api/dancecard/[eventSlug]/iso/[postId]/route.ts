import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { buildCommentTree, type IsoCommentRow } from '@/lib/dancecard/isoComments'
import { loadIsoAuthorProfiles } from '@/lib/dancecard/isoAuthorProfile'
import { assertHttpsUrl } from '@/lib/security/safeUrl'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['active', 'filled', 'withdrawn']).optional(),
  visibility: z.enum(['public', 'organizers_only', 'hidden']).optional(),
})

function postVisible(
  p: { visibility: string; account_id: string; status: string },
  sessionAccountId: string | undefined,
) {
  if (p.status !== 'active') return false
  if (p.visibility === 'hidden') return sessionAccountId === p.account_id
  if (p.visibility === 'organizers_only') return false
  return p.visibility === 'public'
}

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)
    const postId = context.params.postId

    const { data: post, error: pErr } = await admin
      .from('dancecard_iso_posts')
      .select(
        'id, account_id, title, body, tags, visibility, contact_reveal, contact_link, status, curated_pin, created_at, updated_at'
      )
      .eq('id', postId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!post || !postVisible(post as { visibility: string; account_id: string; status: string }, session?.accountId)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { data: commentRows, error: cErr } = await admin
      .from('dancecard_iso_comments')
      .select('id, parent_comment_id, account_id, body, created_at')
      .eq('iso_post_id', postId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })
    if (cErr && (cErr as { code?: string }).code !== '42P01') throw cErr

    const commentAuthorIds = (commentRows ?? []).map((c) => c.account_id as string)
    const profiles = await loadIsoAuthorProfiles(
      admin,
      [post.account_id as string, ...commentAuthorIds],
      (event as { attendee_profile_config?: unknown }).attendee_profile_config,
    )

    const authorProfile = profiles.get(post.account_id as string) ?? null
    const flatComments: IsoCommentRow[] = (commentRows ?? []).map((c) => {
      const prof = profiles.get(c.account_id as string)
      return {
        id: c.id as string,
        parentCommentId: (c.parent_comment_id as string | null) ?? null,
        accountId: c.account_id as string,
        authorSceneName: prof?.displayName ?? 'Attendee',
        body: c.body as string,
        createdAt: c.created_at as string,
        isMine: session?.accountId === c.account_id,
      }
    })

    const contactLinkRaw = (post as { contact_link?: string | null }).contact_link

    return NextResponse.json({
      post: {
        id: post.id as string,
        title: post.title as string,
        body: post.body as string,
        tags: (post.tags as string[]) ?? [],
        contactReveal: post.contact_reveal as string,
        contactLink: contactLinkRaw ? assertHttpsUrl(contactLinkRaw) : null,
        curatedPin: Boolean(post.curated_pin),
        createdAt: post.created_at as string,
        isMine: session?.accountId === post.account_id,
        authorAccountId: post.account_id as string,
        authorProfile,
      },
      comments: buildCommentTree(flatComments),
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-detail-get')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = patchSchema.parse(await request.json())

    const { data: post, error: fErr } = await admin
      .from('dancecard_iso_posts')
      .select('account_id')
      .eq('id', context.params.postId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (fErr) throw fErr
    if (!post || post.account_id !== session.accountId) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const { error } = await admin
      .from('dancecard_iso_posts')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', context.params.postId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-patch')
  }
}
