import type { SupabaseClient } from '@supabase/supabase-js'
import type { QuestionnaireQuestionInput, QuestionnaireQuestionRow } from '@/lib/dancecard/questionnaireTypes'

export function applySlugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  return base || 'role'
}

export function publicTrustedRoleApplyPath(eventSlug: string, applySlug: string): string {
  return `/dancecard/${encodeURIComponent(eventSlug)}/apply/${encodeURIComponent(applySlug)}`
}

export function mapTrustedRoleQuestion(r: Record<string, unknown>): QuestionnaireQuestionRow {
  return {
    id: r.id as string,
    type: r.type as string,
    label: r.label as string,
    required: Boolean(r.required),
    sortOrder: Number(r.sort_order ?? 0),
    optionsJson: r.options_json ?? [],
    visibilityRulesJson: (r.visibility_rules_json as Record<string, unknown>) ?? {},
  }
}

export function mapTrustedRoleRow(r: Record<string, unknown>, questions?: QuestionnaireQuestionRow[]) {
  return {
    id: r.id as string,
    name: r.name as string,
    applySlug: r.apply_slug as string,
    description: (r.description as string | null) ?? null,
    status: r.status as string,
    introText: (r.intro_text as string) ?? '',
    confirmationText: (r.confirmation_text as string) ?? '',
    sortOrder: Number(r.sort_order ?? 0),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
    questions: questions ?? [],
  }
}

export async function syncTrustedRoleQuestions(
  admin: SupabaseClient,
  roleId: string,
  questions: QuestionnaireQuestionInput[],
): Promise<void> {
  const { data: existingRows, error: exErr } = await admin
    .from('dancecard_trusted_role_questions')
    .select('id')
    .eq('role_id', roleId)
  if (exErr) throw exErr
  const existingIds = new Set((existingRows ?? []).map((x) => x.id as string))
  const incomingIds = new Set(questions.map((q) => q.id).filter(Boolean) as string[])

  for (const id of Array.from(existingIds)) {
    if (incomingIds.has(id)) continue
    const { error: dErr } = await admin.from('dancecard_trusted_role_questions').delete().eq('id', id).eq('role_id', roleId)
    if (dErr) throw dErr
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const sortOrder = q.sortOrder ?? i
    const optionsJson = q.optionsJson ?? []
    const visibilityRulesJson = q.visibilityRulesJson ?? {}
    if (q.id && existingIds.has(q.id)) {
      const { error: uErr } = await admin
        .from('dancecard_trusted_role_questions')
        .update({
          type: q.type,
          label: q.label,
          required: q.required ?? false,
          sort_order: sortOrder,
          options_json: optionsJson,
          visibility_rules_json: visibilityRulesJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', q.id)
        .eq('role_id', roleId)
      if (uErr) throw uErr
    } else {
      const { error: iErr } = await admin.from('dancecard_trusted_role_questions').insert({
        role_id: roleId,
        type: q.type,
        label: q.label,
        required: q.required ?? false,
        sort_order: sortOrder,
        options_json: optionsJson,
        visibility_rules_json: visibilityRulesJson,
      })
      if (iErr) throw iErr
    }
  }
}

export function validateQuestionnaireAnswers(
  questions: QuestionnaireQuestionRow[],
  answers: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const q of questions) {
    const raw = answers?.[q.id]
    const empty =
      raw === undefined ||
      raw === null ||
      raw === '' ||
      (Array.isArray(raw) && raw.length === 0)
    if (q.required && empty) {
      throw new Error(`BAD_REQUEST: Required answer missing: ${q.label}`)
    }
    if (!empty) out[q.id] = raw
  }
  return out
}

export function formatApplicationPayload(args: {
  trustedRoleId: string
  trustedRoleName: string
  answers: Record<string, unknown>
  questions: QuestionnaireQuestionRow[]
}) {
  const byLabel: Record<string, unknown> = {}
  for (const q of args.questions) {
    if (args.answers[q.id] !== undefined) {
      byLabel[q.label] = args.answers[q.id]
    }
  }
  return {
    trustedRoleId: args.trustedRoleId,
    trustedRoleName: args.trustedRoleName,
    answers: args.answers,
    answersByLabel: byLabel,
  }
}
