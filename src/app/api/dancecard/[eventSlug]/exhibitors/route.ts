import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const modules = await getEventEntitlements(admin, event.id)
    try {
      assertModuleEnabled(modules, 'exhibitor_directory')
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await admin
      .from('dancecard_exhibitors')
      .select('id, name, booth, hours, description, tags, specials, view_count')
      .eq('event_id', event.id)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error?.code === '42P01') {
      return NextResponse.json({ exhibitors: [], needsMigration: 'dancecard_059_exhibitors.sql' })
    }
    if (error) throw error

    return NextResponse.json({ exhibitors: data ?? [] })
  } catch (e) {
    return jsonFromRouteError(e, 'exhibitors-get')
  }
}
