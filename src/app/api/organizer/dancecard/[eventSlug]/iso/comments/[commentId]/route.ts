import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getDancecardAdmin, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  status: z.enum(['active', 'hidden']),
})

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; commentId: string } },
) {
  try {
    const auth = await requireOrganizerForSlug(context.params.eventSlug)
    const body = bodySchema.parse(await request.json())
    const admin = getDancecardAdmin()

    const { data: comment, error: cErr } = await admin
      .from('dancecard_iso_comments')
      .select('id, iso_post_id')
      .eq('id', context.params.commentId)
      .maybeSingle()
    if (cErr) throw cErr
    if (!comment?.iso_post_id) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: post, error: pErr } = await admin
      .from('dancecard_iso_posts')
      .select('id')
      .eq('id', comment.iso_post_id)
      .eq('event_id', auth.eventId)
      .maybeSingle()
    if (pErr) throw pErr
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { error } = await admin
      .from('dancecard_iso_comments')
      .update({ status: body.status })
      .eq('id', context.params.commentId)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'iso-comment-patch')
  }
}
