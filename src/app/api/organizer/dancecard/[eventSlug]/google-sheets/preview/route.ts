import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { google } from 'googleapis'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { decryptSecret } from '@/lib/dancecard/tokenCrypto'

export const dynamic = 'force-dynamic'

const previewSchema = z.object({
  spreadsheetId: z.string().min(1).max(200),
  range: z.string().min(1).max(500).optional(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const body = previewSchema.parse(await request.json())
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 501 })
    }

    const { data: conn, error: cErr } = await ctx.admin
      .from('dancecard_google_sheet_connections')
      .select('refresh_token_ciphertext')
      .eq('event_id', ctx.eventId)
      .eq('user_id', ctx.userId)
      .maybeSingle()
    if (cErr) throw cErr
    if (!conn?.refresh_token_ciphertext) {
      return NextResponse.json({ error: 'Connect Google first (OAuth).' }, { status: 400 })
    }

    const origin = new URL(request.url).origin
    const slug = encodeURIComponent(context.params.eventSlug)
    const redirectUri = `${origin}/api/organizer/dancecard/${slug}/google-sheets/oauth/callback`
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
    oauth2.setCredentials({ refresh_token: decryptSecret(conn.refresh_token_ciphertext as string) })
    const sheets = google.sheets({ version: 'v4', auth: oauth2 })
    const range = body.range ?? 'Sheet1!A1:Z200'
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: body.spreadsheetId,
      range,
    })
    const values = (res.data.values ?? []) as string[][]
    return NextResponse.json({
      range,
      rowCount: values.length,
      colCount: values.reduce((m, r) => Math.max(m, r.length), 0),
      preview: values.slice(0, 25),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
