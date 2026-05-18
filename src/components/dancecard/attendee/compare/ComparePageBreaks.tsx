/** Gold section breaks for compare connection board. */

const GOLD_LINE =
  'linear-gradient(90deg, transparent 0%, rgba(198, 167, 94, 0.35) 8%, rgba(198, 167, 94, 0.92) 50%, rgba(198, 167, 94, 0.35) 92%, transparent 100%)'

const GOLD_LINE_SOFT =
  'linear-gradient(90deg, transparent 0%, rgba(198, 167, 94, 0.2) 12%, rgba(198, 167, 94, 0.75) 50%, rgba(198, 167, 94, 0.2) 88%, transparent 100%)'

function GoldLine({ soft }: { soft?: boolean }) {
  return (
    <span
      className="block h-px min-h-px flex-1"
      style={{ background: soft ? GOLD_LINE_SOFT : GOLD_LINE }}
      aria-hidden
    />
  )
}

export function PremiumSectionLabel({ children = 'Mutual availability' }: { children?: string }) {
  return (
    <div className="flex items-center gap-5 py-4 sm:gap-8" role="separator" aria-label={children}>
      <GoldLine />
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.42em] text-[#c6a75e] sm:text-xs">
        {children}
      </span>
      <GoldLine />
    </div>
  )
}

export function GoldRule() {
  return (
    <div className="py-3" role="separator" aria-hidden>
      <span className="block h-px w-full" style={{ background: GOLD_LINE }} />
    </div>
  )
}
