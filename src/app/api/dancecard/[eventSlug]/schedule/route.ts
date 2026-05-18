import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { fetchPublicProgramSlotsForEvent } from '@/lib/dancecard/publicProgramSlotsData'
import { parseThemeConfig, themeConfigForPublicApi } from '@/lib/dancecard/theme'

/** Always hit origin + Supabase; avoid any edge cache of an empty first response. */
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    const isStaff = Boolean(session?.isStaff)
    const slots = await fetchPublicProgramSlotsForEvent(admin, event.id, isStaff)
    const body = {
      meta: {
        productTitle: event.product_title,
        eventTitle: event.event_title,
        subtitle: event.subtitle,
        timezone: event.timezone,
        windowStartsAt: event.window_starts_at,
        windowEndsAt: event.window_ends_at,
        sharedByLabel: event.shared_by_label,
        sharedByDetail: event.shared_by_detail,
        logoUrl: event.logo_url,
        theme: themeConfigForPublicApi(parseThemeConfig((event as { theme_config?: unknown }).theme_config)),
      },
      slots: slots.map((s) => ({
        id: s.id,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        title: s.title,
        track: s.track,
        trackId: s.trackId,
        trackDisplay: s.trackDisplay,
        room: s.room,
        locationId: s.locationId,
        description: s.description,
        sortOrder: s.sortOrder,
        tagNames: s.tagNames,
        presenters: s.presenters,
        photoPolicy: s.photoPolicy,
        locationName: s.locationName,
      })),
    }
    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'private, max-age=0, stale-while-revalidate=120',
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-schedule')
  }
}
