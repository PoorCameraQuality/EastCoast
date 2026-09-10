import type { SupabaseClient } from '@supabase/supabase-js'
import { getAllDungeons, getDungeonBySlug } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import {
  dungeonMatchesHubTag,
  inferDungeonHubTags,
  isDungeonHubTagSlug,
  type DungeonSeoHubTagSlug,
} from '@/lib/dungeonHubTagMap'
import { resolveEntityHeroUrl } from '@/lib/kinkSocialEntityMedia'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export type DungeonRecord = ReturnType<typeof getAllDungeons>[number]

export type UnifiedDungeon = Omit<DungeonRecord, 'venueId'> & {
  venueId?: string
  discoveryTagSlugs: DungeonSeoHubTagSlug[]
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  organizationId?: string | null
  status?: 'draft' | 'published'
  coverUrl?: string
  ageRestriction?: string
  accessibility?: string
  dressCode?: string
  photographyPolicy?: string
  parking?: string
  houseRules?: string
  alcoholPolicy?: string
  membershipInfo?: string
  firstTimerInfo?: string
}

const PUBLISHED_DUNGEON_SELECT = [
  'id',
  'slug',
  'name',
  'description',
  'short_description',
  'city',
  'state',
  'website_url',
  'contact_email',
  'contact_phone',
  'street_address',
  'private_address',
  'hours',
  'category',
  'kind',
  'logo_url',
  'cover_url',
  'gallery_urls',
  'age_restriction',
  'accessibility',
  'dress_code',
  'photography_policy',
  'parking',
  'house_rules',
  'alcohol_policy',
  'membership_info',
  'first_timer_info',
  'seo_hub_tags',
  'status',
  'organization_id',
  'updated_at',
  'published_at',
  'meta_title',
  'meta_description',
  'c2k_source_id',
  'c2k_source_type',
].join(', ')

function toUnified(d: DungeonRecord): UnifiedDungeon {
  return {
    ...d,
    discoveryTagSlugs: inferDungeonHubTags(d),
  }
}

export function getUnifiedDungeons(): UnifiedDungeon[] {
  return getAllDungeons().map(toUnified)
}

type DbDungeonVenueRow = {
  id?: string
  slug: string
  name: string
  description: string | null
  short_description?: string | null
  city: string | null
  state: string | null
  website_url: string | null
  contact_email?: string | null
  contact_phone?: string | null
  street_address?: string | null
  private_address?: boolean | null
  hours?: string | null
  category?: string | null
  kind?: string | null
  logo_url?: string | null
  cover_url?: string | null
  gallery_urls?: string[] | null
  age_restriction?: string | null
  accessibility?: string | null
  dress_code?: string | null
  photography_policy?: string | null
  parking?: string | null
  house_rules?: string | null
  alcohol_policy?: string | null
  membership_info?: string | null
  first_timer_info?: string | null
  seo_hub_tags?: string[] | null
  status?: string | null
  organization_id?: string | null
  meta_title: string | null
  meta_description: string | null
  c2k_source_id?: string | null
  c2k_source_type?: string | null
}

function dbDungeonToUnified(row: DbDungeonVenueRow): UnifiedDungeon {
  const city = row.city?.trim() || ''
  const state = row.state ? String(row.state).toUpperCase().slice(0, 2) : ''
  const description = row.description?.trim() || ''
  const shortPitch =
    row.short_description?.trim() ||
    row.meta_description?.trim() ||
    (description.length > 320 ? `${description.slice(0, 280).replace(/\s+\S*$/, '')}…` : description)
  const showAddress = row.private_address === false && Boolean(row.street_address?.trim())
  const gallery = (row.gallery_urls || []).filter(Boolean)
  const record = {
    name: row.name,
    slug: row.slug,
    location: {
      city,
      state,
      address: showAddress ? row.street_address || '' : '',
    },
    category: row.category?.trim() || 'BDSM Dungeon',
    excerpt: shortPitch,
    description: { long: description },
    website: row.website_url || undefined,
    logo: row.logo_url || row.cover_url || undefined,
    images: gallery,
    hours: row.hours || undefined,
    contact: {
      email: row.contact_email || undefined,
      phone: row.contact_phone || undefined,
    },
    seo: {
      title: row.meta_title || `${row.name}${city ? ` — ${city}` : ''}`,
      description: (row.meta_description || shortPitch || description).slice(0, 320),
      keywords: row.name,
    },
  } as DungeonRecord

  const hubTags = (row.seo_hub_tags || []).filter(isDungeonHubTagSlug)
  const unified = toUnified(record)
  return {
    ...unified,
    venueId: row.id || undefined,
    discoveryTagSlugs: hubTags.length ? hubTags : unified.discoveryTagSlugs,
    c2kSourceId: row.c2k_source_id ?? null,
    c2kSourceType: row.c2k_source_type ?? null,
    organizationId: row.organization_id ?? null,
    status: row.status === 'draft' ? 'draft' : 'published',
    coverUrl: row.cover_url || undefined,
    ageRestriction: row.age_restriction || undefined,
    accessibility: row.accessibility || undefined,
    dressCode: row.dress_code || undefined,
    photographyPolicy: row.photography_policy || undefined,
    parking: row.parking || undefined,
    houseRules: row.house_rules || undefined,
    alcoholPolicy: row.alcohol_policy || undefined,
    membershipInfo: row.membership_info || undefined,
    firstTimerInfo: row.first_timer_info || undefined,
  }
}

