import type { SupabaseClient } from '@supabase/supabase-js'
import type { ImportDraftRow, ImportParseResult } from '@/lib/dancecard/organizerImport'

export function importRowToDb(row: ImportDraftRow, index: number, batchId: string, eventId: string) {
  return {
    batch_id: batchId,
    event_id: eventId,
    row_key: row.rowKey,
    kind: row.kind === 'program' ? 'program' : 'staff',
    action: row.errors.length ? 'ignore' : 'add',
    draft_status: row.status,
    title: row.kind === 'program' ? row.title : null,
    person_name: row.kind === 'staff' ? row.personName : null,
    role: row.kind === 'staff' ? row.role : null,
    track: row.kind === 'program' ? row.track : null,
    room: row.kind === 'program' ? row.room : row.location,
    starts_at: row.startsAt,
    ends_at: row.endsAt,
    duration_minutes: row.durationMinutes,
    description: row.kind === 'program' ? row.description : null,
    raw_row: row.raw,
    validation_errors: row.errors,
    sort_order: index,
  }
}

export async function insertDancecardImportBatch(
  admin: SupabaseClient,
  args: {
    eventId: string
    userId: string
    parsed: ImportParseResult
    sourceFilename: string
  },
): Promise<{ batch: { id: string } & Record<string, unknown>; rows: unknown[] }> {
  const { eventId, userId, parsed, sourceFilename } = args
  const { data: batch, error: batchErr } = await admin
    .from('dancecard_import_batches')
    .insert({
      event_id: eventId,
      organizer_user_id: userId,
      kind: parsed.kind,
      status: parsed.summary.invalid ? 'uploaded' : 'validated',
      source_filename: sourceFilename,
      sheet_name: parsed.sheetName,
      column_mapping: parsed.detectedColumns,
      summary: parsed.summary,
    })
    .select('id, kind, status, source_filename, sheet_name, summary, created_at')
    .single()
  if (batchErr) throw batchErr
  const batchId = (batch as { id: string }).id
  const dbRows = parsed.rows.map((row, index) => importRowToDb(row, index, batchId, eventId))
  let insertedRows: unknown[] = []
  if (dbRows.length) {
    const { data, error: rowsErr } = await admin
      .from('dancecard_import_rows')
      .insert(dbRows)
      .select('*')
      .order('sort_order', { ascending: true })
    if (rowsErr) throw rowsErr
    insertedRows = data ?? []
  }
  return { batch: batch as { id: string } & Record<string, unknown>, rows: insertedRows }
}
