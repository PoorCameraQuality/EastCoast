/**
 * Single source for cross-surface discovery URLs (events, dungeons, vendors, blog, education).
 * Keeps anchor text and crawl paths consistent across hubs and entity pages.
 */

import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { BLOG_PILLAR_SLUGS } from '@/lib/blogPillarRegistry'

export type DiscoveryLink = { href: string; label: string }

export type DiscoveryCrossLinkContext = {
  stateSlug?: StateSlug
  /** Key from CITY_BY_SLUG when known */
  citySlug?: string
}

export function stateAbbrToSlug(abbr: string): StateSlug | undefined {
  for (const slug of Object.keys(EAST_COAST_STATES) as StateSlug[]) {
    if (EAST_COAST_STATES[slug].abbr === abbr) return slug
  }
  return undefined
}

function resolveStateSlug(ctx: DiscoveryCrossLinkContext): StateSlug | undefined {
  if (ctx.stateSlug) return ctx.stateSlug
  if (ctx.citySlug && ctx.citySlug in CITY_BY_SLUG) {
    return stateAbbrToSlug(CITY_BY_SLUG[ctx.citySlug].stateAbbr)
  }
  return undefined
}

/** BDSM-events discovery + calendar (stable hubs, not individual event rows). */
export function getEventDiscoveryHubLinks(ctx: DiscoveryCrossLinkContext): DiscoveryLink[] {
  const state = resolveStateSlug(ctx)
  const out: DiscoveryLink[] = []
  out.push({ href: '/events', label: 'All upcoming events' })
  if (state) {
    const n = EAST_COAST_STATES[state].name
    out.push({ href: `/bdsm-events/${state}`, label: `BDSM events in ${n}` })
    out.push({ href: '/bdsm-events/this-weekend', label: 'BDSM events this weekend' })
  } else {
    out.push({ href: '/bdsm-events', label: 'BDSM event discovery hubs' })
    out.push({ href: '/bdsm-events/new-jersey', label: 'BDSM events in New Jersey' })
    out.push({ href: '/bdsm-events/pennsylvania', label: 'BDSM events in Pennsylvania' })
  }
  out.push({ href: '/calendar', label: 'Event calendar' })
  return out
}

/** Vendor index + state/tag hubs. */
export function getVendorDiscoveryHubLinks(ctx: DiscoveryCrossLinkContext): DiscoveryLink[] {
  const state = resolveStateSlug(ctx)
  const out: DiscoveryLink[] = [{ href: '/vendors', label: 'Kink vendors and gear' }]
  if (state) {
    out.push({
      href: `/vendors/${state}`,
      label: `Vendors in ${EAST_COAST_STATES[state].name}`,
    })
  } else {
    out.push({ href: '/vendors/pennsylvania', label: 'Vendors in Pennsylvania' })
  }
  out.push({ href: '/vendors/rope', label: 'Rope and bondage vendors' })
  out.push({ href: '/vendors/latex', label: 'Latex and rubber vendors' })
  return out
}

/** Dungeon directory + state hubs. */
export function getDungeonDiscoveryHubLinks(ctx: DiscoveryCrossLinkContext): DiscoveryLink[] {
  const state = resolveStateSlug(ctx)
  const out: DiscoveryLink[] = [{ href: '/dungeons', label: 'Dungeon and venue directory' }]
  if (state) {
    out.push({
      href: `/dungeons/${state}`,
      label: `Dungeons in ${EAST_COAST_STATES[state].name}`,
    })
  } else {
    out.push({ href: '/dungeons/new-jersey', label: 'Dungeons in New Jersey' })
    out.push({ href: '/dungeons/pennsylvania', label: 'Dungeons in Pennsylvania' })
  }
  return out
}

/** Education (Supabase library) + static blog pillars + geo blog when state known. */
export function getLearningDiscoveryHubLinks(ctx: DiscoveryCrossLinkContext): DiscoveryLink[] {
  const state = resolveStateSlug(ctx)
  const out: DiscoveryLink[] = [
    { href: '/education', label: 'Education and articles' },
    { href: '/blog', label: 'Blog guides (beginner and regional)' },
  ]
  const pillar = BLOG_PILLAR_SLUGS[0]
  out.push({ href: `/blog/${pillar}`, label: 'What is BDSM? (blog guide)' })
  if (state) {
    out.push({
      href: `/blog/bdsm-events-in/${state}`,
      label: `Blog: BDSM events in ${EAST_COAST_STATES[state].name}`,
    })
  }
  out.push({ href: '/guidelines', label: 'Community guidelines' })
  return out
}

/** Full grouped set for nav components and related-link sections. */
export function getDiscoveryHubLinkGroups(ctx: DiscoveryCrossLinkContext) {
  return {
    events: getEventDiscoveryHubLinks(ctx),
    vendors: getVendorDiscoveryHubLinks(ctx),
    dungeons: getDungeonDiscoveryHubLinks(ctx),
    learning: getLearningDiscoveryHubLinks(ctx),
  }
}

/**
 * Compact horizontal strip for entity detail pages (event, dungeon, vendor).
 * Uses state from abbreviation when mappable to EAST_COAST_STATES.
 */
export function getDiscoveryEngineStripForStateAbbr(stateAbbr: string | undefined): DiscoveryLink[] {
  const state = stateAbbr ? stateAbbrToSlug(stateAbbr) : undefined
  if (!state) {
    return [
      { href: '/bdsm-events', label: 'BDSM events by region' },
      { href: '/dungeons', label: 'Dungeons' },
      { href: '/vendors', label: 'Vendors' },
      { href: '/education', label: 'Education' },
      { href: '/blog', label: 'Blog guides' },
    ]
  }
  const n = EAST_COAST_STATES[state].name
  return [
    { href: `/bdsm-events/${state}`, label: `Events in ${n}` },
    { href: `/dungeons/${state}`, label: `Dungeons in ${n}` },
    { href: `/vendors/${state}`, label: `Vendors in ${n}` },
    { href: `/blog/bdsm-events-in/${state}`, label: `Blog: events in ${n}` },
    { href: '/education', label: 'Education library' },
    { href: '/blog', label: 'All blog guides' },
  ]
}
