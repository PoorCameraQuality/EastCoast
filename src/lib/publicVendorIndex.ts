import type { VendorTag } from '@/data/vendorTaxonomy'
import { unifiedToIndexItem } from '@/lib/publicEventIndex'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type { VendorRecord } from '@/lib/vendorFiltering'
import { getVendorPaidImage125Url, getVendorCardPreviewText } from '@/lib/vendorFiltering'
import { parseVendorLocation, type UnifiedVendor } from '@/lib/unifiedVendors'
import type { PublicEventIndexItem } from '@/types/publicEventIndexItem'
import type { PublicVendorListing, PublicVendorType, VendorCategoryChip } from '@/types/publicVendorListing'
import { VENDOR_CATEGORY_CHIPS } from '@/types/publicVendorListing'
import type { PublicVendorMedia, PublicVendorProduct } from '@/types/publicVendorProduct'

function inferVendorType(tagSlugs: string[]): PublicVendorType {
  if (tagSlugs.includes('custom-commission-vendor') || tagSlugs.includes('custom-orders-available')) {
    return 'custom_commission'
  }
  if (tagSlugs.includes('reseller-curated-shop')) return 'reseller'
  if (tagSlugs.includes('photography-content')) return 'artist'
  if (tagSlugs.includes('media-education-products')) return 'author'
  if (tagSlugs.includes('educational-focused-vendor') || tagSlugs.includes('workshop-education-offered')) {
    return 'educator_vendor'
  }
  if (tagSlugs.includes('services-experiences')) return 'service_provider'
  if (tagSlugs.includes('event-pickup-available')) return 'event_vendor'
  if (
    tagSlugs.some((s) =>
      ['handmade-leather', 'handmade-silicone', 'woodworking', 'textile-clothing-maker'].includes(s)
    )
  ) {
    return 'maker'
  }
  return 'other'
}

function productsFromVendor(vendor: VendorRecord, tagsBySlug: Record<string, VendorTag>): PublicVendorProduct[] {
  const map = vendor.productImage125ByTagSlug
  if (!map) return []
  const products: PublicVendorProduct[] = []
  let i = 0
  for (const [key, url] of Object.entries(map)) {
    if (!url || key === 'default') continue
    const tag = tagsBySlug[key]
    products.push({
      id: `${vendor.slug}-${key}`,
      title: tag?.name ?? key.replace(/-/g, ' '),
      imageUrl: url,
      category: tag?.name,
      externalUrl: vendor.websiteUrl,
      sourceSystem: 'manual',
      publicSafe: true,
      sortOrder: i++,
    })
  }
  if (map.default) {
    products.unshift({
      id: `${vendor.slug}-featured`,
      title: 'Featured work',
      imageUrl: map.default,
      externalUrl: vendor.websiteUrl,
      sourceSystem: 'manual',
      publicSafe: true,
      sortOrder: -1,
    })
  }
  return products.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
}

function galleryFromProducts(products: PublicVendorProduct[]): PublicVendorMedia[] {
  return products
    .filter((p) => p.imageUrl && p.publicSafe)
    .map((p, i) => ({
      id: p.id,
      url: p.imageUrl!,
      alt: p.title,
      caption: p.category,
      mediaKind: 'product' as const,
      sourceSystem: 'ecke' as const,
      publicSafe: true,
      sortOrder: i,
    }))
}

