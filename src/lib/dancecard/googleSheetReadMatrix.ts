import { google } from 'googleapis'
import type { OrganizerContext } from '@/lib/dancecard/organizerAuth'
import { decryptSecret } from '@/lib/dancecard/tokenCrypto'

export async function readGoogleSheetMatrix(
  ctx: OrganizerContext,
  range: string,
  opts?: { spreadsheetId?: string | null },
): Promise<string[][]> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth not configured')
  }
  const { data: conn, error: cErr } = await ctx.admin
    .from('dancecard_google_sheet_connections')
    .select('refresh_token_ciphertext, spreadsheet_id')
    .eq('event_id', ctx.eventId)
    .eq('user_id', ctx.userId)
    .maybeSingle()
  if (cErr) throw cErr
  if (!conn?.refresh_token_ciphertext) {
    throw new Error('Connect Google first (OAuth).')
  }
  const sid = (opts?.spreadsheetId?.trim() || String(conn.spreadsheet_id ?? '').trim() || '').trim()
  if (!sid || sid === 'configure-in-integrations') {
    throw new Error('Save a spreadsheet link or ID on the Import tab first.')
  }
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const slugEnc = encodeURIComponent(ctx.slug)
  const redirectUri = `${origin.replace(/\/$/, '')}/api/organizer/dancecard/${slugEnc}/google-sheets/oauth/callback`
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  oauth2.setCredentials({ refresh_token: decryptSecret(conn.refresh_token_ciphertext as string) })
  const sheets = google.sheets({ version: 'v4', auth: oauth2 })
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sid, range })
  return (res.data.values ?? []) as string[][]
}
