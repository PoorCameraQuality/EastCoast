import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { getUnifiedVendors } from '@/lib/unifiedVendors'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import {
  getDungeonDiscoveryHubLinks,
  getEventDiscoveryHubLinks,
  getVendorDiscoveryHubLinks,
} from '@/lib/discoveryCrossLinks'
import type { ParsedBlogSlug } from '@/lib/parseBlogSlug'

export type BlogInternalLink = { href: string; label: string }

function eventIsUpcoming(event: { date: { end: string } }): boolean {
  return new Date(event.date.end) >= new Date(new Date().toISOString().slice(0, 10))
}

function stateSlugFromAbbr(abbr: string): StateSlug | undefined {
  for (const slug of Object.keys(EAST_COAST_STATES) as StateSlug[]) {
    if (EAST_COAST_STATES[slug].abbr === abbr) return slug
  }
  return undefined
}

function fillEventLinks(
  picked: BlogInternalLink[],
  stateSlug?: StateSlug
): BlogInternalLink[] {
  const out: BlogInternalLink[] = []
  const seen = new Set<string>()
  const push = (href: string, label: string) => {
    if (seen.has(href)) return
    seen.add(href)
    out.push({ href, label })
  }
  for (const p of picked) push(p.href, p.label)
  for (const l of getEventDiscoveryHubLinks({ stateSlug })) {
    push(l.href, l.label)
    if (out.length >= 8) break
  }
  if (out.length < 3) push('/events/page/1', 'Events — page 1')
  return out.slice(0, 8)
}

function fillVendorLinks(picked: BlogInternalLink[], stateSlug?: StateSlug): BlogInternalLink[] {
  const out: BlogInternalLink[] = []
  const seen = new Set<string>()
  const push = (href: string, label: string) => {
    if (seen.has(href)) return
    seen.add(href)
    out.push({ href, label })
  }
  for (const p of picked) push(p.href, p.label)
  for (const l of getVendorDiscoveryHubLinks({ stateSlug })) {
    push(l.href, l.label)
    if (out.length >= 8) break
  }
  return out.slice(0, 8)
}

function fillDungeonLinks(picked: BlogInternalLink[], stateSlug?: StateSlug): BlogInternalLink[] {
  const out: BlogInternalLink[] = []
  const seen = new Set<string>()
  const push = (href: string, label: string) => {
    if (seen.has(href)) return
    seen.add(href)
    out.push({ href, label })
  }
  for (const p of picked) push(p.href, p.label)
  for (const l of getDungeonDiscoveryHubLinks({ stateSlug })) {
    push(l.href, l.label)
    if (out.length >= 8) break
  }
  return out.slice(0, 8)
}

export type BlogInternalLinksBundle = {
  events: BlogInternalLink[]
  vendors: BlogInternalLink[]
  dungeons: BlogInternalLink[]
  ctaHref: string
  ctaLabel: string
}

export async function getBlogInternalLinks(parsed: ParsedBlogSlug): Promise<BlogInternalLinksBundle> {
  const allEvents = getAllEvents().filter(eventIsUpcoming)
  const allDungeons = getAllDungeons()
  const vendors = await getUnifiedVendors()

  let stateSlug: StateSlug | undefined
  let cityMatcher: { abbr: string; matchCity: (c: string) => boolean } | undefined

  if (parsed.kind === 'stateEventsGuide') {
    stateSlug = parsed.stateSlug
  } else if (parsed.kind === 'cityStartGuide') {
    const e = CITY_BY_SLUG[parsed.citySlug]
    cityMatcher = { abbr: e.stateAbbr, matchCity: e.matchCity }
    stateSlug = stateSlugFromAbbr(e.stateAbbr)
  }

  const eventPicks: BlogInternalLink[] = []
  if (stateSlug) {
    const abbr = EAST_COAST_STATES[stateSlug].abbr
    for (const ev of allEvents) {
      if (ev.location?.state !== abbr) continue
      eventPicks.push({ href: `/events/${ev.slug}`, label: ev.name })
      if (eventPicks.length >= 6) break
    }
  } else if (cityMatcher) {
    for (const ev of allEvents) {
      if (ev.location?.state !== cityMatcher.abbr) continue
      if (!cityMatcher.matchCity(ev.location?.city || '')) continue
      eventPicks.push({ href: `/events/${ev.slug}`, label: ev.name })
      if (eventPicks.length >= 6) break
    }
  } else {
    for (const ev of allEvents) {
      eventPicks.push({ href: `/events/${ev.slug}`, label: ev.name })
      if (eventPicks.length >= 6) break
    }
  }

  const vendorPicks: BlogInternalLink[] = []
  const wantAbbr = stateSlug ? EAST_COAST_STATES[stateSlug].abbr : cityMatcher?.abbr
  if (wantAbbr) {
    for (const v of vendors) {
      if (v.onlineOnly) continue
      if (v.stateAbbr !== wantAbbr) continue
      vendorPicks.push({ href: `/vendors/${v.slug}`, label: v.name })
      if (vendorPicks.length >= 6) break
    }
  }
  if (vendorPicks.length < 2) {
    for (const v of vendors) {
      if (vendorPicks.some((x) => x.href === `/vendors/${v.slug}`)) continue
      vendorPicks.push({ href: `/vendors/${v.slug}`, label: v.name })
      if (vendorPicks.length >= 6) break
    }
  }

  const dungeonPicks: BlogInternalLink[] = []
  if (wantAbbr) {
    for (const d of allDungeons) {
      if (d.location?.state !== wantAbbr) continue
      dungeonPicks.push({ href: `/dungeons/${d.slug}`, label: d.name })
      if (dungeonPicks.length >= 4) break
    }
  }
  if (dungeonPicks.length < 1) {
    for (const d of allDungeons) {
      dungeonPicks.push({ href: `/dungeons/${d.slug}`, label: d.name })
      break
    }
  }

  let ctaHref = '/bdsm-events'
  let ctaLabel = 'Browse BDSM event discovery hubs'
  if (stateSlug) {
    ctaHref = `/bdsm-events/${stateSlug}`
    ctaLabel = `Browse upcoming BDSM events in ${EAST_COAST_STATES[stateSlug].name}`
  } else {
    ctaHref = '/bdsm-events'
    ctaLabel = 'Browse BDSM events by region'
  }

  return {
    events: fillEventLinks(eventPicks, stateSlug),
    vendors: fillVendorLinks(vendorPicks, stateSlug),
    dungeons: fillDungeonLinks(dungeonPicks, stateSlug),
    ctaHref,
    ctaLabel,
  }
}
