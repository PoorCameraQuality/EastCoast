'use client'

import type { QuestionnaireQuestionRow } from '@/lib/dancecard/questionnaireTypes'

function choiceOptions(optionsJson: unknown): string[] {
  if (!Array.isArray(optionsJson)) return []
  return optionsJson.map((o) => (typeof o === 'string' ? o : String(o))).filter(Boolean)
}

export function QuestionnaireAnswerFields({
  questions,
  answers,
  onChange,
  disabled,
  fieldClassName = 'mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-sm text-dc-text',
  labelClassName = 'block text-xs text-dc-muted',
}: {
  questions: QuestionnaireQuestionRow[]
  answers: Record<string, unknown>
  onChange: (questionId: string, value: unknown) => void
  disabled?: boolean
  fieldClassName?: string
  labelClassName?: string
}) {
  const sorted = [...questions].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <div className="space-y-3">
      {sorted.map((q) => (
        <label key={q.id} className={labelClassName}>
          <span className="text-dc-text">
            {q.label}
            {q.required ? <span className="text-dc-warning"> *</span> : null}
          </span>
          {renderField(q, answers[q.id], (v) => onChange(q.id, v), disabled, fieldClassName)}
        </label>
      ))}
    </div>
  )
}

function renderField(
  q: QuestionnaireQuestionRow,
  value: unknown,
  onChange: (v: unknown) => void,
  disabled: boolean | undefined,
  fieldClassName: string,
) {
  const opts = choiceOptions(q.optionsJson)

  if (q.type === 'long_text' || q.type === 'consent_matrix') {
    return (
      <textarea
        className={`${fieldClassName} min-h-[80px]`}
        disabled={disabled}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    )
  }

  if (q.type === 'multi_choice') {
    const selected = Array.isArray(value) ? value.map(String) : []
    return (
      <div className="mt-2 space-y-1">
        {opts.length ? (
          opts.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-dc-text">
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected.includes(opt)}
                onChange={(e) => {
                  const next = new Set(selected)
                  if (e.target.checked) next.add(opt)
                  else next.delete(opt)
                  onChange(Array.from(next))
                }}
              />
              {opt}
            </label>
          ))
        ) : (
          <p className="text-xs text-dc-muted">No options configured.</p>
        )}
      </div>
    )
  }

  if (q.type === 'single_choice' || q.type === 'dropdown') {
    return (
      <select
        className={fieldClassName}
        disabled={disabled}
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">— choose —</option>
        {opts.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    )
  }

  const inputType =
    q.type === 'email' ? 'email' : q.type === 'phone' ? 'tel' : q.type === 'date' ? 'date' : 'text'

  return (
    <input
      type={inputType}
      className={fieldClassName}
      disabled={disabled}
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
