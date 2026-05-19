import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerRegistrationFormPutSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function mapQuestion(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    type: r.type as string,
    label: r.label as string,
    required: Boolean(r.required),
    sortOrder: Number(r.sort_order ?? 0),
    optionsJson: r.options_json,
    visibilityRulesJson: r.visibility_rules_json,
    requiredForCategoryIds: Array.isArray(r.required_for_category_ids)
      ? (r.required_for_category_ids as string[])
      : [],
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
    const { data: form, error } = await admin
      .from('dancecard_registration_forms')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    if (error) throw error
    if (!form) {
      return NextResponse.json({ form: null })
    }
    const formId = form.id as string
    const { data: qs, error: qErr } = await admin
      .from('dancecard_registration_questions')
      .select('*')
      .eq('form_id', formId)
      .order('sort_order', { ascending: true })
    if (qErr) throw qErr
    return NextResponse.json({
      form: {
        id: formId,
        status: form.status as string,
        introText: form.intro_text as string,
        confirmationText: form.confirmation_text as string,
        createdAt: form.created_at as string,
        updatedAt: form.updated_at as string,
        questions: (qs ?? []).map((r) => mapQuestion(r as Record<string, unknown>)),
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

async function syncQuestions(
  admin: Awaited<ReturnType<typeof requireOrganizerForSlug>>['admin'],
  formId: string,
  questions: Array<{
    id?: string
    type: string
    label: string
    required?: boolean
    sortOrder?: number
    optionsJson?: unknown
    visibilityRulesJson?: Record<string, unknown>
    requiredForCategoryIds?: string[]
  }>,
) {
  const { data: existingRows, error: exErr } = await admin
    .from('dancecard_registration_questions')
    .select('id')
    .eq('form_id', formId)
  if (exErr) throw exErr
  const existingIds = new Set((existingRows ?? []).map((x) => x.id as string))
  const incomingIds = new Set(questions.map((q) => q.id).filter(Boolean) as string[])

  for (const id of Array.from(existingIds)) {
    if (incomingIds.has(id)) continue
    const { count, error: cErr } = await admin
      .from('dancecard_registrant_answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', id)
    if (cErr) throw cErr
    if (count && count > 0) {
      const err = new Error('BAD_REQUEST: Cannot remove questions that already have answers')
      throw err
    }
    const { error: dErr } = await admin.from('dancecard_registration_questions').delete().eq('id', id).eq('form_id', formId)
    if (dErr) throw dErr
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const sortOrder = q.sortOrder ?? i
    const optionsJson = q.optionsJson ?? []
    const visibilityRulesJson = q.visibilityRulesJson ?? {}
    const requiredForCategoryIds = q.requiredForCategoryIds ?? []
    if (q.id && existingIds.has(q.id)) {
      const { error: uErr } = await admin
        .from('dancecard_registration_questions')
        .update({
          type: q.type,
          label: q.label,
          required: q.required ?? false,
          sort_order: sortOrder,
          options_json: optionsJson,
          visibility_rules_json: visibilityRulesJson,
          required_for_category_ids: requiredForCategoryIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', q.id)
        .eq('form_id', formId)
      if (uErr) throw uErr
    } else {
      const { error: iErr } = await admin.from('dancecard_registration_questions').insert({
        form_id: formId,
        type: q.type,
        label: q.label,
        required: q.required ?? false,
        sort_order: sortOrder,
        options_json: optionsJson,
        visibility_rules_json: visibilityRulesJson,
        required_for_category_ids: requiredForCategoryIds,
      })
      if (iErr) throw iErr
    }
  }
}

export async function PUT(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerRegistrationFormPutSchema.parse(await request.json())

    let { data: form, error: fErr } = await admin
      .from('dancecard_registration_forms')
      .select('*')
      .eq('event_id', eventId)
      .maybeSingle()
    if (fErr) throw fErr

    if (!form) {
      const { data: inserted, error: insErr } = await admin
        .from('dancecard_registration_forms')
        .insert({
          event_id: eventId,
          status: body.status ?? 'draft',
          intro_text: body.introText ?? '',
          confirmation_text: body.confirmationText ?? '',
        })
        .select('*')
        .single()
      if (insErr) throw insErr
      form = inserted
    } else {
      const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (body.status !== undefined) patch.status = body.status
      if (body.introText !== undefined) patch.intro_text = body.introText
      if (body.confirmationText !== undefined) patch.confirmation_text = body.confirmationText
      const { data: updated, error: uErr } = await admin
        .from('dancecard_registration_forms')
        .update(patch)
        .eq('id', form.id as string)
        .select('*')
        .single()
      if (uErr) throw uErr
      form = updated
    }

    const formId = form!.id as string
    if (body.questions !== undefined) {
      await syncQuestions(admin, formId, body.questions)
    }

    const { data: qs, error: qErr } = await admin
      .from('dancecard_registration_questions')
      .select('*')
      .eq('form_id', formId)
      .order('sort_order', { ascending: true })
    if (qErr) throw qErr

    return NextResponse.json({
      form: {
        id: formId,
        status: form!.status as string,
        introText: form!.intro_text as string,
        confirmationText: form!.confirmation_text as string,
        createdAt: form!.created_at as string,
        updatedAt: form!.updated_at as string,
        questions: (qs ?? []).map((r) => mapQuestion(r as Record<string, unknown>)),
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
