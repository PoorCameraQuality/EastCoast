import { BASE_URL } from '@/lib/seo'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

export function venueExportType(category: string): 'swing_club' | 'bdsm_dungeon' | 'other_venue' {
  const c = (category || '').toLowerCase()
  if (c.includes('swing')) return 'swing_club'
  if (c.includes('lifestyle') && (c.includes('club') || c.includes('party'))) return 'swing_club'
  if (c.includes('bdsm') && c.includes('swinger')) return 'swing_club'
  /** Creative arts, sanctuary, online-first listings, etc. */
  if (
    c.includes('creative') ||
    c.includes('sanctuary') ||
    c.includes('online') ||
    c.includes('collective')
  ) {
    return 'other_venue'
  }
  return 'bdsm_dungeon'
}

function stateFullName(abbr: string): string | null {
  for (const v of Object.values(EAST_COAST_STATES)) {
    if (v.abbr === abbr) return v.name
  }
  return null
}

export type VenueExport = {
  name: string
  slug: string
  type: ReturnType<typeof venueExportType>
  category: string
  city: string
  state: string
  state_full: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  membership_url: string | null
  membership_price: string | null
  hours: string | null
  social_media: Record<string, string | null>
  description: string
  ecke_url: string
}

export function dungeonToVenueExport(d: Record<string, unknown>): VenueExport {
  const loc = (d.location as Record<string, string> | undefined) || {}
  const contact = (d.contact as Record<string, string> | undefined) || {}
  const category = String((d as { category?: string }).category ?? '')
  const social = ((d as { socialMedia?: Record<string, string> }).socialMedia) || {}
  const socialNorm: Record<string, string | null> = {
    instagram: social.instagram ?? null,
    facebook: social.facebook ?? null,
    twitter: social.twitter ?? null,
    fetlife: social.fetlife ?? null,
    tiktok: social.tiktok ?? null,
  }

  const website = (d as { website?: string }).website ?? null
  const membership_price =
    (d as { membershipPrice?: string }).membershipPrice ??
    (d as { membership_price?: string }).membership_price ??
    null

  return {
    name: String(d.name ?? ''),
    slug: String(d.slug ?? ''),
    type: venueExportType(category),
    category,
    city: loc.city ?? '',
    state: loc.state ?? '',
    state_full: loc.state ? stateFullName(loc.state) : null,
    website: website || null,
    phone: contact.phone ?? (d as { phone?: string }).phone ?? null,
    email: contact.email ?? (d as { email?: string }).email ?? null,
    address: loc.address ?? null,
    membership_url: website || null,
    membership_price,
    hours: (d as { hours?: string }).hours ?? null,
    social_media: socialNorm,
    description: String((d as { excerpt?: string }).excerpt ?? ''),
    ecke_url: `${BASE_URL}/dungeons/${String(d.slug ?? '')}`,
  }
}

export type ConventionExport = {
  name: string
  slug: string
  type: string
  dates: { start: string; end: string }
  city: string
  state: string
  venue: string | null
  website: string | null
  description: string
  ecke_url: string
}

export type DirectoryStats = {
  directory: string
  last_updated: string
  total_venues: number
  total_swing_clubs: number
  total_bdsm_dungeons: number
  total_other_venues: number
  total_conventions: number
  states_covered: number
  states_with_venues: number
}

export function buildDirectoryStats(
  dungeons: Array<Record<string, unknown>>,
  events: Array<Record<string, unknown>>,
  /** US states + DC count for marketing consistency */
  nominalUsStates = 50
): DirectoryStats {
  const today = new Date().toISOString().slice(0, 10)
  let swing = 0
  let bdsm = 0
  let other = 0
  const states = new Set<string>()
  for (const d of dungeons) {
    const cat = String((d as { category?: string }).category ?? '')
    const t = venueExportType(cat)
    if (t === 'swing_club') swing++
    else if (t === 'other_venue') other++
    else bdsm++
    const st = (d.location as { state?: string } | undefined)?.state
    if (st) states.add(st)
  }
  return {
    directory: 'East Coast Kink Events',
    last_updated: today,
    total_venues: dungeons.length,
    total_swing_clubs: swing,
    total_bdsm_dungeons: bdsm,
    total_other_venues: other,
    total_conventions: events.length,
    states_covered: nominalUsStates,
    states_with_venues: states.size,
  }
}

export function eventToConventionExport(e: Record<string, unknown>): ConventionExport {
  const date = (e.date as Record<string, string> | undefined) || {}
  const loc = (e.location as Record<string, string> | undefined) || {}
  return {
    name: String(e.name ?? ''),
    slug: String(e.slug ?? ''),
    type: String((e as { category?: string }).category ?? 'event'),
    dates: {
      start: date.start ?? '',
      end: date.end ?? date.start ?? '',
    },
    city: loc.city ?? '',
    state: loc.state ?? '',
    venue: (e as { venue?: string }).venue ? String((e as { venue?: string }).venue) : null,
    website: (e as { website?: string }).website
      ? String((e as { website?: string }).website)
      : null,
    description: String((e as { excerpt?: string }).excerpt ?? ''),
    ecke_url: `${BASE_URL}/events/${String(e.slug ?? '')}`,
  }
}