async function fetchPublishedSupabaseDungeons(): Promise<UnifiedDungeon[]> {
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    let { data, error } = await client
      .from('dungeon_venues')
      .select(PUBLISHED_DUNGEON_SELECT)
      .eq('status', 'published')
      .or('c2k_source_id.not.is.null,organization_id.not.is.null')
    if (error) {
      const fallback = await client
        .from('dungeon_venues')
        .select(
          'slug, name, description, city, state, website_url, meta_title, meta_description, c2k_source_id, c2k_source_type',
        )
        .not('c2k_source_id', 'is', null)
      data = fallback.data as typeof data
      error = fallback.error
    }
    if (error) {
      console.error('[unifiedDungeons] list query failed:', error.message, error.code)
      return []
    }
    if (!data?.length) return []
    return (data as unknown as DbDungeonVenueRow[])
      .filter((row) => row.status !== 'draft')
      .map(dbDungeonToUnified)
  } catch (err) {
    console.error('[unifiedDungeons] list unexpected error:', err)
    return []
  }
}

export async function enrichDungeonHeroFromManifest(
  dungeon: UnifiedDungeon,
  client: SupabaseClient,
): Promise<UnifiedDungeon> {
  try {
    const heroUrl = await resolveEntityHeroUrl(client, 'dungeon', dungeon.slug, dungeon.logo)
    if (!heroUrl || heroUrl === dungeon.logo) return dungeon
    return { ...dungeon, logo: heroUrl } as UnifiedDungeon
  } catch {
    return dungeon
  }
}

/**
 * Static + Supabase dungeon venues.
 * kink.social rows with `c2k_source_id` win on the same slug (parity with events/vendors).
 */
export async function getUnifiedDungeonsAsync(): Promise<UnifiedDungeon[]> {
  const preferDb = process.env.UNIFIED_DUNGEONS_PREFER_DB === 'true'
  const staticUnified = getUnifiedDungeons()
  const remote = await fetchPublishedSupabaseDungeons()
  const bySlug = new Map<string, UnifiedDungeon>()

  if (preferDb) {
    for (const d of staticUnified) bySlug.set(d.slug, d)
    for (const d of remote) bySlug.set(d.slug, d)
  } else {
    for (const d of staticUnified) bySlug.set(d.slug, d)
    for (const d of remote) {
      if (d.c2kSourceId) {
        const prior = bySlug.get(d.slug)
        // C2K row wins, but keep static logo until hero media is wired.
        const merged: UnifiedDungeon =
          prior?.logo && !d.logo ? ({ ...d, logo: prior.logo } as UnifiedDungeon) : d
        bySlug.set(d.slug, merged)
      } else if (d.organizationId) {
        bySlug.set(d.slug, d)
      } else if (!bySlug.has(d.slug)) {
        bySlug.set(d.slug, d)
      }
    }
  }

  const merged = Array.from(bySlug.values())
  const client = getSupabaseServerClient()
  if (!client) return merged
  return Promise.all(merged.map((d) => enrichDungeonHeroFromManifest(d, client)))
}

export async function resolveDungeonBySlugAsync(slug: string): Promise<UnifiedDungeon | null> {
  const preferDb = process.env.UNIFIED_DUNGEONS_PREFER_DB === 'true'
  const staticDungeon = getDungeonBySlug(slug)
  const staticUnified = staticDungeon ? toUnified(staticDungeon) : null

  const client = getSupabaseServerClient()
  let dbUnified: UnifiedDungeon | null = null
  if (client) {
    try {
      const { data, error } = await client
        .from('dungeon_venues')
        .select(PUBLISHED_DUNGEON_SELECT)
        .eq('slug', slug)
        .maybeSingle()
      if (!error && data && (data as unknown as DbDungeonVenueRow).status !== 'draft') {
        dbUnified = dbDungeonToUnified(data as unknown as DbDungeonVenueRow)
      }
    } catch (err) {
      console.error('[unifiedDungeons] detail unexpected error:', err)
    }
  }

  let resolved: UnifiedDungeon | null = null
  if (dbUnified?.c2kSourceId) {
    const merged: UnifiedDungeon =
      staticUnified?.logo && !dbUnified.logo
        ? ({ ...dbUnified, logo: staticUnified.logo } as UnifiedDungeon)
        : { ...dbUnified }
    // Prefer curated static short/long when publish collapsed them into one blob.
    if (staticUnified?.excerpt) {
      const excerptLooksLikeLong =
        !merged.excerpt ||
        merged.excerpt.length > 360 ||
        (merged.description?.long &&
          merged.excerpt.startsWith(merged.description.long.slice(0, 80)))
      if (excerptLooksLikeLong) merged.excerpt = staticUnified.excerpt
    }
    if (staticUnified?.description?.long) {
      const longLooksThin =
        !merged.description?.long ||
        merged.description.long === merged.excerpt ||
        (staticUnified.description.long.length > merged.description.long.length + 80 &&
          merged.description.long.length < 400)
      if (longLooksThin) {
        merged.description = { ...merged.description, long: staticUnified.description.long }
      }
    }
    resolved = merged
  } else if (dbUnified?.organizationId) resolved = dbUnified
  else if (preferDb && dbUnified) resolved = dbUnified
  else if (staticUnified) resolved = staticUnified
  else resolved = dbUnified

  if (!resolved) return null
  if (!client) return resolved
  return enrichDungeonHeroFromManifest(resolved, client)
}

