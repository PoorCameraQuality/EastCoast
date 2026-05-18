import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrationCategoryCreateSchema } from '@/lib/dancecard/organizerSchemas'
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

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_registration_categories')
      .select('*')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) throw error
    return NextResponse.json({ categories: (rows ?? []).map((r) => mapCat(r as Record<string, unknown>)) })
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
    const body = organizerRegistrationCategoryCreateSchema.parse(await request.json())
    const { count } = await admin
      .from('dancecard_registration_categories')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
    const sortOrder = body.sortOrder ?? (typeof count === 'number' ? count : 0)
    const { data: row, error } = await admin
      .from('dancecard_registration_categories')
      .insert({
        event_id: eventId,
        name: body.name.trim(),
        role_kind: body.roleKind ?? 'attendee',
        expected_hours: body.expectedHours ?? null,
        capacity: body.capacity ?? null,
        access_code: body.accessCode ?? null,
        grants_staff_access: body.grantsStaffAccess ?? false,
        external_source_ref: body.externalSourceRef ?? null,
        imported_payment_status: body.importedPaymentStatus ?? null,
        sort_order: sortOrder,
        check_in_valid_from: body.checkInValidFrom ?? null,
        check_in_valid_through: body.checkInValidThrough ?? null,
      })
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
