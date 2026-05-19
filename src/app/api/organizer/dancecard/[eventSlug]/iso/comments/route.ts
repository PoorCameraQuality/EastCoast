import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizerForSlug, organizerErrorResponse } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data: posts } = await admin.from('dancecard_iso_posts').select('id').eq('event_id', eventId)
    const postIds = (posts ?? []).map((p) => p.id as string)
    if (!postIds.length) return NextResponse.json({ comments: [] })

    const { data, error } = await admin
      .from('dancecard_iso_comments')
      .select('id, iso_post_id, body, status, created_at, dancecard_accounts(display_name, username)')
      .in('iso_post_id', postIds)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error?.code === '42P01') {
      return NextResponse.json({ comments: [], needsMigration: 'dancecard_053_iso_comments.sql' })
    }
    if (error) throw error

    const comments = (data ?? []).map((c) => {
      const acct = c.dancecard_accounts as { display_name?: string; username?: string } | null
      return {
        id: c.id as string,
        postId: c.iso_post_id as string,
        body: c.body as string,
        status: c.status as string,
        createdAt: c.created_at as string,
        authorName: acct?.display_name ?? 'Attendee',
        authorUsername: acct?.username ?? null,
      }
    })
    return NextResponse.json({ comments })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
