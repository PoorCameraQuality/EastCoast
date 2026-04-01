import { getAllVendors } from '@/data/vendors'
import type { VendorRecord } from '@/lib/vendorFiltering'
import type { ParsedVendorDiscovery } from '@/lib/parseVendorDiscoverySlug'
import type { VendorSeoHubTagSlug } from '@/lib/vendorHubTagMap'
import { taxonomySlugsFromSeoHubTags, vendorMatchesHubTag } from '@/lib/vendorHubTagMap'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { getSupabaseClient } from '@/lib/supabase'

export type UnifiedVendor = VendorRecord & {
  stateAbbr: string | null
  city: string | null
  onlineOnly: boolean
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

type DbVendorRow = {
  id: string
  slug: string
  name: string
  description: string | null
  website_url: string | null
  city: string | null
  state: string | null
  online_only: boolean
  meta_title: string | null
  meta_description: string | null
}

function dbRowToUnified(row: DbVendorRow, seoTagSlugs: string[]): UnifiedVendor {
  const stateAbbr = row.state ? String(row.state).toUpperCase().slice(0, 2) : null
  const city = row.city ? String(row.city) : null
  const onlineOnly = Boolean(row.online_only)
  const location = onlineOnly
    ? 'Online'
    : [city, stateAbbr].filter(Boolean).join(', ') || 'Online'

  const tagSlugs = taxonomySlugsFromSeoHubTags(seoTagSlugs)

  const record: VendorRecord = {
    slug: row.slug,
    name: row.name,
    description: row.description || row.meta_description || undefined,
    story: row.description || undefined,
    websiteUrl: row.website_url || undefined,
    location,
    tagSlugs,
    logo125Url: undefined,
    isPaid: false,
  }

  return {
    ...record,
    stateAbbr,
    city,
    onlineOnly,
  }
}

/**
 * Vendors from Supabase (fails soft if DB unavailable).
 * Expects `vendors`, `vendor_seo_tag_links`, `vendor_seo_tags` tables.
 */
export async function fetchPublishedSupabaseVendors(): Promise<UnifiedVendor[]> {
  const client = getSupabaseClient()
  if (!client) return []
  try {
    const { data: vrows, error: vErr } = await client.from('vendors').select('*')
    if (vErr || !vrows?.length) return []

    const rows = vrows as DbVendorRow[]
    const ids = rows.map((r) => r.id)

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

    return rows.map((row) => dbRowToUnified(row, seoTagsByVendor.get(row.id) || []))
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
    productImage125ByTagSlug:
      remote.productImage125ByTagSlug ?? staticV.productImage125ByTagSlug,
    story: remote.story || staticV.story,
    description: remote.description || staticV.description,
  }
}

/**
 * Static + Supabase vendors.
 * Default: static wins on duplicate slug (same as events).
 * Set `UNIFIED_VENDORS_PREFER_DB=true` so DB rows override static for the same slug.
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
      if (!bySlug.has(v.slug)) bySlug.set(v.slug, v)
    }
  }

  return Array.from(bySlug.values())
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
