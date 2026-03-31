/**
 * Staged rollout: when NEXT_PUBLIC_DUNGEON_DISCOVERY_FULL_INDEX is not "true",
 * only allowlisted dungeon discovery paths get index,follow.
 * Set NEXT_PUBLIC_DISCOVERY_FULL_INDEX=true to unlock all surfaces including dungeons.
 */

import { DUNGEON_SEO_HUB_TAG_SLUGS } from '@/lib/dungeonHubTagMap'
import { isDiscoveryFullIndexUnlocked } from '@/lib/discoveryIndexingEnv'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { parseDungeonDiscoverySlug } from '@/lib/parseDungeonDiscoverySlug'

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
  'philadelphia',
  'baltimore',
  'new-york-city',
  'brooklyn',
  'atlanta',
  'miami',
  'charlotte',
  'richmond',
  'wilmington',
])

export function isDungeonDiscoveryTierAllowlisted(segments: string[]): boolean {
  if (
    isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_DUNGEON_DISCOVERY_FULL_INDEX === 'true')
  ) {
    return parseDungeonDiscoverySlug(segments) !== null
  }
  if (segments.length === 0) return false
  const a = segments[0]
  const b = segments[1]

  if (segments.length === 1) {
    if (TIER1_STATE_SLUGS.has(a)) return true
    if (TIER2_CITY_SLUGS.has(a)) return true
    if ((DUNGEON_SEO_HUB_TAG_SLUGS as readonly string[]).includes(a)) return true
    return false
  }

  if (segments.length === 2 && b) {
    if (TIER1_STATE_SLUGS.has(a) || TIER2_CITY_SLUGS.has(a)) {
      return (DUNGEON_SEO_HUB_TAG_SLUGS as readonly string[]).includes(b)
    }
  }

  return false
}

export function buildAllowlistedDungeonDiscoveryPaths(): string[] {
  const out: string[] = []
  const full = isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_DUNGEON_DISCOVERY_FULL_INDEX === 'true')
  const states = full
    ? (Object.keys(EAST_COAST_STATES) as StateSlug[])
    : (Array.from(TIER1_STATE_SLUGS) as StateSlug[])
  states.forEach((s) => {
    out.push(`dungeons/${s}`)
  })
  const cities = full ? Object.keys(CITY_BY_SLUG) : Array.from(TIER2_CITY_SLUGS)
  cities.forEach((c) => {
    out.push(`dungeons/${c}`)
  })
  ;(DUNGEON_SEO_HUB_TAG_SLUGS as readonly string[]).forEach((t) => {
    out.push(`dungeons/${t}`)
  })
  const sampleTags = ['rope-friendly', 'members-only', 'classes'] as const
  const comboStates = full
    ? (['new-jersey', 'pennsylvania', 'maryland', 'delaware', 'virginia'] as const)
    : (['new-jersey', 'pennsylvania', 'maryland'] as const)
  for (const st of comboStates) {
    for (const tg of sampleTags) {
      out.push(`dungeons/${st}/${tg}`)
    }
  }
  const comboCities = full
    ? (['philadelphia', 'baltimore', 'atlanta', 'miami', 'richmond'] as const)
    : (['philadelphia', 'baltimore'] as const)
  for (const c of comboCities) {
    out.push(`dungeons/${c}/rope-friendly`)
    out.push(`dungeons/${c}/classes`)
  }
  return Array.from(new Set(out))
}
