import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrantCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { replaceRegistrantTagsForEvent } from '@/lib/dancecard/organizerRegistrantTags'
import { mapOrganizerRegistrantRow } from '@/lib/dancecard/organizerRegistrantDto'
import { registrantCheckInExtras } from '@/lib/dancecard/organizerRegistrantCheckIn'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

type RegistrantListFilters = {
  status?: string
  vetting?: string
  categoryId?: string
  q?: string
}

function parsePagination(searchParams: URLSearchParams): { limit: number; offset: number } | { error: string } {
  let limit = DEFAULT_LIMIT
  let offset = 0
  const limitRaw = searchParams.get('limit')?.trim()
  const offsetRaw = searchParams.get('offset')?.trim()
  if (limitRaw !== undefined && limitRaw !== '') {
    const n = Number.parseInt(limitRaw, 10)
    if (!Number.isFinite(n) || n < 1) return { error: 'limit must be a positive integer' }
    limit = Math.min(n, MAX_LIMIT)
  }
  if (offsetRaw !== undefined && offsetRaw !== '') {
    const n = Number.parseInt(offsetRaw, 10)
    if (!Number.isFinite(n) || n < 0) return { error: 'offset must be a non-negative integer' }
    offset = n
  }
  return { limit, offset }
}

function registrantListFilters(request: NextRequest): RegistrantListFilters {
  const status = request.nextUrl.searchParams.get('status')?.trim()
  const vetting = request.nextUrl.searchParams.get('vetting')?.trim()
  const categoryId = request.nextUrl.searchParams.get('categoryId')?.trim()
  const q = request.nextUrl.searchParams.get('q')?.trim()
  return {
    status: status || undefined,
    vetting: vetting || undefined,
    categoryId: categoryId || undefined,
    q: q || undefined,
  }
}

function applyRegistrantListFilters<Q extends { eq: (col: string, val: string) => Q; or: (filters: string) => Q }>(
  query: Q,
  filters: RegistrantListFilters,
): Q {
  let q = query
  if (filters.status) q = q.eq('status', filters.status)
  if (filters.vetting) q = q.eq('vetting_status', filters.vetting)
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId)
  if (filters.q) {
    const safe = filters.q.replace(/%/g, '').replace(/_/g, '').replace(/,/g, '')
    q = q.or(`scene_display_name.ilike.%${safe}%,email.ilike.%${safe}%,legal_name.ilike.%${safe}%`)
  }
  return q
}

const REGISTRANT_LIST_SELECT =
  'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, external_source, external_id, last_synced_at, rabbitsign_status, checked_in_at, checked_in_timing, created_at, updated_at'

function mapReg(
  r: Record<string, unknown>,
  categoryName: string | undefined,
  role: OrganizerRoleForClient,
  category: Record<string, unknown> | undefined,
  event: Record<string, unknown>,
) {
  const extras = registrantCheckInExtras({
    status: r.status as string,
    checkedInAt: (r.checked_in_at as string | null) ?? null,
    checkedInTiming: (r.checked_in_timing as string | null) ?? null,
    category: category ?? null,
    event: event as { timezone?: string; window_starts_at?: string; window_ends_at?: string },
  })
  return mapOrganizerRegistrantRow(r, categoryName, role, extras)
}

