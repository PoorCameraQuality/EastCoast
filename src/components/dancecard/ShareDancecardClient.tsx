'use client'

import Link from 'next/link'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { formatRange, formatTime, toDatetimeLocalValue } from '@/components/dancecard/time'
import { bestOpenWindows } from '@/lib/dancecard/openWindowSuggestions'
import { AttendeeProfileCard } from '@/components/dancecard/attendee/AttendeeProfileCard'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import type { AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'

const DANCECARD_DISPLAY_TITLE = 'Dancecard'

type SharePayload = {
  meta: {
    eventTitle: string
    timezone: string
    windowStartsAt: string
    windowEndsAt: string
  } | null
  host: { displayName: string; nameKind?: 'scene' }
  hostProfile?: AttendeePublicProfile | null
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
    photoPolicy?: 'allowed' | 'restricted' | 'none'
  }[]
}

function shareIntroStorageKey(eventSlug: string, token: string) {
  return `eck_dc_share_intro_v1_${eventSlug}_${token}`
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
        <div className="rounded-2xl border border-dc-border bg-dc-elevated p-6 text-dc-text shadow-dc-panel backdrop-blur-xl">
          <h1 className="mb-2 font-serif text-lg font-semibold text-dc-text">Share link</h1>
          <p className="text-sm text-dc-muted">{err}</p>
          <Link href={`/dancecard/${eventSlug}`} className="mt-4 inline-block text-dc-accent hover:underline">
            Back to availability
          </Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-dc-muted lg:max-w-6xl">
        <div className="rounded-[28px] border border-dc-border bg-dc-elevated-solid/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full border-2 border-dc-accent/30 border-t-dc-accent-hover animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-dc-accent/80">{DANCECARD_DISPLAY_TITLE}</p>
              <p className="mt-1 text-sm text-dc-muted">Loading shared availability…</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-dc-border bg-dc-accent-muted/15 p-3">
                <div className="h-3 w-24 rounded-full bg-dc-border/40" />
                <div className="mt-3 h-11 rounded-xl bg-dc-elevated-muted" />
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
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 text-dc-text lg:max-w-6xl lg:pb-10">
      {showIntro ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-dc-surface/80 p-4 backdrop-blur-md sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dc-share-intro-title"
        >
          <div className="w-full max-w-md animate-in motion-reduce:animate-none rounded-[28px] border border-dc-border bg-dc-elevated-solid/98 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.5)] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-dc-accent/90">{DANCECARD_DISPLAY_TITLE}</p>
            <h2 id="dc-share-intro-title" className="mt-2 font-serif text-2xl text-dc-text">
              Welcome to Dancecard <span className="text-dc-accent">beta</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dc-muted">
              <span className="font-medium text-dc-text">{data.host.displayName}</span> shared their dancecard with you
              so you can pick an open time without juggling messages.
            </p>
            <p className="mt-2 text-sm text-dc-muted">
              When you&apos;re ready, close this screen and{' '}
              <span className="font-medium text-emerald-700">tap a green open slot</span> on the schedule to claim time.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link
                href={`/dancecard/${eventSlug}`}
                className="inline-flex min-h-touch items-center justify-center rounded-2xl border border-dc-accent-border bg-dc-accent-muted px-4 py-3 text-center text-sm font-semibold text-dc-accent-foreground transition hover:bg-dc-accent/25"
              >
                Get your personal Dancecard
              </Link>
              <button
                type="button"
                className="inline-flex min-h-touch flex-1 items-center justify-center dc-btn-primary rounded-2xl bg-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground transition hover:opacity-95 sm:flex-none"
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-dc-surface/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dc-claim-sheet-title"
        >
          <div className="max-h-[min(92vh,720px)] w-full max-w-lg translate-y-0 overflow-y-auto rounded-t-[32px] border border-dc-border bg-dc-elevated-solid/98 p-5 shadow-[0_-20px_60px_rgba(0,0,0,0.55)] motion-reduce:transform-none motion-reduce:transition-none sm:translate-y-0 sm:rounded-[32px] sm:p-6 sm:shadow-2xl sm:transition-none max-sm:animate-in max-sm:motion-reduce:animate-none">
            <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-white/15 sm:hidden" aria-hidden />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-dc-accent/85">Claim</p>
                <h3 id="dc-claim-sheet-title" className="mt-1 font-serif text-2xl text-dc-text">
                  Claim this time
                </h3>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border border-dc-border px-3 py-1.5 text-sm text-dc-muted transition hover:bg-dc-accent-muted/30"
                onClick={closeClaimSheet}
              >
                Close
              </button>
            </div>
            {selectedRangeLabel ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/25 bg-emerald-100 p-3 text-emerald-900/95">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700/80">Selected time</p>
                <p className="mt-1 text-base font-semibold text-dc-text">{selectedRangeLabel}</p>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-100 px-3 py-2 text-sm text-amber-900/90">
                Choose a time on the schedule above (tap a green slot).
              </p>
            )}
            {reserveNotice?.kind === 'ok' ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-100 p-4 text-sm text-emerald-900">
                <p className="font-semibold text-dc-text">Claim saved</p>
                <p className="mt-1 text-emerald-800/95">This slot is now reserved. You can close this sheet.</p>
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">Duration</label>
                    <select
                      className="mt-1.5 min-h-touch w-full rounded-2xl border border-dc-border bg-dc-surface-muted/80 px-3 py-2.5 text-sm text-dc-text outline-none focus:border-dc-accent focus:ring-2 focus:ring-dc-accent/20"
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
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">Your name</label>
                <input
                  className="mt-1.5 min-h-touch w-full rounded-2xl border border-dc-border bg-dc-surface-muted/80 px-3 py-2.5 text-sm text-dc-text outline-none placeholder:text-dc-muted focus:border-dc-accent focus:ring-2 focus:ring-dc-accent/20"
                  value={guestName}
                  maxLength={80}
                  autoComplete="name"
                  onChange={(e) => {
                    setGuestName(e.target.value)
                    setReserveNotice(null)
                  }}
                />
                <label className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-dc-muted">Short note (optional)</label>
                <input
                  className="mt-1.5 min-h-touch w-full rounded-2xl border border-dc-border bg-dc-surface-muted/80 px-3 py-2.5 text-sm text-dc-text outline-none placeholder:text-dc-muted focus:border-dc-accent focus:ring-2 focus:ring-dc-accent/20"
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
                    className="min-h-touch flex-1 dc-btn-primary rounded-2xl bg-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-lg shadow-[0_12px_32px_rgba(198,167,94,0.2)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:translate-y-0 disabled:opacity-50"
                    onClick={() => void submitReserve()}
                  >
                    {claimBusy ? 'Saving…' : 'Confirm claim'}
                  </button>
                  <button
                    type="button"
                    className="min-h-touch rounded-2xl border border-dc-border px-4 py-3 text-sm font-medium text-dc-muted hover:bg-dc-accent-muted/30"
                    onClick={closeClaimSheet}
                  >
                    Cancel
                  </button>
                </div>
                {reserveNotice?.kind === 'error' ? <p className="mt-3 text-sm text-red-700">{reserveNotice.text}</p> : null}
                {err ? <p className="mt-2 text-xs text-red-700">{err}</p> : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className="mb-4">
        <Link href={`/dancecard/${eventSlug}`} className="text-sm text-dc-accent hover:underline">
          ← Back to availability
        </Link>
      </div>
      <header className="mb-5 rounded-[28px] border border-dc-border bg-dc-elevated-solid/95 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-dc-accent/80">{DANCECARD_DISPLAY_TITLE}</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-dc-text sm:text-3xl">
              {data.host.displayName}&apos;s open windows
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dc-muted">
              Pick an open time without seeing private details. Busy time stays private; green windows are available to claim.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] text-dc-muted md:justify-end">
            <span className="rounded-full border border-dc-border bg-dc-accent-muted/20 px-2.5 py-1">All times in {tz}</span>
            <span className="rounded-full border border-dc-border bg-dc-accent-muted/20 px-2.5 py-1">
              {refreshing ? 'Refreshing…' : `Updated ${lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleTimeString() : 'just now'}`}
            </span>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-100 px-3 py-2.5 text-sm leading-relaxed text-dc-muted">
          <span className="font-semibold text-emerald-800">Tap a green open slot</span> or use a suggested window below.
          A sheet will open so you can confirm your name and claim the time. No login required.
        </div>
        {data.hostProfile ? (
          <div className="mt-4 max-w-md">
            <AttendeeProfileCard profile={data.hostProfile} variant="host" compact />
            <Link
              href={`/dancecard/${eventSlug}?compare=${encodeURIComponent(data.hostProfile.loginName)}#compare`}
              className="mt-2 inline-flex rounded-xl border border-dc-accent-border bg-dc-accent-muted px-3 py-2 text-xs font-semibold text-dc-accent"
            >
              Compare availability with me
            </Link>
          </div>
        ) : null}
      </header>

      {openWindowSuggestions.length ? (
        <section className="mb-4 rounded-[24px] border border-emerald-300/15 bg-emerald-50 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-700/75">Suggested windows</p>
              <h2 className="font-serif text-xl font-semibold text-dc-text">Longest open blocks</h2>
            </div>
            <p className="text-xs text-dc-muted">Uses the same claim flow as the schedule.</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {openWindowSuggestions.map((w) => (
              <button
                key={w.id}
                type="button"
                className="group flex min-h-touch items-center gap-3 rounded-2xl border border-dc-border bg-dc-accent-muted/20 p-3 text-left transition hover:-translate-y-0.5 hover:border-emerald-200/35 hover:bg-emerald-300/10"
                onClick={() => fillReserveFromStep(w.startMs, w.endMs)}
              >
                <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-xs font-bold text-emerald-800">
                  {w.day.split(',')[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-dc-text">{w.time}</span>
                  <span className="block text-xs text-dc-muted">{w.duration} open</span>
                </span>
                <span className="text-lg text-emerald-700 transition group-hover:translate-x-0.5">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-dc-text0">
        <span className="rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-red-800">Red = busy</span>
        <span className="rounded-full border border-emerald-400/35 bg-emerald-100 px-2.5 py-1 text-emerald-800">
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
            hostBusyIntervals={data.hostBusy}
            tz={tz}
            mode="host"
            onFreeStepClick={data ? onShareStripSlotClick : undefined}
            activeWindowStartMs={activePlayableWindow?.startMs}
            activeWindowEndMs={activePlayableWindow?.endMs}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dc-border bg-dc-elevated-solid/90 p-4 text-center text-sm text-dc-muted">
        <p>
          Claim form opens when you <span className="font-medium text-emerald-700">tap a green slot</span>.{' '}
          <button type="button" className="text-dc-accent underline decoration-dc-accent/50 hover:text-dc-accent-hover" onClick={() => setClaimOpen(true)}>
            Open claim sheet
          </button>{' '}
          if you already selected a time on the strip.
        </p>
        <p className="mt-2 text-xs text-dc-text0">
          Want your own card?{' '}
          <Link href={`/dancecard/${eventSlug}`} className="font-medium text-dc-accent hover:underline">
            Get your personal Dancecard
          </Link>
        </p>
      </div>
    </div>
  )
}
