import { NextRequest, NextResponse } from 'next/server'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

/** Poster-only: list pending/accepted interests on a post. */
export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, _request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const postId = context.params.postId
    const { data: post, error: pErr } = await admin
      .from('dancecard_iso_posts')
      .select('id, account_id, event_id')
      .eq('id', postId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.account_id !== session.accountId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rows, error } = await admin
      .from('dancecard_iso_interests')
      .select('id, status, created_at, from_account_id, dancecard_accounts(username, display_name)')
      .eq('iso_post_id', postId)
      .order('created_at', { ascending: true })
    if (error) throw error

    const interests = (rows ?? []).map((r) => {
      const a = r.dancecard_accounts as { username?: string; display_name?: string } | { username?: string; display_name?: string }[] | null
      const acc = Array.isArray(a) ? a[0] : a
      return {
        id: r.id as string,
        status: r.status as string,
        createdAt: r.created_at as string,
        fromUsername: acc?.username ?? '',
        fromDisplayName: acc?.display_name ?? '',
      }
    })

    return NextResponse.json({ interests })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-interests-list')
  }
}
