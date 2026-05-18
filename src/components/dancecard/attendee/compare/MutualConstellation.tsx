'use client'

import { useMemo, useRef, useState } from 'react'
import { CompareLegend } from '@/components/dancecard/attendee/compare/CompareLegend'
import { compareConstellationSegment, compareSlot } from '@/components/dancecard/attendee/compare/compareColors'
import { formatRange, formatTime } from '@/components/dancecard/time'

type Gap = { start: string; end: string }

type Props = {
  tz: string
  hostLabel: string
  hostBusy: Gap[]
  hostFree: Gap[]
  mutualFree: Gap[] | null
  windowStartMs: number
  windowEndMs: number
  onGapClick?: (startMs: number, endMs: number) => void
}

function toSegments(gaps: Gap[], kind: 'free' | 'busy' | 'mutual') {
  return gaps.map((g) => ({
    startMs: Date.parse(g.start),
    endMs: Date.parse(g.end),
    kind,
  }))
}

function formatEventBoundary(ms: number, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(ms))
}

function eventSpanDays(startMs: number, endMs: number, tz: string): number {
  const dayMs = 24 * 60 * 60 * 1000
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  const startDay = fmt.format(new Date(startMs))
  const endDay = fmt.format(new Date(endMs - 1))
  if (startDay === endDay) return 1
  const a = Date.parse(`${startDay}T12:00:00Z`)
  const b = Date.parse(`${endDay}T12:00:00Z`)
  return Math.max(1, Math.round((b - a) / dayMs) + 1)
}

export function MutualConstellation({
  tz,
  hostLabel,
  hostBusy,
  hostFree,
  mutualFree,
  windowStartMs,
  windowEndMs,
  onGapClick,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const span = Math.max(windowEndMs - windowStartMs, 60_000)

  const viewerMutual = mutualFree !== null
  const windowStartIso = new Date(windowStartMs).toISOString()
  const windowEndIso = new Date(windowEndMs).toISOString()
  const windowRangeLabel = formatRange(windowStartIso, windowEndIso, tz)
  const spanDays = eventSpanDays(windowStartMs, windowEndMs, tz)

  const segments = useMemo(() => {
    const mutual = mutualFree ? toSegments(mutualFree, 'mutual') : []
    return [...toSegments(hostFree, 'free'), ...mutual, ...toSegments(hostBusy, 'busy')]
  }, [hostBusy, hostFree, mutualFree])

  return (
    <section className="space-y-2" aria-labelledby="compare-event-overview-heading">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-dc-muted">Full event overview</p>
          <h3 id="compare-event-overview-heading" className="mt-0.5 text-sm font-semibold text-dc-text sm:text-base">
            {hostLabel} — entire event
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-dc-muted">
            One bar spans the whole event ({spanDays === 1 ? '1 day' : `${spanDays} days`}):{' '}
            <span className="text-dc-text">{windowRangeLabel}</span>. Colors match the legend; day strips below are hourly
            detail.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="dc-hallway-touch rounded-lg border border-dc-border px-2 py-1 text-dc-micro text-dc-muted"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            aria-label="Zoom out timeline"
          >
            -
          </button>
          <button
            type="button"
            className="dc-hallway-touch rounded-lg border border-dc-border px-2 py-1 text-dc-micro text-dc-muted"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Zoom in timeline"
          >
            +
          </button>
        </div>
      </div>
      <CompareLegend compact mode={viewerMutual ? 'mutual' : 'host'} />
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-xl border border-dc-border bg-dc-surface-muted p-2"
        role="img"
        aria-label={`Full event availability for ${hostLabel}, ${windowRangeLabel}`}
      >
        <div className="relative h-16 min-w-full" style={{ width: `${100 * zoom}%` }}>
          <div
            className={cx('absolute inset-x-0 top-2 h-10 rounded-md border border-dc-border', compareSlot.outsideWindow)}
            aria-hidden
          />
          {segments.map((seg, i) => {
            const left = ((seg.startMs - windowStartMs) / span) * 100
            const width = ((seg.endMs - seg.startMs) / span) * 100
            const color =
              seg.kind === 'busy'
                ? compareConstellationSegment.busy
                : seg.kind === 'mutual'
                  ? compareConstellationSegment.mutual
                  : viewerMutual
                    ? compareConstellationSegment.hostFreeOnly
                    : compareConstellationSegment.hostFree
            const z =
              seg.kind === 'busy' ? 'z-30' : seg.kind === 'mutual' ? 'z-20' : seg.kind === 'free' ? 'z-10' : 'z-0'
            return (
              <button
                key={`${seg.kind}-${seg.startMs}-${i}`}
                type="button"
                title={`${formatTime(new Date(seg.startMs).toISOString(), tz)} - ${formatTime(new Date(seg.endMs).toISOString(), tz)}`}
                className={`absolute top-2 h-10 min-w-[2px] rounded ${z} ${color} ${seg.kind === 'mutual' ? 'cursor-pointer hover:opacity-90' : ''}`}
                style={{ left: `${left}%`, width: `${Math.max(width, 0.4)}%` }}
                onClick={() => {
                  if (seg.kind === 'mutual') onGapClick?.(seg.startMs, seg.endMs)
                }}
              />
            )
          })}
        </div>
      </div>
      <div className="flex items-start justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-dc-muted">
        <div className="min-w-0 max-w-[46%]">
          <span className="block text-[9px] tracking-[0.2em] text-dc-muted/80">Event starts</span>
          <span className="mt-0.5 block normal-case tracking-normal text-dc-text">{formatEventBoundary(windowStartMs, tz)}</span>
        </div>
        <div className="hidden shrink-0 px-1 pt-3 text-center text-[9px] tracking-[0.18em] text-dc-muted/70 sm:block" aria-hidden>
          ← entire event →
        </div>
        <div className="min-w-0 max-w-[46%] text-right">
          <span className="block text-[9px] tracking-[0.2em] text-dc-muted/80">Event ends</span>
          <span className="mt-0.5 block normal-case tracking-normal text-dc-text">{formatEventBoundary(windowEndMs, tz)}</span>
        </div>
      </div>
    </section>
  )
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
