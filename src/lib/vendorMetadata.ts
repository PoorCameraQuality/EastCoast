import { tagsBySlug } from '@/data/vendorTaxonomy'

type VendorLike = {
  name: string
  slug: string
  location?: string
  tagSlugs?: string[]
  seoKeywordPhrases?: string[]
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
  const inferred = [
    `${vendor.name} handmade kink gear`,
    `${vendor.name} fetish marketplace listing`,
    'BDSM convention vendor',
    'dungeon vending handmade',
    'kink maker directory',
  ]
  const manual = vendor.seoKeywordPhrases ?? []
  return Array.from(new Set([...base, ...inferred, ...manual]))
}

/** Prefer dedicated SEO copy; otherwise trim at word boundary for meta tags. */
export function buildVendorMetaDescription(vendor: {
  seoDescription?: string
  description?: string
  story?: string
}): string {
  const primary = (vendor.seoDescription || vendor.description || vendor.story || 'Vendor listing').trim()
  if (!vendor.seoDescription && primary.length > 160) {
    const slice = primary.slice(0, 157)
    const lastSpace = slice.lastIndexOf(' ')
    const body = lastSpace > 50 ? slice.slice(0, lastSpace) : slice
    return `${body}…`
  }
  return primary.length > 160 ? `${primary.slice(0, 157)}…` : primary
}

export function buildVendorOgDescription(vendor: {
  seoDescription?: string
  description?: string
  story?: string
}): string {
  const primary = (vendor.seoDescription || vendor.description || vendor.story || 'Vendor listing').trim()
  if (primary.length <= 200) return primary
  const slice = primary.slice(0, 197)
  const lastSpace = slice.lastIndexOf(' ')
  const body = lastSpace > 60 ? slice.slice(0, lastSpace) : slice
  return `${body}…`
}
