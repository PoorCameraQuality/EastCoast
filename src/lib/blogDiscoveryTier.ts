/**
 * Tiered indexing for programmatic /blog URLs.
 * Set NEXT_PUBLIC_BLOG_PROGRAMMATIC_FULL_INDEX=true to include all east-coast states + tier-2 cities.
 * Set NEXT_PUBLIC_DISCOVERY_FULL_INDEX=true to unlock all discovery surfaces at once.
 */

import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { BLOG_PILLAR_SLUGS } from '@/lib/blogPillarRegistry'
import { isDiscoveryFullIndexUnlocked } from '@/lib/discoveryIndexingEnv'
import { parseBlogSlug } from '@/lib/parseBlogSlug'

const TIER1_STATE_SLUGS: StateSlug[] = ['new-jersey', 'pennsylvania']

const TIER2_CITY_SLUGS = ['philadelphia', 'baltimore'] as const

export function isBlogProgrammaticPathAllowlisted(segments: string[]): boolean {
  if (isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_BLOG_PROGRAMMATIC_FULL_INDEX === 'true')) {
    return parseBlogSlug(segments) !== null && segments.length === 2
  }
  if (segments.length !== 2) return false
  const [a, b] = segments
  if (a === 'bdsm-events-in') return TIER1_STATE_SLUGS.includes(b as StateSlug)
  if (a === 'how-to-start-bdsm-in') return (TIER2_CITY_SLUGS as readonly string[]).includes(b)
  return false
}

export function buildAllowlistedBlogPaths(): string[] {
  const out: string[] = ['blog']
  for (const slug of BLOG_PILLAR_SLUGS) {
    out.push(`blog/${slug}`)
  }

  const fullBlog = isDiscoveryFullIndexUnlocked(process.env.NEXT_PUBLIC_BLOG_PROGRAMMATIC_FULL_INDEX === 'true')
  const states = fullBlog ? (Object.keys(EAST_COAST_STATES) as StateSlug[]) : TIER1_STATE_SLUGS

  for (const s of states) {
    out.push(`blog/bdsm-events-in/${s}`)
  }

  const cities = fullBlog ? Object.keys(CITY_BY_SLUG) : [...TIER2_CITY_SLUGS]

  for (const c of cities) {
    out.push(`blog/how-to-start-bdsm-in/${c}`)
  }

  return Array.from(new Set(out))
}

/** Robots for programmatic hubs outside tier: thin or unstaged URLs stay discoverable via links only. */
export function blogRobotsMeta(
  segments: string[],
  kind: 'pillar' | 'stateEventsGuide' | 'cityStartGuide'
): { index: boolean; follow: boolean } {
  if (kind === 'pillar') return { index: true, follow: true }
  if (segments.length === 2 && !isBlogProgrammaticPathAllowlisted(segments)) {
    return { index: false, follow: true }
  }
  return { index: true, follow: true }
}
