import { listingCopyToPlainText } from './eckeOrgRichText'
import type { UnifiedDungeon } from './unifiedDungeons'
import type { KinkSocialListingRecord } from './unifiedExtendedListings'
import type { UnifiedEvent } from './unifiedEvents'

const SKIPPED_SLUGS = new Set([
  'harbor-dungeon-test',
  'calendar-forge-playhouse',
  'preview-c2k-weekend',
])

const TEST_SLUG_RE = /(?:^|-)test$/

export type CatalogListingRecord = KinkSocialListingRecord & {
  relatedHref?: string | null
  relatedLabel?: string | null
}

export type CatalogDungeonInput = {
  slug: string
  name: string
  excerpt?: string
  description?: { long?: string } | string
  location?: { city?: string; state?: string }
  logo?: string
  coverUrl?: string
  images?: string[]
  website?: string
  c2kSourceId?: string | null
}

export type CatalogConventionInput = {
  slug: string
  name: string
  excerpt?: string
  location?: { city?: string; state?: string }
  logo?: string
  organizer?: string
  orgSlug?: string | null
  c2kSourceId?: string | null
  lastSyncedAt?: string
}

const TRAILING_YEAR_RE = /-\d{4}$/

/** `grand-strand-affair-2026` → `grand-strand-affair`. */
export function stripCatalogYearSuffix(slug: string): string {
  return slug.trim().toLowerCase().replace(TRAILING_YEAR_RE, '')
}

export function catalogRowMatchesSlug(
  row: Pick<CatalogListingRecord, 'slug' | 'orgSlug'>,
  slug: string,
): boolean {
  const normalized = slug.trim().toLowerCase()
  if (!normalized) return false
  if (row.slug === normalized) return true
  const org = row.orgSlug?.trim().toLowerCase()
  if (org && org === normalized) return true
  return stripCatalogYearSuffix(row.slug) === normalized
}

function findCatalogRowBySlug(
  rows: CatalogListingRecord[],
  slug: string,
): CatalogListingRecord | null {
  const normalized = slug.trim().toLowerCase()
  return (
    rows.find((row) => row.slug === normalized) ??
    rows.find((row) => catalogRowMatchesSlug(row, normalized)) ??
    null
  )
}

export function isSkippedCatalogSlug(slug: string): boolean {
  const s = (slug || '').trim().toLowerCase()
  if (!s) return true
  return SKIPPED_SLUGS.has(s) || TEST_SLUG_RE.test(s)
}

export function usableListingImageUrl(url: string | null | undefined): string | null {
  const raw = (url || '').trim()
  if (!raw) return null
  if (/^(null|undefined|#)$/i.test(raw)) return null
  if (raw === '/') return null
  if (!/^(?:\/images\/|\/[A-Za-z0-9._-]|https?:\/\/)/i.test(raw)) return null
  return raw
}

export function listingImageAlt(name: string, kind: 'logo' | 'image' = 'logo'): string {
  const label = (name || '').trim() || 'Listing'
  return kind === 'image' ? `${label} image` : `${label} logo`
}

export { listingImageUnoptimized } from '@/lib/nextImageSrc'

export function isRedundantOrgDisplayName(
  orgDisplayName: string | null | undefined,
  listingName: string,
): boolean {
  const a = normalizeBrandName(orgDisplayName)
  const b = normalizeBrandName(listingName)
  return Boolean(a && b && a === b)
}

function normalizeBrandName(value: string | null | undefined): string {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '')
}

function pickLogo(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const url = usableListingImageUrl(candidate)
    if (url) return url
  }
  return null
}

