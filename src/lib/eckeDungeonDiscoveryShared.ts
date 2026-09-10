import { getStateSlugFromAbbr } from '@/lib/eventDiscoveryLinks'
import { isDungeonHubTagSlug } from '@/lib/dungeonHubTagMap'

export function dungeonDiscoveryPaths(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
}): string[] {
  const paths = [`/dungeons/${input.slug}`, '/dungeons']
  const stateSlug = input.stateAbbr ? getStateSlugFromAbbr(input.stateAbbr) : null
  if (stateSlug) paths.push(`/dungeons/${stateSlug}`)
  for (const tag of input.seoHubTags || []) {
    if (!isDungeonHubTagSlug(tag)) continue
    paths.push(`/dungeons/${tag}`)
    if (stateSlug) paths.push(`/dungeons/${stateSlug}/${tag}`)
  }
  return Array.from(new Set(paths))
}
