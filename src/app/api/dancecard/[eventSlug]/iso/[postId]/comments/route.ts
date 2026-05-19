import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function attendeePostVisible(post: { visibility: string; status: string }) {
  return post.status === 'active' && post.visibility === 'public'
}

const commentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentCommentId: z.string().uuid().nullable().optional(),
})

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
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

    const postId = context.params.postId
    const body = commentSchema.parse(await request.json())

    const { data: post, error: pErr } = await admin
      .from('dancecard_iso_posts')
      .select('id, status, visibility')
      .eq('id', postId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!post || !attendeePostVisible(post as { visibility: string; status: string })) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (body.parentCommentId) {
      const { data: parent, error: parErr } = await admin
        .from('dancecard_iso_comments')
        .select('id, iso_post_id')
        .eq('id', body.parentCommentId)
        .eq('status', 'active')
        .maybeSingle()
      if (parErr) throw parErr
      if (!parent || parent.iso_post_id !== postId) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 })
      }
    }

    const { data, error } = await admin
      .from('dancecard_iso_comments')
      .insert({
        iso_post_id: postId,
        parent_comment_id: body.parentCommentId ?? null,
        account_id: session.accountId,
        body: body.body.trim(),
        status: 'active',
      })
      .select('id')
      .single()
    if (error) {
      const code = (error as { code?: string }).code
      if (code === '42P01') {
        return NextResponse.json(
          { error: 'Apply migration dancecard_053_iso_comments.sql first.' },
          { status: 409 },
        )
      }
      throw error
    }

    return NextResponse.json({ ok: true, id: data.id })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-comment-post')
  }
}
