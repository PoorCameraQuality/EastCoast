import { getStateSlugFromAbbr } from '@/lib/eventDiscoveryLinks'
import { isVendorSeoHubTagSlug } from '@/lib/vendorHubTagMap'

export function vendorDiscoveryPaths(input: {
  slug: string
  stateAbbr?: string | null
  seoHubTags?: string[]
  onlineOnly?: boolean
}): string[] {
  const paths = [`/vendors/${input.slug}`, '/vendors']
  if (input.onlineOnly) paths.push('/vendors/online')
  const stateSlug = input.stateAbbr ? getStateSlugFromAbbr(input.stateAbbr) : null
  if (stateSlug) paths.push(`/vendors/${stateSlug}`)
  for (const tag of input.seoHubTags || []) {
    if (!isVendorSeoHubTagSlug(tag)) continue
    paths.push(`/vendors/${tag}`)
    if (stateSlug) paths.push(`/vendors/${stateSlug}/${tag}`)
  }
  return Array.from(new Set(paths))
}
