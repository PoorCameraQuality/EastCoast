import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { encodeCheckInQrPayload, generateCheckInTokenValue } from '@/lib/dancecard/checkInToken'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string; registrantId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const registrantId = context.params.registrantId

    const { data: row } = await admin
      .from('dancecard_registrants')
      .select('id, check_in_token')
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let token = row.check_in_token as string | null
    if (!token) {
      token = generateCheckInTokenValue()
      await admin
        .from('dancecard_registrants')
        .update({ check_in_token: token })
        .eq('id', registrantId)
        .eq('event_id', eventId)
    }

    const payload = encodeCheckInQrPayload(registrantId, token)
    const png = await QRCode.toBuffer(payload, { width: 200, margin: 1, type: 'png' })
    return new NextResponse(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
