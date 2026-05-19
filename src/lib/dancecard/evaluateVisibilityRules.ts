/**
 * Registration question visibility and category-scoped required rules.
 *
 * visibility_rules_json shape:
 * {
 *   "categoryIdIn": ["uuid", ...],           // show only when selected category is in list
 *   "answerEquals": { "<questionId>": value } // show only when prior answers match
 * }
 */

export type VisibilityRulesJson = {
  categoryIdIn?: string[]
  answerEquals?: Record<string, unknown>
}

export type RegistrationQuestionRuleInput = {
  id: string
  label: string
  required: boolean
  requiredForCategoryIds?: string[]
  visibilityRulesJson?: VisibilityRulesJson | Record<string, unknown>
}

function normalizeRules(raw: VisibilityRulesJson | Record<string, unknown> | undefined): VisibilityRulesJson {
  if (!raw || typeof raw !== 'object') return {}
  const categoryIdIn = Array.isArray((raw as VisibilityRulesJson).categoryIdIn)
    ? (raw as VisibilityRulesJson).categoryIdIn!.filter((id) => typeof id === 'string' && id.length > 0)
    : undefined
  const answerEqualsRaw = (raw as VisibilityRulesJson).answerEquals
  let answerEquals: Record<string, unknown> | undefined
  if (answerEqualsRaw && typeof answerEqualsRaw === 'object' && !Array.isArray(answerEqualsRaw)) {
    answerEquals = answerEqualsRaw as Record<string, unknown>
  }
  return { categoryIdIn, answerEquals }
}

function answerMatches(expected: unknown, actual: unknown): boolean {
  if (expected === actual) return true
  if (expected == null && (actual === '' || actual == null)) return true
  if (typeof expected === 'string' && typeof actual === 'string') {
    return expected.trim().toLowerCase() === actual.trim().toLowerCase()
  }
  if (Array.isArray(actual)) {
    if (Array.isArray(expected)) {
      const exp = expected.map(String).sort()
      const act = actual.map(String).sort()
      return exp.length === act.length && exp.every((v, i) => v === act[i])
    }
    return actual.map(String).includes(String(expected))
  }
  return String(expected) === String(actual)
}

/** True when the question should be shown for the given category and current answers. */
export function isQuestionVisible(
  question: RegistrationQuestionRuleInput,
  categoryId: string,
  answers: Record<string, unknown>,
): boolean {
  const rules = normalizeRules(question.visibilityRulesJson)
  if (rules.categoryIdIn?.length) {
    if (!rules.categoryIdIn.includes(categoryId)) return false
  }
  if (rules.answerEquals && Object.keys(rules.answerEquals).length > 0) {
    for (const [qid, expected] of Object.entries(rules.answerEquals)) {
      if (!answerMatches(expected, answers[qid])) return false
    }
  }
  return true
}

/** True when the question must be answered (global required or category-scoped). */
export function isQuestionRequired(question: RegistrationQuestionRuleInput, categoryId: string): boolean {
  if (question.required) return true
  const ids = question.requiredForCategoryIds ?? []
  return ids.length > 0 && ids.includes(categoryId)
}

export function visibleQuestionsForRegistration(
  questions: RegistrationQuestionRuleInput[],
  categoryId: string,
  answers: Record<string, unknown>,
): RegistrationQuestionRuleInput[] {
  return questions.filter((q) => isQuestionVisible(q, categoryId, answers))
}

function isAnswerEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

/**
 * Validates answers for visible questions; returns sanitized map (visible questions only).
 * Throws Error with BAD_REQUEST prefix on validation failure.
 */
export function validateRegistrationAnswers(
  questions: RegistrationQuestionRuleInput[],
  categoryId: string,
  answers: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const input = answers ?? {}
  const visible = visibleQuestionsForRegistration(questions, categoryId, input)
  const out: Record<string, unknown> = {}

  for (const q of visible) {
    const raw = input[q.id]
    const empty = isAnswerEmpty(raw)
    if (isQuestionRequired(q, categoryId) && empty) {
      throw new Error(`BAD_REQUEST: Required answer missing: ${q.label}`)
    }
    if (!empty) out[q.id] = raw
  }

  // Reject answers for hidden questions
  const visibleIds = new Set(visible.map((q) => q.id))
  for (const qid of Object.keys(input)) {
    if (!visibleIds.has(qid) && !isAnswerEmpty(input[qid])) {
      throw new Error('BAD_REQUEST: Answer provided for a hidden question')
    }
  }

  return out
}
