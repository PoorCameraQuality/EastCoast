'use client'

import { CompareConnectionBoard } from '@/components/dancecard/attendee/compare/CompareConnectionBoard'
import { DancecardPanelSkeleton } from '@/components/dancecard/organizer/ui'
import { CompareDirectoryDiscover } from '@/components/dancecard/attendee/compare/CompareDirectoryDiscover'
import { CompareOnboardingCarousel } from '@/components/dancecard/attendee/compare/CompareOnboardingCarousel'
import type { AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import { extractDancecardShareToken } from '@/components/dancecard/time'

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export type CompareMutualData = {
  host: { displayName: string; id?: string }
  hostProfile?: AttendeePublicProfile | null
  viewerProfile?: AttendeePublicProfile | null
  viewerYou: string | null
  hostBusy: { start: string; end: string }[]
  hostFreeGaps: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
}

export type CompareStripDay = { label: string; startMs: number; endMs: number }

type MeLite = { account: { displayName: string } } | null

export function CompareAvailabilityPanel(props: {
  slug: string
  tz: string
  /** When true, strips + reserve hints render (same as `mutualData && schedule.meta` in parent). */
  showStrips: boolean
  mutualCompareUsername: string
  setMutualCompareUsername: (v: string) => void
  mutualToken: string
  setMutualToken: (v: string) => void
  mutualAdvancedTokenOpen: boolean
  setMutualAdvancedTokenOpen: (v: boolean | ((b: boolean) => boolean)) => void
  refreshMutual: (opts?: { mode?: 'token' }) => void
  mutualRefreshing?: boolean
  mutualData: CompareMutualData | null
  mutualStripDays: CompareStripDay[]
  mutualPlayableWindow: { startMs: number; endMs: number } | null | undefined
  onMutualStripSlotClick: (startMs: number, endMs: number) => void
  me: MeLite
  windowStartMs?: number
  windowEndMs?: number
  /** Minimal dancecard layout: tighter copy and chrome (not the classic Mutual tab). */
  compact?: boolean
  selectedStartMs?: number | null
  selectedEndMs?: number | null
  reserveModalOpen?: boolean
}) {
  const {
    slug,
    tz,
    showStrips,
    mutualCompareUsername,
    setMutualCompareUsername,
    mutualToken,
    setMutualToken,
    mutualAdvancedTokenOpen,
    setMutualAdvancedTokenOpen,
    refreshMutual,
    mutualRefreshing = false,
    mutualData,
    mutualStripDays,
    mutualPlayableWindow,
    onMutualStripSlotClick,
    windowStartMs,
    windowEndMs,
    compact,
    selectedStartMs,
    selectedEndMs,
    reserveModalOpen,
  } = props

  return (
    <>
      <CompareOnboardingCarousel eventSlug={slug} />
      <CompareDirectoryDiscover
        eventSlug={slug}
        compact={compact}
        onPickUsername={(username) => {
          setMutualCompareUsername(username)
          setMutualToken('')
          const t = username.trim().toLowerCase()
          if (t && typeof window !== 'undefined') {
            try {
              window.sessionStorage.setItem(`eck_dc_compare_user_${slug}`, t)
              window.sessionStorage.removeItem(`eck_dc_mutual_${slug}`)
            } catch {
              /* ignore */
            }
          }
          void refreshMutual()
        }}
      />
      {compact ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dc-muted">Shared schedules / Compare</p>
          <p className="mt-1 text-[11px] leading-snug text-dc-muted">
            If someone shared a login name or link, open it here. Their <span className="text-dc-text">login name</span>{' '}
            loads only when you tap <span className="text-dc-text">Compare</span>.{' '}
            <span className="text-dc-success">Green</span> / <span className="text-dc-danger">red</span> on the
            strips. Only a token?{' '}
            <span className="text-dc-text">Advanced</span>.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-muted">Shared schedules / Compare</p>
          <h2 className="mt-1 font-serif text-xl text-dc-text sm:text-3xl">Availability</h2>
          <p className="mt-2 text-sm leading-6 text-dc-muted">
            If someone gave you a link or login name, open it here. You stay on your own account; their calendar appears as
            red/green free time. Enter the host’s <span className="text-dc-text">login name</span> if they allow
            compare-by-username on their Profile tab — then tap Compare.{' '}
            <span className="text-dc-success">Green</span> means open, <span className="text-dc-danger">red</span> means busy.
            No class names — just time. If they did not turn that on, use <span className="text-dc-text">Advanced</span> with their
            share link or token.
          </p>
        </div>
      )}
      <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2', compact ? 'mt-2' : 'mt-4')}>
        <div className="min-w-0 flex-1">
          <label
            className={cx(
              'mb-1.5 block font-semibold uppercase tracking-[0.2em] text-dc-muted/85',
              compact ? 'text-[10px] tracking-[0.18em]' : 'text-[10px]'
            )}
          >
            Host login name
          </label>
          <input
            className="dc-field-input w-full rounded-2xl border border-dc-border px-4 py-3.5 text-base outline-none transition focus:border-dc-accent focus:ring-2 focus:ring-dc-accent/20 sm:py-3 sm:text-sm"
            value={mutualCompareUsername}
            onChange={(e) => {
              const v = e.target.value
              setMutualCompareUsername(v)
              setMutualToken('')
              const t = v.trim().toLowerCase()
              if (t && typeof window !== 'undefined') {
                try {
                  window.sessionStorage.setItem(`eck_dc_compare_user_${slug}`, t)
                  window.sessionStorage.removeItem(`eck_dc_mutual_${slug}`)
                } catch {
                  /* ignore */
                }
              } else if (typeof window !== 'undefined') {
                try {
                  window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
                } catch {
                  /* ignore */
                }
              }
            }}
            placeholder="e.g. brax"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:grid-cols-none">
          <button
            type="button"
            disabled={!mutualCompareUsername.trim()}
            className="min-h-[44px] touch-manipulation rounded-2xl dc-btn-primary bg-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-5"
            onClick={() => void refreshMutual()}
          >
            Compare
          </button>
          <button
            type="button"
            disabled={!mutualCompareUsername.trim()}
            className="min-h-[44px] touch-manipulation rounded-2xl border border-dc-border bg-dc-elevated-solid/80 px-4 py-3 text-sm font-medium text-dc-text shadow-sm transition hover:border-dc-accent-border hover:bg-dc-accent-muted hover:text-dc-accent disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
            onClick={() => void refreshMutual()}
            title="Reload using this login name"
          >
            Refresh
          </button>
        </div>
      </div>
      {compact ? (
        <p className="mt-1.5 text-[10px] leading-snug text-dc-muted">Login names are case-insensitive.</p>
      ) : (
        <p className="mt-2 text-[10px] leading-snug text-dc-muted">
          Names are matched case-insensitively. A remembered value is not loaded until you tap Compare.
        </p>
      )}
      <div className={cx('border-t border-dc-border', compact ? 'mt-2 pt-2' : 'mt-4 pt-4')}>
        <button
          type="button"
          className={cx(
            'flex w-full touch-manipulation items-center justify-between gap-3 rounded-xl border border-dc-border bg-dc-elevated-solid/80 px-3 text-left text-dc-text shadow-sm transition active:bg-dc-accent-muted/30 hover:border-dc-accent-border hover:bg-dc-accent-muted/20',
            compact
              ? 'min-h-10 py-2 text-xs sm:min-h-0'
              : 'min-h-[44px] py-2.5 text-sm sm:min-h-0 sm:py-2'
          )}
          onClick={() => setMutualAdvancedTokenOpen((o) => !o)}
          aria-expanded={mutualAdvancedTokenOpen}
        >
          <span className="min-w-0 flex-1 font-medium leading-snug text-dc-text">
            {compact ? 'Advanced · link or token' : 'Advanced — share link or token'}
          </span>
          <span className="shrink-0 rounded-full border border-dc-border bg-dc-elevated-muted/40 px-2 py-1 text-xs text-dc-muted">
            {mutualAdvancedTokenOpen ? 'Hide' : 'Show'}
          </span>
        </button>
        {mutualAdvancedTokenOpen ? (
          <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2', compact ? 'mt-2' : 'mt-3')}>
            <input
              className="dc-field-input min-w-0 flex-1 rounded-2xl border border-dc-border px-4 py-3.5 text-base outline-none transition focus:border-dc-accent focus:ring-2 focus:ring-dc-accent/20 sm:py-3 sm:text-sm"
              value={mutualToken}
              onChange={(e) => {
                const v = e.target.value
                setMutualToken(v)
                setMutualCompareUsername('')
                const clean = extractDancecardShareToken(v).trim() || v.trim()
                if (typeof window !== 'undefined') {
                  try {
                    if (clean) window.sessionStorage.setItem(`eck_dc_mutual_${slug}`, clean)
                    else window.sessionStorage.removeItem(`eck_dc_mutual_${slug}`)
                    window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
                  } catch {
                    /* ignore */
                  }
                }
              }}
              placeholder="Paste share token, code, or full link…"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:grid-cols-none">
              <button
                type="button"
                className="min-h-[44px] touch-manipulation rounded-2xl dc-btn-primary bg-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)] sm:min-h-0 sm:px-5"
                onClick={() => void refreshMutual({ mode: 'token' })}
              >
                Load
              </button>
              <button
                type="button"
                disabled={!mutualToken.trim()}
                className="min-h-[44px] touch-manipulation rounded-2xl border border-dc-border bg-dc-elevated-solid/80 px-4 py-3 text-sm font-medium text-dc-text shadow-sm transition hover:border-dc-accent-border hover:bg-dc-accent-muted hover:text-dc-accent disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
                onClick={() => void refreshMutual({ mode: 'token' })}
                title="Reload from this token (ignores login name above)"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : null}
        {mutualAdvancedTokenOpen ? (
          <p className={cx('text-[10px] leading-snug text-dc-muted', compact ? 'mt-1.5' : 'mt-2')}>
            {compact
              ? 'Load uses link/code only (clears login). Remembered on this device.'
              : 'Load clears the login name field above and uses the link/code only. The last value is remembered on this device.'}
          </p>
        ) : null}
      </div>

      {mutualRefreshing ? (
        <div className={cx(compact ? 'mt-3' : 'mt-6')} aria-busy="true">
          <DancecardPanelSkeleton lines={4} />
        </div>
      ) : null}

      {showStrips && mutualData && !mutualRefreshing ? (
        <CompareConnectionBoard
          tz={tz}
          compact={compact}
          mutualData={mutualData}
          hostProfile={mutualData.hostProfile ?? null}
          viewerProfile={mutualData.viewerProfile ?? null}
          mutualStripDays={mutualStripDays}
          mutualPlayableWindow={mutualPlayableWindow}
          onMutualStripSlotClick={onMutualStripSlotClick}
          windowStartMs={windowStartMs}
          windowEndMs={windowEndMs}
          selectedStartMs={selectedStartMs}
          selectedEndMs={selectedEndMs}
          reserveModalOpen={reserveModalOpen}
        />
      ) : null}
    </>
  )
}
