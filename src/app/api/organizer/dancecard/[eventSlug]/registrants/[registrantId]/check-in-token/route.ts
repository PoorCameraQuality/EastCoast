import { NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { encodeCheckInQrPayload, generateCheckInTokenValue } from '@/lib/dancecard/checkInToken'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, context: { params: { eventSlug: string; registrantId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const registrantId = context.params.registrantId
    const token = generateCheckInTokenValue()

    const { data, error } = await admin
      .from('dancecard_registrants')
      .update({ check_in_token: token, updated_at: new Date().toISOString() })
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const qrPayload = encodeCheckInQrPayload(registrantId, token)
    return NextResponse.json({ token, qrPayload })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
