import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTrackCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_tracks')
      .select('id, name, color, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json({
      tracks: (rows ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        sortOrder: r.sort_order,
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
    const body = organizerTrackCreateSchema.parse(await request.json())
    const { data: row, error } = await admin
      .from('dancecard_tracks')
      .insert({
        event_id: eventId,
        name: body.name.trim(),
        color: body.color ?? '#22d3ee',
        sort_order: body.sortOrder ?? 0,
      })
      .select('id, name, color, sort_order')
      .single()
    if (error) throw error
    return NextResponse.json({
      track: { id: row.id, name: row.name, color: row.color, sortOrder: row.sort_order },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
