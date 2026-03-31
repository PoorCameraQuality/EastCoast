/**
 * `/bdsm-events` sitemap + tier allowlisting. By default full North American hubs are indexed
 * (see `isDiscoveryFullIndexUnlocked`). Set `NEXT_PUBLIC_DISCOVERY_LIMITED=true` to restrict to
 * tier-1 states/cities until you set `NEXT_PUBLIC_DISCOVERY_FULL_INDEX=true`.
 * Paths are segments joined (no leading slash), e.g. `new-jersey`, `new-jersey/rope`.
 */

import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { isDiscoveryFullIndexUnlocked } from '@/lib/discoveryIndexingEnv'

const TIER1_STATE_SLUGS = new Set([
  'new-jersey',
  'pennsylvania',
  'new-york',
  'delaware',
  'maryland',
  'virginia',
  'north-carolina',
  'south-carolina',
  'georgia',
  'florida',
])

const TIER2_CITY_SLUGS = new Set([
  'newark',
  'jersey-city',
  'trenton',
  'atlantic-city',
  'philadelphia',
  'pittsburgh',
  'allentown',
  'harrisburg',
  'new-york-city',
  'brooklyn',
  'queens',
  'buffalo',
  'rochester',
  'wilmington',
  'dover',
  'baltimore',
  'annapolis',
  'columbia-md',
  'northern-virginia',
  'richmond',
  'virginia-beach',
  'arlington',
  'charlotte',
  'raleigh',
  'durham',
  'greensboro',
  'charleston',
  'columbia-sc',
  'atlanta',
  'savannah',
  'miami',
  'orlando',
  'tampa',
  'jacksonville',
  'fort-lauderdale',
  'west-palm-beach',
  'st-petersburg',
  'daytona',
])

const SPECIAL_SLUGS = new Set(['this-weekend', 'near-philadelphia'])

export function isDiscoveryTierAllowlisted(segments: string[]): boolean {
  if (isDiscoveryFullIndexUnlocked(false)) return true
  if (segments.length === 0) return false
  const a = segments[0]
  const b = segments[1]
  if (segments.length === 1) {
    if (SPECIAL_SLUGS.has(a)) return true
    if (TIER1_STATE_SLUGS.has(a)) return true
    if (TIER2_CITY_SLUGS.has(a)) return true
    return false
  }
  if (segments.length === 2 && b) {
    const stateTag = TIER1_STATE_SLUGS.has(a)
    const cityTag = TIER2_CITY_SLUGS.has(a)
    return stateTag || cityTag
  }
  return false
}

/** For sitemap: emit URLs only for allowlisted discovery paths */
export function buildAllowlistedDiscoveryPaths(): string[] {
  const out: string[] = []
  const full = isDiscoveryFullIndexUnlocked(false)
  Array.from(SPECIAL_SLUGS).forEach((s) => out.push(`bdsm-events/${s}`))
  const states = full ? (Object.keys(EAST_COAST_STATES) as StateSlug[]) : Array.from(TIER1_STATE_SLUGS)
  states.forEach((s) => out.push(`bdsm-events/${s}`))
  const cities = full ? Object.keys(CITY_BY_SLUG) : Array.from(TIER2_CITY_SLUGS)
  cities.forEach((c) => out.push(`bdsm-events/${c}`))
  const sampleTags = ['beginner-friendly', 'rope', 'munch', 'play-party', 'classes']
  const comboStates = full
    ? (Object.keys(EAST_COAST_STATES) as StateSlug[])
    : (Array.from(TIER1_STATE_SLUGS) as StateSlug[])
  for (const st of comboStates) {
    for (const t of sampleTags) {
      out.push(`bdsm-events/${st}/${t}`)
    }
  }
  return Array.from(new Set(out))
}
