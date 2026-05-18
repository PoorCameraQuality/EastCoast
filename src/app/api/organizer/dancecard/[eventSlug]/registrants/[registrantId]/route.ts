import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrantPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { replaceRegistrantTagsForEvent } from '@/lib/dancecard/organizerRegistrantTags'
import { mapOrganizerRegistrantRow } from '@/lib/dancecard/organizerRegistrantDto'
import { assertCheckInAllowed, registrantCheckInExtras } from '@/lib/dancecard/organizerRegistrantCheckIn'
import { organizerRoleCanEditVettingSafetyNotes, organizerRoleCanSeeRegistrantInternalNotes } from '@/lib/dancecard/organizerRoles'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

async function countActiveInCategory(
  admin: Awaited<ReturnType<typeof requireOrganizerForSlug>>['admin'],
  categoryId: string,
  excludeRegistrantId?: string,
): Promise<number> {
  let q = admin
    .from('dancecard_registrants')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .neq('status', 'cancelled')
  if (excludeRegistrantId) q = q.neq('id', excludeRegistrantId)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; registrantId: string } }) {
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const registrantId = context.params.registrantId
    const { data: row, error } = await admin
      .from('dancecard_registrants')
      .select(
        'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, rabbitsign_status, created_at, updated_at',
      )
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: cat } = await admin
      .from('dancecard_registration_categories')
      .select('name')
      .eq('id', row.category_id as string)
      .maybeSingle()

    const { data: ans, error: aErr } = await admin
      .from('dancecard_registrant_answers')
      .select('question_id, value_json')
      .eq('registrant_id', registrantId)
    if (aErr) throw aErr
    const answers: Record<string, unknown> = {}
    for (const a of ans ?? []) answers[a.question_id as string] = a.value_json

    const { data: tagRows } = await admin.from('dancecard_registrant_tags').select('tag_id').eq('registrant_id', registrantId)
    const tagIds = (tagRows ?? []).map((t) => t.tag_id as string)

    const base = mapOrganizerRegistrantRow(row as Record<string, unknown>, (cat?.name as string) ?? null, organizerRole)
    return NextResponse.json({
      registrant: {
        ...base,
        answers,
        tagIds,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; registrantId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const registrantId = context.params.registrantId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_registrants')
      .select('id, category_id, status')
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = organizerRegistrantPatchSchema.parse(await request.json())
    if (body.internalNotes !== undefined && !organizerRoleCanSeeRegistrantInternalNotes(organizerRole)) {
      const err = new Error('FORBIDDEN')
      ;(err as Error & { status: number }).status = 403
      throw err
    }
    if (body.vettingSafetyNotes !== undefined && !organizerRoleCanEditVettingSafetyNotes(organizerRole)) {
      const err = new Error('FORBIDDEN')
      ;(err as Error & { status: number }).status = 403
      throw err
    }
    const targetCategoryId = body.categoryId ?? (existing.category_id as string)

    if (body.categoryId) {
      const { data: cat, error: catErr } = await admin
        .from('dancecard_registration_categories')
        .select('id, capacity')
        .eq('id', targetCategoryId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (catErr) throw catErr
      if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    let desiredStatus = body.status !== undefined ? body.status : (existing.status as string)
    const { data: catRow, error: catRowErr } = await admin
      .from('dancecard_registration_categories')
      .select('capacity, check_in_valid_from, check_in_valid_through')
      .eq('id', targetCategoryId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (catRowErr) throw catRowErr
    const catForCap = catRow
    const cap = catForCap?.capacity as number | null | undefined
    // Check-in is an on-site desk action — never downgrade to waitlisted because the category is full.
    const skipCapacityForCheckIn = body.status === 'checked_in'
    if (
      !skipCapacityForCheckIn &&
      cap != null &&
      cap >= 0 &&
      desiredStatus !== 'cancelled' &&
      desiredStatus !== 'waitlisted'
    ) {
      const n = await countActiveInCategory(admin, targetCategoryId, registrantId)
      if (n >= cap) desiredStatus = 'waitlisted'
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    let checkInTiming: string | null = null
    if (body.status === 'checked_in') {
      const check = await assertCheckInAllowed({
        admin,
        eventId,
        categoryId: targetCategoryId,
        event,
        earlyCheckInOverride: Boolean(body.earlyCheckInOverride),
      })
      checkInTiming = check.timing
      desiredStatus = 'checked_in'
      patch.checked_in_at = new Date().toISOString()
      patch.checked_in_timing = check.timing
    }
    if (body.categoryId !== undefined) patch.category_id = body.categoryId
    if (body.status !== undefined || body.categoryId !== undefined) patch.status = desiredStatus
    if (body.personId !== undefined) patch.person_id = body.personId
    if (body.sceneDisplayName !== undefined) patch.scene_display_name = body.sceneDisplayName.trim()
    if (body.legalName !== undefined) patch.legal_name = body.legalName
    if (body.email !== undefined) patch.email = body.email === '' ? null : body.email
    if (body.phone !== undefined) patch.phone = body.phone
    if (body.internalNotes !== undefined) patch.internal_notes = body.internalNotes
    if (body.consentWaiverAckAt !== undefined) {
      patch.consent_waiver_ack_at = body.consentWaiverAckAt ? new Date(body.consentWaiverAckAt).toISOString() : null
    }
    if (body.consentPhotoAckAt !== undefined) {
      patch.consent_photo_ack_at = body.consentPhotoAckAt ? new Date(body.consentPhotoAckAt).toISOString() : null
    }
    if (body.importedPaymentStatus !== undefined) patch.imported_payment_status = body.importedPaymentStatus
    if (body.externalSourceRef !== undefined) patch.external_source_ref = body.externalSourceRef
    if (body.pronouns !== undefined) patch.pronouns = body.pronouns
    if (body.vettingStatus !== undefined) patch.vetting_status = body.vettingStatus
    if (body.vettingSafetyNotes !== undefined) patch.vetting_safety_notes = body.vettingSafetyNotes
    if (body.rabbitsignStatus !== undefined) patch.rabbitsign_status = body.rabbitsignStatus

    const { data: row, error } = await admin
      .from('dancecard_registrants')
      .update(patch)
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .select(
        'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, rabbitsign_status, checked_in_at, checked_in_timing, created_at, updated_at',
      )
      .single()
    if (error) throw error

    if (body.tagIds !== undefined) {
      await replaceRegistrantTagsForEvent(admin, eventId, registrantId, body.tagIds)
    }
    if (body.answers && Object.keys(body.answers).length) {
      const inserts = Object.entries(body.answers).map(([question_id, value_json]) => ({
        registrant_id: registrantId,
        question_id,
        value_json,
      }))
      const { error: aErr } = await admin.from('dancecard_registrant_answers').upsert(inserts, {
        onConflict: 'registrant_id,question_id',
      })
      if (aErr) throw aErr
    }

    if (body.policyDocumentIds?.length) {
      const now = new Date().toISOString()
      for (const policyDocumentId of body.policyDocumentIds) {
        const { data: pol, error: pErr } = await admin
          .from('dancecard_policy_documents')
          .select('id')
          .eq('id', policyDocumentId)
          .eq('event_id', eventId)
          .maybeSingle()
        if (pErr) throw pErr
        if (!pol) continue
        const { error: insPol } = await admin.from('dancecard_registrant_policy_acceptances').insert({
          registrant_id: registrantId,
          policy_document_id: policyDocumentId,
          accepted_at: now,
          signature_method: 'manual',
        })
        const code = (insPol as { code?: string } | null)?.code
        if (insPol && code !== '23505') throw insPol
      }
    }

    const extras = registrantCheckInExtras({
      status: row.status as string,
      checkedInAt: (row.checked_in_at as string | null) ?? null,
      checkedInTiming: (row.checked_in_timing as string | null) ?? checkInTiming,
      category: catRow,
      event,
    })
    return NextResponse.json({
      registrant: mapOrganizerRegistrantRow(row as Record<string, unknown>, undefined, organizerRole, extras),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; registrantId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const registrantId = context.params.registrantId
    const { error } = await admin.from('dancecard_registrants').delete().eq('id', registrantId).eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
