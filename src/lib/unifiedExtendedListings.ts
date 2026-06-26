import { getSupabaseServerClient } from '@/lib/supabaseServer'
import type { ListingEntityType } from '@/lib/kinkSocialListingValidation'
import { LISTING_PROJECTIONS } from '@/lib/kinkSocialListingProjection'

export type KinkSocialListingRecord = {
  slug: string
  name: string
  description: string | null
  publicLocationSummary: string | null
  logoUrl: string | null
  kinkSocialCanonicalUrl: string | null
  ctaUrl: string | null
  orgSlug: string | null
  orgDisplayName: string | null
  websiteUrl: string | null
  city: string | null
  state: string | null
  c2kSourceId: string
  sourceAttribution: string
  lastSyncedAt: string | null
}

type DbRow = {
  slug: string
  name: string
  description: string | null
  public_location_summary: string | null
  logo_url: string | null
  kink_social_canonical_url: string | null
  cta_url: string | null
  org_slug?: string | null
  org_display_name?: string | null
  website_url?: string | null
  city?: string | null
  state?: string | null
  c2k_source_id: string
  source_attribution: string | null
  last_synced_at: string | null
  status: string
}

function dbRowToRecord(row: DbRow): KinkSocialListingRecord {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    publicLocationSummary: row.public_location_summary,
    logoUrl: row.logo_url,
    kinkSocialCanonicalUrl: row.kink_social_canonical_url,
    ctaUrl: row.cta_url,
    orgSlug: row.org_slug ?? null,
    orgDisplayName: row.org_display_name ?? null,
    websiteUrl: row.website_url ?? null,
    city: row.city ?? null,
    state: row.state ?? null,
    c2kSourceId: row.c2k_source_id,
    sourceAttribution: row.source_attribution ?? 'kink.social',
    lastSyncedAt: row.last_synced_at,
  }
}

const BASE_SELECT =
  'slug, name, description, public_location_summary, logo_url, kink_social_canonical_url, cta_url, c2k_source_id, source_attribution, last_synced_at, status'

function selectColumns(entityType: ListingEntityType): string {
  if (entityType === 'group' || entityType === 'convention') {
    return `${BASE_SELECT}, org_slug, org_display_name`
  }
  if (entityType === 'venue') {
    return `${BASE_SELECT}, city, state, website_url`
  }
  if (entityType === 'organization' || entityType === 'presenter') {
    return `${BASE_SELECT}, website_url`
  }
  return BASE_SELECT
}

export async function fetchPublishedListingBySlug(
  entityType: ListingEntityType,
  slug: string,
): Promise<KinkSocialListingRecord | null> {
  const config = LISTING_PROJECTIONS[entityType]
  const client = getSupabaseServerClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from(config.table)
      .select(selectColumns(entityType))
      .eq('status', 'published')
      .eq('slug', slug.toLowerCase())
      .maybeSingle()
    if (error || !data) return null
    return dbRowToRecord(data as unknown as DbRow)
  } catch {
    return null
  }
}

export async function fetchPublishedListingSlugsForSitemap(
  entityType: ListingEntityType,
): Promise<Array<{ slug: string; updated?: string }>> {
  const config = LISTING_PROJECTIONS[entityType]
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from(config.table)
      .select('slug, last_synced_at, updated_at')
      .eq('status', 'published')
    if (error || !data) return []
    return data.map((row) => ({
      slug: (row as { slug: string }).slug,
      updated: (row as { last_synced_at?: string; updated_at?: string }).last_synced_at ??
        (row as { updated_at?: string }).updated_at,
    }))
  } catch {
    return []
  }
}

export async function fetchPublishedListingsIndex(
  entityType: ListingEntityType,
): Promise<KinkSocialListingRecord[]> {
  const config = LISTING_PROJECTIONS[entityType]
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from(config.table)
      .select(selectColumns(entityType))
      .eq('status', 'published')
      .order('name', { ascending: true })
    if (error || !data) return []
    return (data as unknown as DbRow[]).map(dbRowToRecord)
  } catch {
    return []
  }
}
