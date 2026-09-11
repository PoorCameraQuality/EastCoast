'use client'

import { useMemo, useState } from 'react'
import {
  US_STATE_MAP_LABELS,
  US_STATE_MAP_VIEWBOX,
  US_STATE_SVG_PATHS,
} from '@/data/usStateSvgPaths'
import { hubCountLabel } from '@/lib/usStateMapCounts'
import type { StateHubSummary } from '@/lib/publicStateIndex'

type Props = {
  summaries: StateHubSummary[]
}

export default function StateIndexMap({ summaries }: Props) {
  const [activeAbbr, setActiveAbbr] = useState<string | null>(null)

  const summaryByAbbr = useMemo(() => {
    const map = new Map<string, StateHubSummary>()
    for (const summary of summaries) {
      map.set(summary.info.abbr, summary)
    }
    return map
  }, [summaries])

  const active = activeAbbr ? summaryByAbbr.get(activeAbbr) : undefined
  const listedCount = useMemo(
    () =>
      US_STATE_SVG_PATHS.filter((path) => {
        const summary = summaryByAbbr.get(path.abbr)
        if (!summary) return false
        return summary.stats.events + summary.stats.conventions + summary.stats.places > 0
      }).length,
    [summaryByAbbr]
  )

  return (
    <section className="st-map" aria-labelledby="st-map-title">
      <div className="st-section-head">
        <h2 id="st-map-title" className="st-section-title">
          Pick a state
        </h2>
        <p className="st-section-note" id="st-map-help">
          {listedCount} hubs have listings. Growing hubs stay quieter and still open a page.
        </p>
      </div>

      <div className="st-map-shell">
        <p className="st-map-readout" aria-live="polite">
          {active ? (
            <>
              <strong>{active.info.name}</strong>
              <span>{hubCountLabel(active.stats)}</span>
            </>
          ) : (
            <span>Hover, tap, or tab a state. Canada is in the list below.</span>
          )}
        </p>

        <svg
          className="st-map-svg"
          viewBox={US_STATE_MAP_VIEWBOX}
          role="group"
          aria-labelledby="st-map-title"
          aria-describedby="st-map-help"
        >
          <defs>
            <pattern
              id="st-map-quiet-hatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <rect width="6" height="6" fill="rgba(15, 23, 42, 0.55)" />
              <path d="M0 0 H6" stroke="rgba(148, 163, 184, 0.28)" strokeWidth="1" />
            </pattern>
          </defs>

          {US_STATE_SVG_PATHS.map((path) => {
            const summary = summaryByAbbr.get(path.abbr)
            if (!summary) return null

            const hasListings =
              summary.stats.events + summary.stats.conventions + summary.stats.places > 0
            const label = US_STATE_MAP_LABELS[path.abbr]
            const isHot = activeAbbr === path.abbr
            const stateClass = [
              'st-map-state',
              hasListings ? 'is-listed' : 'is-quiet',
              isHot ? 'is-hot' : '',
              path.inset ? 'is-inset' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <a
                key={path.abbr}
                href={`/states/${summary.slug}`}
                className={stateClass}
                aria-label={`${summary.info.name}. ${hubCountLabel(summary.stats)}. Open hub`}
                onMouseEnter={() => setActiveAbbr(path.abbr)}
                onMouseLeave={() => setActiveAbbr((current) => (current === path.abbr ? null : current))}
                onFocus={() => setActiveAbbr(path.abbr)}
                onBlur={() => setActiveAbbr((current) => (current === path.abbr ? null : current))}
              >
                <path d={path.d} />
                {label ? (
                  <text className="st-map-label" x={label.x} y={label.y} aria-hidden="true">
                    {path.abbr}
                  </text>
                ) : null}
              </a>
            )
          })}
        </svg>

        <ul className="st-map-legend">
          <li>
            <span className="st-map-legend-swatch is-listed" aria-hidden="true" />
            Has events or places
          </li>
          <li>
            <span className="st-map-legend-swatch is-quiet" aria-hidden="true" />
            Growing hub
          </li>
        </ul>
      </div>
    </section>
  )
}
