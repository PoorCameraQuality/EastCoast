import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { hashCalendarFeedSecret, newCalendarFeedSecret } from '@/lib/dancecard/calendarFeedCrypto'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function isMissingFeedTable(error: unknown) {
  const e = error as { code?: string; message?: string }
  return e?.code === '42P01' || /dancecard_calendar_feed_tokens|relation .* does not exist/i.test(e?.message ?? '')
}

const createBodySchema = z
  .object({
    scope: z.enum(['full', 'track', 'room', 'presenter']),
    label: z.string().max(160).optional().nullable(),
    filterTrackId: z.string().uuid().optional().nullable(),
    filterLocationId: z.string().uuid().optional().nullable(),
    filterPersonId: z.string().uuid().optional().nullable(),
  })
  .superRefine((b, ctx) => {
    if (b.scope === 'full') {
      if (b.filterTrackId || b.filterLocationId || b.filterPersonId) {
        ctx.addIssue({ code: 'custom', message: 'full scope must not include filter ids' })
      }
    }
    if (b.scope === 'track' && !b.filterTrackId) ctx.addIssue({ code: 'custom', message: 'track scope requires filterTrackId' })
    if (b.scope === 'room' && !b.filterLocationId) ctx.addIssue({ code: 'custom', message: 'room scope requires filterLocationId' })
    if (b.scope === 'presenter' && !b.filterPersonId) ctx.addIssue({ code: 'custom', message: 'presenter scope requires filterPersonId' })
  })

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    let rows: Record<string, unknown>[] = []
    try {
      const { data, error } = await admin
        .from('dancecard_calendar_feed_tokens')
        .select(
          'id, scope, label, filter_track_id, filter_location_id, filter_person_id, created_at, revoked_at',
        )
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      rows = data ?? []
    } catch (e) {
      if (isMissingFeedTable(e)) {
        return NextResponse.json({ tokens: [], needsMigration: true })
      }
      throw e
    }
    return NextResponse.json({
      tokens: rows.map((r) => ({
        id: r.id,
        scope: r.scope,
        label: r.label,
        filterTrackId: r.filter_track_id,
        filterLocationId: r.filter_location_id,
        filterPersonId: r.filter_person_id,
        createdAt: r.created_at,
        revokedAt: r.revoked_at,
      })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = createBodySchema.parse(await request.json())

    if (body.scope === 'track' && body.filterTrackId) {
      const { data: tr, error } = await admin
        .from('dancecard_tracks')
        .select('id')
        .eq('id', body.filterTrackId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (error) throw error
      if (!tr) return NextResponse.json({ error: 'Track not found for this event' }, { status: 400 })
    }
    if (body.scope === 'room' && body.filterLocationId) {
      const { data: loc, error } = await admin
        .from('dancecard_locations')
        .select('id')
        .eq('id', body.filterLocationId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (error) throw error
      if (!loc) return NextResponse.json({ error: 'Location not found for this event' }, { status: 400 })
    }
    if (body.scope === 'presenter' && body.filterPersonId) {
      const { data: p, error } = await admin
        .from('dancecard_persons')
        .select('id')
        .eq('id', body.filterPersonId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (error) throw error
      if (!p) return NextResponse.json({ error: 'Person not found for this event' }, { status: 400 })
    }

    const secret = newCalendarFeedSecret()
    const tokenHash = hashCalendarFeedSecret(secret)
    const insertRow = {
      event_id: eventId,
      scope: body.scope,
      filter_track_id: body.filterTrackId ?? null,
      filter_location_id: body.filterLocationId ?? null,
      filter_person_id: body.filterPersonId ?? null,
      token_hash: tokenHash,
      label: body.label?.trim() ? body.label.trim().slice(0, 160) : null,
    }
    try {
      const { data: row, error } = await admin
        .from('dancecard_calendar_feed_tokens')
        .insert(insertRow)
        .select('id')
        .single()
      if (error) throw error
      const origin = new URL(request.url).origin
      const slug = context.params.eventSlug.toLowerCase()
      const subscribeUrl = `${origin}/api/dancecard/${encodeURIComponent(slug)}/feeds/ics?token=${encodeURIComponent(secret)}`
      return NextResponse.json({ id: row.id, token: secret, subscribeUrl })
    } catch (e) {
      if (isMissingFeedTable(e)) {
        return NextResponse.json(
          { error: 'Calendar feeds require migration dancecard_021_calendar_feed_tokens.sql' },
          { status: 503 },
        )
      }
      throw e
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
