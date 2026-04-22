'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { dancecardFetch, DancecardApiError } from '@/components/dancecard/api-client'
import { formatRange, formatTime, groupSlotsByDay } from '@/components/dancecard/time'
import { trackChipClass, trackChipStyle } from '@/components/dancecard/trackColor'

type SharePayload = {
  meta: {
    eventTitle: string
    timezone: string
  } | null
  host: { displayName: string }
  viewerYou: string | null
  hostFreeGaps: { start: string; end: string }[]
  hostBusy: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
  slots: {
    id: string
    startsAt: string
    endsAt: string
    title: string
    track: string | null
    room: string | null
    description: string | null
  }[]
}

type MeLight = { account: { displayName: string } } | null

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function ShareDancecardClient(props: { eventSlug: string; token: string }) {
  const { eventSlug, token } = props
  const [data, setData] = useState<SharePayload | null>(null)
  const [me, setMe] = useState<MeLight>(null)
  const [err, setErr] = useState<string | null>(null)
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState<{ ok: boolean } | null>(null)

  const tz = data?.meta?.timezone ?? 'America/New_York'
  const grouped = useMemo(() => (data ? groupSlotsByDay(data.slots, tz) : []), [data, tz])

  useEffect(() => {
    void (async () => {
      try {
        const s = await dancecardFetch<SharePayload>(eventSlug, `/share/${encodeURIComponent(token)}`)
        setData(s)
        const first = s.mutualFreeGaps?.[0]
        if (first) {
          setStart(toLocalInput(new Date(first.start)))
          setEnd(toLocalInput(new Date(first.end)))
        }
      } catch (e) {
        setErr(e instanceof DancecardApiError ? e.body : 'Not found')
      }
    })()
  }, [eventSlug, token])

  useEffect(() => {
    void (async () => {
      try {
        const m = await dancecardFetch<{ account: { displayName: string } }>(eventSlug, '/me')
        setMe(m)
      } catch {
        setMe(null)
      }
    })()
  }, [eventSlug])

  async function runPreview() {
    if (!start || !end) return
    try {
      const p = await dancecardFetch<{ ok: boolean }>(eventSlug, '/preview', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: token,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
          note: note || undefined,
        }),
      })
      setPreview(p)
    } catch {
      setPreview({ ok: false })
    }
  }

  async function submitReserve() {
    if (!start || !end) return
    try {
      await dancecardFetch(eventSlug, '/reserve', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: token,
          startsAt: new Date(start).toISOString(),
          endsAt: new Date(end).toISOString(),
          note: note || undefined,
        }),
      })
      setErr(null)
      alert('Reserved — both dancecards updated.')
    } catch (e) {
      setErr(e instanceof DancecardApiError ? e.body : 'Failed')
    }
  }

  if (err && !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-xl border border-white/10 bg-slate-900/80 p-6 text-slate-100">
          <h1 className="mb-2 text-lg font-semibold">Share link</h1>
          <p className="text-sm text-slate-400">{err}</p>
          <Link href={`/dancecard/${eventSlug}`} className="mt-4 inline-block text-amber-300 hover:underline">
            Back to dancecard
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return <div className="px-4 py-10 text-slate-400">Loading…</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <div className="mb-6">
        <Link href={`/dancecard/${eventSlug}`} className="text-sm text-amber-300 hover:underline">
          ← Back to dancecard
        </Link>
      </div>
      <header className="mb-6 border-b border-white/10 pb-4">
        <p className="text-xs uppercase tracking-wide text-amber-200/80">East Coast Kink Events</p>
        <h1 className="font-serif text-2xl font-semibold text-white">{data.meta?.eventTitle ?? 'Dancecard'}</h1>
        <p className="mt-1 text-slate-300">
          <span className="font-medium text-white">{data.host.displayName}</span>&apos;s dancecard
        </p>
        {data.viewerYou ? (
          <p className="mt-2 text-sm text-slate-400">
            Signed in as <span className="text-white">{data.viewerYou}</span>. Mutual free gaps highlighted below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            Log in on the main dancecard page to see mutual availability and reserve time together.
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {grouped.map((g) => (
            <section key={g.day} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <h2 className="mb-3 font-display text-lg font-semibold text-white">{g.day}</h2>
              <div className="space-y-3">
                {g.items.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex flex-wrap gap-3 rounded-lg border border-white/5 bg-slate-950/50 p-3 transition hover:border-amber-400/30"
                  >
                    <div className="min-w-[5.5rem] text-sm text-amber-100/90">
                      <div>{formatTime(slot.startsAt, tz)}</div>
                      <div className="text-xs text-slate-500">→ {formatTime(slot.endsAt, tz)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white">{slot.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs">
                        {slot.track ? (
                          <span className={`rounded px-2 py-0.5 text-xs ${trackChipClass()}`} style={trackChipStyle(slot.track)}>
                            {slot.track}
                          </span>
                        ) : null}
                        {slot.room ? <span className="rounded bg-white/5 px-2 py-0.5 text-slate-300">{slot.room}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-4">
            <h3 className="text-sm font-semibold text-rose-100">Host busy (conflicts)</h3>
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-rose-100/85">
              {data.hostBusy.slice(0, 20).map((g, i) => (
                <li key={i} className="rounded bg-black/20 px-2 py-1">
                  {formatRange(g.start, g.end, tz)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <h3 className="text-sm font-semibold text-white">Host free gaps</h3>
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-300">
              {data.hostFreeGaps.slice(0, 16).map((g, i) => (
                <li key={i} className="rounded bg-white/5 px-2 py-1">
                  {formatRange(g.start, g.end, tz)}
                </li>
              ))}
            </ul>
          </div>
          {data.mutualFreeGaps?.length ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
              <h3 className="text-sm font-semibold text-emerald-200">Mutual free</h3>
              <ul className="mt-2 space-y-1 text-xs text-emerald-100/90">
                {data.mutualFreeGaps.map((g, i) => (
                  <li key={i}>{formatRange(g.start, g.end, tz)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {me?.account ? (
            <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
              <h3 className="text-sm font-semibold text-white">Reserve together</h3>
              <label className="mt-2 block text-xs text-slate-400">Start</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <label className="mt-2 block text-xs text-slate-400">End</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
              <label className="mt-2 block text-xs text-slate-400">Note (optional)</label>
              <input
                className="mt-1 w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/5"
                  onClick={() => void runPreview()}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-amber-400"
                  onClick={() => void submitReserve()}
                >
                  Reserve
                </button>
              </div>
              {preview ? (
                <p
                  className={`mt-2 text-xs ${preview.ok ? 'text-emerald-300' : 'text-rose-300'}`}
                >
                  {preview.ok ? 'Looks mutually free.' : 'Not mutually free or conflicts.'}
                </p>
              ) : null}
              {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
