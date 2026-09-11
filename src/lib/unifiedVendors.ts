import type { SupabaseClient } from '@supabase/supabase-js'
import { getAllVendors } from '@/data/vendors'
import type { VendorRecord } from '@/lib/vendorFiltering'
import type { ParsedVendorDiscovery } from '@/lib/parseVendorDiscoverySlug'
import type { VendorSeoHubTagSlug } from '@/lib/vendorHubTagMap'
import { taxonomySlugsFromSeoHubTags, vendorMatchesHubTag } from '@/lib/vendorHubTagMap'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { resolveEntityHeroUrl } from '@/lib/kinkSocialEntityMedia'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { vendorOffsiteShopUrl } from '@/lib/vendorOutboundUrls'

export type UnifiedVendor = VendorRecord & {
  stateAbbr: string | null
  city: string | null
  onlineOnly: boolean
  lastSyncedAt?: string
}

/**
 * Best-effort parse of `location` strings like "Philadelphia, PA • USA", "Online", "Online • Etsy".
 */
export function parseVendorLocation(location: string | undefined): {
  stateAbbr: string | null
  city: string | null
  onlineOnly: boolean
} {
  if (!location || !location.trim()) {
    return { stateAbbr: null, city: null, onlineOnly: true }
  }
  const s = location.trim()
  const hasCommaState = /,\s*([A-Z]{2})\b/i.test(s)
  const commaState = s.match(/,\s*([A-Z]{2})\b/i)
  const abbr = commaState ? commaState[1].toUpperCase() : null

  let city: string | null = null
  if (s.includes(',')) {
    city = s.split(',')[0].trim() || null
    if (city && city.length > 60) city = `${city.slice(0, 57)}…`
  }

  const onlineOnly =
    /^online\b/i.test(s) || (!hasCommaState && /\bonline\b/i.test(s))

  return {
    stateAbbr: abbr,
    city,
    onlineOnly,
  }
}

function toUnified(v: VendorRecord): UnifiedVendor {
  const { stateAbbr, city, onlineOnly } = parseVendorLocation(v.location)
  return {
    ...v,
    stateAbbr,
    city,
    onlineOnly,
  }
}

/** Static catalog only (sync). */
export function getStaticUnifiedVendors(): UnifiedVendor[] {
  return getAllVendors().map(toUnified)
}

type DbVendorListing = {
  id?: string
  title?: string
  imageUrl?: string | null
  priceLabel?: string | null
  externalUrl?: string | null
  sourceSystem?: string | null
  sortOrder?: number
}

type DbVendorRow = {
  id: string
  slug: string
  name: string
  description: string | null
  website_url: string | null
  contact_email?: string | null
  city: string | null
  state: string | null
  online_only: boolean
  logo_url?: string | null
  cover_url?: string | null
  listings?: DbVendorListing[] | null
  seo_hub_tags?: string[] | null
  tag_slugs?: string[] | null
  kink_social_canonical_path?: string | null
  accepts_commissions?: boolean | null
  last_synced_at?: string | null
  meta_title: string | null
  meta_description: string | null
  short_description?: string | null
  c2k_source_id?: string | null
  c2k_source_type?: string | null
  organization_id?: string | null
  status?: string | null
  checkout_mode?: string | null
}

function asUnknownList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(value) as unknown
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function asStringList(value: unknown): string[] {
  return asUnknownList(value).filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
}

/** Dedupes without spreading a Set — tsconfig target is ES5 (TS2802). */
function uniqueStrings(values: string[]): string[] {
  const seen: Record<string, true> = {}
  const unique: string[] = []
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]
    if (!value || seen[value]) continue
    seen[value] = true
    unique.push(value)
  }
  return unique
}

