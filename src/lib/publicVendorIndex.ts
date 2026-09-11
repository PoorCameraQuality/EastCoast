import type { VendorTag } from '@/data/vendorTaxonomy'
import { unifiedToIndexItem } from '@/lib/publicEventIndex'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type { VendorRecord } from '@/lib/vendorFiltering'
import { getVendorPaidImage125Url, getVendorCardPreviewText } from '@/lib/vendorFiltering'
import { parseVendorLocation, type UnifiedVendor } from '@/lib/unifiedVendors'
import { buildKinkSocialUrl, kinkSocialVendorShopPath } from '@/lib/kinkSocialMarketing'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'
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

function toMirroredProductSource(
  value: string | null | undefined,
): NonNullable<PublicVendorProduct['sourceSystem']> {
  switch (value) {
    case 'native':
    case 'etsy':
    case 'shopify':
    case 'woo':
    case 'manual':
      return value
    default:
      return 'manual'
  }
}

function productsFromMirroredListings(vendor: VendorRecord): PublicVendorProduct[] {
  const mirrored = vendor.listings
  if (!mirrored?.length) return []
  const products: PublicVendorProduct[] = mirrored.map((listing, index) => {
    const media =
      listing.media?.map((item, mediaIndex) => ({
        id: item.id || `${listing.id}-media-${mediaIndex}`,
        url: item.url,
        kind: (item.kind === 'video' ? 'video' : 'image') as 'image' | 'video',
        sortOrder: item.sortOrder ?? mediaIndex,
      })) ||
      (listing.imageUrl
        ? [{ id: `${listing.id}-cover`, url: listing.imageUrl, kind: 'image' as const, sortOrder: 0 }]
        : [])
    return {
      id: listing.id || `${vendor.slug}-listing-${index}`,
      title: listing.title,
      description: listing.description || undefined,
      imageUrl: listing.imageUrl || media.find((m) => m.kind === 'image')?.url || undefined,
      media: media.length ? media : undefined,
      priceLabel: listing.priceLabel || undefined,
      category: listing.category || undefined,
      externalUrl: vendorOffsiteShopUrl(listing.externalUrl),
      sourceSystem: toMirroredProductSource(listing.sourceSystem),
      publicSafe: true,
      sortOrder: listing.sortOrder ?? index,
    }
  })
  return products.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
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
      externalUrl: vendorOffsiteShopUrl(vendor.websiteUrl),
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
      externalUrl: vendorOffsiteShopUrl(vendor.websiteUrl),
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

/** Path-only `/vendors/{slug}` from C2K publish. Reject hosts, query strings, and extra segments. */
function safeKinkSocialVendorPath(path: string | null | undefined): string | null {
  const trimmed = path?.trim()
  if (!trimmed || !trimmed.startsWith('/vendors/')) return null
  if (trimmed.includes('://') || trimmed.includes('?') || trimmed.includes('\\')) return null
  const slug = trimmed.slice('/vendors/'.length)
  if (!slug || slug.includes('/') || slug.includes('..')) return null
  return `/vendors/${slug}`
}

function kinkSocialVendorUrlFor(vendor: UnifiedVendor): string | undefined {
  const path = safeKinkSocialVendorPath(vendor.kinkSocialCanonicalPath) ?? (
    vendor.c2kSourceId ? kinkSocialVendorShopPath(vendor.slug) : null
  )
  if (!path) return undefined
  return buildKinkSocialUrl(path, 'vendor_page', {
    ref: 'ecke_vendor',
    ecke_vendor: vendor.slug,
  })
}

export function vendorToListing(
  vendor: UnifiedVendor,
  tagsBySlug: Record<string, VendorTag>
): PublicVendorListing {
  const { stateAbbr, city, onlineOnly } = parseVendorLocation(vendor.location)
  const mirroredProducts = productsFromMirroredListings(vendor)
  const featuredProducts =
    mirroredProducts.length > 0 ? mirroredProducts : productsFromVendor(vendor, tagsBySlug)
  const coverImageUrl =
    vendor.coverUrl ??
    featuredProducts[0]?.imageUrl ??
    getVendorPaidImage125Url({ vendor, selectedTagSlugs: vendor.tagSlugs }) ??
    undefined

  const craftTags = vendor.tagSlugs
    .map((s) => tagsBySlug[s]?.name)
    .filter(Boolean)
    .slice(0, 4) as string[]

  const acceptsCommissions =
    Boolean(vendor.acceptsCommissions) ||
    vendor.tagSlugs.includes('custom-commission-vendor') ||
    vendor.tagSlugs.includes('custom-orders-available')

  // Prefer the editable short description; fall back to a truncated story.
  const shortSummary =
    (vendor.description || '').trim() ||
    getVendorCardPreviewText({ vendor, maxSentences: 2 }) ||
    undefined

  const fromKinkSocial = Boolean(vendor.c2kSourceId)
  const kinkSocialVendorUrl = kinkSocialVendorUrlFor(vendor)
  const offsiteShopUrl = vendorOffsiteShopUrl(vendor.websiteUrl)
  const commissionInfo = acceptsCommissions
    ? (vendor.commissionInfo || '').trim() ||
      'Custom commissions available — confirm details on the vendor site.'
    : undefined

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
    shopUrl: offsiteShopUrl,
    websiteUrl: offsiteShopUrl,
    contactEmail: vendor.contactEmail,
    publicContactUrl: vendor.publicContactUrl || undefined,
    publicContactLabel: vendor.publicContactLabel || undefined,
    contactUrl: vendor.publicContactUrl || undefined,
    acceptsCommissions,
    commissionInfo,
    appearanceEventSlugs: vendor.appearanceEventSlugs?.length
      ? [...vendor.appearanceEventSlugs]
      : undefined,
    supporterTier: vendor.isPaid ? 'supporter' : 'none',
    dungeonListingSlug: vendor.dungeonListingSlug,
    kinkSocialVendorUrl,
    followUrl: fromKinkSocial ? kinkSocialVendorUrl : undefined,
    sourceSystem: fromKinkSocial ? 'kink_social' : 'ecke',
    organizationId: vendor.organizationId || undefined,
    lastSyncedAt: vendor.lastSyncedAt,
    status: vendor.status === 'draft' ? 'draft' : 'published',
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
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * Legacy curated listings only: require the full vendor name in the event title.
 * Do not match on generic tokens like "leather" — that falsely attached HOLO Leather
 * to every leather-titled night.
 */
export function eventMatchesVendor(vendor: PublicVendorListing, event: PublicEventIndexItem): boolean {
  const vendorNorm = normalizeName(vendor.name)
  if (vendorNorm.length < 4) return false
  return normalizeName(event.title).includes(vendorNorm)
}

export function eventIsVendorAppearance(
  vendor: PublicVendorListing,
  event: PublicEventIndexItem & { organizationId?: string | null },
  eventOrganizationId?: string | null
): boolean {
  const orgId = eventOrganizationId ?? event.organizationId ?? null
  if (vendor.organizationId && orgId && vendor.organizationId === orgId) return true
  const linked = vendor.appearanceEventSlugs
  if (linked?.length && linked.includes(event.slug)) return true
  // Org-managed shops only show owned + explicitly linked appearances.
  if (vendor.organizationId) return false
  return eventMatchesVendor(vendor, event)
}

export function attachVendorEvents(
  vendors: PublicVendorListing[],
  unifiedEvents: UnifiedEvent[]
): PublicVendorListing[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcoming = unifiedEvents
    .filter((e) => new Date(e.date.end) >= today)
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())

  return vendors.map((vendor) => {
    const matched = upcoming
      .filter((e) =>
        eventIsVendorAppearance(vendor, unifiedToIndexItem(e), e.organizationId ?? null)
      )
      .map(unifiedToIndexItem)
      .slice(0, 12)
    return {
      ...vendor,
      upcomingVendorEvents: matched,
    }
  })
}

export function locationDisplay(vendor: PublicVendorListing): string {
  if (vendor.onlineOnly && !vendor.city) return 'Online shop'
  if (vendor.city && vendor.state) return `${vendor.city}, ${vendor.state}`
  return vendor.locationLabel ?? 'Online'
}
