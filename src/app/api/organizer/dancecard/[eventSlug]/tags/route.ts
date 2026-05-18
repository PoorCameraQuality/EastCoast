import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerTagCreateSchema } from '@/lib/dancecard/organizerSchemas'
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
      .from('dancecard_tags')
      .select('id, name, scope')
      .eq('event_id', eventId)
      .order('scope', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json({
      tags: (rows ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        scope: r.scope,
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
    const body = organizerTagCreateSchema.parse(await request.json())
    const { data: row, error } = await admin
      .from('dancecard_tags')
      .insert({
        event_id: eventId,
        name: body.name.trim(),
        scope: body.scope ?? 'session',
      })
      .select('id, name, scope')
      .single()
    if (error) throw error
    return NextResponse.json({
      tag: { id: row.id, name: row.name, scope: row.scope },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
