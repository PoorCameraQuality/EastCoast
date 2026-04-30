import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { buildMutualSharePayload } from '@/lib/dancecard/mutualSharePayload'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string; token: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug, token } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const { data: link, error: lErr } = await admin
      .from('dancecard_share_links')
      .select('id, account_id, token, revoked_at')
      .eq('token', token)
      .is('revoked_at', null)
      .maybeSingle()
    if (lErr) throw lErr
    if (!link) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    }

    const { data: host, error: hErr } = await admin
      .from('dancecard_accounts')
      .select('id, display_name, event_id')
      .eq('id', link.account_id)
      .maybeSingle()
    if (hErr || !host || host.event_id !== event.id) {
      return NextResponse.json({ error: 'Host not found' }, { status: 404 })
    }

    const viewer = await resolveAccountFromSession(admin, request, slug)
    const viewerPayload =
      viewer && viewer.accountId !== host.id ? { accountId: viewer.accountId, displayName: viewer.displayName } : null

    const payload = await buildMutualSharePayload(
      admin,
      event,
      { id: host.id, display_name: host.display_name as string },
      viewerPayload
    )

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0',
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
