import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; batchId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const body = await request.json()
    const { data, error } = await admin
      .from('dancecard_import_batches')
      .update({
        column_mapping: body.mapping ?? {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.params.batchId)
      .eq('event_id', eventId)
      .select('id, column_mapping')
      .single()
    if (error) throw error
    return NextResponse.json({ batch: data })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
