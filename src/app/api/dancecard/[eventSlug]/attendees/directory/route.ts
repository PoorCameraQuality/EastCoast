import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { DANCECARD_ACCOUNT_REGISTRANT_SOURCE } from '@/lib/dancecard/ensureSelfServiceRegistrant'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 30

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const modules = await getEventEntitlements(admin, event.id)
    try {
      assertModuleEnabled(modules, 'attendee_directory')
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cursor = request.nextUrl.searchParams.get('cursor') ?? '0'
    const offset = Math.max(0, parseInt(cursor, 10) || 0)
    const attendingOnly = request.nextUrl.searchParams.get('attending') === '1'

    const { data: accounts, error } = await admin
      .from('dancecard_accounts')
      .select(
        'id, username, display_name, dancecard_prefs!inner(show_in_attendee_directory, show_attending_status)',
      )
      .eq('event_id', event.id)
      .neq('id', session.accountId)
      .eq('dancecard_prefs.show_in_attendee_directory', true)
      .order('display_name', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error?.code === '42703' || error?.code === 'PGRST200') {
      return NextResponse.json({ entries: [], nextCursor: null, needsMigration: 'dancecard_057_compare_social_prefs.sql' })
    }
    if (error) throw error

    const accountIds = (accounts ?? []).map((a) => a.id as string)
    const attendingIds = new Set<string>()
    if (accountIds.length) {
      const { data: regs } = await admin
        .from('dancecard_registrants')
        .select('external_id')
        .eq('event_id', event.id)
        .eq('external_source', DANCECARD_ACCOUNT_REGISTRANT_SOURCE)
        .in('external_id', accountIds)
        .neq('status', 'cancelled')
      for (const r of regs ?? []) {
        if (r.external_id) attendingIds.add(r.external_id as string)
      }
    }

    const entries = (accounts ?? [])
      .map((a) => {
        const prefs = a.dancecard_prefs as { show_attending_status?: boolean }
        const accountId = a.id as string
        const isAttending = attendingIds.has(accountId)
        if (attendingOnly && (!prefs.show_attending_status || !isAttending)) return null
        return {
          accountId,
          username: a.username as string,
          sceneName: a.display_name as string,
          attending: prefs.show_attending_status && isAttending ? true : undefined,
        }
      })
      .filter(Boolean)

    const nextCursor = (accounts?.length ?? 0) >= PAGE_SIZE ? String(offset + PAGE_SIZE) : null
    return NextResponse.json({ entries, nextCursor })
  } catch (e) {
    return jsonFromRouteError(e, 'attendees-directory')
  }
}
