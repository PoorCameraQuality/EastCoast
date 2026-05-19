'use client'

import { useCallback, useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { Panel } from '@/components/dancecard/ui/Panel'

type Period = { id: string; label: string; starts_at: string | null }
type Signup = { id: string; meal_period_id: string; meal_choice: string; dietary_notes: string | null }

const CHOICES = ['standard', 'vegetarian', 'vegan', 'gluten-free'] as const

export function MealSignupsPanel({ eventSlug }: { eventSlug: string }) {
  const [periods, setPeriods] = useState<Period[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const d = await dancecardFetch<{ periods: Period[]; signups: Signup[] }>(eventSlug, '/meal-signups')
      setPeriods(d.periods ?? [])
      setSignups(d.signups ?? [])
      setErr(null)
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  const signupFor = (periodId: string) => signups.find((s) => s.meal_period_id === periodId)

  async function save(periodId: string, mealChoice: string, dietaryNotes: string) {
    setBusy(periodId)
    try {
      await dancecardFetch(eventSlug, '/meal-signups', {
        method: 'POST',
        body: JSON.stringify({ mealPeriodId: periodId, mealChoice, dietaryNotes: dietaryNotes || undefined }),
      })
      await load()
    } catch (e) {
      setErr(formatDancecardApiMessage(e))
    } finally {
      setBusy(null)
    }
  }

  if (!periods.length) {
    return (
      <Panel className="p-4">
        <p className="text-sm text-dc-muted">No meal periods are open for signup yet.</p>
      </Panel>
    )
  }

  return (
    <Panel className="space-y-4 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-dc-muted">Meal signups</p>
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <ul className="space-y-3">
        {periods.map((p) => {
          const existing = signupFor(p.id)
          return (
            <li key={p.id} className="rounded-xl border border-dc-border px-3 py-3">
              <p className="font-medium text-dc-text">{p.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CHOICES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    disabled={busy === p.id}
                    className={
                      existing?.meal_choice === c
                        ? 'rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1 text-xs font-medium text-dc-accent'
                        : 'rounded-full border border-dc-border px-3 py-1 text-xs text-dc-muted hover:border-dc-accent-border'
                    }
                    onClick={() => void save(p.id, c, existing?.dietary_notes ?? '')}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <label className="mt-2 block text-xs text-dc-muted">
                Dietary notes
                <input
                  className="mt-1 block w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm"
                  defaultValue={existing?.dietary_notes ?? ''}
                  onBlur={(e) => {
                    const choice = existing?.meal_choice ?? 'standard'
                    if (e.target.value !== (existing?.dietary_notes ?? '')) {
                      void save(p.id, choice, e.target.value)
                    }
                  }}
                />
              </label>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
