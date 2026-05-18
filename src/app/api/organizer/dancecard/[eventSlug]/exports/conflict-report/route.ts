import { NextRequest, NextResponse } from 'next/server'
import { scanDancecardConflictsForEvent } from '@/lib/dancecard/conflictScanFromEvent'
import {
  assertOrganizerCanExport,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { normalizeEventSlug } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExport(ctx)
    const conflicts = await scanDancecardConflictsForEvent(ctx.admin, ctx.eventId)
    const slug = normalizeEventSlug(context.params.eventSlug)
    const header = 'id,severity,title,detail,related_slot_ids,related_person_ids\n'
    const body = conflicts
      .map((c) =>
        [
          csvEscape(c.id),
          csvEscape(c.severity),
          csvEscape(c.title),
          csvEscape(c.detail ?? ''),
          csvEscape((c.relatedSlotIds ?? []).join(';')),
          csvEscape((c.relatedPersonIds ?? []).join(';')),
        ].join(','),
      )
      .join('\n')
    const csv = header + body
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dancecard-conflicts-${slug}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