function parseDbListings(raw: DbVendorListing[] | string | null | undefined): VendorRecord['listings'] {
  const items = asUnknownList(raw) as DbVendorListing[]
  if (items.length === 0) return undefined
  const listings: NonNullable<VendorRecord['listings']> = []
  for (const item of items) {
    const title = item.title?.trim()
    if (!title) continue
    const source = item.sourceSystem
    const sourceSystem =
      source === 'native' || source === 'etsy' || source === 'shopify' || source === 'woo' || source === 'manual'
        ? source
        : 'manual'
    listings.push({
      id: item.id?.trim() || `${title}-${listings.length}`,
      title,
      imageUrl: item.imageUrl ?? null,
      priceLabel: item.priceLabel ?? null,
      externalUrl: vendorOffsiteShopUrl(item.externalUrl) ?? null,
      sourceSystem,
      sortOrder: item.sortOrder ?? listings.length,
    })
  }
  return listings.length ? listings : undefined
}

export function dbRowToUnified(row: DbVendorRow, seoTagSlugs: string[]): UnifiedVendor {
  const stateAbbr = row.state ? String(row.state).toUpperCase().slice(0, 2) : null
  const city = row.city ? String(row.city) : null
  const onlineOnly = Boolean(row.online_only)
  const location = onlineOnly
    ? 'Online'
    : [city, stateAbbr].filter(Boolean).join(', ') || 'Online'

  const publishedHubTags = asStringList(row.seo_hub_tags)
  const hubTags = publishedHubTags.length ? publishedHubTags : seoTagSlugs
  const fromHubs = taxonomySlugsFromSeoHubTags(hubTags)
  const extras = asStringList(row.tag_slugs)
  const tagSlugs = uniqueStrings(fromHubs.concat(extras))

  const record: VendorRecord = {
    slug: row.slug,
    name: row.name,
    description: row.short_description || row.description || row.meta_description || undefined,
    story: row.description || undefined,
    websiteUrl: vendorOffsiteShopUrl(row.website_url),
    contactEmail: row.contact_email || undefined,
    location,
    tagSlugs,
    logo125Url: row.logo_url || undefined,
    coverUrl: row.cover_url || undefined,
    listings: parseDbListings(row.listings),
    acceptsCommissions: Boolean(row.accepts_commissions),
    kinkSocialCanonicalPath: row.kink_social_canonical_path ?? null,
    isPaid: false,
    c2kSourceId: row.c2k_source_id ?? null,
    c2kSourceType: row.c2k_source_type ?? null,
    organizationId: row.organization_id ?? null,
    status: row.status === 'draft' ? 'draft' : 'published',
    checkoutMode: row.checkout_mode === 'stripe' ? 'stripe' : 'offsite',
  }

  return {
    ...record,
    stateAbbr,
    city,
    onlineOnly,
    lastSyncedAt: row.last_synced_at ? String(row.last_synced_at).slice(0, 10) || undefined : undefined,
  }
}

async function enrichVendorHeroFromManifest(
  vendor: UnifiedVendor,
  client: SupabaseClient,
): Promise<UnifiedVendor> {
  try {
    const heroUrl = await resolveEntityHeroUrl(client, 'vendor', vendor.slug, vendor.logo125Url)
    if (!heroUrl || heroUrl === vendor.logo125Url) return vendor
    return { ...vendor, logo125Url: heroUrl }
  } catch {
    return vendor
  }
}

/**
 * Vendors from Supabase (fails soft if DB unavailable).
 * Expects `vendors`, `vendor_seo_tag_links`, `vendor_seo_tags` tables.
 */