export async function fetchPublishedDungeonSlugsForSitemap(): Promise<
  Array<{ slug: string; updated?: string }>
> {
  const client = getSupabaseServerClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('dungeon_venues')
      .select('slug, updated_at, published_at, last_synced_at, status, organization_id, c2k_source_id')
      .eq('status', 'published')
    if (error || !data?.length) return []
    return (data as Array<Record<string, unknown>>)
      .filter((row) => row.slug && (row.organization_id || row.c2k_source_id))
      .map((row) => ({
        slug: String(row.slug),
        updated: String(row.last_synced_at || row.published_at || row.updated_at || '').slice(0, 10),
      }))
  } catch (err) {
    console.error('[sitemap] dungeons unexpected error:', err)
    return []
  }
}

export type DungeonHubFilter = {
  stateSlug?: StateSlug
  citySlug?: string
  tagSlug?: DungeonSeoHubTagSlug
}

export function filterDungeonsForHub(
  dungeons: UnifiedDungeon[],
  filter: DungeonHubFilter
): UnifiedDungeon[] {
  let list = dungeons

  if (filter.stateSlug) {
    const abbr = EAST_COAST_STATES[filter.stateSlug].abbr
    list = list.filter((d) => d.location?.state === abbr)
  }

  if (filter.citySlug && filter.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[filter.citySlug as keyof typeof CITY_BY_SLUG]
    list = list.filter(
      (d) =>
        d.location?.state === entry.stateAbbr && entry.matchCity(d.location?.city || '')
    )
  }

  if (filter.tagSlug) {
    const hub = filter.tagSlug
    list = list.filter((d) => dungeonMatchesHubTag(d.discoveryTagSlugs, hub))
  }

  return list
}

function eventIsUpcoming(event: { date: { end: string } }): boolean {
  return new Date(event.date.end) >= new Date(new Date().toISOString().slice(0, 10))
}

/** Upcoming static events for dungeon hub context (geographic v1). */
export function getUpcomingEventsForDungeonHub(args: {
  variant: 'state' | 'city' | 'tag' | 'stateTag' | 'cityTag'
  stateSlug?: StateSlug
  citySlug?: string
  filteredDungeons: UnifiedDungeon[]
}): ReturnType<typeof getAllEvents> {
  const all = getAllEvents().filter(eventIsUpcoming)
  const max = 24

  if (args.variant === 'state' && args.stateSlug) {
    const abbr = EAST_COAST_STATES[args.stateSlug].abbr
    return all.filter((e) => e.location?.state === abbr).slice(0, max)
  }

  if (args.variant === 'city' && args.citySlug && args.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[args.citySlug as keyof typeof CITY_BY_SLUG]
    return all
      .filter(
        (e) =>
          e.location?.state === entry.stateAbbr && entry.matchCity(e.location?.city || '')
      )
      .slice(0, max)
  }

  if (args.variant === 'stateTag' && args.stateSlug) {
    const abbr = EAST_COAST_STATES[args.stateSlug].abbr
    return all.filter((e) => e.location?.state === abbr).slice(0, max)
  }

  if (args.variant === 'cityTag' && args.citySlug && args.citySlug in CITY_BY_SLUG) {
    const entry = CITY_BY_SLUG[args.citySlug as keyof typeof CITY_BY_SLUG]
    return all
      .filter(
        (e) =>
          e.location?.state === entry.stateAbbr && entry.matchCity(e.location?.city || '')
      )
      .slice(0, max)
  }

  // tag-only: union of states represented in filtered dungeons
  const states = new Set(
    args.filteredDungeons.map((d) => d.location?.state).filter(Boolean) as string[]
  )
  if (states.size === 0) return []
  return all.filter((e) => states.has(e.location?.state)).slice(0, max)
}
