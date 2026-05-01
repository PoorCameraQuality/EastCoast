'use client'

import { useMemo } from 'react'
import {
  exclusiveEndOfZonedCalendarDayMs,
  formatHourTickLabel,
  formatTime,
  utcMillisAtZonedWallClock,
  zonedCalendarDateFromUtc,
} from '@/components/dancecard/time'
import type { IsoInterval } from '@/components/dancecard/eventAvailability'
import { intervalFullyInsideAnyUnion, mergeIsoIntervals } from '@/components/dancecard/eventAvailability'

const STEP_MS = 30 * 60 * 1000
/** Fixed local day window shown in the strip (00:00 → 24:00, event timezone). */
const DISPLAY_HOUR_START = 0
const DISPLAY_SLOT_COUNT = 48 // 24 hours × 2 half-hours

export function MutualAvailabilityStrip(props: {
  dayLabel: string
  rangeStartMs: number
  rangeEndMs: number
  freeIntervals: IsoInterval[]
  /** Optional first layer in mutual mode: when host is free but viewer is not, render host-only color. */
  hostFreeIntervals?: IsoInterval[]
  tz: string
  /** In mutual mode, green = both free and teal = host free only. In host mode, green = host free. */
  mode: 'mutual' | 'host'
  /** When set, each green half-hour becomes a control to reserve that slot (caller should only pass in mutual mode). */
  onFreeStepClick?: (startMs: number, endMs: number) => void
  /** Optional active playable window in UTC; outside this range renders gray/inactive. */
  activeWindowStartMs?: number
  activeWindowEndMs?: number
}) {
  const {
    dayLabel,
    rangeStartMs,
    freeIntervals,
    hostFreeIntervals,
    tz,
    mode,
    onFreeStepClick,
    activeWindowStartMs,
    activeWindowEndMs,
  } = props
  const merged = useMemo(() => mergeIsoIntervals(freeIntervals), [freeIntervals])
  const mergedHost = useMemo(() => mergeIsoIntervals(hostFreeIntervals ?? freeIntervals), [freeIntervals, hostFreeIntervals])

  const calendarYmd = useMemo(() => zonedCalendarDateFromUtc(rangeStartMs, tz), [rangeStartMs, tz])

  const slots = useMemo(() => {
    const dayEnd = exclusiveEndOfZonedCalendarDayMs(tz, calendarYmd)
    const row: { startMs: number; endMs: number; free: boolean; hostFree: boolean; inPlayableWindow: boolean }[] = []

    for (let i = 0; i < DISPLAY_SLOT_COUNT; i++) {
      const hour = DISPLAY_HOUR_START + Math.floor(i / 2)
      const minute = (i % 2) * 30
      let startMs = utcMillisAtZonedWallClock(tz, calendarYmd, hour, minute)
      if (startMs == null) {
        startMs =
          i > 0
            ? row[i - 1].endMs
            : utcMillisAtZonedWallClock(tz, calendarYmd, DISPLAY_HOUR_START, 0) ?? rangeStartMs
      }

      let endMs: number
      if (i === DISPLAY_SLOT_COUNT - 1) {
        endMs = dayEnd
      } else {
        const h2 = DISPLAY_HOUR_START + Math.floor((i + 1) / 2)
        const min2 = ((i + 1) % 2) * 30
        endMs = utcMillisAtZonedWallClock(tz, calendarYmd, h2, min2) ?? startMs + STEP_MS
      }
      if (!(endMs > startMs)) endMs = startMs + STEP_MS

      const inPlayableWindow =
        activeWindowStartMs == null ||
        activeWindowEndMs == null ||
        (startMs >= activeWindowStartMs && endMs <= activeWindowEndMs)
      const free = inPlayableWindow && intervalFullyInsideAnyUnion(startMs, endMs, merged)
      const hostFree = inPlayableWindow && intervalFullyInsideAnyUnion(startMs, endMs, mergedHost)
      row.push({ startMs, endMs, free, hostFree, inPlayableWindow })
    }
    return row
  }, [activeWindowEndMs, activeWindowStartMs, calendarYmd, merged, mergedHost, rangeStartMs, tz])

  const interactive = Boolean(onFreeStepClick)

  const hourColumns = useMemo(() => {
    const cols: { hour: number; slots: typeof slots }[] = []
    for (let h = 0; h < 24; h++) {
      const hour = DISPLAY_HOUR_START + h
      cols.push({ hour, slots: slots.slice(h * 2, h * 2 + 2) })
    }
    return cols
  }, [slots])

  return (
    <div className="rounded-xl border border-slate-700/70 bg-[#101a2d]/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">{dayLabel}</div>
        <div className="text-[10px] text-slate-400">
          {mode === 'mutual' ? 'Green = both free · Teal = host free only' : 'Green = host free'}
          {interactive ? <span className="text-slate-500"> · tap or click green to reserve</span> : null}
          <span className="text-slate-500"> · Red = busy · Gray = outside playable window</span>
        </div>
      </div>

      {/* Hour tick labels */}
      <div
        className="mt-1.5 grid text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400 sm:text-[10px]"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0,1fr))' }}
        aria-hidden
      >
        {hourColumns.map(({ hour }) => (
          <div key={hour} className="min-w-0 border-l border-slate-600/45 pl-1 first:border-l-0 first:pl-0">
            {formatHourTickLabel(hour)}
          </div>
        ))}
      </div>

      <div
        className="relative z-0 mt-1 grid gap-0 rounded-lg border border-slate-700/70 bg-slate-950/55 p-1"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0,1fr))' }}
        role={interactive ? 'group' : 'img'}
        aria-label={`Availability for ${dayLabel}, 24-hour day in ${tz}. Green both free, teal host free only, red busy, gray outside playable window.`}
      >
        {hourColumns.map(({ hour, slots: pair }) => (
          <div
            key={hour}
            className="flex min-h-11 min-w-0 w-full gap-px border-l border-slate-500/35 first:border-l-0"
          >
            {pair.map((slot, j) => {
              const stepStartIso = new Date(slot.startMs).toISOString()
              const stepEndIso = new Date(slot.endMs).toISOString()
              const rangeLabel = `${formatTime(stepStartIso, tz)} – ${formatTime(stepEndIso, tz)}`
              const free = slot.free
              const hostOnly = mode === 'mutual' && slot.hostFree && !slot.free

              if (free && slot.inPlayableWindow && onFreeStepClick) {
                return (
                  <button
                    key={`${hour}-${j}`}
                    type="button"
                    title={`Reserve ${rangeLabel}`}
                    aria-label={`Reserve mutual free time ${rangeLabel}`}
                    onClick={() => onFreeStepClick(slot.startMs, slot.endMs)}
                    className={cx(
                      'relative z-[1] min-h-11 min-w-[12px] w-full flex-1 cursor-pointer touch-manipulation rounded-sm bg-emerald-400/90 transition hover:bg-emerald-300 hover:ring-2 hover:ring-emerald-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-300'
                    )}
                  />
                )
              }

              return (
                <div
                  key={`${hour}-${j}`}
                  title={
                    slot.inPlayableWindow
                      ? free
                        ? `${mode === 'mutual' ? 'Both free' : 'Open'} ${rangeLabel}`
                        : hostOnly
                          ? `Host free only ${rangeLabel}`
                          : `Busy ${rangeLabel}`
                      : `Outside playable window ${rangeLabel}`
                  }
                  className={cx(
                    'min-h-11 min-w-[12px] w-full flex-1 rounded-sm',
                    !slot.inPlayableWindow
                      ? 'bg-slate-600/70'
                      : free
                        ? 'bg-emerald-400/90'
                        : hostOnly
                          ? 'bg-teal-400/85'
                          : 'bg-rose-500/90'
                  )}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.18em] text-slate-400">
        <span>12 AM</span>
        <span>12 AM</span>
      </div>
    </div>
  )
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}










