import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { mapDbLocationToDto } from '@/lib/dancecard/organizerLocationDto'

export const dynamic = 'force-dynamic'

function isMissingWorkflowSchema(error: unknown) {
  const e = error as { code?: string; message?: string }
  return e?.code === '42P01' || /dancecard_locations|relation .* does not exist/i.test(e?.message ?? '')
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await admin
      .from('dancecard_locations')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) {
      if (isMissingWorkflowSchema(error)) {
        return NextResponse.json({ locations: [], needsMigration: true })
      }
      throw error
    }
    return NextResponse.json({
      locations: (data ?? []).map((row) => mapDbLocationToDto(row as Parameters<typeof mapDbLocationToDto>[0])),
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
    const body = await request.json()
    const name = String(body.name ?? '').trim()
    if (!name) return NextResponse.json({ error: 'Location name is required' }, { status: 400 })

    let parentId: string | null = null
    if (body.parentId != null && String(body.parentId).trim()) {
      parentId = String(body.parentId).trim()
      const { data: parent, error: pErr } = await admin
        .from('dancecard_locations')
        .select('id')
        .eq('id', parentId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (pErr) throw pErr
      if (!parent) return NextResponse.json({ error: 'Parent location not found' }, { status: 400 })
    }

    const insertRow: Record<string, unknown> = {
      event_id: eventId,
      name,
      short_name: body.shortName ? String(body.shortName).trim() : null,
      capacity: Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : null,
      notes: body.notes != null ? String(body.notes).trim() || null : null,
      sort_order: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
      parent_id: parentId,
      kind: body.kind != null ? String(body.kind).trim() || null : null,
      accessibility_notes:
        body.accessibilityNotes != null ? String(body.accessibilityNotes).trim() || null : null,
      directions_public: body.directionsPublic != null ? String(body.directionsPublic).trim() || null : null,
      internal_notes: body.internalNotes != null ? String(body.internalNotes).trim() || null : null,
    }

    const { data, error } = await admin
      .from('dancecard_locations')
      .insert(insertRow)
      .select('*')
      .single()
    if (error) {
      if (isMissingWorkflowSchema(error)) {
        return NextResponse.json(
          { error: 'Location manager requires dancecard_007_organizer_import_workflow.sql to be applied.' },
          { status: 409 },
        )
      }
      throw error
    }
    return NextResponse.json({ location: mapDbLocationToDto(data as Parameters<typeof mapDbLocationToDto>[0]) })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
