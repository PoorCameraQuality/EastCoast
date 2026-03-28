import { tagsBySlug } from '@/data/vendorTaxonomy'

type VendorLike = {
  name: string
  slug: string
  location?: string
  tagSlugs?: string[]
}

/** Keywords for vendor detail metadata (mirrors events/dungeons richness). */
export function buildVendorKeywords(vendor: VendorLike): string[] {
  const fromTags = (vendor.tagSlugs ?? [])
    .map((s) => tagsBySlug[s]?.name)
    .filter((n): n is string => Boolean(n))
  const regionHint = vendor.location?.split('•')[0]?.trim()
  const base = [
    'kink vendor',
    'BDSM gear',
    'fetish maker',
    'East Coast Kink Events',
    vendor.name,
    regionHint,
    ...fromTags,
  ].filter(Boolean) as string[]
  return Array.from(new Set(base))
}
