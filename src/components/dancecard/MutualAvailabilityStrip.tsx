'use client'

import { useMemo } from 'react'
import { formatTime } from '@/components/dancecard/time'
import type { IsoInterval } from '@/components/dancecard/eventAvailability'
import { buildAvailabilityFlags, mergeIsoIntervals } from '@/components/dancecard/eventAvailability'

const STEP_MS = 30 * 60 * 1000

export function MutualAvailabilityStrip(props: {
  dayLabel: string
  rangeStartMs: number
  rangeEndMs: number
  freeIntervals: IsoInterval[]
  tz: string
  /** When true, green = mutually free; when false, green = host free only */
  mode: 'mutual' | 'host'
  /** When set, each green half-hour becomes a control to reserve that slot (caller should only pass in mutual mode). */
  onFreeStepClick?: (startMs: number, endMs: number) => void
}) {
  const { dayLabel, rangeStartMs, rangeEndMs, freeIntervals, tz, mode, onFreeStepClick } = props
  const merged = useMemo(() => mergeIsoIntervals(freeIntervals), [freeIntervals])
  const flags = useMemo(
    () => buildAvailabilityFlags(rangeStartMs, rangeEndMs, merged, STEP_MS),
    [rangeStartMs, rangeEndMs, merged]
  )

  const startIso = useMemo(() => new Date(rangeStartMs).toISOString(), [rangeStartMs])
  const endIso = useMemo(() => new Date(rangeEndMs).toISOString(), [rangeEndMs])

  const interactive = Boolean(onFreeStepClick)

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0a1322] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{dayLabel}</div>
        <div className="text-[10px] text-slate-500">
          {mode === 'mutual' ? 'Green = both free' : 'Green = host free'}
          {interactive ? <span className="text-slate-600"> · tap green to reserve</span> : null}
        </div>
      </div>
      <div
        className="mt-3 flex flex-wrap gap-px rounded-xl border border-slate-800 bg-slate-950/60 p-1"
        role={interactive ? 'group' : 'img'}
        aria-label={`Availability for ${dayLabel}. Red busy, green open.`}
      >
        {flags.map((free, i) => {
          const stepStart = rangeStartMs + i * STEP_MS
          const stepEnd = stepStart + STEP_MS
          if (stepEnd > rangeEndMs) return null
          const stepStartIso = new Date(stepStart).toISOString()
          const stepEndIso = new Date(stepEnd).toISOString()
          const rangeLabel = `${formatTime(stepStartIso, tz)} – ${formatTime(stepEndIso, tz)}`

          if (free && onFreeStepClick) {
            return (
              <button
                key={i}
                type="button"
                title={`Reserve ${rangeLabel}`}
                aria-label={`Reserve mutual free time ${rangeLabel}`}
                onClick={() => onFreeStepClick(stepStart, stepEnd)}
                className={cx(
                  'h-8 min-h-[2rem] w-2 shrink-0 rounded-[3px] bg-emerald-500/85 transition hover:bg-emerald-400 hover:ring-1 hover:ring-emerald-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-300'
                )}
              />
            )
          }

          return (
            <div
              key={i}
              title={free ? 'Open' : 'Busy'}
              className={cx(
                'h-8 min-h-[2rem] w-1.5 shrink-0 rounded-[3px]',
                free ? 'bg-emerald-500/85' : 'bg-rose-600/85'
              )}
            />
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
        <span>{formatTime(startIso, tz)}</span>
        <span>{formatTime(endIso, tz)}</span>
      </div>
    </div>
  )
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
