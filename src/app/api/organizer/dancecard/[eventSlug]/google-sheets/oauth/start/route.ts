import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { assertOrganizerOwnerOrAdmin, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

function b64url(obj: unknown) {
  return Buffer.from(JSON.stringify(obj), 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET not set' }, { status: 501 })
    }
    const origin = new URL(request.url).origin
    const slug = encodeURIComponent(context.params.eventSlug)
    const redirectUri = `${origin}/api/organizer/dancecard/${slug}/google-sheets/oauth/callback`
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    const returnTo = request.nextUrl.searchParams.get('returnTo')
    const state = b64url({
      slug: context.params.eventSlug,
      ...(returnTo === 'import' ? { returnTo: 'import' as const } : {}),
    })
    const url = oauth2.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      state,
    })
    return NextResponse.redirect(url)
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