export async function fetchPublishedSupabaseVendors(): Promise<UnifiedVendor[]> {
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    // C2K rows and org-owned published shops. Drafts stay out of the public catalog.
    let { data: vrows, error: vErr } = await client
      .from('vendors')
      .select(
        'id, slug, name, description, short_description, website_url, contact_email, city, state, online_only, logo_url, cover_url, listings, seo_hub_tags, tag_slugs, kink_social_canonical_path, accepts_commissions, last_synced_at, meta_title, meta_description, c2k_source_id, c2k_source_type, organization_id, status, checkout_mode',
      )
      .eq('status', 'published')
      .or('c2k_source_id.not.is.null,organization_id.not.is.null')
    if (vErr) {
      const fallback = await client
        .from('vendors')
        .select(
          'id, slug, name, description, website_url, city, state, online_only, logo_url, cover_url, listings, seo_hub_tags, tag_slugs, kink_social_canonical_path, accepts_commissions, last_synced_at, meta_title, meta_description, c2k_source_id, c2k_source_type',
        )
        .not('c2k_source_id', 'is', null)
      vrows = fallback.data as typeof vrows
      vErr = fallback.error
    }
    if (vErr || !vrows?.length) return []

    const rows = vrows as DbVendorRow[]
    const ids = rows.map((r) => r.id)

    const { data: productRows, error: productErr } = await client
      .from('vendor_products')
      .select('id, vendor_id, title, image_url, price_label, external_url, sort_order')
      .eq('status', 'published')
      .eq('public_safe', true)
      .in('vendor_id', ids)
    if (productErr) {
      console.error('[vendors] vendor_products query failed', productErr.message)
    }

    const listingsByVendor = new Map<string, NonNullable<VendorRecord['listings']>>()
    for (const item of productRows || []) {
      const row = item as {
        id: string
        vendor_id: string
        title: string
        image_url: string | null
        price_label: string | null
        external_url: string | null
        sort_order: number | null
      }
      if (!row.title?.trim()) continue
      const list = listingsByVendor.get(row.vendor_id) || []
      list.push({
        id: row.id,
        title: row.title.trim(),
        imageUrl: row.image_url,
        priceLabel: row.price_label,
        externalUrl: row.external_url,
        sourceSystem: 'manual',
        sortOrder: row.sort_order ?? list.length,
      })
      listingsByVendor.set(row.vendor_id, list)
    }

    const { data: linkRows } = await client
      .from('vendor_seo_tag_links')
      .select('vendor_id, tag_id')
      .in('vendor_id', ids)

    const { data: tagRows } = await client.from('vendor_seo_tags').select('id, slug')
    const tagSlugById = new Map((tagRows || []).map((t: { id: string; slug: string }) => [t.id, t.slug]))

    const seoTagsByVendor = new Map<string, string[]>()
    for (const l of linkRows || []) {
      const row = l as { vendor_id: string; tag_id: string }
      const slug = tagSlugById.get(row.tag_id)
      if (!slug) continue
      const arr = seoTagsByVendor.get(row.vendor_id) || []
      arr.push(slug)
      seoTagsByVendor.set(row.vendor_id, arr)
    }

    return rows.map((row) => {
      const unified = dbRowToUnified(row, seoTagsByVendor.get(row.id) || [])
      const fromProducts = listingsByVendor.get(row.id)
      if (!fromProducts?.length) return unified
      return { ...unified, listings: fromProducts }
    })
  } catch {
    return []
  }
}

function overlayStaticPaidAssets(remote: UnifiedVendor, staticV: UnifiedVendor | undefined): UnifiedVendor {
  if (!staticV) return remote
  return {
    ...remote,
    isPaid: Boolean(staticV.isPaid) || Boolean(remote.isPaid),
    logo125Url: remote.logo125Url ?? staticV.logo125Url,
    coverUrl: remote.coverUrl ?? staticV.coverUrl,
    productImage125ByTagSlug:
      remote.productImage125ByTagSlug ?? staticV.productImage125ByTagSlug,
    listings: remote.listings?.length ? remote.listings : staticV.listings,
    tagSlugs: remote.tagSlugs.length ? remote.tagSlugs : staticV.tagSlugs,
    story: remote.story || staticV.story,
    description: remote.description || staticV.description,
    websiteUrl: vendorOffsiteShopUrl(remote.websiteUrl, staticV.websiteUrl),
    dungeonListingSlug: remote.dungeonListingSlug ?? staticV.dungeonListingSlug,
  }
}

