import { NextRequest, NextResponse } from 'next/server'
import { buildMapEmbedHtml } from '@/lib/dancecard/embedHtml'
import { embedRequestParentOrigin, verifyEmbedRequest } from '@/lib/dancecard/embedTokenAuth'
import { assertModuleEnabled, getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { parseThemeConfig, themeConfigToCssVars } from '@/lib/dancecard/theme'
import { fetchSignedVenueMapsForEvent } from '@/lib/dancecard/venueMapsSigned'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  const admin = getDancecardAdmin()
  const token = request.nextUrl.searchParams.get('token')
  const parentOrigin = embedRequestParentOrigin(request)
  try {
    const { eventId, title } = await verifyEmbedRequest(admin, context.params.eventSlug, token, parentOrigin, 'map')
    const modules = await getEventEntitlements(admin, eventId)
    assertModuleEnabled(modules, 'map_embed')
    const maps = await fetchSignedVenueMapsForEvent(admin, eventId, 12)
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    const cssVars = themeConfigToCssVars(parseThemeConfig((event as { theme_config?: unknown } | null)?.theme_config))
    const html = buildMapEmbedHtml(
      title,
      maps.map((m) => ({ title: m.title, imageUrl: m.imageUrl })),
      cssVars,
    )
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=120, s-maxage=120',
      },
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status ?? 500
    const msg =
      status === 401
        ? 'Unauthorized'
        : status === 403
          ? 'Forbidden'
          : status === 404
            ? 'Not found'
            : status === 503
              ? 'Embeds not available (apply migration dancecard_027_phase7_embed_entitlements.sql).'
              : 'Error'
    return new NextResponse(`<!DOCTYPE html><html><body><p>${msg}</p></body></html>`, {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}
