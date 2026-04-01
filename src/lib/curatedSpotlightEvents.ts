import { resolveEventForPage } from '@/lib/unifiedEvents'
import type { EventPageRecord } from '@/lib/unifiedEvents'

/** Fixed allowlist for `/community-spotlight` — do not expand without an explicit product decision. */
export const CURATED_SPOTLIGHT_EVENT_SLUGS = [
  'primal-arts-festival',
  'beltane',
  'elevation-rope',
] as const

export type CuratedSpotlightSlug = (typeof CURATED_SPOTLIGHT_EVENT_SLUGS)[number]

/** Short framing lines for each slug (honest angles: not all are “spirituality” events). */
export const CURATED_SPOTLIGHT_ANGLE: Record<CuratedSpotlightSlug, string> = {
  'primal-arts-festival':
    'Sacred sexuality, ritual fires, and primal arts—outdoor Maryland campground.',
  beltane:
    'Seasonal ritual, bonfire community, and a large on-site dungeon—Maryland.',
  'elevation-rope':
    'Multi-day rope & shibari education in the Blue Ridge—North Carolina.',
}

/**
 * Resolves each allowlisted slug in order using the same precedence as `/events/[slug]`
 * (static vs Supabase per `resolveEventForPage`).
 */
export async function getCuratedSpotlightEvents(): Promise<EventPageRecord[]> {
  const out: EventPageRecord[] = []
  for (const slug of CURATED_SPOTLIGHT_EVENT_SLUGS) {
    const ev = await resolveEventForPage(slug)
    if (ev) out.push(ev)
  }
  return out
}
