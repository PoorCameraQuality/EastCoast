import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { scanDancecardConflictsForEvent } from '@/lib/dancecard/conflictScanFromEvent'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const conflicts = await scanDancecardConflictsForEvent(ctx.admin, ctx.eventId)
    return NextResponse.json({ conflicts })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
