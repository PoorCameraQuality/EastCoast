import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string; batchId: string } }
) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data: batch, error: batchErr } = await admin
      .from('dancecard_import_batches')
      .select('id, kind, status, source_filename, sheet_name, summary, column_mapping, created_at, published_at')
      .eq('event_id', eventId)
      .eq('id', context.params.batchId)
      .maybeSingle()
    if (batchErr) throw batchErr
    if (!batch) return NextResponse.json({ error: 'Import batch not found' }, { status: 404 })

    const { data: rows, error: rowsErr } = await admin
      .from('dancecard_import_rows')
      .select('*')
      .eq('batch_id', context.params.batchId)
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
    if (rowsErr) throw rowsErr

    return NextResponse.json({ batch, rows: rows ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
