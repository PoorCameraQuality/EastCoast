'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { QuestionnaireAnswerFields } from '@/components/dancecard/questionnaire/QuestionnaireAnswerFields'
import type { QuestionnaireQuestionRow } from '@/lib/dancecard/questionnaireTypes'

type RolePayload = {
  id: string
  name: string
  applySlug: string
  description: string | null
  introText: string
  confirmationText: string
  questions: QuestionnaireQuestionRow[]
}

export function TrustedRoleApplyClient({
  eventSlug,
  applySlug,
}: {
  eventSlug: string
  applySlug: string
}) {
  const [eventTitle, setEventTitle] = useState<string | null>(null)
  const [role, setRole] = useState<RolePayload | null>(null)
  const [sceneName, setSceneName] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await dancecardFetch<{ eventTitle: string; role: RolePayload }>(
        eventSlug,
        `/trusted-roles/${encodeURIComponent(applySlug)}`,
      )
      setEventTitle(res.eventTitle)
      setRole(res.role)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug, applySlug])

  useEffect(() => {
    void load()
  }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!role || !sceneName.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await dancecardFetch(eventSlug, '/vetting-applications', {
        method: 'POST',
        body: JSON.stringify({
          applySlug: role.applySlug,
          sceneDisplayName: sceneName.trim(),
          email: email.trim() || null,
          answers,
        }),
      })
      setDone(true)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(false)
    }
  }

  if (err && !role) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center text-sm text-dc-text">
        <p className="text-dc-danger">{err}</p>
        <Link className="mt-4 inline-block text-dc-accent hover:underline" href={`/dancecard/${eventSlug}`}>
          Back to event
        </Link>
      </div>
    )
  }

  if (!role) {
    return <p className="px-4 py-12 text-center text-sm text-dc-muted">Loading application…</p>
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-sm text-dc-text">
        <h1 className="text-xl font-semibold text-dc-text">{role.name}</h1>
        <p className="mt-4 text-dc-success">
          {role.confirmationText?.trim() ||
            'Application submitted. Organizers will review and follow up if you are approved.'}
        </p>
        <Link className="mt-6 inline-block text-dc-accent hover:underline" href={`/dancecard/${eventSlug}`}>
          Back to {eventTitle ?? 'event'}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8 text-sm text-dc-text">
      <p className="text-xs uppercase tracking-wide text-dc-muted">{eventTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold text-dc-text">{role.name}</h1>
      {role.description ? <p className="mt-2 text-dc-muted">{role.description}</p> : null}
      {role.introText ? <p className="mt-4 whitespace-pre-wrap text-dc-text">{role.introText}</p> : null}
      {err ? <p className="mt-4 text-xs text-dc-danger">{err}</p> : null}
      <form className="mt-6 space-y-4" onSubmit={(e) => void submit(e)}>
        <label className="block text-xs text-dc-muted">
          Scene display name *
          <input
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            required
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
          />
        </label>
        <label className="block text-xs text-dc-muted">
          Email (optional)
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {role.questions.length > 0 ? (
          <QuestionnaireAnswerFields
            questions={role.questions}
            answers={answers}
            onChange={(id, value) => setAnswers((a) => ({ ...a, [id]: value }))}
          />
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-dc-accent py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-40"
        >
          Submit application
        </button>
      </form>
    </div>
  )
}
