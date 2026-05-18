import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { parseThemeConfig, themeConfigForPublicApi } from '@/lib/dancecard/theme'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const theme = themeConfigForPublicApi(parseThemeConfig((event as { theme_config?: unknown }).theme_config))
    return NextResponse.json({ theme })
  } catch (e) {
    console.error('[dancecard/theme]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
