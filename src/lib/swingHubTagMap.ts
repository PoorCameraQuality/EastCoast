/**
 * SEO hub slugs for /swing-clubs/[...slug] tag pages.
 */
export const SWING_SEO_HUB_TAG_SLUGS = [
  'byob',
  'on-premise',
  'members-only',
  'couples-focused',
  'single-women-welcome',
] as const

export type SwingSeoHubTagSlug = (typeof SWING_SEO_HUB_TAG_SLUGS)[number]

export function isSwingHubTagSlug(s: string): s is SwingSeoHubTagSlug {
  return (SWING_SEO_HUB_TAG_SLUGS as readonly string[]).includes(s)
}

type ClubLike = {
  category?: string
  excerpt?: string
  description?: { long?: string }
}

export function inferSwingHubTags(club: ClubLike): SwingSeoHubTagSlug[] {
  const long = club.description?.long || ''
  const text = `${club.category || ''} ${club.excerpt || ''} ${long}`.toLowerCase()
  const out = new Set<SwingSeoHubTagSlug>()

  if (/\bbyob\b|bring your own (booze|alcohol|liquor|drinks?)/i.test(text)) {
    out.add('byob')
  }

  if (/\bon[- ]premise\b|on premise/i.test(text)) {
    out.add('on-premise')
  }

  if (
    /\bmembers?\s+only\b|\bmembership\s+(required|must)|private\s+members/i.test(text) ||
    /\b501\s*\(c\)\s*7\b/i.test(text)
  ) {
    out.add('members-only')
  }

  if (
    /\bcouples?\s+only\b|\bcouples?\s+and\s+single\s+wom/i.test(text) ||
    /\bcouples?[- ]focused\b/i.test(text)
  ) {
    out.add('couples-focused')
  }

  if (/\bsingle\s+wom(e|o)n\b|\bladies?\s+free\b|\bsingle\s+ladies?\s+welcome/i.test(text)) {
    out.add('single-women-welcome')
  }

  return Array.from(out)
}

export function swingMatchesHubTag(discoveryTagSlugs: string[], hub: SwingSeoHubTagSlug): boolean {
  return discoveryTagSlugs.includes(hub)
}

export const SWING_SEO_HUB_LABELS: Record<SwingSeoHubTagSlug, string> = {
  byob: 'BYOB-friendly',
  'on-premise': 'On-premise play',
  'members-only': 'Members-only',
  'couples-focused': 'Couples-focused nights',
  'single-women-welcome': 'Single women welcome',
}
