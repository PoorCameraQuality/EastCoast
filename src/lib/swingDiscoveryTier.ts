/**
 * Staged rollout: when NEXT_PUBLIC_SWING_DISCOVERY_FULL_INDEX is not "true",
 * only allowlisted swing discovery paths get index,follow (mirrors dungeon tiers).
 */

import { SWING_SEO_HUB_TAG_SLUGS } from '@/lib/swingHubTagMap'
import { isDiscoveryFullIndexUnlocked } from '@/lib/discoveryIndexingEnv'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { parseSwingDiscoverySlug } from '@/lib/parseSwingDiscoverySlug'

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
  'california',
  'texas',
  'nevada',
])

const TIER2_CITY_SLUGS = new Set([
  'philadelphia',
  'baltimore',
  'new-york-city',
  'brooklyn',
  'atlanta',
  'miami',
  'charlotte',
  'richmond',
  'wilmington',
  'las-vegas',
  'houston',
  'dallas',
  'portland',
])

export function isSwingDiscoveryTierAllowlisted(segments: string[]): boolean {
  if (isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_SWING_DISCOVERY_FULL_INDEX === 'true')) {
    return parseSwingDiscoverySlug(segments) !== null
  }
  if (segments.length === 0) return false
  const a = segments[0]
  const b = segments[1]

  if (segments.length === 1) {
    if (TIER1_STATE_SLUGS.has(a)) return true
    if (TIER2_CITY_SLUGS.has(a)) return true
    if ((SWING_SEO_HUB_TAG_SLUGS as readonly string[]).includes(a)) return true
    return false
  }

  if (segments.length === 2 && b) {
    if (TIER1_STATE_SLUGS.has(a) || TIER2_CITY_SLUGS.has(a)) {
      return (SWING_SEO_HUB_TAG_SLUGS as readonly string[]).includes(b)
    }
  }

  return false
}

export function buildAllowlistedSwingDiscoveryPaths(): string[] {
  const out: string[] = []
  const full = isDiscoveryFullIndexUnlocked(
    process.env.NEXT_PUBLIC_SWING_DISCOVERY_FULL_INDEX === 'true'
  )
  const states = full
    ? (Object.keys(EAST_COAST_STATES) as StateSlug[])
    : (Array.from(TIER1_STATE_SLUGS) as StateSlug[])
  states.forEach((s) => {
    out.push(`swing-clubs/${s}`)
  })
  const cities = full ? Object.keys(CITY_BY_SLUG) : Array.from(TIER2_CITY_SLUGS)
  cities.forEach((c) => {
    out.push(`swing-clubs/${c}`)
  })
  ;(SWING_SEO_HUB_TAG_SLUGS as readonly string[]).forEach((t) => {
    out.push(`swing-clubs/${t}`)
  })
  const sampleTags = ['byob', 'on-premise', 'members-only'] as const
  const comboStates = full
    ? (Object.keys(EAST_COAST_STATES) as StateSlug[])
    : (Array.from(TIER1_STATE_SLUGS) as StateSlug[])
  for (const st of comboStates) {
    for (const tg of sampleTags) {
      out.push(`swing-clubs/${st}/${tg}`)
    }
  }
  const comboCities = full ? Object.keys(CITY_BY_SLUG) : Array.from(TIER2_CITY_SLUGS)
  for (const c of comboCities) {
    out.push(`swing-clubs/${c}/byob`)
    out.push(`swing-clubs/${c}/on-premise`)
  }
  return Array.from(new Set(out))
}