async function countActiveInCategory(
  admin: Awaited<ReturnType<typeof requireOrganizerForSlug>>['admin'],
  categoryId: string,
): Promise<number> {
  const { count, error } = await admin
    .from('dancecard_registrants')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .neq('status', 'cancelled')
  if (error) throw error
  return count ?? 0
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const pagination = parsePagination(request.nextUrl.searchParams)
    if ('error' in pagination) {
      return NextResponse.json({ error: pagination.error }, { status: 400 })
    }
    const { limit, offset } = pagination
    const filters = registrantListFilters(request)

    const countQuery = applyRegistrantListFilters(
      admin.from('dancecard_registrants').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
      filters,
    )
    const { count: totalCount, error: countErr } = await countQuery
    if (countErr) throw countErr
    const total = totalCount ?? 0

    const listBase = admin
      .from('dancecard_registrants')
      .select(REGISTRANT_LIST_SELECT)
      .eq('event_id', eventId)
    const filteredList = applyRegistrantListFilters(listBase, filters) as typeof listBase
    const { data: rows, error } = await filteredList
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error
    const catIds = Array.from(new Set((rows ?? []).map((r) => r.category_id as string)))
    const catById: Record<string, Record<string, unknown>> = {}
    const catName: Record<string, string> = {}
    if (catIds.length) {
      const { data: cats, error: cErr } = await admin
        .from('dancecard_registration_categories')
        .select('id, name, check_in_valid_from, check_in_valid_through')
        .in('id', catIds)
      if (cErr) throw cErr
      for (const c of cats ?? []) {
        const id = c.id as string
        catById[id] = c as Record<string, unknown>
        catName[id] = String(c.name)
      }
    }
    const eventRow = event as Record<string, unknown>
    return NextResponse.json({
      registrants: (rows ?? []).map((r) => {
        const row = r as Record<string, unknown>
        const cid = row.category_id as string
        return mapReg(row, catName[cid], organizerRole, catById[cid], eventRow)
      }),
      total,
      limit,
      offset,
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
    const body = organizerRegistrantCreateSchema.parse(await request.json())

    const { data: cat, error: catErr } = await admin
      .from('dancecard_registration_categories')
      .select('id, capacity')
      .eq('id', body.categoryId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (catErr) throw catErr
    if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })

    let status = body.status ?? 'pending'
    const cap = cat.capacity as number | null
    if (cap != null && cap >= 0) {
      const n = await countActiveInCategory(admin, body.categoryId)
      if (n >= cap && status !== 'cancelled' && status !== 'waitlisted') {
        status = 'waitlisted'
      }
    }

    const email = body.email === '' || body.email === undefined ? null : body.email ?? null
    const { data: row, error } = await admin
      .from('dancecard_registrants')
      .insert({
        event_id: eventId,
        category_id: body.categoryId,
        person_id: body.personId ?? null,
        status,
        scene_display_name: body.sceneDisplayName.trim(),
        legal_name: body.legalName ?? null,
        email,
        phone: body.phone ?? null,
        internal_notes: body.internalNotes ?? null,
        consent_waiver_ack_at: body.consentWaiverAckAt ? new Date(body.consentWaiverAckAt).toISOString() : null,
        consent_photo_ack_at: body.consentPhotoAckAt ? new Date(body.consentPhotoAckAt).toISOString() : null,
        imported_payment_status: body.importedPaymentStatus ?? null,
        external_source_ref: body.externalSourceRef ?? null,
      })
      .select(
        'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, external_source, external_id, last_synced_at, rabbitsign_status, created_at, updated_at',
      )
      .single()
    if (error) throw error
    const regId = row.id as string

    if (body.tagIds?.length) {
      await replaceRegistrantTagsForEvent(admin, eventId, regId, body.tagIds)
    }
    if (body.answers && Object.keys(body.answers).length) {
      const inserts = Object.entries(body.answers).map(([questionId, value_json]) => ({
        registrant_id: regId,
        question_id: questionId,
        value_json,
      }))
      const { error: aErr } = await admin.from('dancecard_registrant_answers').upsert(inserts, {
        onConflict: 'registrant_id,question_id',
      })
      if (aErr) throw aErr
    }

    const { data: catMeta } = await admin
      .from('dancecard_registration_categories')
      .select('id, name, check_in_valid_from, check_in_valid_through')
      .eq('id', body.categoryId)
      .maybeSingle()
    const catName = catMeta ? String((catMeta as { name?: string }).name ?? '') : undefined
    return NextResponse.json({
      registrant: mapReg(
        row as Record<string, unknown>,
        catName,
        ctx.organizerRole,
        (catMeta as Record<string, unknown> | null) ?? undefined,
        event as Record<string, unknown>,
      ),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
