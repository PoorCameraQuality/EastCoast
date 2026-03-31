/** Tag slugs aligned with database seed + programmatic URLs */
export const KNOWN_TAG_SLUGS = new Set([
  'beginner-friendly',
  'vetted-event',
  'vetted-events',
  'lgbtq-friendly',
  'rope',
  'impact',
  'public',
  'private',
  'munch',
  'play-party',
  'play_party',
  'classes',
  'class',
  'femdom',
  'bdsm-workshops',
  'private-events',
  'public-events',
  'fetish-parties',
  'dungeon-events',
  'bdsm-social',
  'newcomer-events',
  'advanced-play',
  'impact-play',
  'rope-jams',
  'latex-fetish',
  'costume-events',
  'night-events',
  'weekend-events',
  'bdsm-meetups',
  'kink-parties',
  'community-events',
  'convention',
  'social',
])

export function isLikelyTagSlug(s: string): boolean {
  if (KNOWN_TAG_SLUGS.has(s)) return true
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 48
}
