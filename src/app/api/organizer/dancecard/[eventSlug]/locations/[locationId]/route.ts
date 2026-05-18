import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { wouldCreateParentCycle, type LocationParentRow } from '@/lib/dancecard/locationHierarchyHelpers'
import { mapDbLocationToDto } from '@/lib/dancecard/organizerLocationDto'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; locationId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const locationId = context.params.locationId
    const body = await request.json()

    const { data: graphRows, error: gErr } = await admin
      .from('dancecard_locations')
      .select('id, parent_id')
      .eq('event_id', eventId)
    if (gErr) throw gErr

    const rows: LocationParentRow[] = (graphRows ?? []).map((r) => ({
      id: r.id as string,
      parentId: (r.parent_id as string | null) ?? null,
    }))

    let newParentId: string | null | undefined = undefined
    if (body.parentId !== undefined) {
      newParentId = body.parentId === null || body.parentId === '' ? null : String(body.parentId).trim()
      if (newParentId) {
        const exists = rows.some((r) => r.id === newParentId)
        if (!exists) return NextResponse.json({ error: 'Parent location not found' }, { status: 400 })
        if (wouldCreateParentCycle(rows, locationId, newParentId)) {
          return NextResponse.json({ error: 'That parent would create a cycle in the location tree' }, { status: 400 })
        }
      }
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) patch.name = String(body.name).trim()
    if (body.shortName !== undefined) patch.short_name = body.shortName ? String(body.shortName).trim() : null
    if (body.capacity !== undefined) patch.capacity = Number.isFinite(Number(body.capacity)) ? Number(body.capacity) : null
    if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes).trim() : null
    if (body.sortOrder !== undefined) patch.sort_order = Number(body.sortOrder)
    if (newParentId !== undefined) patch.parent_id = newParentId
    if (body.kind !== undefined) patch.kind = body.kind ? String(body.kind).trim() : null
    if (body.accessibilityNotes !== undefined) {
      patch.accessibility_notes = body.accessibilityNotes ? String(body.accessibilityNotes).trim() : null
    }
    if (body.directionsPublic !== undefined) {
      patch.directions_public = body.directionsPublic ? String(body.directionsPublic).trim() : null
    }
    if (body.internalNotes !== undefined) {
      patch.internal_notes = body.internalNotes ? String(body.internalNotes).trim() : null
    }

    const { data, error } = await admin
      .from('dancecard_locations')
      .update(patch)
      .eq('id', locationId)
      .eq('event_id', eventId)
      .select('*')
      .single()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    return NextResponse.json({ location: mapDbLocationToDto(data as Parameters<typeof mapDbLocationToDto>[0]) })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { eventSlug: string; locationId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const locationId = context.params.locationId

    const { data: kids, error: kErr } = await admin
      .from('dancecard_locations')
      .select('id')
      .eq('event_id', eventId)
      .eq('parent_id', locationId)
      .limit(1)
    if (kErr) throw kErr
    if (kids?.length) {
      return NextResponse.json(
        { error: 'Cannot delete a location that has child locations. Delete or reassign children first.' },
        { status: 409 },
      )
    }

    const { data, error } = await admin
      .from('dancecard_locations')
      .delete()
      .eq('id', locationId)
      .eq('event_id', eventId)
      .select('id')
    if (error) throw error
    if (!data?.length) return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
