import { getAllEvents } from '@/data/events'
import { getSupabaseClient } from '@/lib/supabase'
import { KNOWN_TAG_SLUGS } from '@/lib/discoveryTags'

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
        'title, slug, start_date, end_date, display_date, city, state, short_description, category, logo, tags, status'
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
      if (!bySlug.has(e.slug)) bySlug.set(e.slug, e)
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
