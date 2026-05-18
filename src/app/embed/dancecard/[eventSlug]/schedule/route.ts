import { NextRequest, NextResponse } from 'next/server'
import { buildScheduleEmbedHtml } from '@/lib/dancecard/embedHtml'
import { embedRequestParentOrigin, verifyEmbedRequest } from '@/lib/dancecard/embedTokenAuth'
import { assertModuleEnabled, getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import { fetchPublicProgramSlotsForEvent } from '@/lib/dancecard/publicProgramSlotsData'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { parseThemeConfig, themeConfigToCssVars } from '@/lib/dancecard/theme'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  const admin = getDancecardAdmin()
  const token = request.nextUrl.searchParams.get('token')
  const parentOrigin = embedRequestParentOrigin(request)
  try {
    const { eventId, title } = await verifyEmbedRequest(admin, context.params.eventSlug, token, parentOrigin, 'schedule')
    const modules = await getEventEntitlements(admin, eventId)
    assertModuleEnabled(modules, 'schedule_embed')
    const slots = await fetchPublicProgramSlotsForEvent(admin, eventId, false)
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    const cssVars = themeConfigToCssVars(parseThemeConfig((event as { theme_config?: unknown } | null)?.theme_config))
    const chrome = request.nextUrl.searchParams.get('chrome') === 'minimal' ? 'minimal' : 'default'
    const publicHost =
      request.nextUrl.searchParams.get('host')?.trim() ||
      process.env.DANCECARD_ECKE_PUBLIC_ORIGIN?.replace(/\/$/, '') ||
      request.nextUrl.origin
    const html = buildScheduleEmbedHtml(title, slots, cssVars, {
      chrome,
      eventSlug: slug,
      publicHost,
      parentOrigin,
    })
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=60',
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
