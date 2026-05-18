import { NextRequest, NextResponse } from 'next/server'
import { buildOpsSummaryEmbedHtml } from '@/lib/dancecard/embedOpsSummary'
import { embedRequestParentOrigin, verifyEmbedRequest } from '@/lib/dancecard/embedTokenAuth'
import { getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { parseThemeConfig, themeConfigToCssVars } from '@/lib/dancecard/theme'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  const admin = getDancecardAdmin()
  const token = request.nextUrl.searchParams.get('token')
  const parentOrigin = embedRequestParentOrigin(request)
  try {
    const { eventId, title } = await verifyEmbedRequest(admin, context.params.eventSlug, token, parentOrigin, 'ops_summary')
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    const cssVars = themeConfigToCssVars(parseThemeConfig((event as { theme_config?: unknown } | null)?.theme_config))

    const { data: slots } = await admin
      .from('dancecard_program_slots')
      .select('id, is_published')
      .eq('event_id', eventId)
    const rows = slots ?? []
    const total = rows.length
    const published = rows.filter((r) => (r as { is_published?: boolean }).is_published).length
    const readinessPct = total ? Math.round((published / total) * 100) : 0

    const { count: regCount } = await admin
      .from('dancecard_registrants')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const registrantBand =
      regCount == null ? 'Registrants —' : regCount === 0 ? 'No registrants yet' : `${regCount} registrants`

    let integrationsOk = false
    try {
      const ent = await getEventEntitlements(admin, eventId)
      integrationsOk = Boolean(ent.schedule_embed)
    } catch {
      integrationsOk = false
    }

    const html = buildOpsSummaryEmbedHtml({
      title,
      readinessPct,
      publishedCount: published,
      totalSlots: total,
      registrantBand,
      integrationsOk,
      cssVars,
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
    const msg = status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 404 ? 'Not found' : 'Error'
    return new NextResponse(`<!DOCTYPE html><html><body><p>${msg}</p></body></html>`, {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}
