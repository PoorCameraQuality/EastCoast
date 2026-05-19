'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { QuestionnaireAnswerFields } from '@/components/dancecard/questionnaire/QuestionnaireAnswerFields'
import {
  isQuestionRequired,
  isQuestionVisible,
  type RegistrationQuestionRuleInput,
} from '@/lib/dancecard/evaluateVisibilityRules'
import { formatCategoryOptionLabel } from '@/lib/dancecard/registrationCategoryRoleKinds'
import type { QuestionnaireQuestionRow } from '@/lib/dancecard/questionnaireTypes'

type Category = {
  id: string
  name: string
  expectedHours: number | null
  requiresAccessCode: boolean
}

type FormPayload = {
  introText: string
  confirmationText: string
  questions: (RegistrationQuestionRuleInput & QuestionnaireQuestionRow)[]
}

export function RegisterFormClient({ eventSlug }: { eventSlug: string }) {
  const [eventTitle, setEventTitle] = useState<string | null>(null)
  const [requiresEventCode, setRequiresEventCode] = useState(false)
  const [form, setForm] = useState<FormPayload | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [categoryAccessCode, setCategoryAccessCode] = useState('')
  const [eventAccessCode, setEventAccessCode] = useState('')
  const [sceneDisplayName, setSceneDisplayName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await dancecardFetch<{
        eventTitle: string
        requiresEventAccessCode: boolean
        form: FormPayload
        categories: Category[]
      }>(eventSlug, '/registration-form')
      setEventTitle(res.eventTitle)
      setRequiresEventCode(Boolean(res.requiresEventAccessCode))
      setForm(res.form)
      setCategories(res.categories ?? [])
      if (res.categories?.length === 1) setCategoryId(res.categories[0].id)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  const selectedCategory = categories.find((c) => c.id === categoryId)

  const visibleQuestions = useMemo(() => {
    if (!form || !categoryId) return []
    return form.questions
      .filter((q) => isQuestionVisible(q, categoryId, answers))
      .map((q) => ({
        ...q,
        required: isQuestionRequired(q, categoryId),
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [form, categoryId, answers])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !categoryId || !sceneDisplayName.trim()) return
    setBusy(true)
    setErr(null)
    try {
      const res = await dancecardFetch<{ confirmationText: string }>(eventSlug, '/registration/submit', {
        method: 'POST',
        body: JSON.stringify({
          categoryId,
          categoryAccessCode: categoryAccessCode.trim() || undefined,
          registrationAccessCode: eventAccessCode.trim() || undefined,
          sceneDisplayName: sceneDisplayName.trim(),
          legalName: legalName.trim() || null,
          email: email.trim() || undefined,
          phone: phone.trim() || null,
          answers,
        }),
      })
      setDone(
        res.confirmationText?.trim() ||
          'Registration received. Organizers will follow up if anything else is needed.',
      )
    } catch (e2) {
      setErr(formatDancecardApiMessage(e2))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-sm text-dc-text">
        <h1 className="text-xl font-semibold text-dc-text">Registration received</h1>
        <p className="mt-4 whitespace-pre-wrap text-dc-success">{done}</p>
        <Link className="mt-6 inline-block text-dc-accent hover:underline" href={`/dancecard/${eventSlug}`}>
          Back to {eventTitle ?? 'event'}
        </Link>
      </div>
    )
  }

  if (err && !form) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-dc-text">
        <p className="text-dc-danger">{err}</p>
        <Link className="mt-4 inline-block text-dc-accent hover:underline" href={`/dancecard/${eventSlug}`}>
          Back to event
        </Link>
      </div>
    )
  }

  if (!form) {
    return <p className="px-4 py-12 text-center text-sm text-dc-muted">Loading registration…</p>
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 text-sm text-dc-text">
      <p className="text-xs uppercase tracking-wide text-dc-muted">{eventTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold text-dc-text">Register</h1>
      {form.introText ? <p className="mt-4 whitespace-pre-wrap text-dc-text">{form.introText}</p> : null}
      {err ? <p className="mt-4 text-xs text-dc-danger">{err}</p> : null}
      <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
        {requiresEventCode ? (
          <label className="block text-xs text-dc-muted">
            Event registration code *
            <input
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 font-mono text-dc-text"
              required
              value={eventAccessCode}
              onChange={(e) => setEventAccessCode(e.target.value)}
            />
          </label>
        ) : null}
        {categories.length > 0 ? (
          <label className="block text-xs text-dc-muted">
            Registration type *
            <select
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">— choose —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatCategoryOptionLabel(c.name, c.expectedHours)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {selectedCategory?.requiresAccessCode ? (
          <label className="block text-xs text-dc-muted">
            Access / comp code *
            <input
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 font-mono text-dc-text"
              required
              value={categoryAccessCode}
              onChange={(e) => setCategoryAccessCode(e.target.value)}
            />
          </label>
        ) : null}
        <label className="block text-xs text-dc-muted">
          Scene / badge name *
          <input
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            required
            value={sceneDisplayName}
            onChange={(e) => setSceneDisplayName(e.target.value)}
          />
        </label>
        <label className="block text-xs text-dc-muted">
          Legal name (optional)
          <input
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
        </label>
        <label className="block text-xs text-dc-muted">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-xs text-dc-muted">
          Phone (optional)
          <input
            type="tel"
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {visibleQuestions.length > 0 ? (
          <QuestionnaireAnswerFields
            questions={visibleQuestions}
            answers={answers}
            onChange={(id, value) => setAnswers((a) => ({ ...a, [id]: value }))}
          />
        ) : null}
        <button
          type="submit"
          disabled={busy || !categoryId}
          className="w-full rounded-full bg-dc-accent py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
        >
          {busy ? 'Submitting…' : 'Submit registration'}
        </button>
      </form>
    </div>
  )
}
