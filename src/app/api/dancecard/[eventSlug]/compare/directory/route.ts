import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { isCompareBlocked } from '@/lib/dancecard/comparePrivacy'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 30

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardCompare)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const cursor = request.nextUrl.searchParams.get('cursor') ?? '0'
    const offset = Math.max(0, parseInt(cursor, 10) || 0)

    const { data: accounts, error: aErr } = await admin
      .from('dancecard_accounts')
      .select('id, username, display_name, dancecard_prefs!inner(show_in_compare_directory, compare_visibility)')
      .eq('event_id', event.id)
      .neq('id', session.accountId)
      .eq('dancecard_prefs.show_in_compare_directory', true)
      .eq('dancecard_prefs.compare_visibility', 'username')
      .order('display_name', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)
    if (aErr) {
      const code = (aErr as { code?: string }).code
      if (code === '42703' || code === 'PGRST200') return NextResponse.json({ entries: [], nextCursor: null })
      throw aErr
    }

    const visible: { accountId: string; username: string; sceneName: string }[] = []
    for (const a of accounts ?? []) {
      const accountId = a.id as string
      if (await isCompareBlocked(admin, event.id, session.accountId, accountId)) continue
      visible.push({
        accountId,
        username: a.username as string,
        sceneName: a.display_name as string,
      })
    }

    const nextCursor = (accounts?.length ?? 0) >= PAGE_SIZE ? String(offset + PAGE_SIZE) : null

    return NextResponse.json({ entries: visible, nextCursor })
  } catch (e) {
    return jsonFromRouteError(e, 'compare-directory')
  }
}
