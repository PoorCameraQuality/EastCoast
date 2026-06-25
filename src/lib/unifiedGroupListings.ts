import { getSupabaseServerClient } from '@/lib/supabaseServer'

export type GroupListingRecord = {
  slug: string
  name: string
  description: string | null
  publicLocationSummary: string | null
  tags: string[]
  logoUrl: string | null
  kinkSocialCanonicalUrl: string | null
  ctaUrl: string | null
  orgSlug: string | null
  orgDisplayName: string | null
  c2kSourceId: string
  sourceAttribution: string
  lastSyncedAt: string | null
}

type DbGroupListingRow = {
  slug: string
  name: string
  description: string | null
  public_location_summary: string | null
  tags: string[] | null
  logo_url: string | null
  kink_social_canonical_url: string | null
  cta_url: string | null
  org_slug: string | null
  org_display_name: string | null
  c2k_source_id: string
  source_attribution: string | null
  last_synced_at: string | null
  status: string
}

function dbRowToRecord(row: DbGroupListingRow): GroupListingRecord {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    publicLocationSummary: row.public_location_summary,
    tags: row.tags ?? [],
    logoUrl: row.logo_url,
    kinkSocialCanonicalUrl: row.kink_social_canonical_url,
    ctaUrl: row.cta_url,
    orgSlug: row.org_slug,
    orgDisplayName: row.org_display_name,
    c2kSourceId: row.c2k_source_id,
    sourceAttribution: row.source_attribution ?? 'kink.social',
    lastSyncedAt: row.last_synced_at,
  }
}

export async function fetchPublishedGroupListingBySlug(slug: string): Promise<GroupListingRecord | null> {
  const client = getSupabaseServerClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from('group_listings')
      .select(
        'slug, name, description, public_location_summary, tags, logo_url, kink_social_canonical_url, cta_url, org_slug, org_display_name, c2k_source_id, source_attribution, last_synced_at, status',
      )
      .eq('status', 'published')
      .eq('slug', slug.toLowerCase())
      .maybeSingle()

    if (error || !data) return null
    return dbRowToRecord(data as DbGroupListingRow)
  } catch {
    return null
  }
}

export async function fetchPublishedGroupSlugsForSitemap(): Promise<Array<{ slug: string; updated?: string }>> {
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('group_listings')
      .select('slug, last_synced_at, updated_at')
      .eq('status', 'published')

    if (error || !data?.length) return []
    return (data as Record<string, unknown>[])
      .filter((row) => row.slug)
      .map((row) => ({
        slug: String(row.slug),
        updated: String(row.last_synced_at || row.updated_at || '').slice(0, 10),
      }))
  } catch {
    return []
  }
}

export function isKinkSocialSourcedGroupListing(record: GroupListingRecord): boolean {
  return Boolean(record.c2kSourceId)
}
