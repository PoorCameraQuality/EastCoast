'use client'

import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { formatRange, formatTime, toDatetimeLocalValue } from '@/components/dancecard/time'

const DANCECARD_DISPLAY_TITLE = 'Dancecard'

type OpenWindowSuggestion = {
  id: string
  day: string
  time: string
  duration: string
  startMs: number
  endMs: number
}

type SharePayload = {
  meta: {
    eventTitle: string
    timezone: string
    windowStartsAt: string
    windowEndsAt: string
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

function shareIntroStorageKey(eventSlug: string, token: string) {
  return `eck_dc_share_intro_v1_${eventSlug}_${token}`
}

function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`
}

function bestOpenWindows(
  intervals: { start: string; end: string }[],
  tz: string
): OpenWindowSuggestion[] {
  return intervals
    .map((interval, index) => {
      const startMs = Date.parse(interval.start)
      const endMs = Date.parse(interval.end)
      const durationMs = endMs - startMs
      return {
        id: `${interval.start}-${index}`,
        day: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }).format(
          new Date(interval.start)
        ),
        time: `${formatTime(interval.start, tz)} – ${formatTime(interval.end, tz)}`,
        duration: formatDuration(durationMs),
        startMs,
        endMs,
        durationMs,
      }
    })
    .filter((item) => Number.isFinite(item.startMs) && Number.isFinite(item.endMs) && item.durationMs >= 60 * 60_000)
    .sort((a, b) => b.durationMs - a.durationMs || a.startMs - b.startMs)
    .slice(0, 4)
    .map(({ durationMs: _durationMs, ...item }) => item)
}

export function ShareDancecardClient(props: { eventSlug: string; token: string }) {
  const { eventSlug, token } = props
  const [data, setData] = useState<SharePayload | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [start, setStart] = useState('')
  const [guestName, setGuestName] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [description, setDescription] = useState('')
  const [reserveNotice, setReserveNotice] = useState<null | { kind: 'ok' } | { kind: 'error'; text: string }>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [claimOpen, setClaimOpen] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [claimBusy, setClaimBusy] = useState(false)
  const introAppliedRef = useRef(false)

  const tz = data?.meta?.timezone ?? 'America/New_York'
  const introKey = useMemo(() => shareIntroStorageKey(eventSlug, token), [eventSlug, token])

  const shortDayLabel = (day: string) => day.split(',')[0]?.trim() ?? day

  const shareDayWindows = useMemo(() => {
    if (!data?.meta) return []
    return dayRangesFromSchedule(data.slots, data.meta, tz, shortDayLabel)
  }, [data, tz])

  const shareStripDays = useMemo(() => {
    if (shareDayWindows.length) return shareDayWindows
    if (!data?.meta) return []
    const s = Date.parse(data.meta.windowStartsAt)
    const e = Date.parse(data.meta.windowEndsAt)
    if (!(e > s)) return []
    return [{ label: 'Event', startMs: s, endMs: e }]
  }, [shareDayWindows, data])

  const activePlayableWindow = useMemo(() => {
    if (!data?.meta) return null
    let startMs = Date.parse(data.meta.windowStartsAt)
    let endMs = Date.parse(data.meta.windowEndsAt)
    if (!(endMs > startMs)) return null

    return endMs > startMs ? { startMs, endMs } : null
  }, [data])

  const openWindowSuggestions = useMemo(
    () => bestOpenWindows(data?.hostFreeGaps ?? [], tz),
    [data?.hostFreeGaps, tz]
  )

  const loadShare = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (opts?.silent) setRefreshing(true)
      try {
        const s = await dancecardFetch<SharePayload>(eventSlug, `/share/${encodeURIComponent(token)}`)
        setData(s)
        setLastUpdatedAt(Date.now())
        setErr(null)
      } catch (e) {
        setErr(e instanceof DancecardApiError ? e.body : 'Not found')
      } finally {
        if (opts?.silent) setRefreshing(false)
      }
    },
    [eventSlug, token]
  )

  useEffect(() => {
    void loadShare()
  }, [loadShare])

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadShare({ silent: true })
    }, 15000)
    return () => window.clearInterval(id)
  }, [loadShare])

  useEffect(() => {
    introAppliedRef.current = false
  }, [introKey])

  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !data || introAppliedRef.current) return
    introAppliedRef.current = true
    try {
      setShowIntro(!window.localStorage.getItem(introKey))
    } catch {
      setShowIntro(true)
    }
  }, [data, introKey])

  function dismissIntro() {
    try {
      window.localStorage.setItem(introKey, '1')
    } catch {
      // ignore
    }
    setShowIntro(false)
  }

  const fillReserveFromStep = useCallback((startMs: number, _endMs: number) => {
    setStart(toDatetimeLocalValue(new Date(startMs)))
    setReserveNotice(null)
    setErr(null)
    setClaimOpen(true)
  }, [])

  const onShareStripSlotClick = useCallback(
    (startMs: number, endMs: number) => {
      fillReserveFromStep(startMs, endMs)
    },
    [fillReserveFromStep]
  )

  function closeClaimSheet() {
    setClaimOpen(false)
    setReserveNotice(null)
  }

  async function submitReserve() {
    setReserveNotice(null)
    if (!start) {
      setReserveNotice({ kind: 'error', text: 'Tap a green open slot on the schedule first.' })
      return
    }
    if (!guestName.trim()) {
      setReserveNotice({ kind: 'error', text: 'Enter your name.' })
      return
    }
    setClaimBusy(true)
    try {
      await dancecardFetch(eventSlug, '/claim', {
        method: 'POST',
        body: JSON.stringify({
          shareToken: token,
          startsAt: new Date(start).toISOString(),
          durationMinutes,
          guestName: guestName.trim(),
          description: description.trim() || undefined,
        }),
      })
      setErr(null)
      setReserveNotice({ kind: 'ok' })
      await loadShare({ silent: true })
      setStart('')
      setGuestName('')
      setDescription('')
      window.setTimeout(() => {
        setClaimOpen(false)
        setReserveNotice(null)
      }, 2200)
    } catch (e) {
      setReserveNotice({ kind: 'error', text: formatDancecardApiMessage(e) })
    } finally {
      setClaimBusy(false)
    }
  }

  if (err && !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-[#0c1424]/95 p-6 text-stone-100 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <h1 className="mb-2 font-serif text-lg font-semibold text-stone-50">Share link</h1>
          <p className="text-sm text-stone-400">{err}</p>
          <Link href={`/dancecard/${eventSlug}`} className="mt-4 inline-block text-teal-300 hover:underline">
            Back to availability
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-stone-300 lg:max-w-6xl">
        <div className="rounded-[28px] border border-white/10 bg-[#0c1424]/95 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full border-2 border-teal-400/30 border-t-teal-300 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-200/80">{DANCECARD_DISPLAY_TITLE}</p>
              <p className="mt-1 text-sm text-stone-300">Loading shared availability…</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="h-3 w-24 rounded-full bg-white/10" />
                <div className="mt-3 h-11 rounded-xl bg-slate-800/80" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedRangeLabel =
    start && !Number.isNaN(Date.parse(start))
      ? formatRange(new Date(start).toISOString(), new Date(new Date(start).getTime() + durationMinutes * 60_000).toISOString(), tz)
      : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 text-stone-100 lg:max-w-6xl lg:pb-10">
      {showIntro ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/80 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dc-share-intro-title"
        >
          <div className="w-full max-w-md animate-in motion-reduce:animate-none rounded-[28px] border border-white/10 bg-[#0c1424]/98 p-6 shadow-[0_28px_90px_rgba(2,6,23,0.65)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200/90">{DANCECARD_DISPLAY_TITLE}</p>
            <h2 id="dc-share-intro-title" className="mt-2 font-serif text-2xl text-stone-50">
              Welcome to Dancecard <span className="text-teal-200">beta</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              <span className="font-medium text-stone-100">{data.host.displayName}</span> shared their dancecard with you
              so you can pick an open time without juggling messages.
            </p>
            <p className="mt-2 text-sm text-stone-400">
              When you&apos;re ready, close this screen and{' '}
              <span className="font-medium text-emerald-200">tap a green open slot</span> on the schedule to claim time.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={`/dancecard/${eventSlug}`}
                className="inline-flex min-h-touch items-center justify-center rounded-2xl border border-teal-400/35 bg-teal-500/15 px-4 py-3 text-center text-sm font-semibold text-teal-50 transition hover:bg-teal-500/25"
              >
                Get your personal Dancecard
              </Link>
              <button
                type="button"
                className="inline-flex min-h-touch flex-1 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-100 via-teal-100 to-violet-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-95 sm:flex-none"
                onClick={dismissIntro}
              >
                Continue to schedule
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {claimOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dc-claim-sheet-title"
        >
          <div className="max-h-[min(92vh,720px)] w-full max-w-lg translate-y-0 overflow-y-auto rounded-t-[32px] border border-white/10 bg-[#0c1424]/98 p-5 shadow-[0_-20px_80px_rgba(2,6,23,0.75)] motion-reduce:transform-none motion-reduce:transition-none sm:translate-y-0 sm:rounded-[32px] sm:p-6 sm:shadow-2xl sm:transition-none max-sm:animate-in max-sm:motion-reduce:animate-none">
            <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-white/15 sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200/85">Claim</p>
                <h3 id="dc-claim-sheet-title" className="mt-1 font-serif text-2xl text-stone-50">
                  Claim this time
                </h3>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-sm text-stone-300 transition hover:bg-white/5"
                onClick={closeClaimSheet}
              >
                Close
              </button>
            </div>
            {selectedRangeLabel ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-950/35 p-3 text-emerald-50/95">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/80">Selected time</p>
                <p className="mt-1 text-base font-semibold text-stone-50">{selectedRangeLabel}</p>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-950/25 px-3 py-2 text-sm text-amber-100/90">
                Choose a time on the schedule above (tap a green slot).
              </p>
            )}
            {reserveNotice?.kind === 'ok' ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 text-sm text-emerald-50">
                <p className="font-semibold text-white">Claim saved</p>
                <p className="mt-1 text-emerald-100/95">This slot is now reserved. You can close this sheet.</p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Duration</label>
                    <select
                      className="mt-1.5 min-h-touch w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-stone-100 outline-none focus:border-teal-200/60 focus:ring-2 focus:ring-teal-300/20"
                      value={durationMinutes}
                      onChange={(e) => {
                        setDurationMinutes(Number(e.target.value))
                        setReserveNotice(null)
                      }}
                    >
                      {[30, 60, 90, 120, 180].map((m) => (
                        <option key={m} value={m}>
                          {m} minutes
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Your name</label>
                <input
                  className="mt-1.5 min-h-touch w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-teal-200/60 focus:ring-2 focus:ring-teal-300/20"
                  value={guestName}
                  maxLength={80}
                  autoComplete="name"
                  onChange={(e) => {
                    setGuestName(e.target.value)
                    setReserveNotice(null)
                  }}
                />
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Short note (optional)</label>
                <input
                  className="mt-1.5 min-h-touch w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-teal-200/60 focus:ring-2 focus:ring-teal-300/20"
                  value={description}
                  maxLength={150}
                  placeholder="e.g. topic, location…"
                  onChange={(e) => {
                    setDescription(e.target.value)
                    setReserveNotice(null)
                  }}
                />
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    disabled={claimBusy}
                    className="min-h-touch flex-1 rounded-2xl bg-gradient-to-br from-stone-100 via-teal-100 to-violet-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-teal-950/30 transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-50"
                    onClick={() => void submitReserve()}
                  >
                    {claimBusy ? 'Saving…' : 'Confirm claim'}
                  </button>
                  <button
                    type="button"
                    className="min-h-touch rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-stone-200 hover:bg-white/5"
                    onClick={closeClaimSheet}
                  >
                    Cancel
                  </button>
                </div>
                {reserveNotice?.kind === 'error' ? <p className="mt-3 text-sm text-rose-200">{reserveNotice.text}</p> : null}
                {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <Link href={`/dancecard/${eventSlug}`} className="text-sm text-teal-300/95 hover:underline">
          ← Back to availability
        </Link>
      </div>
      <header className="mb-5 rounded-[28px] border border-white/10 bg-[#0c1424]/95 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-200/80">{DANCECARD_DISPLAY_TITLE}</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-stone-50 sm:text-3xl">
              {data.host.displayName}&apos;s open windows
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-300">
              Pick an open time without seeing private details. Busy time stays private; green windows are available to claim.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-stone-400 md:justify-end">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">All times in {tz}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              {refreshing ? 'Refreshing…' : `Updated ${lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString() : 'just now'}`}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-950/25 px-3 py-2.5 text-sm leading-relaxed text-stone-200">
          <span className="font-semibold text-emerald-100">Tap a green open slot</span> or use a suggested window below.
          A sheet will open so you can confirm your name and claim the time. No login required.
        </div>
      </header>

      {openWindowSuggestions.length ? (
        <section className="mb-4 rounded-[24px] border border-emerald-300/15 bg-emerald-950/10 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">Suggested windows</p>
              <h2 className="font-serif text-xl font-semibold text-stone-50">Longest open blocks</h2>
            </div>
            <p className="text-xs text-stone-400">Uses the same claim flow as the schedule.</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {openWindowSuggestions.map((w) => (
              <button
                key={w.id}
                type="button"
                className="group flex min-h-touch items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-300/10"
                onClick={() => fillReserveFromStep(w.startMs, w.endMs)}
              >
                <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-xs font-bold text-emerald-100">
                  {w.day.split(',')[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-stone-50">{w.time}</span>
                  <span className="block text-xs text-stone-400">{w.duration} open</span>
                </span>
                <span className="text-lg text-emerald-200 transition group-hover:translate-x-0.5">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        <span className="rounded-full border border-rose-400/30 bg-rose-950/40 px-2.5 py-1 text-rose-100">Red = busy</span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-950/45 px-2.5 py-1 text-emerald-100">
          Green = tap to claim
        </span>
      </div>

      <div className="mt-4 max-h-[50vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
        {shareStripDays.map((d) => (
          <MutualAvailabilityStrip
            key={`${d.label}-${d.startMs}`}
            dayLabel={d.label}
            rangeStartMs={d.startMs}
            rangeEndMs={d.endMs}
            freeIntervals={data.hostFreeGaps}
            tz={tz}
            mode="host"
            onFreeStepClick={data ? onShareStripSlotClick : undefined}
            activeWindowStartMs={activePlayableWindow?.startMs}
            activeWindowEndMs={activePlayableWindow?.endMs}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a1220]/90 p-4 text-center text-sm text-stone-400">
        <p>
          Claim form opens when you <span className="font-medium text-emerald-200">tap a green slot</span>.{' '}
          <button type="button" className="text-teal-300 underline decoration-teal-500/50 hover:text-teal-200" onClick={() => setClaimOpen(true)}>
            Open claim sheet
          </button>{' '}
          if you already selected a time on the strip.
        </p>
        <p className="mt-2 text-xs text-stone-500">
          Want your own card?{' '}
          <Link href={`/dancecard/${eventSlug}`} className="font-medium text-teal-300 hover:underline">
            Get your personal Dancecard
          </Link>
        </p>
      </div>
    </div>
  )
}
