import { NextResponse } from 'next/server'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, context: { params: { eventSlug: string; tokenId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const id = context.params.tokenId
    const { data, error } = await admin
      .from('dancecard_calendar_feed_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('event_id', eventId)
      .is('revoked_at', null)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Not found or already revoked' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