export function vendorToListing(
  vendor: UnifiedVendor,
  tagsBySlug: Record<string, VendorTag>
): PublicVendorListing {
  const { stateAbbr, city, onlineOnly } = parseVendorLocation(vendor.location)
  const featuredProducts = productsFromVendor(vendor, tagsBySlug)
  const coverImageUrl =
    featuredProducts[0]?.imageUrl ??
    getVendorPaidImage125Url({ vendor, selectedTagSlugs: vendor.tagSlugs }) ??
    undefined

  const craftTags = vendor.tagSlugs
    .map((s) => tagsBySlug[s]?.name)
    .filter(Boolean)
    .slice(0, 4) as string[]

  const acceptsCommissions =
    vendor.tagSlugs.includes('custom-commission-vendor') ||
    vendor.tagSlugs.includes('custom-orders-available')

  const shortSummary =
    getVendorCardPreviewText({ vendor, maxSentences: 2 }) || undefined

  return {
    id: vendor.slug,
    slug: vendor.slug,
    name: vendor.name,
    shortSummary,
    description: vendor.story || vendor.description,
    tagline: craftTags.slice(0, 3).join(' · ') || undefined,
    vendorType: inferVendorType(vendor.tagSlugs),
    productCategories: craftTags,
    craftTags,
    tagSlugs: vendor.tagSlugs,
    city: city ?? undefined,
    state: stateAbbr ?? undefined,
    locationLabel: vendor.location,
    onlineOnly,
    logoUrl: vendor.logo125Url,
    coverImageUrl,
    gallery: galleryFromProducts(featuredProducts),
    featuredProducts,
    shopUrl: vendor.websiteUrl,
    websiteUrl: vendor.websiteUrl,
    acceptsCommissions,
    commissionInfo: acceptsCommissions ? 'Custom commissions available — confirm details on the vendor site.' : undefined,
    supporterTier: vendor.isPaid ? 'supporter' : 'none',
    dungeonListingSlug: vendor.dungeonListingSlug,
    sourceSystem: 'ecke',
    status: 'published',
  }
}

export function buildVendorIndex(
  vendors: UnifiedVendor[],
  tagsBySlug: Record<string, VendorTag>
): PublicVendorListing[] {
  return vendors.map((v) => vendorToListing(v, tagsBySlug))
}

export function featuredVendorScore(v: PublicVendorListing): number {
  let score = 0
  if (v.supporterTier === 'supporter') score += 40
  if (v.coverImageUrl || (v.featuredProducts?.length ?? 0) > 0) score += 35
  if (v.logoUrl) score += 10
  if ((v.upcomingVendorEvents?.length ?? 0) > 0) score += 20
  if (v.acceptsCommissions) score += 5
  return score
}

export function pickFeaturedVendors(items: PublicVendorListing[], limit = 4): PublicVendorListing[] {
  return [...items]
    .sort((a, b) => featuredVendorScore(b) - featuredVendorScore(a) || a.name.localeCompare(b.name))
    .slice(0, limit)
}

export function matchesCategoryChip(vendor: PublicVendorListing, chip: VendorCategoryChip): boolean {
  const set = new Set(vendor.tagSlugs)
  return chip.tagSlugs.some((t) => set.has(t))
}

export function categoryChipCounts(
  vendors: PublicVendorListing[]
): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {}
  for (const chip of VENDOR_CATEGORY_CHIPS) {
    const n = vendors.filter((v) => matchesCategoryChip(v, chip)).length
    if (n > 0) counts[chip.id] = n
  }
  return counts
}

export function filterByCategoryChip(
  vendors: PublicVendorListing[],
  categoryId: string | null
): PublicVendorListing[] {
  if (!categoryId) return vendors
  const chip = VENDOR_CATEGORY_CHIPS.find((c) => c.id === categoryId)
  if (!chip) return vendors
  return vendors.filter((v) => matchesCategoryChip(v, chip))
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ')
}

export function eventMatchesVendor(vendor: PublicVendorListing, event: PublicEventIndexItem): boolean {
  const vendorNorm = normalizeName(vendor.name)
  const titleNorm = normalizeName(event.title)
  const text = `${event.summary ?? ''} ${event.category} ${event.title}`.toLowerCase()
  if (text.includes(vendorNorm)) return true
  if (vendorNorm.split(' ').filter((w) => w.length > 3).some((w) => text.includes(w))) return true
  return false
}

export function attachVendorEvents(
  vendors: PublicVendorListing[],
  unifiedEvents: UnifiedEvent[]
): PublicVendorListing[] {
  const items = unifiedEvents.map(unifiedToIndexItem)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = items.filter((e) => new Date(e.endsAt) >= today)

  return vendors.map((vendor) => {
    const matched = upcoming.filter((e) => eventMatchesVendor(vendor, e))
    return {
      ...vendor,
      upcomingVendorEvents: matched.slice(0, 6),
    }
  })
}

export function locationDisplay(vendor: PublicVendorListing): string {
  if (vendor.onlineOnly && !vendor.city) return 'Online shop'
  if (vendor.city && vendor.state) return `${vendor.city}, ${vendor.state}`
  return vendor.locationLabel ?? 'Online'
}
