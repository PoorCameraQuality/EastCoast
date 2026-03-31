/**
 * SEO hub slugs (short URLs like /vendors/rope) map to one or more
 * vendorTaxonomy.ts tag slugs for filtering.
 */
export const VENDOR_SEO_HUB_TAG_SLUGS = [
  'rope',
  'latex',
  'leather',
  'impact',
  'restraints',
  'clothing',
  'toys',
] as const

export type VendorSeoHubTagSlug = (typeof VENDOR_SEO_HUB_TAG_SLUGS)[number]

/** Hub slug → taxonomy `tagSlugs` to match (OR within hub) */
export const VENDOR_HUB_TO_TAXONOMY: Record<VendorSeoHubTagSlug, string[]> = {
  rope: ['rope-suspension', 'restraints-bondage-gear', 'rope-fabric'],
  latex: ['latex-rubber', 'clothing-fetish-wear', 'roleplay-costume'],
  leather: ['leather', 'handmade-leather', 'vegan-leather'],
  impact: ['impact-implements', 'impact-play'],
  restraints: ['restraints-bondage-gear', 'chastity-cages', 'dungeon-equipment-furniture'],
  clothing: ['clothing-fetish-wear', 'roleplay-costume', 'textile-clothing-maker', 'jewelry-collars'],
  toys: ['insertables-body-toys', 'sensation-play-tools', 'electro-play-gear'],
}

export function isVendorSeoHubTagSlug(s: string): s is VendorSeoHubTagSlug {
  return (VENDOR_SEO_HUB_TAG_SLUGS as readonly string[]).includes(s)
}

export function taxonomySlugsForHub(hub: VendorSeoHubTagSlug): string[] {
  return VENDOR_HUB_TO_TAXONOMY[hub] || []
}

/** Map DB `vendor_seo_tags` slugs → taxonomy `tagSlugs` for filtering / VendorCard */
export function taxonomySlugsFromSeoHubTags(seoSlugs: string[]): string[] {
  const out = new Set<string>()
  for (const s of seoSlugs) {
    if (isVendorSeoHubTagSlug(s)) {
      for (const t of taxonomySlugsForHub(s)) out.add(t)
    }
  }
  return Array.from(out)
}

/** Infer SEO hub tags from granular taxonomy (for migration / backfill). */
export function seoHubTagsFromTaxonomySlugs(taxonomySlugs: string[]): VendorSeoHubTagSlug[] {
  const tax = new Set(taxonomySlugs)
  const out: VendorSeoHubTagSlug[] = []
  for (const hub of VENDOR_SEO_HUB_TAG_SLUGS) {
    const terms = VENDOR_HUB_TO_TAXONOMY[hub]
    if (terms.some((t) => tax.has(t))) out.push(hub)
  }
  return out
}

/** True if vendor has at least one taxonomy tag from this hub */
export function vendorMatchesHubTag(vendorTagSlugs: string[], hub: VendorSeoHubTagSlug): boolean {
  const want = new Set(taxonomySlugsForHub(hub))
  return vendorTagSlugs.some((t) => want.has(t))
}

/** Human-readable labels for intro copy */
export const VENDOR_SEO_HUB_LABELS: Record<VendorSeoHubTagSlug, string> = {
  rope: 'rope bondage, suspension, and cordage',
  latex: 'latex and rubber fetish wear',
  leather: 'leather gear and handmade leather',
  impact: 'impact play tools and implements',
  restraints: 'restraints, bondage gear, and chastity',
  clothing: 'fetish clothing, collars, and wearables',
  toys: 'insertables, sensation tools, and body toys',
}

/** Taxonomy slugs to pass into VendorCard when a hub includes an SEO tag */
export function selectedTaxonomySlugsForVendorHub(args: {
  variant: 'state' | 'tag' | 'stateTag' | 'online'
  seoTagSlug?: VendorSeoHubTagSlug
}): string[] {
  if (
    (args.variant === 'tag' || args.variant === 'stateTag') &&
    args.seoTagSlug
  ) {
    return taxonomySlugsForHub(args.seoTagSlug)
  }
  return []
}
