import { getAllEvents, getEventBySlug } from '@/data/events'
import { getSupabaseClient } from '@/lib/supabase'
import { resolveEntityHeroUrl } from '@/lib/kinkSocialEntityMedia'
import { KNOWN_TAG_SLUGS } from '@/lib/discoveryTags'
import { BASE_URL } from '@/lib/seo'

export type UnifiedEvent = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  excerpt: string
  category: string
  logo?: string
  /** Normalized tag slugs for filtering (inferred for static, DB for Supabase) */
  tagSlugs: string[]
  source: 'static' | 'supabase'
  c2kSourceId?: string | null
  c2kSourceType?: string | null
  dancecardEnabled?: boolean
  organizer?: string
  lastSyncedAt?: string
}

function slugifyTag(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Map freeform tag / category text to canonical slugs */
export function inferTagsForStaticEvent(event: {
  name: string
  excerpt: string
  category: string
  longDescription?: string
}): string[] {
  const text = `${event.name} ${event.excerpt} ${event.category} ${event.longDescription || ''}`.toLowerCase()
  const tags = new Set<string>()

  const add = (s: string) => {
    if (KNOWN_TAG_SLUGS.has(s)) tags.add(s)
  }

  if (/munch/i.test(event.category) || /\bmunch\b/i.test(text)) add('munch')
  if (/play\s*party|play party/i.test(event.category) || /\bplay party\b/i.test(text)) add('play-party')
  if (/class|workshop|education/i.test(event.category) || /\bworkshop|class\b/i.test(text)) add('classes')
  if (/convention|conference|weekend event/i.test(event.category)) add('convention')
  if (/rope|shibari|kinbaku/i.test(text)) add('rope')
  if (/impact|flogger|spanking/i.test(text)) add('impact')
  if (/lgbtq|lgbt|queer|trans/i.test(text)) add('lgbtq-friendly')
  if (/beginner|newcomer|101|first timer/i.test(text)) add('beginner-friendly')
  if (/outdoor|public park/i.test(event.category) || /\boutdoor\b/i.test(text)) add('public')
  if (/private|members only|invite/i.test(text)) add('private')
  if (/femdom|dominatrix|mistress/i.test(text)) add('femdom')
  if (/latex|rubber|fetish fashion/i.test(text)) add('latex-fetish')
  if (/dungeon/i.test(text)) add('dungeon-events')
  if (/social|meetup|mixer/i.test(event.category)) add('bdsm-social')

  return Array.from(tags)
}

function staticToUnified(e: ReturnType<typeof getAllEvents>[number]): UnifiedEvent {
  const raw = e as ReturnType<typeof getAllEvents>[number] & {
    dancecardEnabled?: boolean
    dancecardSlug?: string
    organizer?: string
  }
  return {
    name: e.name,
    slug: e.slug,
    date: e.date,
    location: e.location,
    excerpt: e.excerpt,
    category: e.category,
    logo: e.logo,
    tagSlugs: inferTagsForStaticEvent({
      name: e.name,
      excerpt: e.excerpt,
      category: e.category,
      longDescription: (e as { longDescription?: string }).longDescription,
    }),
    source: 'static',
    dancecardEnabled: Boolean(raw.dancecardEnabled || raw.dancecardSlug),
    organizer: raw.organizer,
  }
}

function normalizeDbTags(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((t) => slugifyTag(String(t))).filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((t) => slugifyTag(t))
      .filter(Boolean)
  }
  return []
}

function dbRowToUnified(row: Record<string, unknown>): UnifiedEvent | null {
  const slug = row.slug as string | undefined
  if (!slug) return null
  const start = (row.start_date as string)?.slice(0, 10) || ''
  const end = (row.end_date as string)?.slice(0, 10) || start
  const display = (row.display_date as string) || start
  return {
    name: (row.title as string) || slug,
    slug,
    date: { start, end, display },
    location: {
      city: String(row.city || ''),
      state: String(row.state || '').toUpperCase().slice(0, 2),
      region: '',
    },
    excerpt: (row.short_description as string) || '',
    category: (row.category as string) || 'Event',
    logo: (row.logo as string) || undefined,
    tagSlugs: normalizeDbTags(row.tags),
    source: 'supabase',
    c2kSourceId: (row.c2k_source_id as string | null) ?? null,
    c2kSourceType: (row.c2k_source_type as string | null) ?? null,
    lastSyncedAt: String(row.last_synced_at || row.updated_at || '').slice(0, 10) || undefined,
  }
}

