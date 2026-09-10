import { getStateSlugFromAbbr } from '@/lib/eventDiscoveryLinks'

export function eventDiscoveryPaths(slug: string, stateAbbr?: string | null): string[] {
  const paths = [`/events/${slug}`, '/events', '/calendar', '/states']
  const stateSlug = stateAbbr ? getStateSlugFromAbbr(stateAbbr) : null
  if (stateSlug) paths.push(`/states/${stateSlug}`)
  return Array.from(new Set(paths))
}
