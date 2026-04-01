/**
 * Programmatic SEO silo: kink + spirituality intersection, centered on three allowlisted events.
 * Not linked from main header — discovery via search, sitemap, internal cross-links, footer.
 */
import type { EventPageRecord } from '@/lib/unifiedEvents'

export const SPIRITUALITY_KINK_BASE = '/spirituality-kink' as const

export const SPIRITUALITY_KINK_SPOKES = [
  {
    slug: 'maryland-sacred-kink-gatherings',
    title: 'Maryland sacred kink & ritual gatherings',
    short: 'Primal Arts Festival & THE Beltane — Darlington-area campground culture.',
  },
  {
    slug: 'north-carolina-rope-embodiment',
    title: 'North Carolina rope & embodiment',
    elevationOnly: true,
    short: 'Elevation Rope — intensive shibari education in the Blue Ridge.',
  },
  {
    slug: 'east-coast-conscious-kink',
    title: 'East Coast conscious kink & sexuality events',
    short: 'Regional lens on sacred sexuality, ritual, and rope—how these listings fit together.',
  },
] as const

export function hubPath(): string {
  return SPIRITUALITY_KINK_BASE
}

export function spokePath(slug: string): string {
  return `${SPIRITUALITY_KINK_BASE}/${slug}`
}

/** Primal Arts + THE Beltane (Maryland). */
export const MARYLAND_FEATURE_SLUGS = ['primal-arts-festival', 'beltane'] as const

/** Elevation Rope (North Carolina). */
export const NORTH_CAROLINA_FEATURE_SLUGS = ['elevation-rope'] as const

export function filterFeaturedEvents(
  all: EventPageRecord[],
  slugs: readonly string[]
): EventPageRecord[] {
  const set = new Set(slugs)
  return all.filter((e) => set.has(e.slug))
}