/**
 * Published events from Supabase (submissions pipeline). Fails soft if DB unavailable.
 */
export async function fetchPublishedSupabaseEvents(): Promise<UnifiedEvent[]> {
  const client = getSupabaseClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('events')
      .select(
        'title, slug, start_date, end_date, display_date, city, state, short_description, category, logo, tags, status, c2k_source_id, c2k_source_type, last_synced_at, updated_at'
      )
      .eq('status', 'published')

    if (error || !data?.length) return []
    const rows = data as Record<string, unknown>[]
    return rows.map(dbRowToUnified).filter((e): e is UnifiedEvent => e !== null)
  } catch {
    return []
  }
}

/**
 * Static + published DB events.
 * Default: static wins on duplicate slug (same event in both places uses `events.js`).
 * Set `UNIFIED_EVENTS_PREFER_DB=true` after migrating static data to Supabase so DB rows win.
 */
export async function getUnifiedEvents(): Promise<UnifiedEvent[]> {
  const preferDb = process.env.UNIFIED_EVENTS_PREFER_DB === 'true'
  const staticUnified = getAllEvents().map(staticToUnified)
  const bySlug = new Map<string, UnifiedEvent>()
  const remote = await fetchPublishedSupabaseEvents()

  if (preferDb) {
    for (const e of staticUnified) {
      bySlug.set(e.slug, e)
    }
    for (const e of remote) {
      bySlug.set(e.slug, e)
    }
  } else {
    for (const e of staticUnified) {
      bySlug.set(e.slug, e)
    }
    for (const e of remote) {
      const existing = bySlug.get(e.slug)
      if (e.c2kSourceId) {
        bySlug.set(e.slug, e)
      } else if (!existing) {
        bySlug.set(e.slug, e)
      }
    }
    // kink.social rows with source ID win over static when slug differs but same source ID
    for (const e of remote) {
      if (!e.c2kSourceId) continue
      for (const [slug, existing] of Array.from(bySlug.entries())) {
        if (slug !== e.slug && existing.c2kSourceId === e.c2kSourceId) {
          bySlug.delete(slug)
        }
      }
    }
  }
  return Array.from(bySlug.values()).sort(
    (a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime()
  )
}

export function getUpcomingUnified(events: UnifiedEvent[]): UnifiedEvent[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return events
    .filter((e) => new Date(e.date.end) >= today)
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
}

/** Same shape as static `events.js` entries — used by `/events/[slug]`, SEO, and structured data. */
export type EventPageRecord = {
  name: string
  slug: string
  date: { start: string; end: string; display: string }
  location: { city: string; state: string; region: string }
  category: string
  excerpt: string
  longDescription?: string
  website: string
  organizer?: string
  venue?: string
  logo?: string
  features?: string[]
  seo?: { title: string; description: string; keywords: string }
  c2kSourceId?: string | null
  c2kSourceType?: string | null
}

function parseDbFeatures(raw: unknown): string[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((x) => String(x).trim()).filter(Boolean)
  const s = String(raw).trim()
  if (!s) return []
  try {
    const parsed = JSON.parse(s) as unknown
    if (Array.isArray(parsed)) return parsed.map((x) => String(x).trim()).filter(Boolean)
  } catch {
    // freeform text
  }
  return s
    .split(/\r?\n/)
    .flatMap((line) => line.split(';').map((part) => part.trim()))
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

function formatSeoKeywords(raw: unknown): string {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean).join(', ')
  return String(raw || '').trim()
}

function dbRowToEventPageRecord(row: Record<string, unknown>): EventPageRecord | null {
  const slug = row.slug as string | undefined
  if (!slug) return null
  const start = (row.start_date as string)?.slice(0, 10) || ''
  const end = (row.end_date as string)?.slice(0, 10) || start
  const display = ((row.display_date as string) || '').trim() || start
  const city = String(row.city || '').trim()
  const stateAbbr = String(row.state || '')
    .toUpperCase()
    .slice(0, 2)
  const excerpt = (row.short_description as string)?.trim() || ''
  const longDesc = (row.long_description as string)?.trim() || ''
  const title = ((row.title as string) || slug).trim()
  const websiteRaw = (row.website as string)?.trim()
  const fallbackUrl = `${BASE_URL}/events/${encodeURIComponent(slug)}`
  const website = websiteRaw || fallbackUrl
  const organizer =
    ((row.organizer_name as string) || (row.organizer as string))?.trim() || undefined
  const venue = (row.venue as string)?.trim() || undefined
  const metaTitle = ((row.meta_title as string) || (row.seo_title as string))?.trim()
  const metaDesc = ((row.meta_description as string) || (row.seo_description as string))?.trim()
  const kw = formatSeoKeywords(row.seo_keywords)

  return {
    name: title,
    slug,
    date: { start, end, display },
    location: {
      city,
      state: stateAbbr,
      region: city && stateAbbr ? `${city}, ${stateAbbr}` : stateAbbr || '',
    },
    category: ((row.category as string) || 'Event').trim(),
    excerpt: excerpt || longDesc.slice(0, 280) || `${title} — kink event in ${city || stateAbbr || 'your area'}.`,
    longDescription: longDesc || undefined,
    website,
    organizer,
    venue,
    logo: (row.logo as string)?.trim() || undefined,
    features: parseDbFeatures(row.features),
    c2kSourceId: (row.c2k_source_id as string | null) ?? null,
    c2kSourceType: (row.c2k_source_type as string | null) ?? null,
    seo: metaTitle
      ? {
          title: metaTitle,
          description: (metaDesc || excerpt || longDesc).slice(0, 320),
          keywords: kw || title,
        }
      : undefined,
  }
}

/**
 * Published event from Supabase as a full page record (for `/events/[slug]` when not in static data).
 */
export async function fetchPublishedSupabaseEventAsPageEvent(
  slug: string
): Promise<EventPageRecord | null> {
  const client = getSupabaseClient()
  if (!client) return null
  try {
    const { data, error } = await client
      .from('events')
      .select(
        [
          'title',
          'slug',
          'start_date',
          'end_date',
          'display_date',
          'city',
          'state',
          'short_description',
          'long_description',
          'category',
          'logo',
          'status',
          'website',
          'features',
          'venue',
          'organizer',
          'organizer_name',
          'seo_title',
          'seo_description',
          'seo_keywords',
          'meta_title',
          'meta_description',
          'c2k_source_id',
          'c2k_source_type',
        ].join(', ')
      )
      .eq('status', 'published')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !data) return null
    const record = dbRowToEventPageRecord(data as unknown as Record<string, unknown>)
    if (!record) return null
    const heroUrl = await resolveEntityHeroUrl(client, 'event', slug, record.logo)
    if (heroUrl && heroUrl !== record.logo) {
      return { ...record, logo: heroUrl }
    }
    return record
  } catch {
    return null
  }
}

