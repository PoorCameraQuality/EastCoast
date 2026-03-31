/**
 * Programmatic /blog geo URLs: full US + Canadian provincial hubs + city guides (see EAST_COAST_STATES, CITY_BY_SLUG).
 * Set `NEXT_PUBLIC_DISCOVERY_LIMITED=true` to stage rollout; then tier rules in discoveryTier / vendor / dungeon modules apply.
 */

import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { BLOG_PILLAR_SLUGS } from '@/lib/blogPillarRegistry'
import { parseBlogSlug } from '@/lib/parseBlogSlug'

export function isBlogProgrammaticPathAllowlisted(segments: string[]): boolean {
  const parsed = parseBlogSlug(segments)
  return parsed !== null && (parsed.kind === 'stateEventsGuide' || parsed.kind === 'cityStartGuide')
}

export function buildAllowlistedBlogPaths(): string[] {
  const out: string[] = ['blog']
  for (const slug of BLOG_PILLAR_SLUGS) {
    out.push(`blog/${slug}`)
  }

  for (const s of Object.keys(EAST_COAST_STATES) as StateSlug[]) {
    out.push(`blog/bdsm-events-in/${s}`)
  }

  for (const c of Object.keys(CITY_BY_SLUG)) {
    out.push(`blog/how-to-start-bdsm-in/${c}`)
  }

  return Array.from(new Set(out))
}

/**
 * Every `/blog/[...slug]` segment list that `parseBlogSlug` accepts — for `generateStaticParams` only.
 */
export function buildBlogCatchAllStaticParams(): { slug: string[] }[] {
  const params: { slug: string[] }[] = []
  for (const slug of BLOG_PILLAR_SLUGS) {
    params.push({ slug: [slug] })
  }
  for (const s of Object.keys(EAST_COAST_STATES) as StateSlug[]) {
    params.push({ slug: ['bdsm-events-in', s] })
  }
  for (const c of Object.keys(CITY_BY_SLUG)) {
    params.push({ slug: ['how-to-start-bdsm-in', c] })
  }
  return params
}

/** Robots for programmatic hubs when using staged indexing (blog uses full allowlist by default). */
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