/**
 * Static + Supabase vendors.
 * kink.social rows with `c2k_source_id` win on the same slug (same rule as events).
 * Set `UNIFIED_VENDORS_PREFER_DB=true` so any DB row overrides static.
 * When DB wins, static `isPaid` and local assets still overlay so sponsors keep badges/images.
 */
export async function getUnifiedVendors(): Promise<UnifiedVendor[]> {
  const preferDb = process.env.UNIFIED_VENDORS_PREFER_DB === 'true'
  const staticUnified = getStaticUnifiedVendors()
  const remote = await fetchPublishedSupabaseVendors()
  const bySlug = new Map<string, UnifiedVendor>()
  const staticBySlug = new Map(staticUnified.map((v) => [v.slug, v]))

  if (preferDb) {
    for (const v of staticUnified) bySlug.set(v.slug, v)
    for (const v of remote) {
      bySlug.set(v.slug, overlayStaticPaidAssets(v, staticBySlug.get(v.slug)))
    }
  } else {
    for (const v of staticUnified) bySlug.set(v.slug, v)
    for (const v of remote) {
      const existing = bySlug.get(v.slug)
      if (v.c2kSourceId) {
        bySlug.set(v.slug, overlayStaticPaidAssets(v, staticBySlug.get(v.slug)))
      } else if (!existing) {
        bySlug.set(v.slug, v)
      }
    }
  }

  const merged = Array.from(bySlug.values())
  const client = getSupabaseServerClient()
  if (!client) return merged
  return Promise.all(merged.map((v) => enrichVendorHeroFromManifest(v, client)))
}

/** Resolve a vendor for `/vendors/[slug]` including DB-only listings. */
export async function resolveVendorBySlug(slug: string): Promise<VendorRecord | null> {
  const all = await getUnifiedVendors()
  return all.find((v) => v.slug === slug) ?? null
}

export type VendorHubFilter = {
  stateSlug?: StateSlug
  seoTagSlug?: VendorSeoHubTagSlug
  onlineOnly?: boolean
}

export function vendorHubFilterFromParsed(
  parsed: Extract<ParsedVendorDiscovery, { kind: 'hub' }>
): VendorHubFilter {
  switch (parsed.variant) {
    case 'online':
      return { onlineOnly: true }
    case 'state':
      return { stateSlug: parsed.stateSlug }
    case 'tag':
      return { seoTagSlug: parsed.seoTagSlug }
    case 'stateTag':
      return { stateSlug: parsed.stateSlug, seoTagSlug: parsed.seoTagSlug }
  }
}

/** Max online-only vendors (not tied to the hub state) mixed into state / state+tag hubs. */
const ONLINE_VENDORS_SAMPLE_CAP = 5

function sampleAtMost<T>(items: T[], max: number): T[] {
  if (items.length <= max) return [...items]
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, max)
}

/**
 * State hubs used to include every `onlineOnly` vendor nationwide. We keep all in-state rows
 * and cap ship-everywhere online vendors so each region surfaces a small rotating sample.
 */
export function filterVendorsForHub(
  vendors: UnifiedVendor[],
  filter: VendorHubFilter
): UnifiedVendor[] {
  let list = vendors

  if (filter.onlineOnly === true) {
    list = list.filter((v) => v.onlineOnly)
    return list
  }

  if (filter.stateSlug) {
    const abbr = EAST_COAST_STATES[filter.stateSlug].abbr
    const inState = list.filter((v) => v.stateAbbr === abbr)
    const onlineNotInState = list.filter((v) => v.onlineOnly && v.stateAbbr !== abbr)
    list = [...inState, ...sampleAtMost(onlineNotInState, ONLINE_VENDORS_SAMPLE_CAP)]
  }

  if (filter.seoTagSlug) {
    const hub = filter.seoTagSlug
    list = list.filter((v) => vendorMatchesHubTag(v.tagSlugs || [], hub))
  }

  return list
}
