'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { Panel } from '@/components/dancecard/ui/Panel'
import type { OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { organizerRoleCanEditVettingSafetyNotes } from '@/lib/dancecard/organizerRoles'

type Incident = {
  id: string
  reportedAt: string
  summary: string
  safetyNotes: string | null
  status: string
  locationLabel: string | null
}

export function SafetyIncidentsPanel({
  eventSlug,
  organizerRole,
  readOnly,
}: {
  eventSlug: string
  organizerRole: OrganizerRoleForClient
  readOnly: boolean
}) {
  const [items, setItems] = useState<Incident[]>([])
  const [summary, setSummary] = useState('')
  const [safetyNotes, setSafetyNotes] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const canSafety = organizerRoleCanEditVettingSafetyNotes(organizerRole)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const data = await organizerDancecardFetch<{ incidents: Incident[] }>(eventSlug, '/safety-incidents')
      setItems(data.incidents)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function create() {
    if (!summary.trim() || readOnly) return
    try {
      await organizerDancecardFetch(eventSlug, '/safety-incidents', {
        method: 'POST',
        body: JSON.stringify({
          summary: summary.trim(),
          safetyNotes: canSafety ? safetyNotes.trim() || undefined : undefined,
        }),
      })
      setSummary('')
      setSafetyNotes('')
      await load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save')
    }
  }

  return (
    <Panel>
      <h2 className="font-serif text-lg text-dc-text">Safety incidents</h2>
      <p className="mt-1 text-sm text-dc-muted">Lightweight log for safety leads. Restricted notes visible to safety role and owners only.</p>
      {err ? <p className="mt-2 text-sm text-red-700">{err}</p> : null}

      {!readOnly ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What happened (summary)…"
            rows={3}
            className="w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-sm"
          />
          {canSafety ? (
            <textarea
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="Restricted safety notes…"
              rows={2}
              className="w-full rounded-lg border border-dc-border bg-dc-elevated-solid px-3 py-2 text-sm"
            />
          ) : null}
          <button type="button" onClick={() => void create()} className="dc-gold-btn rounded-lg px-4 py-2 text-sm font-semibold">
            Log incident
          </button>
        </div>
      ) : null}

      <ul className="mt-6 space-y-3">
        {items.map((inc) => (
          <li key={inc.id} className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3 text-sm">
            <p className="text-xs text-dc-muted">{new Date(inc.reportedAt).toLocaleString()} · {inc.status}</p>
            <p className="mt-1 font-medium text-dc-text">{inc.summary}</p>
            {inc.safetyNotes ? <p className="mt-2 text-xs text-dc-muted">Safety: {inc.safetyNotes}</p> : null}
          </li>
        ))}
        {!items.length ? <p className="text-sm text-dc-muted">No incidents logged.</p> : null}
      </ul>
    </Panel>
  )
}
