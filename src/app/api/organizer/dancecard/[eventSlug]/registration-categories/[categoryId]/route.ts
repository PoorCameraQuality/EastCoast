import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrationCategoryPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { registrationCategoryWriteErrorResponse } from '@/lib/dancecard/registrationCategoryDb'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function mapCat(r: Record<string, unknown>) {
  const rawHours = r.expected_hours
  return {
    id: r.id as string,
    name: r.name as string,
    roleKind: String(r.role_kind ?? 'attendee'),
    expectedHours:
      rawHours === null || rawHours === undefined ? null : Number(rawHours),
    capacity: r.capacity === null || r.capacity === undefined ? null : Number(r.capacity),
    accessCode: (r.access_code as string | null) ?? null,
    grantsStaffAccess: Boolean(r.grants_staff_access),
    externalSourceRef: (r.external_source_ref as string | null) ?? null,
    importedPaymentStatus: (r.imported_payment_status as string | null) ?? null,
    sortOrder: Number(r.sort_order ?? 0),
    checkInValidFrom: (r.check_in_valid_from as string | null) ?? null,
    checkInValidThrough: (r.check_in_valid_through as string | null) ?? null,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; categoryId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const categoryId = context.params.categoryId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_registration_categories')
      .select('id')
      .eq('id', categoryId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = organizerRegistrationCategoryPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) patch.name = body.name.trim()
    if (body.roleKind !== undefined) patch.role_kind = body.roleKind
    if (body.expectedHours !== undefined) patch.expected_hours = body.expectedHours
    if (body.capacity !== undefined) patch.capacity = body.capacity
    if (body.accessCode !== undefined) patch.access_code = body.accessCode
    if (body.grantsStaffAccess !== undefined) patch.grants_staff_access = body.grantsStaffAccess
    if (body.externalSourceRef !== undefined) patch.external_source_ref = body.externalSourceRef
    if (body.importedPaymentStatus !== undefined) patch.imported_payment_status = body.importedPaymentStatus
    if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder
    if (body.checkInValidFrom !== undefined) patch.check_in_valid_from = body.checkInValidFrom
    if (body.checkInValidThrough !== undefined) patch.check_in_valid_through = body.checkInValidThrough

    const { data: row, error } = await admin
      .from('dancecard_registration_categories')
      .update(patch)
      .eq('id', categoryId)
      .eq('event_id', eventId)
      .select('*')
      .single()
    if (error) {
      const mapped = registrationCategoryWriteErrorResponse(error)
      if (mapped) return mapped
      throw error
    }
    return NextResponse.json({ category: mapCat(row as Record<string, unknown>) })
  } catch (e) {
    if (e instanceof ZodError) {
      const flat = e.flatten()
      const fieldMsgs = Object.entries(flat.fieldErrors).flatMap(([k, v]) =>
        (v ?? []).map((msg) => `${k}: ${msg}`),
      )
      const message = fieldMsgs[0] ?? flat.formErrors[0] ?? 'Validation error'
      return NextResponse.json({ error: message, details: flat }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; categoryId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const categoryId = context.params.categoryId
    const { count, error: cErr } = await admin
      .from('dancecard_registrants')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
    if (cErr) throw cErr
    if (count && count > 0) {
      return NextResponse.json({ error: 'Cannot delete category with registrants' }, { status: 400 })
    }
    const { error } = await admin.from('dancecard_registration_categories').delete().eq('id', categoryId).eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
