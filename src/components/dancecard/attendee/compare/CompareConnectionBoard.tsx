'use client'

import { useMemo, useState } from 'react'
import { AttendeeProfileCard } from '@/components/dancecard/attendee/AttendeeProfileCard'
import { GoldRule, PremiumSectionLabel } from '@/components/dancecard/attendee/compare/ComparePageBreaks'
import { CompareLegend } from '@/components/dancecard/attendee/compare/CompareLegend'
import type { CompareMutualData, CompareStripDay } from '@/components/dancecard/CompareAvailabilityPanel'
import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { formatTime } from '@/components/dancecard/time'
import type { AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import { bestOpenWindows } from '@/lib/dancecard/openWindowSuggestions'
import { cn } from '@/lib/cn'

function cx(...v: Array<string | false | null | undefined>) {
  return v.filter(Boolean).join(' ')
}

export function CompareConnectionBoard({
  tz,
  compact,
  mutualData,
  hostProfile,
  viewerProfile,
  mutualStripDays,
  mutualPlayableWindow,
  onMutualStripSlotClick,
  windowStartMs,
  windowEndMs,
  selectedStartMs,
  selectedEndMs,
}: {
  tz: string
  compact?: boolean
  mutualData: CompareMutualData
  hostProfile: AttendeePublicProfile | null
  viewerProfile: AttendeePublicProfile | null
  mutualStripDays: CompareStripDay[]
  mutualPlayableWindow: { startMs: number; endMs: number } | null | undefined
  onMutualStripSlotClick: (startMs: number, endMs: number) => void
  windowStartMs?: number
  windowEndMs?: number
  selectedStartMs?: number | null
  selectedEndMs?: number | null
}) {
  const [pickedId, setPickedId] = useState<string | null>(null)
  const meetWindows = useMemo(
    () => bestOpenWindows(mutualData.mutualFreeGaps ?? [], tz, 4),
    [mutualData.mutualFreeGaps, tz]
  )

  const showProfiles = hostProfile || viewerProfile

  return (
    <div className={cx('space-y-3', compact ? 'mt-3' : 'mt-4')}>
      {showProfiles ? (
        <section className="grid gap-2.5 sm:grid-cols-2">
          {viewerProfile ? <AttendeeProfileCard profile={viewerProfile} variant="self" compact /> : null}
          {hostProfile ? <AttendeeProfileCard profile={hostProfile} variant="host" compact /> : null}
        </section>
      ) : null}

      {mutualData.viewerYou && meetWindows.length > 0 ? (
        <>
          <PremiumSectionLabel>Mutual availability</PremiumSectionLabel>
          <section>
            <h2 className="font-serif text-lg text-dc-text">Times you can meet</h2>
            <p className="mt-0.5 text-xs text-dc-muted">Longest mutual gaps — tap to reserve.</p>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {meetWindows.map((w, i) => {
                const selected = pickedId === w.id
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setPickedId(w.id)
                        onMutualStripSlotClick(w.startMs, w.endMs)
                      }}
                      className={cx(
                        'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition',
                        selected
                          ? 'border-dc-accent bg-dc-accent-muted/80 shadow-[0_0_16px_rgba(198,167,94,0.1)]'
                          : 'border-dc-border bg-dc-surface-muted/90 hover:border-dc-accent-border/50'
                      )}
                    >
                      <div
                        className={cx(
                          'flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border text-center',
                          selected ? 'border-dc-accent/60 bg-dc-surface' : 'border-dc-border bg-dc-surface/50'
                        )}
                      >
                        <span className="text-[9px] font-bold uppercase leading-none tracking-wide text-dc-muted">
                          {w.day.split(',')[0].slice(0, 3)}
                        </span>
                        {i === 0 ? (
                          <span className="text-[10px] leading-none text-dc-accent" aria-hidden>
                            ★
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight text-dc-text">{w.time}</p>
                        <p className="text-[10px] text-dc-muted">
                          {w.duration} · {w.day}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">
                        {selected ? '✓' : 'Pick'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
          <GoldRule />
        </>
      ) : null}

      <div
        className={cx(
          'rounded-2xl border border-dc-accent-border bg-dc-accent-muted text-dc-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          compact ? 'px-3 py-2 text-[11px] leading-snug' : 'px-4 py-3 text-sm leading-relaxed'
        )}
      >
        <p className="font-semibold text-dc-text">{compact ? 'Reserve' : 'Reserving a time'}</p>
        {mutualData.viewerYou ? (
          <p className={cx('text-dc-muted', compact ? 'mt-1' : 'mt-1.5')}>
            <span className="text-dc-success">Green</span> = both free (tap to reserve).{' '}
            <span className="text-sky-300/90">Blue</span> = host free but you are busy.
          </p>
        ) : (
          <p className={cx('text-dc-muted', compact ? 'mt-1' : 'mt-1.5')}>
            <span className="text-dc-text">Green</span> = host free. Sign in and Compare again for mutual windows.
          </p>
        )}
      </div>

      <CompareLegend mode={mutualData.viewerYou ? 'mutual' : 'host'} />

      {windowStartMs != null && windowEndMs != null ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-dc-muted">Hour-by-hour calendar</h2>
            <p className="mt-1 text-[11px] text-dc-muted">
              {formatTime(new Date(windowStartMs).toISOString(), tz)} –{' '}
              {formatTime(new Date(windowEndMs).toISOString(), tz)}
            </p>
          </div>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
            {mutualStripDays.map((d) => (
              <MutualAvailabilityStrip
                key={`${d.label}-${d.startMs}`}
                dayLabel={d.label}
                rangeStartMs={d.startMs}
                rangeEndMs={d.endMs}
                freeIntervals={mutualData.viewerYou ? (mutualData.mutualFreeGaps ?? []) : mutualData.hostFreeGaps}
                hostFreeIntervals={mutualData.hostFreeGaps}
                hostBusyIntervals={mutualData.hostBusy}
                tz={tz}
                mode={mutualData.viewerYou ? 'mutual' : 'host'}
                onFreeStepClick={onMutualStripSlotClick}
                activeWindowStartMs={mutualPlayableWindow?.startMs}
                activeWindowEndMs={mutualPlayableWindow?.endMs}
                selectedStartMs={selectedStartMs}
                selectedEndMs={selectedEndMs}
              />
            ))}
          </div>
        </section>
      ) : null}

      {mutualData.viewerYou && !(mutualData.mutualFreeGaps?.length ?? 0) ? (
        <p className="text-sm text-dc-muted">No mutual free windows right now — try adjusting availability.</p>
      ) : null}
    </div>
  )
}
