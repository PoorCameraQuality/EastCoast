/**
 * Staged rollout for vendor SEO hubs: when NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX
 * is not "true", only allowlisted paths get index,follow (mirrors discoveryTier pattern).
 * Segments are path parts after `/vendors/` (no leading slash).
 */

import { VENDOR_SEO_HUB_TAG_SLUGS } from '@/lib/vendorHubTagMap'
import { isDiscoveryFullIndexUnlocked } from '@/lib/discoveryIndexingEnv'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'

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

export function isVendorDiscoveryTierAllowlisted(segments: string[]): boolean {
  if (isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX === 'true')) return true
  if (segments.length === 0) return false
  const a = segments[0]
  const b = segments[1]

  if (segments.length === 1) {
    if (a === 'online') return true
    if (TIER1_STATE_SLUGS.has(a)) return true
    if ((VENDOR_SEO_HUB_TAG_SLUGS as readonly string[]).includes(a)) return true
    return false
  }

  if (segments.length === 2 && b) {
    return TIER1_STATE_SLUGS.has(a)
  }

  return false
}

/** Sitemap: allowlisted vendor discovery URLs only (tiered rollout). */
export function buildAllowlistedVendorDiscoveryPaths(): string[] {
  const out: string[] = ['vendors/online']
  const stateSet = isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX === 'true')
    ? (Object.keys(EAST_COAST_STATES) as StateSlug[])
    : Array.from(TIER1_STATE_SLUGS)
  stateSet.forEach((s) => {
    out.push(`vendors/${s}`)
  })
  ;(VENDOR_SEO_HUB_TAG_SLUGS as readonly string[]).forEach((t) => {
    out.push(`vendors/${t}`)
  })
  const sampleStates = (
    isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_VENDOR_DISCOVERY_FULL_INDEX === 'true')
      ? (['new-jersey', 'pennsylvania', 'new-york', 'maryland', 'delaware', 'virginia'] as const)
      : (['new-jersey', 'pennsylvania', 'new-york'] as const)
  ) as readonly StateSlug[]
  const sampleTags = ['rope', 'latex', 'leather', 'impact'] as const
  for (const st of sampleStates) {
    for (const tg of sampleTags) {
      out.push(`vendors/${st}/${tg}`)
    }
  }
  return Array.from(new Set(out))
}
