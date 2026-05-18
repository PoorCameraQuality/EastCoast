import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { parseOrganizerImport, type ImportKind } from '@/lib/dancecard/organizerImport'
import { insertDancecardImportBatch } from '@/lib/dancecard/importBatchInsert'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function isMissingWorkflowSchema(error: unknown) {
  const e = error as { code?: string; message?: string }
  return e?.code === '42P01' || /dancecard_import_(batches|rows)|relation .* does not exist/i.test(e?.message ?? '')
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await admin
      .from('dancecard_import_batches')
      .select('id, kind, status, source_filename, sheet_name, summary, created_at, published_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) {
      if (isMissingWorkflowSchema(error)) {
        return NextResponse.json({ batches: [], needsMigration: true })
      }
      throw error
    }
    return NextResponse.json({ batches: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, userId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    const contentType = request.headers.get('content-type') ?? ''
    let kind: ImportKind
    let filename = 'import.json'
    let parsed

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData()
      kind = String(form.get('kind') ?? 'program') === 'staff' ? 'staff' : 'program'
      const file = form.get('file')
      if (!(file instanceof File)) return NextResponse.json({ error: 'File is required' }, { status: 400 })
      filename = file.name
      parsed = await parseOrganizerImport({
        kind,
        filename,
        buffer: await file.arrayBuffer(),
        windowStartsAt: event?.window_starts_at ?? undefined,
        windowEndsAt: event?.window_ends_at ?? undefined,
      })
    } else {
      const body = await request.json()
      kind = body.kind === 'staff' ? 'staff' : 'program'
      filename = String(body.filename ?? 'manual.json')
      parsed = await parseOrganizerImport({ kind, filename, json: body.rows ?? body.payload ?? body })
    }

    try {
      const { batch, rows } = await insertDancecardImportBatch(admin, {
        eventId,
        userId,
        parsed,
        sourceFilename: filename,
      })
      return NextResponse.json({ batch, rows })
    } catch (batchErr) {
      if (isMissingWorkflowSchema(batchErr)) {
        return NextResponse.json(
          { error: 'Import workflow requires dancecard_007_organizer_import_workflow.sql to be applied.' },
          { status: 409 },
        )
      }
      throw batchErr
    }
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
