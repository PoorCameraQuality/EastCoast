import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { DEFAULT_GOOGLE_SHEET_RANGE } from '@/lib/dancecard/parseGoogleSpreadsheetId'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const PLACEHOLDER_SPREADSHEET_ID = 'configure-in-integrations'

const patchSchema = z.object({
  spreadsheetId: z.string().min(1).max(200),
  sheetTitle: z.string().max(500).nullable().optional(),
  range: z.string().min(1).max(500).optional(),
  columnMapJson: z.record(z.string(), z.unknown()).optional(),
})

function savedRange(columnMapJson: unknown): string {
  if (columnMapJson && typeof columnMapJson === 'object' && 'range' in columnMapJson) {
    const r = (columnMapJson as { range?: unknown }).range
    if (typeof r === 'string' && r.trim()) return r.trim()
  }
  return DEFAULT_GOOGLE_SHEET_RANGE
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const { data: conn, error } = await ctx.admin
      .from('dancecard_google_sheet_connections')
      .select('spreadsheet_id, sheet_title, column_map_json, updated_at')
      .eq('event_id', ctx.eventId)
      .eq('user_id', ctx.userId)
      .maybeSingle()
    if (error) throw error
    const rawId = String(conn?.spreadsheet_id ?? '').trim()
    const spreadsheetId =
      rawId && rawId !== PLACEHOLDER_SPREADSHEET_ID ? rawId : null
    return NextResponse.json({
      connected: Boolean(conn),
      spreadsheetId,
      sheetTitle: conn?.sheet_title ?? null,
      range: conn ? savedRange(conn.column_map_json) : DEFAULT_GOOGLE_SHEET_RANGE,
      updatedAt: conn?.updated_at ?? null,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const body = patchSchema.parse(await request.json())
    const { data: existing, error: exErr } = await ctx.admin
      .from('dancecard_google_sheet_connections')
      .select('id, column_map_json')
      .eq('event_id', ctx.eventId)
      .eq('user_id', ctx.userId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) {
      return NextResponse.json({ error: 'Complete Google OAuth first (Connect Google).' }, { status: 400 })
    }
    const priorMap =
      existing.column_map_json && typeof existing.column_map_json === 'object'
        ? (existing.column_map_json as Record<string, unknown>)
        : {}
    const column_map_json = {
      ...priorMap,
      ...(body.columnMapJson ?? {}),
      ...(body.range ? { range: body.range } : {}),
    }
    const { error } = await ctx.admin
      .from('dancecard_google_sheet_connections')
      .update({
        spreadsheet_id: body.spreadsheetId,
        sheet_title: body.sheetTitle ?? null,
        column_map_json,
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', ctx.eventId)
      .eq('user_id', ctx.userId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
