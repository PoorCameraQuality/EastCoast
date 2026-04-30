'use client'

import { MutualAvailabilityStrip } from '@/components/dancecard/MutualAvailabilityStrip'
import { extractDancecardShareToken } from '@/components/dancecard/time'

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export type CompareMutualData = {
  host: { displayName: string }
  viewerYou: string | null
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
  mutualData: CompareMutualData | null
  mutualStripDays: CompareStripDay[]
  mutualPlayableWindow: { startMs: number; endMs: number } | null | undefined
  onMutualStripSlotClick: (startMs: number, endMs: number) => void
  me: MeLite
  /** Minimal dancecard layout: tighter copy and chrome (not the classic Mutual tab). */
  compact?: boolean
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
    mutualData,
    mutualStripDays,
    mutualPlayableWindow,
    onMutualStripSlotClick,
    me,
    compact,
  } = props

  return (
    <>
      {compact ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Compare</p>
          <p className="mt-1 text-[11px] leading-snug text-slate-400">
            Their <span className="text-slate-200">login name</span> if they allow it in My availability, then{' '}
            <span className="text-slate-200">Compare</span>. <span className="text-emerald-200/90">Green</span> /{' '}
            <span className="text-rose-200/90">red</span> on the strips. Only a token?{' '}
            <span className="text-slate-200">Advanced</span>.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Compare</p>
          <h2 className="mt-1 font-serif text-xl text-white sm:text-3xl">Availability</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Enter the host’s <span className="text-white">login name</span> (same as they use to sign in here) if they allow
            compare-by-username in My availability — then tap Compare.{' '}
            <span className="text-emerald-200">Green</span> means open, <span className="text-rose-200">red</span> means busy.
            No class names — just time. If they did not turn that on, use <span className="text-white">Advanced</span> with their
            share link or token.
          </p>
        </div>
      )}
      <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2', compact ? 'mt-2' : 'mt-4')}>
        <div className="min-w-0 flex-1">
          <label
            className={cx(
              'mb-1.5 block font-semibold uppercase tracking-[0.2em] text-slate-500',
              compact ? 'text-[10px] tracking-[0.18em]' : 'text-[10px]'
            )}
          >
            Host login name
          </label>
          <input
            className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-base text-white placeholder:text-slate-500 sm:py-3 sm:text-sm"
            value={mutualCompareUsername}
            onChange={(e) => {
              const v = e.target.value
              setMutualCompareUsername(v)
              const t = v.trim().toLowerCase()
              if (t && typeof window !== 'undefined') {
                try {
                  window.sessionStorage.setItem(`eck_dc_compare_user_${slug}`, t)
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
            className="min-h-[44px] touch-manipulation rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-5"
            onClick={() => void refreshMutual()}
          >
            Compare
          </button>
          <button
            type="button"
            disabled={!mutualCompareUsername.trim()}
            className="min-h-[44px] touch-manipulation rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
            onClick={() => void refreshMutual()}
            title="Reload using this login name"
          >
            Refresh
          </button>
        </div>
      </div>
      {compact ? (
        <p className="mt-1.5 text-[10px] leading-snug text-slate-500">Login names are case-insensitive.</p>
      ) : (
        <p className="mt-2 text-[10px] leading-snug text-slate-500">
          Names are matched case-insensitively. Clear the field and use Advanced if you only have a share token.
        </p>
      )}
      <div className={cx('border-t border-white/10', compact ? 'mt-2 pt-2' : 'mt-4 pt-4')}>
        <button
          type="button"
          className={cx(
            'flex w-full touch-manipulation items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 text-left text-slate-200 transition active:bg-white/[0.08] hover:bg-white/[0.06]',
            compact
              ? 'min-h-10 py-2 text-xs sm:min-h-0'
              : 'min-h-[44px] py-2.5 text-sm sm:min-h-0 sm:py-2'
          )}
          onClick={() => setMutualAdvancedTokenOpen((o) => !o)}
          aria-expanded={mutualAdvancedTokenOpen}
        >
          <span className="min-w-0 flex-1 font-medium leading-snug text-white">
            {compact ? 'Advanced · link or token' : 'Advanced — share link or token'}
          </span>
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-400">
            {mutualAdvancedTokenOpen ? 'Hide' : 'Show'}
          </span>
        </button>
        {mutualAdvancedTokenOpen ? (
          <div className={cx('flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2', compact ? 'mt-2' : 'mt-3')}>
            <input
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-base text-white placeholder:text-slate-500 sm:py-3 sm:text-sm"
              value={mutualToken}
              onChange={(e) => {
                const v = e.target.value
                setMutualToken(v)
                const clean = extractDancecardShareToken(v).trim() || v.trim()
                if (clean && typeof window !== 'undefined') {
                  try {
                    window.sessionStorage.setItem(`eck_dc_mutual_${slug}`, clean)
                  } catch {
                    /* ignore */
                  }
                }
              }}
              placeholder="Paste share token or full link…"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
            <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:grid-cols-none">
              <button
                type="button"
                className="min-h-[44px] touch-manipulation rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)] sm:min-h-0 sm:px-5"
                onClick={() => void refreshMutual({ mode: 'token' })}
              >
                Load
              </button>
              <button
                type="button"
                disabled={!mutualToken.trim()}
                className="min-h-[44px] touch-manipulation rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
                onClick={() => void refreshMutual({ mode: 'token' })}
                title="Reload from this token (ignores login name above)"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : null}
        {mutualAdvancedTokenOpen ? (
          <p className={cx('text-[10px] leading-snug text-slate-500', compact ? 'mt-1.5' : 'mt-2')}>
            {compact
              ? 'Load uses token only (clears login). Remembered on this device.'
              : 'Load clears the login name field above and uses the token only. The last token is remembered on this device.'}
          </p>
        ) : null}
      </div>

      {showStrips && mutualData ? (
        <div className={cx('space-y-4', compact ? 'mt-3' : 'mt-6')}>
          <div
            className={cx(
              'rounded-2xl border border-cyan-400/25 bg-cyan-950/30 text-cyan-50/95',
              compact ? 'px-3 py-2 text-[11px] leading-snug' : 'px-4 py-3 text-sm leading-relaxed'
            )}
          >
            <p className="font-semibold text-white">{compact ? 'Reserve' : 'Reserving a time'}</p>
            {mutualData.viewerYou && me ? (
              <p className={cx('text-cyan-100/95', compact ? 'mt-1' : 'mt-1.5')}>
                {compact ? (
                  <>
                    <span className="text-white">Tap green</span> = both free (½ hr). Form opens — adjust,{' '}
                    <span className="text-white">Check slot</span>, <span className="text-white">Send</span>.
                  </>
                ) : (
                  <>
                    <span className="text-white">Tap or click a green block</span> on the strips below — each block is half an
                    hour when you are both free. That opens a form with those times; adjust the window if you need longer, use{' '}
                    <span className="text-white">Check slot</span>, then <span className="text-white">Send reservation</span>.
                  </>
                )}
              </p>
            ) : (
              <p className={cx('text-cyan-100/95', compact ? 'mt-1' : 'mt-1.5')}>
                {compact ? (
                  <>
                    <span className="text-white">Green</span> = host free. Log in (not as host), Compare again —{' '}
                    <span className="text-white">green</span> = both free; tap a block to reserve.
                  </>
                ) : (
                  <>
                    <span className="text-white">Green</span> shows when the host is free. Log in here with an account that is{' '}
                    <span className="text-white">not</span> the host, then tap <span className="text-white">Compare</span> or{' '}
                    <span className="text-white">Refresh</span> again — green will mean you are <span className="text-white">both</span>{' '}
                    free, and you can tap a green block to open the reserve form.
                  </>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="font-medium text-white">Host:</span> {mutualData.host.displayName}
            {mutualData.viewerYou ? (
              <>
                <span className="text-slate-500">·</span>
                <span>
                  Signed in — <span className="text-emerald-200">{mutualData.viewerYou}</span>
                </span>
              </>
            ) : (
              <span className="text-slate-500"> · Sign in to compare both calendars.</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <span className="rounded-full border border-rose-500/30 bg-rose-950/40 px-2 py-1 text-rose-100">Red = busy</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2 py-1 text-emerald-100">
              {mutualData.viewerYou ? 'Green = both free' : 'Green = host free'}
            </span>
          </div>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 sm:max-h-none">
            {mutualStripDays.map((d) => (
              <MutualAvailabilityStrip
                key={`${d.label}-${d.startMs}`}
                dayLabel={d.label}
                rangeStartMs={d.startMs}
                rangeEndMs={d.endMs}
                freeIntervals={mutualData.viewerYou ? (mutualData.mutualFreeGaps ?? []) : mutualData.hostFreeGaps}
                tz={tz}
                mode={mutualData.viewerYou ? 'mutual' : 'host'}
                onFreeStepClick={onMutualStripSlotClick}
                activeWindowStartMs={mutualPlayableWindow?.startMs}
                activeWindowEndMs={mutualPlayableWindow?.endMs}
              />
            ))}
          </div>
          {mutualData.viewerYou && !(mutualData.mutualFreeGaps?.length ?? 0) ? (
            <p className="text-sm text-slate-400">No mutual free windows right now — try adjusting availability.</p>
          ) : null}
        </div>
      ) : null}
    </>
  )
}
