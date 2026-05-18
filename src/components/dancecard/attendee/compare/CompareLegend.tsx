'use client'

import { compareLegendBusyHatchStyle, compareLegendSwatch } from '@/components/dancecard/attendee/compare/compareColors'

/** Color-blind safe compare legend (swatches match MutualAvailabilityStrip). */
export function CompareLegend({
  compact,
  mode = 'mutual',
}: {
  compact?: boolean
  /** `mutual` = signed-in compare (green / amber / red); `host` = host-only view. */
  mode?: 'mutual' | 'host'
}) {
  return (
    <div
      className={
        compact
          ? 'flex flex-wrap gap-3 text-dc-micro text-dc-muted'
          : 'mt-3 flex flex-wrap gap-4 text-xs text-dc-muted'
      }
      role="list"
      aria-label="Compare color legend"
    >
      <span role="listitem" className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 rounded-sm ${compareLegendSwatch.mutualFree}`} aria-hidden />
        <span>{mode === 'mutual' ? 'Both free' : 'Host free'}</span>
      </span>
      {mode === 'mutual' ? (
        <span role="listitem" className="inline-flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm ${compareLegendSwatch.hostFreeOnly}`} aria-hidden />
          <span>Host free only</span>
        </span>
      ) : null}
      <span role="listitem" className="inline-flex items-center gap-1.5">
        <span
          className={`h-3 w-3 rounded-sm ${compareLegendSwatch.busy}`}
          style={compareLegendBusyHatchStyle}
          aria-hidden
        />
        <span>Busy</span>
      </span>
      <span role="listitem" className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 rounded-sm ${compareLegendSwatch.outsideWindow}`} aria-hidden />
        <span>Outside window</span>
      </span>
      <span role="listitem" className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 rounded-sm ${compareLegendSwatch.selectedGap}`} aria-hidden />
        <span>Selected gap</span>
      </span>
    </div>
  )
}