/**
 * Resolve an event for the public detail page — matches `getUnifiedEvents` precedence for slug conflicts.
 */
export async function resolveEventForPage(slug: string): Promise<EventPageRecord | null> {
  const preferDb = process.env.UNIFIED_EVENTS_PREFER_DB === 'true'
  const staticEv = getEventBySlug(slug) as EventPageRecord | undefined
  const dbEv = await fetchPublishedSupabaseEventAsPageEvent(slug)

  if (dbEv?.c2kSourceId) return dbEv
  if (preferDb && dbEv) return dbEv
  if (staticEv) return staticEv
  return dbEv
}

/**
 * Published kink.social event rows for sitemap (status=published, c2k_source_id set).
 */
export async function fetchPublishedC2kEventSlugsForSitemap(): Promise<
  Array<{ slug: string; updated?: string }>
> {
  const client = getSupabaseClient()
  if (!client) return []
  try {
    const { data, error } = await client
      .from('events')
      .select('slug, start_date, last_synced_at, updated_at, c2k_source_id, status')
      .eq('status', 'published')
      .not('c2k_source_id', 'is', null)

    if (error || !data?.length) return []
    return (data as Record<string, unknown>[])
      .filter((row) => row.slug)
      .map((row) => ({
        slug: String(row.slug),
        updated: String(row.last_synced_at || row.updated_at || row.start_date || '').slice(0, 10),
      }))
  } catch {
    return []
  }
}

/** Shape for `/events` client list and paginated `EventCard` grids (static + Supabase). */
export function unifiedEventToEventsPageShape(e: UnifiedEvent) {
  const { city, state, region } = e.location
  const regionOut = region || (city && state ? `${city}, ${state}` : state || '')
  return {
    slug: e.slug,
    name: e.name,
    category: e.category,
    date: e.date,
    location: { city, state, region: regionOut },
    excerpt: e.excerpt,
    logo: e.logo,
  }
}
