/**
 * SEO hub slugs for /dungeons/[...slug] tag pages (coarser than any future taxonomy).
 */
export const DUNGEON_SEO_HUB_TAG_SLUGS = [
  'private',
  'public',
  'members-only',
  'rope-friendly',
  'impact-play',
  'classes',
] as const

export type DungeonSeoHubTagSlug = (typeof DUNGEON_SEO_HUB_TAG_SLUGS)[number]

export function isDungeonHubTagSlug(s: string): s is DungeonSeoHubTagSlug {
  return (DUNGEON_SEO_HUB_TAG_SLUGS as readonly string[]).includes(s)
}

type DungeonLike = {
  category?: string
  excerpt?: string
  description?: { long?: string }
}

/** Conservative keyword inference from listing copy */
export function inferDungeonHubTags(dungeon: DungeonLike): DungeonSeoHubTagSlug[] {
  const long = dungeon.description?.long || ''
  const text = `${dungeon.category || ''} ${dungeon.excerpt || ''} ${long}`.toLowerCase()
  const out = new Set<DungeonSeoHubTagSlug>()

  if (
    /\bmembers\s+only\b/.test(text) ||
    /\bmembership\s+(\$|required|must\s+apply)/i.test(text) ||
    /\b501\s*\(c\)\s*7\b.*\bmembers/i.test(text)
  ) {
    out.add('members-only')
  }

  if (
    /\bopen\s+to\s+the\s+public\b/.test(text) ||
    /\bnewcomers?\s+welcome\b/.test(text) ||
    /\bno\s+contributorship\s+required\b/.test(text) ||
    /\bno\s+membership\s+required\b/.test(text)
  ) {
    out.add('public')
  }

  if (
    /\bprivate\s+(club|dungeon|social|space)\b/.test(text) ||
    /\bdoes\s+not\s+have\s+a\s+phone\b/.test(text) ||
    /\bexact\s+location.*registration\b/.test(text) ||
    /\bdo\s+not\s+publish.*(street|address)\b/.test(text) ||
    /\bprivately\s+owned\b/.test(text)
  ) {
    out.add('private')
  }

  if (/\brope\b|\bshibari\b|\bkinbaku\b|\brope\s+share\b/.test(text)) {
    out.add('rope-friendly')
  }

  if (/\bimpact\b|\bflogger\b|\bflogging\b|\bspanking\b|\bwhip\b|\bdungeon\b.*\bplay\b/.test(text)) {
    out.add('impact-play')
  }

  if (/\bworkshop\b|\bclasses?\b|\b101\b|\beducation\b|\btraining\b|\bpresenter\b/.test(text)) {
    out.add('classes')
  }

  return Array.from(out)
}

export function dungeonMatchesHubTag(
  discoveryTagSlugs: string[],
  hub: DungeonSeoHubTagSlug
): boolean {
  return discoveryTagSlugs.includes(hub)
}

export const DUNGEON_SEO_HUB_LABELS: Record<DungeonSeoHubTagSlug, string> = {
  private: 'private and vetted spaces',
  public: 'public-facing and newcomer-friendly spaces',
  'members-only': 'members-only clubs and dungeons',
  'rope-friendly': 'rope, shibari, and suspension-friendly venues',
  'impact-play': 'impact play and dungeon equipment',
  classes: 'classes, workshops, and education-focused spaces',
}
