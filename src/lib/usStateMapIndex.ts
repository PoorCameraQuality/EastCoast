import { US_STATE_SVG_PATHS } from '../data/usStateSvgPaths'
import { EAST_COAST_STATES, type StateSlug } from './eastCoastStates'

export { hubCountLabel } from './usStateMapCounts'

export function usMapAbbrToSlug(): Map<string, StateSlug> {
  const map = new Map<string, StateSlug>()
  for (const [slug, info] of Object.entries(EAST_COAST_STATES) as [
    StateSlug,
    (typeof EAST_COAST_STATES)[StateSlug],
  ][]) {
    if (info.region === 'Canada') continue
    map.set(info.abbr, slug)
  }
  return map
}

export function usMapPathAbbrs(): string[] {
  return US_STATE_SVG_PATHS.map((path) => path.abbr)
}
