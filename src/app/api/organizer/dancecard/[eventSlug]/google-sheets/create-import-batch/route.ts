import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { buildImportFromSheetMatrix } from '@/lib/dancecard/googleSheetMatrixToImport'
import { readGoogleSheetMatrix } from '@/lib/dancecard/googleSheetReadMatrix'
import { insertDancecardImportBatch } from '@/lib/dancecard/importBatchInsert'
import type { ImportKind } from '@/lib/dancecard/organizerImport'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  range: z.string().min(1).max(500).optional().default('Sheet1!A1:Z500'),
  spreadsheetId: z.string().max(200).optional(),
  kind: z.enum(['program', 'staff']).optional().default('program'),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = bodySchema.parse(await request.json())
    const matrix = await readGoogleSheetMatrix(ctx, body.range, { spreadsheetId: body.spreadsheetId })
    const kind = body.kind as ImportKind
    const parsed = buildImportFromSheetMatrix(matrix, kind, 'google-sheet')
    const { batch, rows } = await insertDancecardImportBatch(ctx.admin, {
      eventId: ctx.eventId,
      userId: ctx.userId,
      parsed,
      sourceFilename: 'google-sheet.csv',
    })
    return NextResponse.json({ batch, rows })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Import failed'
    if (/Connect Google|Save a spreadsheet|not configured/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
