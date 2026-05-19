import type { SupabaseClient } from '@supabase/supabase-js'
import { codesEqual } from '@/lib/dancecard/accessCodes'
import {
  type RegistrationQuestionRuleInput,
  validateRegistrationAnswers,
} from '@/lib/dancecard/evaluateVisibilityRules'

export type PublicRegistrationCategory = {
  id: string
  name: string
  roleKind: string
  expectedHours: number | null
  requiresAccessCode: boolean
  sortOrder: number
}

export type PublicRegistrationQuestion = RegistrationQuestionRuleInput & {
  type: string
  sortOrder: number
  optionsJson: unknown
}

function mapQuestionRow(r: Record<string, unknown>): PublicRegistrationQuestion {
  const requiredFor = r.required_for_category_ids
  return {
    id: r.id as string,
    type: r.type as string,
    label: r.label as string,
    required: Boolean(r.required),
    sortOrder: Number(r.sort_order ?? 0),
    optionsJson: r.options_json ?? [],
    visibilityRulesJson: (r.visibility_rules_json as Record<string, unknown>) ?? {},
    requiredForCategoryIds: Array.isArray(requiredFor)
      ? (requiredFor as string[]).filter((id) => typeof id === 'string')
      : [],
  }
}

export async function loadPublishedRegistrationForm(admin: SupabaseClient, eventId: string) {
  const { data: form, error: fErr } = await admin
    .from('dancecard_registration_forms')
    .select('id, status, intro_text, confirmation_text')
    .eq('event_id', eventId)
    .eq('status', 'published')
    .maybeSingle()
  if (fErr) throw fErr
  if (!form) return null

  const { data: qs, error: qErr } = await admin
    .from('dancecard_registration_questions')
    .select('*')
    .eq('form_id', form.id as string)
    .order('sort_order', { ascending: true })
  if (qErr) throw qErr

  return {
    id: form.id as string,
    introText: (form.intro_text as string) ?? '',
    confirmationText: (form.confirmation_text as string) ?? '',
    questions: (qs ?? []).map((q) => mapQuestionRow(q as Record<string, unknown>)),
  }
}

export async function loadPublicRegistrationCategories(
  admin: SupabaseClient,
  eventId: string,
): Promise<PublicRegistrationCategory[]> {
  const { data: rows, error } = await admin
    .from('dancecard_registration_categories')
    .select('id, name, role_kind, expected_hours, access_code, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (rows ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    roleKind: String(r.role_kind ?? 'attendee'),
    expectedHours:
      r.expected_hours === null || r.expected_hours === undefined ? null : Number(r.expected_hours),
    requiresAccessCode: Boolean(String(r.access_code ?? '').trim()),
    sortOrder: Number(r.sort_order ?? 0),
  }))
}

async function countActiveInCategory(admin: SupabaseClient, categoryId: string): Promise<number> {
  const { count, error } = await admin
    .from('dancecard_registrants')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
    .neq('status', 'cancelled')
  if (error) throw error
  return count ?? 0
}

export type PublicRegistrationSubmitInput = {
  categoryId: string
  categoryAccessCode?: string
  sceneDisplayName: string
  legalName?: string | null
  email?: string | null
  phone?: string | null
  answers?: Record<string, unknown>
}

export async function submitPublicRegistration(
  admin: SupabaseClient,
  eventId: string,
  eventRegistrationAccessCode: string | null | undefined,
  body: PublicRegistrationSubmitInput,
  options?: { registrationAccessCode?: string },
): Promise<{ registrantId: string; status: string; confirmationText: string }> {
  const form = await loadPublishedRegistrationForm(admin, eventId)
  if (!form) {
    throw new Error('BAD_REQUEST: Registration is not open for this event')
  }

  const regGate = String(eventRegistrationAccessCode ?? '').trim()
  if (regGate) {
    const provided = String(options?.registrationAccessCode ?? '').trim()
    if (!provided || !codesEqual(provided, regGate)) {
      throw new Error('BAD_REQUEST: Invalid or missing event registration access code')
    }
  }

  const { data: cat, error: catErr } = await admin
    .from('dancecard_registration_categories')
    .select('id, name, capacity, access_code')
    .eq('id', body.categoryId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (catErr) throw catErr
  if (!cat) throw new Error('BAD_REQUEST: Registration type not found')

  const catCode = String(cat.access_code ?? '').trim()
  if (catCode) {
    const provided = String(body.categoryAccessCode ?? '').trim()
    if (!provided || !codesEqual(provided, catCode)) {
      throw new Error('BAD_REQUEST: Invalid or missing access code for this registration type')
    }
  }

  const validatedAnswers = validateRegistrationAnswers(form.questions, body.categoryId, body.answers)

  let pronouns: string | null = null
  for (const q of form.questions) {
    if (q.type === 'pronouns' && validatedAnswers[q.id] != null) {
      pronouns = String(validatedAnswers[q.id]).trim() || null
    }
  }

  let status = 'pending'
  const cap = cat.capacity as number | null
  if (cap != null && cap >= 0) {
    const n = await countActiveInCategory(admin, body.categoryId)
    if (n >= cap) status = 'waitlisted'
  }

  const email = body.email?.trim() ? body.email.trim() : null
  const { data: row, error: insErr } = await admin
    .from('dancecard_registrants')
    .insert({
      event_id: eventId,
      category_id: body.categoryId,
      status,
      scene_display_name: body.sceneDisplayName.trim(),
      legal_name: body.legalName?.trim() || null,
      email,
      phone: body.phone?.trim() || null,
      pronouns,
    })
    .select('id, status')
    .single()
  if (insErr) throw insErr

  const registrantId = row.id as string
  if (Object.keys(validatedAnswers).length) {
    const inserts = Object.entries(validatedAnswers).map(([question_id, value_json]) => ({
      registrant_id: registrantId,
      question_id,
      value_json,
    }))
    const { error: aErr } = await admin.from('dancecard_registrant_answers').upsert(inserts, {
      onConflict: 'registrant_id,question_id',
    })
    if (aErr) throw aErr
  }

  return {
    registrantId,
    status: row.status as string,
    confirmationText: form.confirmationText,
  }
}
