import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { isCitySlug } from '@/lib/discoveryCityRegistry'
import { BLOG_PILLAR_SLUGS } from '@/lib/blogPillarRegistry'

/** First path segments reserved for programmatic two-segment URLs (do not use as pillar slugs). */
export const BLOG_RESERVED_FIRST_SEGMENTS = ['bdsm-events-in', 'how-to-start-bdsm-in'] as const

export type BlogReservedFirstSegment = (typeof BLOG_RESERVED_FIRST_SEGMENTS)[number]

export type ParsedBlogSlug =
  | { kind: 'pillar'; slug: string }
  | { kind: 'stateEventsGuide'; stateSlug: StateSlug }
  | { kind: 'cityStartGuide'; citySlug: string }

export function parseBlogSlug(segments: string[]): ParsedBlogSlug | null {
  if (segments.length === 0 || segments.length > 2) return null

  const [a, b] = segments

  if (segments.length === 1) {
    if (BLOG_RESERVED_FIRST_SEGMENTS.includes(a as BlogReservedFirstSegment)) return null
    if (!(BLOG_PILLAR_SLUGS as readonly string[]).includes(a)) return null
    return { kind: 'pillar', slug: a }
  }

  if (!b) return null

  if (a === 'bdsm-events-in') {
    if (!(b in EAST_COAST_STATES)) return null
    return { kind: 'stateEventsGuide', stateSlug: b as StateSlug }
  }

  if (a === 'how-to-start-bdsm-in') {
    if (!isCitySlug(b)) return null
    return { kind: 'cityStartGuide', citySlug: b }
  }

  return null
}

export function parseBlogSlugSafe(segments: string[]): ParsedBlogSlug | null {
  try {
    return parseBlogSlug(segments)
  } catch {
    return null
  }
}
