import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'

export function getStateSlugFromAbbr(abbr: string): StateSlug | null {
  const e = (Object.keys(EAST_COAST_STATES) as StateSlug[]).find(
    (s) => EAST_COAST_STATES[s].abbr === abbr.toUpperCase()
  )
  return e ?? null
}

/** First city hub slug whose matcher fits this event (if any) */
export function getCityHubSlugForEvent(city: string, stateAbbr: string): string | null {
  for (const [slug, entry] of Object.entries(CITY_BY_SLUG)) {
    if (entry.stateAbbr === stateAbbr && entry.matchCity(city)) return slug
  }
  return null
}
