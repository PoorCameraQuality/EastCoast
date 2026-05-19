import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { getDancecardAdmin, loadEventBySlugAnyStatus, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { isMissingColumn, isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const { eventId } = await requireOrganizerForSlug(slug)
    const admin = getDancecardAdmin()
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('dancecard_session_feedback')
      .select('program_slot_id, rating, comment, created_at, dancecard_program_slots(title)')
      .eq('event_id', eventId)
    if (error) {
      if (isMissingTable(error, 'dancecard_session_feedback')) {
        return NextResponse.json(
          {
            error: 'Session feedback tables are missing. Apply migration dancecard_050_session_feedback.sql.',
            needsMigration: 'dancecard_050_session_feedback.sql',
          },
          { status: 409 },
        )
      }
      throw error
    }

    const bySlot = new Map<string, { count: number; ratingSum: number; comments: number }>()
    for (const row of data ?? []) {
      const sid = row.program_slot_id as string
      const cur = bySlot.get(sid) ?? { count: 0, ratingSum: 0, comments: 0 }
      cur.count++
      if (row.rating) cur.ratingSum += Number(row.rating)
      if (row.comment) cur.comments++
      bySlot.set(sid, cur)
    }

    const aggregates = Array.from(bySlot.entries()).map(([slotId, agg]) => ({
      programSlotId: slotId,
      responseCount: agg.count,
      averageRating: agg.ratingSum ? agg.ratingSum / agg.count : null,
      commentCount: agg.comments,
    }))

    const eventRow = event as { feedback_config?: Record<string, unknown> | null }
    const feedbackConfig =
      eventRow.feedback_config != null
        ? eventRow.feedback_config
        : { enabled: false }

    return NextResponse.json({
      feedbackConfig,
      aggregates,
      rows: data ?? [],
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const ctx = await requireOrganizerForSlug(slug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = (await request.json()) as { feedbackConfig?: Record<string, unknown> }
    if (!body.feedbackConfig) {
      return NextResponse.json({ error: 'feedbackConfig required' }, { status: 400 })
    }

    const { error } = await admin
      .from('dancecard_events')
      .update({ feedback_config: body.feedbackConfig })
      .eq('id', eventId)
    if (error) {
      if (isMissingColumn(error, 'feedback_config')) {
        return NextResponse.json(
          {
            error: 'feedback_config column is missing. Apply migration dancecard_050_session_feedback.sql.',
            needsMigration: 'dancecard_050_session_feedback.sql',
          },
          { status: 409 },
        )
      }
      throw error
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
