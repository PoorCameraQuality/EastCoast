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
import {
  intervalFullyInsideAnyUnion,
  intervalOverlapsAnyUnion,
  mergeIsoIntervals,
} from '@/components/dancecard/eventAvailability'
import { compareSlot } from '@/components/dancecard/attendee/compare/compareColors'

const STEP_MS = 30 * 60 * 1000
const DISPLAY_HOUR_START = 0
const DISPLAY_SLOT_COUNT = 48

type SlotKind = 'outside' | 'mutual' | 'hostOnly' | 'busy' | 'selected'

export function MutualAvailabilityStrip(props: {
  dayLabel: string
  rangeStartMs: number
  rangeEndMs: number
  freeIntervals: IsoInterval[]
  hostFreeIntervals?: IsoInterval[]
  hostBusyIntervals?: IsoInterval[]
  tz: string
  mode: 'mutual' | 'host'
  onFreeStepClick?: (startMs: number, endMs: number) => void
  activeWindowStartMs?: number
  activeWindowEndMs?: number
  selectedStartMs?: number | null
  selectedEndMs?: number | null
}) {
  const {
    dayLabel,
    rangeStartMs,
    freeIntervals,
    hostFreeIntervals,
    hostBusyIntervals,
    tz,
    mode,
    onFreeStepClick,
    activeWindowStartMs,
    activeWindowEndMs,
    selectedStartMs,
    selectedEndMs,
  } = props

  const mergedFree = useMemo(() => mergeIsoIntervals(freeIntervals), [freeIntervals])
  const mergedHostFree = useMemo(
    () => mergeIsoIntervals(hostFreeIntervals ?? freeIntervals),
    [freeIntervals, hostFreeIntervals]
  )
  const mergedHostBusy = useMemo(() => mergeIsoIntervals(hostBusyIntervals ?? []), [hostBusyIntervals])

  const calendarYmd = useMemo(() => zonedCalendarDateFromUtc(rangeStartMs, tz), [rangeStartMs, tz])

  const slots = useMemo(() => {
    const dayEnd = exclusiveEndOfZonedCalendarDayMs(tz, calendarYmd)
    const row: {
      startMs: number
      endMs: number
      kind: SlotKind
    }[] = []

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

      const selected =
        selectedStartMs != null &&
        selectedEndMs != null &&
        selectedEndMs > selectedStartMs &&
        startMs < selectedEndMs &&
        endMs > selectedStartMs

      let kind: SlotKind
      if (!inPlayableWindow) {
        kind = 'outside'
      } else if (selected) {
        kind = 'selected'
      } else if (mode === 'mutual') {
        const mutual = intervalFullyInsideAnyUnion(startMs, endMs, mergedFree)
        const hostFree = intervalOverlapsAnyUnion(startMs, endMs, mergedHostFree)
        const hostBusy = intervalOverlapsAnyUnion(startMs, endMs, mergedHostBusy)
        if (mutual) kind = 'mutual'
        else if (hostBusy || !hostFree) kind = 'busy'
        else if (hostFree) kind = 'hostOnly'
        else kind = 'busy'
      } else {
        const hostFree = intervalFullyInsideAnyUnion(startMs, endMs, mergedHostFree)
        const hostBusy = intervalOverlapsAnyUnion(startMs, endMs, mergedHostBusy)
        if (hostBusy || !hostFree) kind = 'busy'
        else kind = 'mutual'
      }

      row.push({ startMs, endMs, kind })
    }
    return row
  }, [
    activeWindowEndMs,
    activeWindowStartMs,
    calendarYmd,
    mergedFree,
    mergedHostBusy,
    mergedHostFree,
    mode,
    rangeStartMs,
    selectedEndMs,
    selectedStartMs,
    tz,
  ])

  const interactive = Boolean(onFreeStepClick)

  const hourColumns = useMemo(() => {
    const cols: { hour: number; slots: typeof slots }[] = []
    for (let h = 0; h < 24; h++) {
      const hour = DISPLAY_HOUR_START + h
      cols.push({ hour, slots: slots.slice(h * 2, h * 2 + 2) })
    }
    return cols
  }, [slots])

  function slotClass(kind: SlotKind): string {
    switch (kind) {
      case 'outside':
        return compareSlot.outsideWindow
      case 'mutual':
        return compareSlot.mutualFree
      case 'hostOnly':
        return compareSlot.hostFreeOnly
      case 'busy':
        return compareSlot.busy
      case 'selected':
        return compareSlot.selectedGap
      default:
        return compareSlot.busy
    }
  }

  function slotTitle(kind: SlotKind, rangeLabel: string): string {
    switch (kind) {
      case 'outside':
        return `Outside playable window ${rangeLabel}`
      case 'mutual':
        return `${mode === 'mutual' ? 'Both free' : 'Host free'} ${rangeLabel}`
      case 'hostOnly':
        return `Host free only ${rangeLabel}`
      case 'busy':
        return `Busy ${rangeLabel}`
      case 'selected':
        return `Selected ${rangeLabel}`
      default:
        return rangeLabel
    }
  }

  return (
    <div className="rounded-xl border border-dc-border bg-dc-surface-muted/95 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-2.5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-dc-text">{dayLabel}</div>
        <p className="text-[11px] leading-snug text-dc-muted sm:max-w-[min(100%,28rem)] sm:text-xs">
          {mode === 'mutual' ? 'Green = both free · Blue = host free only' : 'Green = host free'}
          {interactive ? <span className="text-dc-muted/80"> · tap green to reserve</span> : null}
          <span className="text-dc-muted/80"> · Rose = busy · Charcoal = outside window</span>
        </p>
      </div>

      <div
        className="mt-1.5 grid text-[10px] font-medium uppercase tracking-[0.1em] text-dc-muted sm:text-[11px]"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0,1fr))' }}
        aria-hidden
      >
        {hourColumns.map(({ hour }) => (
          <div key={hour} className="min-w-0 border-l border-dc-border pl-1 first:border-l-0 first:pl-0">
            {formatHourTickLabel(hour)}
          </div>
        ))}
      </div>

      <div
        className="relative z-0 mt-1 grid gap-0 rounded-lg border border-dc-border bg-dc-surface/80 p-1"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0,1fr))' }}
        role={interactive ? 'group' : 'img'}
        aria-label={`Availability for ${dayLabel}`}
      >
        {hourColumns.map(({ hour, slots: pair }) => (
          <div
            key={hour}
            className="flex min-h-11 min-w-0 w-full gap-px border-l border-dc-border first:border-l-0"
          >
            {pair.map((slot, j) => {
              const rangeLabel = `${formatTime(new Date(slot.startMs).toISOString(), tz)} – ${formatTime(new Date(slot.endMs).toISOString(), tz)}`
              const canReserve = slot.kind === 'mutual' && interactive

              if (canReserve) {
                return (
                  <button
                    key={`${hour}-${j}`}
                    type="button"
                    title={`Reserve ${rangeLabel}`}
                    aria-label={`Reserve mutual free time ${rangeLabel}`}
                    onClick={() => onFreeStepClick!(slot.startMs, slot.endMs)}
                    className={cx(
                      'relative z-[1] min-h-11 min-w-[12px] w-full flex-1 cursor-pointer touch-manipulation rounded-sm transition',
                      compareSlot.mutualFree,
                      compareSlot.mutualFreeHover
                    )}
                  />
                )
              }

              return (
                <div
                  key={`${hour}-${j}`}
                  title={slotTitle(slot.kind, rangeLabel)}
                  className={cx('min-h-11 min-w-[12px] w-full flex-1 rounded-sm', slotClass(slot.kind))}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-between text-[10px] uppercase tracking-[0.18em] text-dc-muted">
        <span>12 AM</span>
        <span>12 AM</span>
      </div>
    </div>
  )
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}
