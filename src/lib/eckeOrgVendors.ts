import { z } from 'zod'
import { getAllVendors } from '@/data/vendors'
import { requireOrgApiSession } from '@/lib/eckeOrgEvents'
import {
  RESERVED_VENDOR_SLUGS,
  buildShopSeoDescription,
  buildShopSeoKeywords,
  buildShopSeoTitle,
  normalizeAppearanceEventSlugs,
  normalizeShopHubTags,
  slugifyShopSlug,
  type ManagedShopProduct,
  type ManagedShopRow,
  type OrgShopInput,
  type OrgShopProductInput,
} from '@/lib/eckeOrgVendorShared'
import { notifyVendorDiscovery } from '@/lib/eckeVendorDiscovery'
import { taxonomySlugsFromSeoHubTags } from '@/lib/vendorHubTagMap'
import type { VendorRecord } from '@/lib/vendorFiltering'
import type { UnifiedVendor } from '@/lib/unifiedVendors'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export { requireOrgApiSession }
export type { ManagedShopProduct, ManagedShopRow, OrgShopInput, OrgShopProductInput }

export const MANAGED_SHOP_SELECT = [
  'id',
  'slug',
  'name',
  'description',
  'short_description',
  'website_url',
  'contact_email',
  'city',
  'state',
  'online_only',
  'logo_url',
  'cover_url',
  'seo_hub_tags',
  'tag_slugs',
  'accepts_commissions',
  'commission_info',
  'appearance_event_slugs',
  'status',
  'checkout_mode',
  'organization_id',
  'published_at',
  'updated_at',
].join(', ')

export const MANAGED_PRODUCT_SELECT = [
  'id',
  'vendor_id',
  'organization_id',
  'title',
  'description',
  'image_url',
  'price_label',
  'category',
  'checkout_mode',
  'external_url',
  'status',
  'public_safe',
  'sort_order',
  'created_at',
  'updated_at',
].join(', ')

function optionalUrl(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export const orgShopSchema = z
  .object({
    name: z.string().min(3).max(120),
    slug: z.string().max(80).optional().or(z.literal('')),
    shortDescription: z.string().min(10).max(280),
    story: z.string().min(10).max(20000),
    website: z.string().max(500).optional().or(z.literal('')),
    contactEmail: z.string().email('Enter a contact email shoppers can write to'),
    isOnline: z.boolean().optional(),
    city: z.string().max(80).optional().or(z.literal('')),
    state: z.string().max(2).optional().or(z.literal('')),
    acceptsCommissions: z.boolean().optional(),
    commissionInfo: z.string().max(500).optional().or(z.literal('')),
    appearanceEventSlugs: z.array(z.string().max(80)).max(24).optional(),
    hubTags: z.array(z.string().max(40)).max(7).optional(),
    checkoutMode: z.enum(['offsite', 'stripe']).optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.isOnline) {
      if (!value.city?.trim()) ctx.addIssue({ code: 'custom', path: ['city'], message: 'City is required' })
      if (!value.state?.trim() || value.state.trim().length !== 2) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'State is required' })
      }
    }
  })

export const orgShopProductSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal('')),
  imageUrl: z.string().max(800).optional().or(z.literal('')),
  priceLabel: z.string().max(40).optional().or(z.literal('')),
  category: z.string().max(60).optional().or(z.literal('')),
  externalUrl: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['published', 'hidden']).optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
})

export async function requireOwnedShop() {
  const gated = await requireOrgApiSession()
  if (gated.error || !gated.session || !gated.admin) return { ...gated, shop: null }
  const { data } = await gated.admin
    .from('vendors')
    .select(MANAGED_SHOP_SELECT)
    .eq('organization_id', gated.session.organization.id)
    .maybeSingle()
  return { ...gated, shop: (data as ManagedShopRow | null) || null }
}

export async function takeRequestedVendorSlug(raw: string, excludeId?: string) {
  const root = slugifyShopSlug(raw)
  if (root.length < 3) return { error: 'Slug needs at least 3 letters or numbers' }
  if (RESERVED_VENDOR_SLUGS.has(root)) return { error: 'That URL is reserved. Try another slug.' }
  const staticHit = getAllVendors().some((vendor: { slug?: string }) => vendor.slug === root)
  if (staticHit) return { error: 'That URL is already in use. Choose another slug.' }
  const admin = getSupabaseAdminClient()
  if (!admin) return { slug: root }
  let query = admin.from('vendors').select('id').eq('slug', root)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query.maybeSingle()
  if (data) return { error: 'That URL is already in use. Choose another slug.' }
  return { slug: root }
}

export async function uniqueVendorSlug(name: string, excludeId?: string) {
  const root = slugifyShopSlug(name) || 'shop'
  const safeRoot = RESERVED_VENDOR_SLUGS.has(root) ? `${root}-shop` : root
  const resolved = await takeRequestedVendorSlug(safeRoot, excludeId)
  if (!('error' in resolved)) return resolved.slug
  for (let i = 2; i < 10; i += 1) {
    const next = await takeRequestedVendorSlug(`${safeRoot}-${i}`, excludeId)
    if (!('error' in next)) return next.slug
  }
  return `${safeRoot}-${Date.now().toString(36)}`
}

