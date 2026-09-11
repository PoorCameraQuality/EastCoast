import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { slugifyEventSlug } from '@/lib/eckeOrgEventShared'
import {
  VENDOR_SEO_HUB_LABELS,
  VENDOR_SEO_HUB_TAG_SLUGS,
  type VendorSeoHubTagSlug,
} from '@/lib/vendorHubTagMap'

export { slugifyEventSlug as slugifyShopSlug }
export { US_STATE_ABBR_OPTIONS, CANADA_STATE_ABBR_OPTIONS } from '@/lib/eckeOrgEventShared'
export { VENDOR_SEO_HUB_TAG_SLUGS, VENDOR_SEO_HUB_LABELS } from '@/lib/vendorHubTagMap'

export const SHOP_HUB_TAG_OPTIONS = VENDOR_SEO_HUB_TAG_SLUGS.map((slug) => ({
  slug,
  label: slug.charAt(0).toUpperCase() + slug.slice(1),
  hint: VENDOR_SEO_HUB_LABELS[slug],
}))

export const RESERVED_VENDOR_SLUGS = new Set<string>([
  'login',
  'my-shop',
  'create',
  'page',
  'online',
  ...Object.keys(EAST_COAST_STATES),
  ...VENDOR_SEO_HUB_TAG_SLUGS,
])

export type ShopCheckoutMode = 'offsite' | 'stripe'
export type ShopStatus = 'draft' | 'published'
export type ShopProductStatus = 'published' | 'hidden'
export type ShopProductMediaKind = 'image' | 'video'

export const MAX_PRODUCT_MEDIA = 12

export type ShopProductMediaItem = {
  id: string
  url: string
  kind: ShopProductMediaKind
  sortOrder: number
}

export type OrgShopInput = {
  name: string
  slug?: string
  shortDescription: string
  story: string
  website?: string
  contactEmail?: string
  publicContactUrl?: string
  publicContactLabel?: string
  isOnline?: boolean
  city?: string
  state?: string
  acceptsCommissions?: boolean
  commissionInfo?: string
  appearanceEventSlugs?: string[]
  hubTags?: string[]
  checkoutMode?: ShopCheckoutMode
  status?: ShopStatus
}

export type OrgShopProductInput = {
  title: string
  description?: string
  imageUrl?: string
  priceLabel?: string
  category?: string
  externalUrl?: string
  status?: ShopProductStatus
  sortOrder?: number
}

