import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { assertOrganizerOwnerOrAdmin, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { encryptSecret } from '@/lib/dancecard/tokenCrypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }
    let parsed: { slug?: string; returnTo?: string }
    try {
      const pad = state.length % 4 === 0 ? '' : '='.repeat(4 - (state.length % 4))
      const json = Buffer.from(state.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8')
      parsed = JSON.parse(json) as { slug?: string; returnTo?: string }
    } catch {
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }
    if (parsed.slug !== context.params.eventSlug) {
      return NextResponse.json({ error: 'State mismatch' }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!
    const origin = new URL(request.url).origin
    const slug = encodeURIComponent(context.params.eventSlug)
    const redirectUri = `${origin}/api/organizer/dancecard/${slug}/google-sheets/oauth/callback`
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    const { tokens } = await oauth2.getToken(code)
    if (!tokens.refresh_token) {
      return NextResponse.json({ error: 'No refresh token returned; revoke app access in Google and retry with prompt=consent' }, { status: 400 })
    }
    const ciphertext = encryptSecret(tokens.refresh_token)
    const { error } = await ctx.admin.from('dancecard_google_sheet_connections').upsert(
      {
        event_id: ctx.eventId,
        user_id: ctx.userId,
        refresh_token_ciphertext: ciphertext,
        spreadsheet_id: 'configure-in-integrations',
        sheet_title: null,
        column_map_json: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'event_id,user_id' },
    )
    if (error) throw error
    const tab = parsed.returnTo === 'import' ? 'import' : 'integrations'
    const dest = `${origin}/organizer/dancecard/${slug}?tab=${tab}&google=connected`
    return NextResponse.redirect(dest)
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
