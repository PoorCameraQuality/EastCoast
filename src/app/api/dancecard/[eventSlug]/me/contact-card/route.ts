import { NextRequest, NextResponse } from 'next/server'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { loadPrefs } from '@/lib/dancecard/data'
import { parseAttendeeProfileConfig } from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfileResolved } from '@/lib/dancecard/profilePhotoUrl'
import { buildVCard3 } from '@/lib/dancecard/vcard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prefs = await loadPrefs(admin, session.accountId)
    const config = parseAttendeeProfileConfig(
      (event as { attendee_profile_config?: unknown }).attendee_profile_config,
    )
    const publicProfile = await buildPublicProfileResolved(admin, {
      displayName: session.displayName,
      username: session.username,
      stored: prefs.profile,
      config,
    })

    const profile = prefs.profile
    const origin = request.nextUrl.origin
    const shareUrl = `${origin}/dancecard/${slug}/contact?account=${session.accountId}`
    const vcard = buildVCard3({
      displayName: session.displayName,
      username: session.username,
      email: profile.emailOnCard?.trim() || null,
      phone: null,
      url: shareUrl,
      note: profile.bio ?? null,
    })

    return NextResponse.json({
      vcard,
      publicProfile,
      shareUrl,
    })
  } catch (e) {
    return jsonFromRouteError(e, 'contact-card')
  }
}
