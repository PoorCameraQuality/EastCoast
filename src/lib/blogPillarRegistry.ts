/**
 * Curated pillar slugs for `/blog/[slug]`. Each must have a matching `.md` file under
 * `src/content/blog/pillars/`. Do not use `bdsm-events-in` or `how-to-start-bdsm-in` here—those are
 * reserved for two-segment programmatic routes (see parseBlogSlug.ts).
 */
export const BLOG_PILLAR_SLUGS = [
  'what-is-bdsm',
  'bdsm-beginner-guide',
  'bdsm-safety-guide',
  'what-to-expect-at-a-kink-event',
  'how-to-find-kink-events-near-me',
  'what-to-expect-first-bdsm-convention',
  'what-is-a-munch-bdsm',
  'what-is-a-play-party',
  'what-is-a-bdsm-dungeon',
  'bdsm-safety-consent-events',
  'guide-to-rope-bondage-workshops',
  'what-is-sacred-kink',
  'can-kink-be-spiritual-practice',
  'what-is-primal-play-bdsm',
  'spring-kink-events-east-coast',
  'summer-kink-events-east-coast',
  'fall-kink-events-east-coast',
  'winter-kink-events-east-coast',
] as const

export type BlogPillarSlug = (typeof BLOG_PILLAR_SLUGS)[number]

export function isBlogPillarSlug(s: string): s is BlogPillarSlug {
  return (BLOG_PILLAR_SLUGS as readonly string[]).includes(s)
}
