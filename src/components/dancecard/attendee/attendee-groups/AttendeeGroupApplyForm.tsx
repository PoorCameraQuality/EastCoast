'use client'

import { useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'

type Question = {
  id: string
  prompt: string
  kind: string
  options: string[]
  required: boolean
}

type Props = {
  eventSlug: string
  groupId: string
  onSuccess: () => void
}

export function AttendeeGroupApplyForm({ eventSlug, groupId, onSuccess }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await dancecardFetch<{ questions: Question[] }>(
          eventSlug,
          `/attendee-groups/${groupId}/questions`,
        )
        setQuestions(res.questions ?? [])
      } catch {
        setQuestions([])
      }
    })()
  }, [eventSlug, groupId])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await dancecardFetch(eventSlug, `/attendee-groups/${groupId}/join`, {
        method: 'POST',
        body: JSON.stringify({
          message,
          answers: questions.map((q) => ({
            questionId: q.id,
            value: answers[q.id] ?? '',
          })),
        }),
      })
      setSent(true)
      onSuccess()
    } catch (ex) {
      setErr(formatDancecardApiMessage(ex))
    } finally {
      setBusy(false)
    }
  }

  if (sent) return <p className="text-sm text-emerald-700">Application sent. The group owner will review it.</p>

  return (
    <form className="space-y-3 rounded-xl border border-dc-border p-3" onSubmit={(e) => void submit(e)}>
      <p className="text-xs font-semibold uppercase text-dc-muted">Apply to join</p>
      {questions.map((q) => (
        <label key={q.id} className="block text-sm">
          <span className="text-dc-text">
            {q.prompt}
            {q.required ? ' *' : ''}
          </span>
          {q.kind === 'long_text' ? (
            <textarea
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
              rows={3}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          ) : q.kind === 'yes_no' ? (
            <select
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            >
              <option value="">Select…</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          ) : q.kind === 'single_choice' && q.options.length ? (
            <select
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            >
              <option value="">Select…</option>
              {q.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          )}
        </label>
      ))}
      <label className="block text-sm">
        <span className="text-dc-muted">Intro message (optional)</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2"
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </label>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-dc-accent px-4 py-2.5 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
      >
        Submit application
      </button>
    </form>
  )
}