function locationSummary(city?: string | null, state?: string | null): string | null {
  const parts = [city?.trim(), state?.trim()].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

function dungeonLongCopy(dungeon: CatalogDungeonInput): string | null {
  if (typeof dungeon.description === 'string' && dungeon.description.trim()) {
    return dungeon.description.trim()
  }
  if (dungeon.description && typeof dungeon.description === 'object' && dungeon.description.long?.trim()) {
    return dungeon.description.long.trim()
  }
  return dungeon.excerpt?.trim() || null
}

export function hasListingCopy(description: string | null | undefined): boolean {
  return listingCopyToPlainText(description).length > 0
}

/** Keep real dungeon/convention rows; skip hollow invented stubs. */
export function shouldIncludeCatalogListing(input: {
  logoUrl?: string | null
  description?: string | null
  alreadyListed: boolean
}): boolean {
  if (usableListingImageUrl(input.logoUrl) || hasListingCopy(input.description)) return true
  return input.alreadyListed
}

function emptyListing(slug: string, name: string, sourceId: string): CatalogListingRecord {
  return {
    slug,
    name,
    description: null,
    publicLocationSummary: null,
    logoUrl: null,
    kinkSocialCanonicalUrl: null,
    ctaUrl: null,
    orgSlug: null,
    orgDisplayName: null,
    websiteUrl: null,
    city: null,
    state: null,
    c2kSourceId: sourceId,
    sourceAttribution: 'eastcoastkinkevents',
    lastSyncedAt: null,
    gallery: [],
  }
}

export function dungeonToOrgListing(dungeon: CatalogDungeonInput): CatalogListingRecord {
  const slug = dungeon.slug.trim().toLowerCase()
  const firstImage = Array.isArray(dungeon.images) ? dungeon.images[0] : undefined
  const logoUrl = pickLogo(dungeon.logo, dungeon.coverUrl, firstImage)
  const description = dungeonLongCopy(dungeon)
  return {
    ...emptyListing(slug, dungeon.name, dungeon.c2kSourceId || `ecke-catalog-dungeon:${slug}`),
    description,
    publicLocationSummary: locationSummary(dungeon.location?.city, dungeon.location?.state),
    logoUrl,
    websiteUrl: dungeon.website?.trim() || null,
    city: dungeon.location?.city?.trim() || null,
    state: dungeon.location?.state?.trim() || null,
    relatedHref: `/dungeons/${slug}`,
    relatedLabel: 'View dungeon',
  }
}

export function conventionToListing(event: CatalogConventionInput): CatalogListingRecord {
  const slug = event.slug.trim().toLowerCase()
  const yearless = stripCatalogYearSuffix(slug)
  const orgSlug = event.orgSlug?.trim().toLowerCase() || (yearless !== slug ? yearless : null)
  return {
    ...emptyListing(slug, event.name, event.c2kSourceId || `ecke-catalog-convention:${slug}`),
    description: event.excerpt?.trim() || null,
    publicLocationSummary: locationSummary(event.location?.city, event.location?.state),
    logoUrl: pickLogo(event.logo),
    orgSlug,
    orgDisplayName: event.organizer?.trim() || null,
    city: event.location?.city?.trim() || null,
    state: event.location?.state?.trim() || null,
    lastSyncedAt: event.lastSyncedAt ?? null,
    relatedHref: `/events/${slug}`,
    relatedLabel: 'View event',
  }
}

function withDbMedia(row: KinkSocialListingRecord): CatalogListingRecord {
  const galleryHero = row.gallery?.[0]?.publicUrl
  return {
    ...row,
    logoUrl: pickLogo(row.logoUrl, galleryHero),
  }
}

function attachRelatedLink(
  row: CatalogListingRecord,
  href: string,
  label: string,
): CatalogListingRecord {
  if (row.relatedHref) return row
  return { ...row, relatedHref: href, relatedLabel: label }
}

function compareCatalogListings(a: CatalogListingRecord, b: CatalogListingRecord): number {
  const mediaA = usableListingImageUrl(a.logoUrl) ? 0 : 1
  const mediaB = usableListingImageUrl(b.logoUrl) ? 0 : 1
  if (mediaA !== mediaB) return mediaA - mediaB
  return a.name.localeCompare(b.name)
}

function keepCatalogRow(row: CatalogListingRecord, alreadyListed: boolean): boolean {
  if (isSkippedCatalogSlug(row.slug) || !row.name.trim()) return false
  return shouldIncludeCatalogListing({
    logoUrl: row.logoUrl,
    description: row.description,
    alreadyListed,
  })
}

export function mergeOrganizationCatalog(
  dbOrgs: KinkSocialListingRecord[],
  dungeons: CatalogDungeonInput[],
  nationalConventions: CatalogConventionInput[],
): CatalogListingRecord[] {
  const bySlug = new Map<string, CatalogListingRecord>()

  for (const org of dbOrgs) {
    const row = withDbMedia(org)
    if (!keepCatalogRow(row, true)) continue
    bySlug.set(row.slug, row)
  }

  for (const dungeon of dungeons) {
    if (isSkippedCatalogSlug(dungeon.slug)) continue
    const next = dungeonToOrgListing(dungeon)
    if (!keepCatalogRow(next, true)) continue
    const existing = bySlug.get(next.slug)
    if (existing) {
      bySlug.set(next.slug, attachRelatedLink(existing, `/dungeons/${next.slug}`, 'View dungeon'))
      continue
    }
    bySlug.set(next.slug, next)
  }

  for (const event of nationalConventions) {
    if (isSkippedCatalogSlug(event.slug)) continue
    const next = conventionToListing(event)
    if (!keepCatalogRow(next, true)) continue
    const existing = bySlug.get(next.slug)
    if (existing) {
      if (existing.relatedHref) continue
      bySlug.set(next.slug, attachRelatedLink(existing, `/events/${next.slug}`, 'View event'))
      continue
    }
    bySlug.set(next.slug, next)
  }

  return Array.from(bySlug.values()).sort(compareCatalogListings)
}

export function mergeConventionCatalog(
  dbConventions: KinkSocialListingRecord[],
  nationalConventions: CatalogConventionInput[],
): CatalogListingRecord[] {
  const bySlug = new Map<string, CatalogListingRecord>()

  for (const row of dbConventions) {
    const next = {
      ...withDbMedia(row),
      relatedHref: `/events/${row.slug}`,
      relatedLabel: 'View event',
    }
    if (!keepCatalogRow(next, true)) continue
    bySlug.set(next.slug, next)
  }

  for (const event of nationalConventions) {
    if (isSkippedCatalogSlug(event.slug) || bySlug.has(event.slug.trim().toLowerCase())) continue
    const next = conventionToListing(event)
    if (!keepCatalogRow(next, true)) continue
    bySlug.set(next.slug, next)
  }

  return Array.from(bySlug.values()).sort(compareCatalogListings)
}

function nationalConventionInputs(
  events: UnifiedEvent[],
  isNational: (event: UnifiedEvent) => boolean,
): CatalogConventionInput[] {
  return events
    .filter(isNational)
    .map((event) => ({
      slug: event.slug,
      name: event.name,
      excerpt: event.excerpt,
      location: event.location,
      logo: event.logo,
      organizer: event.organizer,
      c2kSourceId: event.c2kSourceId,
      lastSyncedAt: event.lastSyncedAt,
    }))
}

function dungeonInputs(dungeons: UnifiedDungeon[]): CatalogDungeonInput[] {
  return dungeons.map((dungeon) => ({
    slug: dungeon.slug,
    name: dungeon.name,
    excerpt: dungeon.excerpt,
    description: dungeon.description,
    location: dungeon.location,
    logo: dungeon.logo,
    coverUrl: dungeon.coverUrl,
    images: dungeon.images,
    website: dungeon.website,
    c2kSourceId: dungeon.c2kSourceId,
  }))
}

export async function getOrganizationCatalog(): Promise<CatalogListingRecord[]> {
  const [{ fetchPublishedListingsIndex }, { getUnifiedDungeonsAsync }, { getUnifiedEvents }] =
    await Promise.all([
      import('./unifiedExtendedListings'),
      import('./unifiedDungeons'),
      import('./unifiedEvents'),
    ])
  const { isNationalConventionListing, unifiedToIndexItem } = await import('./publicEventIndex')
  const [dbOrgs, dungeons, events] = await Promise.all([
    fetchPublishedListingsIndex('organization'),
    getUnifiedDungeonsAsync(),
    getUnifiedEvents(),
  ])
  return mergeOrganizationCatalog(
    dbOrgs,
    dungeonInputs(dungeons),
    nationalConventionInputs(events, (event) =>
      isNationalConventionListing(unifiedToIndexItem(event)),
    ),
  )
}

export async function getOrganizationCatalogBySlug(
  slug: string,
): Promise<CatalogListingRecord | null> {
  const normalized = slug.trim().toLowerCase()
  if (isSkippedCatalogSlug(normalized)) return null
  const catalog = await getOrganizationCatalog()
  return findCatalogRowBySlug(catalog, normalized)
}

export async function getConventionCatalog(): Promise<CatalogListingRecord[]> {
  const [{ fetchPublishedListingsIndex }, { getUnifiedEvents }] = await Promise.all([
    import('./unifiedExtendedListings'),
    import('./unifiedEvents'),
  ])
  const { isNationalConventionListing, unifiedToIndexItem } = await import('./publicEventIndex')
  const [dbConventions, events] = await Promise.all([
    fetchPublishedListingsIndex('convention'),
    getUnifiedEvents(),
  ])
  return mergeConventionCatalog(
    dbConventions,
    nationalConventionInputs(events, (event) =>
      isNationalConventionListing(unifiedToIndexItem(event)),
    ),
  )
}

export async function getConventionCatalogBySlug(
  slug: string,
): Promise<CatalogListingRecord | null> {
  const normalized = slug.trim().toLowerCase()
  if (isSkippedCatalogSlug(normalized)) return null
  const { fetchPublishedListingBySlug, fetchPublishedListingByOrgSlug } = await import(
    './unifiedExtendedListings'
  )
  const db =
    (await fetchPublishedListingBySlug('convention', normalized)) ??
    (await fetchPublishedListingByOrgSlug('convention', normalized))
  if (db) {
    return {
      ...withDbMedia(db),
      relatedHref: `/events/${db.slug}`,
      relatedLabel: 'View event',
    }
  }
  const catalog = await getConventionCatalog()
  return findCatalogRowBySlug(catalog, normalized)
}

export function catalogSlugsForSitemap(
  rows: CatalogListingRecord[],
): Array<{ slug: string; updated?: string }> {
  return rows.map((row) => ({
    slug: row.slug,
    updated: row.lastSyncedAt ?? undefined,
  }))
}
