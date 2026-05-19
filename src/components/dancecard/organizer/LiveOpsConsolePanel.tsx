'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { Panel } from '@/components/dancecard/ui/Panel'

type LivePayload = {
  generatedAt: string
  happeningNow: Array<{
    locationName: string
    capacity: number | null
    slots: Array<{ id: string; title: string; startsAt: string; endsAt: string }>
  }>
  checkIn: { onSite: number; registered: number; byTiming: Record<string, number> }
  unpublishedStartingSoon: Array<{ id: string; title: string; startsAt: string }>
  dmGapsNow: Array<{ title: string; detail?: string }>
}

export function LiveOpsConsolePanel({ eventSlug }: { eventSlug: string }) {
  const [data, setData] = useState<LivePayload | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const res = await organizerDancecardFetch<LivePayload>(eventSlug, '/ops/live')
      setData(res)
    } catch (e) {
      setData(null)
      setErr(e instanceof Error ? e.message : 'Failed to load live ops')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
    const t = window.setInterval(() => void load(), 45_000)
    return () => window.clearInterval(t)
  }, [load])

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-lg text-dc-text">Live ops</h2>
          <p className="text-xs text-dc-muted">What is happening now — refreshes every 45s</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-dc-border px-3 py-1.5 text-xs text-dc-muted hover:bg-dc-surface-muted"
        >
          Refresh
        </button>
      </div>
      {err ? (
        <p className="text-sm text-red-700">
          {err}{' '}
          <Link
            href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=registrants`}
            className="font-semibold text-dc-accent underline"
          >
            Open signups
          </Link>
        </p>
      ) : null}
      {data ? (
        <div className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3">
              <p className="text-xs text-dc-muted">On-site</p>
              <p className="text-2xl font-semibold text-dc-text">{data.checkIn.onSite}</p>
              <p className="text-xs text-dc-muted">of {data.checkIn.registered} registered</p>
            </div>
            <div className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3 sm:col-span-2">
              <p className="text-xs text-dc-muted">Check-in timing</p>
              <p className="mt-1 text-dc-text">
                {Object.entries(data.checkIn.byTiming)
                  .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                  .join(' · ') || '—'}
              </p>
            </div>
          </div>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-dc-muted">Rooms now</h3>
            {!data.happeningNow.length ? (
              <p className="text-dc-muted">No published sessions in progress.</p>
            ) : (
              <ul className="space-y-2">
                {data.happeningNow.map((loc) => (
                  <li key={loc.locationName} className="rounded-xl border border-dc-border p-3">
                    <p className="font-medium text-dc-text">
                      {loc.locationName}
                      {loc.capacity != null ? (
                        <span className="ml-2 text-xs text-dc-muted">
                          {loc.slots.length}/{loc.capacity} concurrent
                        </span>
                      ) : null}
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-dc-muted">
                      {loc.slots.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=program&slot=${s.id}`}
                            className="text-dc-accent hover:underline"
                          >
                            {s.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {data.dmGapsNow.length ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-dc-muted">DM coverage now</h3>
              <ul className="space-y-1 text-xs text-amber-900">
                {data.dmGapsNow.map((g, i) => (
                  <li key={i}>
                    {g.title}
                    {g.detail ? ` — ${g.detail}` : ''}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {data.unpublishedStartingSoon.length ? (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-dc-warning">Unpublished soon</h3>
              <ul className="space-y-1 text-xs">
                {data.unpublishedStartingSoon.map((s) => (
                  <li key={s.id} className="text-amber-900">
                    {s.title} — starts {new Date(s.startsAt).toLocaleString()}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-dc-muted">Loading…</p>
      )}
    </Panel>
  )
}