export type ManagedShopProduct = {
  id: string
  vendor_id: string
  organization_id: string | null
  title: string
  description: string | null
  image_url: string | null
  media: ShopProductMediaItem[] | null
  price_label: string | null
  category: string | null
  checkout_mode: ShopCheckoutMode
  external_url: string | null
  status: ShopProductStatus
  public_safe: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type ManagedShopRow = {
  id: string
  slug: string
  name: string
  description: string | null
  short_description: string | null
  website_url: string | null
  contact_email: string | null
  public_contact_url: string | null
  public_contact_label: string | null
  city: string | null
  state: string | null
  online_only: boolean
  logo_url: string | null
  cover_url: string | null
  seo_hub_tags: string[] | null
  tag_slugs: string[] | null
  accepts_commissions: boolean
  commission_info: string | null
  appearance_event_slugs: string[] | null
  status: ShopStatus
  checkout_mode: ShopCheckoutMode
  organization_id: string | null
  published_at: string | null
  updated_at: string | null
}

export function normalizeShopProductMedia(
  raw: unknown,
  coverImageUrl?: string | null,
): ShopProductMediaItem[] {
  const items: ShopProductMediaItem[] = []
  if (Array.isArray(raw)) {
    for (let i = 0; i < raw.length; i += 1) {
      const row = raw[i] as Partial<ShopProductMediaItem> | null
      const url = typeof row?.url === 'string' ? row.url.trim() : ''
      if (!url) continue
      const kind = row?.kind === 'video' ? 'video' : 'image'
      items.push({
        id: typeof row?.id === 'string' && row.id ? row.id : `media-${i}`,
        url,
        kind,
        sortOrder: typeof row?.sortOrder === 'number' ? row.sortOrder : i,
      })
    }
  }
  items.sort((a, b) => a.sortOrder - b.sortOrder)
  if (items.length === 0 && coverImageUrl?.trim()) {
    return [{ id: 'cover', url: coverImageUrl.trim(), kind: 'image', sortOrder: 0 }]
  }
  return items.slice(0, MAX_PRODUCT_MEDIA).map((item, index) => ({ ...item, sortOrder: index }))
}

export function coverImageFromMedia(media: ShopProductMediaItem[], fallback?: string | null): string | null {
  const firstImage = media.find((item) => item.kind === 'image')
  return firstImage?.url || fallback || null
}

export function isShopHubTag(value: string): value is VendorSeoHubTagSlug {
  return (VENDOR_SEO_HUB_TAG_SLUGS as readonly string[]).includes(value)
}

export function normalizeShopHubTags(values: string[] | undefined): VendorSeoHubTagSlug[] {
  const seen = new Set<VendorSeoHubTagSlug>()
  for (const raw of values || []) {
    const slug = String(raw || '').trim().toLowerCase()
    if (isShopHubTag(slug)) seen.add(slug)
  }
  return Array.from(seen)
}

export function buildShopSeoKeywords(input: {
  name: string
  city?: string
  state?: string
  isOnline?: boolean
  hubTags?: string[]
}): string[] {
  const city = input.isOnline ? 'Online' : input.city?.trim()
  const state = input.isOnline ? undefined : input.state?.trim().toUpperCase()
  const seen = new Set<string>()
  const terms: string[] = []
  for (const raw of [
    input.name.trim(),
    city,
    state,
    ...(input.hubTags || []),
    'kink vendor',
    'BDSM shop',
  ]) {
    const term = raw?.trim()
    if (!term) continue
    const key = term.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(term)
  }
  return terms
}

export function buildShopSeoTitle(input: {
  name: string
  city?: string
  state?: string
  isOnline?: boolean
}): string {
  const city = input.isOnline ? 'Online' : input.city?.trim()
  const state = input.isOnline ? undefined : input.state?.trim().toUpperCase()
  const location = city && state ? ` — ${city}, ${state}` : city ? ` — ${city}` : ''
  let title = `${input.name.trim()}${location}`
  if (title.length > 60) title = input.name.trim()
  return title.slice(0, 60)
}

export function buildShopSeoDescription(shortDescription: string): string {
  return shortDescription.trim().slice(0, 160)
}

export function vendorContactMailto(email: string, shopName: string): string {
  const subject = encodeURIComponent(`Question for ${shopName} (via East Coast Kink Events)`)
  return `mailto:${email}?subject=${subject}`
}

export function normalizeAppearanceEventSlugs(values: string[] | undefined): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of values || []) {
    const slug = slugifyEventSlug(String(raw || ''))
    if (slug.length < 3 || seen.has(slug)) continue
    seen.add(slug)
    out.push(slug)
    if (out.length >= 24) break
  }
  return out
}

export function managedShopToFormValues(shop: ManagedShopRow): OrgShopInput {
  return {
    name: shop.name,
    slug: shop.slug,
    shortDescription: shop.short_description || '',
    story: shop.description || '',
    website: shop.website_url || '',
    contactEmail: shop.contact_email || '',
    publicContactUrl: shop.public_contact_url || '',
    publicContactLabel: shop.public_contact_label || '',
    isOnline: shop.online_only,
    city: shop.online_only ? '' : shop.city || '',
    state: shop.online_only ? '' : shop.state || '',
    acceptsCommissions: shop.accepts_commissions,
    commissionInfo: shop.commission_info || '',
    appearanceEventSlugs: normalizeAppearanceEventSlugs(shop.appearance_event_slugs || []),
    hubTags: normalizeShopHubTags(shop.seo_hub_tags || []),
    checkoutMode: 'offsite',
    status: shop.status === 'draft' ? 'draft' : 'published',
  }
}