export function shopWritePayload(input: OrgShopInput, orgId: string, slug: string) {
  const online = Boolean(input.isOnline)
  const status = input.status === 'draft' ? 'draft' : 'published'
  const hubTags = normalizeShopHubTags(input.hubTags)
  const appearanceEventSlugs = normalizeAppearanceEventSlugs(input.appearanceEventSlugs)
  const seoTitle = buildShopSeoTitle({
    name: input.name.trim(),
    city: input.city,
    state: input.state,
    isOnline: online,
  })
  const seoDescription = buildShopSeoDescription(input.shortDescription)
  return {
    name: input.name.trim(),
    slug,
    description: input.story.trim(),
    short_description: input.shortDescription.trim(),
    website_url: optionalUrl(input.website) ?? null,
    contact_email: (input.contactEmail || '').trim().toLowerCase(),
    online_only: online,
    city: online ? null : input.city!.trim(),
    state: online ? null : input.state!.trim().toUpperCase(),
    seo_hub_tags: hubTags,
    tag_slugs: taxonomySlugsFromSeoHubTags(hubTags),
    accepts_commissions: Boolean(input.acceptsCommissions),
    commission_info: Boolean(input.acceptsCommissions)
      ? (input.commissionInfo || '').trim() || null
      : null,
    appearance_event_slugs: appearanceEventSlugs,
    checkout_mode: 'offsite' as const,
    organization_id: orgId,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
    meta_title: seoTitle,
    meta_description: seoDescription,
    source_attribution: 'ecke-org',
  }
}

export function productWritePayload(input: OrgShopProductInput, vendorId: string, orgId: string, sortOrder: number) {
  return {
    vendor_id: vendorId,
    organization_id: orgId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    image_url: optionalUrl(input.imageUrl) ?? null,
    price_label: input.priceLabel?.trim() || null,
    category: input.category?.trim() || null,
    checkout_mode: 'offsite' as const,
    external_url: optionalUrl(input.externalUrl) ?? null,
    status: input.status === 'hidden' ? 'hidden' : 'published',
    public_safe: true,
    sort_order: input.sortOrder ?? sortOrder,
    updated_at: new Date().toISOString(),
  }
}

export async function listShopProducts(vendorId: string): Promise<ManagedShopProduct[]> {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data } = await admin
    .from('vendor_products')
    .select(MANAGED_PRODUCT_SELECT)
    .eq('vendor_id', vendorId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  return (data as unknown as ManagedShopProduct[] | null) || []
}

export async function syncVendorListingsMirror(vendorId: string) {
  const admin = getSupabaseAdminClient()
  if (!admin) return
  const products = await listShopProducts(vendorId)
  const listings = products
    .filter((product) => product.status === 'published' && product.public_safe)
    .map((product, index) => ({
      id: product.id,
      title: product.title,
      imageUrl: product.image_url,
      priceLabel: product.price_label,
      externalUrl: product.external_url,
      sourceSystem: 'manual',
      sortOrder: product.sort_order ?? index,
    }))
  await admin.from('vendors').update({ listings }).eq('id', vendorId)
}

export function notifyShopIndex(
  shop: Pick<ManagedShopRow, 'slug' | 'state' | 'seo_hub_tags' | 'online_only'>,
  reason: 'publish' | 'update' | 'unpublish' | 'archive' | 'delete' = 'publish',
) {
  notifyVendorDiscovery({
    slug: shop.slug,
    stateAbbr: shop.state,
    seoHubTags: shop.seo_hub_tags || [],
    onlineOnly: shop.online_only,
    reason,
  })
}

export function shopToUnified(shop: ManagedShopRow, products: ManagedShopProduct[]): UnifiedVendor {
  const published = products.filter((product) => product.status === 'published' && product.public_safe)
  const onlineOnly = Boolean(shop.online_only)
  const stateAbbr = shop.state ? String(shop.state).toUpperCase().slice(0, 2) : null
  const city = shop.city ? String(shop.city) : null
  const location = onlineOnly ? 'Online' : [city, stateAbbr].filter(Boolean).join(', ') || 'Online'
  const record: VendorRecord = {
    slug: shop.slug,
    name: shop.name,
    description: shop.short_description || shop.description || undefined,
    story: shop.description || undefined,
    websiteUrl: shop.website_url || undefined,
    contactEmail: shop.contact_email || undefined,
    location,
    tagSlugs: shop.tag_slugs || taxonomySlugsFromSeoHubTags(shop.seo_hub_tags || []),
    logo125Url: shop.logo_url || undefined,
    coverUrl: shop.cover_url || undefined,
    listings: published.map((product, index) => ({
      id: product.id,
      title: product.title,
      imageUrl: product.image_url,
      priceLabel: product.price_label,
      externalUrl: product.external_url,
      sourceSystem: 'manual',
      sortOrder: product.sort_order ?? index,
    })),
    acceptsCommissions: Boolean(shop.accepts_commissions),
    commissionInfo: shop.commission_info?.trim() || undefined,
    appearanceEventSlugs: shop.appearance_event_slugs || [],
    organizationId: shop.organization_id,
    status: shop.status,
    checkoutMode: shop.checkout_mode,
    isPaid: false,
    c2kSourceId: null,
    c2kSourceType: null,
  }
  return {
    ...record,
    stateAbbr,
    city,
    onlineOnly,
    lastSyncedAt: shop.updated_at ? String(shop.updated_at).slice(0, 10) : undefined,
  }
}

export async function fetchOwnedShopAsUnified(slug: string, organizationId: string): Promise<UnifiedVendor | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from('vendors')
    .select(MANAGED_SHOP_SELECT)
    .eq('slug', slug)
    .eq('organization_id', organizationId)
    .maybeSingle()
  if (!data) return null
  const shop = data as unknown as ManagedShopRow
  const products = await listShopProducts(shop.id)
  return shopToUnified(shop, products)
}
