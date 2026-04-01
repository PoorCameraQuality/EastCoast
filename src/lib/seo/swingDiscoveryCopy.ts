import type { ParsedSwingDiscovery } from '@/lib/parseSwingDiscoverySlug'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { SWING_SEO_HUB_LABELS, type SwingSeoHubTagSlug } from '@/lib/swingHubTagMap'

const STATE_BLURB: Partial<Record<StateSlug, string>> = {
  'new-jersey': 'Newark, Jersey City, and shore communities',
  pennsylvania: 'Philadelphia, Pittsburgh, and statewide lifestyle networks',
  'new-york': 'New York City, Buffalo, Rochester, and upstate',
  maryland: 'Baltimore, the DC suburbs, and the Chesapeake region',
  florida: 'Miami, Orlando, Tampa, and the Gulf and Atlantic coasts',
  california: 'Los Angeles, San Francisco, San Diego, and statewide',
  texas: 'Dallas–Fort Worth, Houston, Austin, San Antonio, and statewide',
  nevada: 'Las Vegas and Reno metro areas',
}

function stateCities(slug: StateSlug): string {
  return STATE_BLURB[slug] || `communities across ${EAST_COAST_STATES[slug].name}`
}

type BuildArgs = {
  parsed: Extract<ParsedSwingDiscovery, { kind: 'hub' }>
  swingCount: number
  year: number
}

export function buildSwingDiscoveryIntro(args: BuildArgs): { h1: string; paragraphs: string[] } {
  const { parsed, swingCount, year } = args
  const countLine =
    swingCount === 0
      ? 'We are expanding coverage; submit a listing if your club is missing.'
      : `This directory slice lists ${swingCount} club${swingCount === 1 ? '' : 's'} that match your filters—on-premise venues, BYOB clubs, and members-only spaces.`

  if (parsed.variant === 'state') {
    const st = parsed.stateSlug
    const { name } = EAST_COAST_STATES[st]
    const h1 = `Swing & lifestyle clubs in ${name}`
    const paragraphs = [
      `Looking for swingers clubs, lifestyle lounges, and on-premise social clubs in ${name}? This page highlights physical venues that host couples, single women, and (where permitted) single men—often with BYOB policies, membership, and dress codes. ${countLine}`,
      `Clubs in ${name} serve ${stateCities(st)}. Policies vary—RSVP, ID checks, membership tiers, and alcohol rules are common. Always read each venue’s site before you go: hours, pricing, and newcomer nights change. We list vetted public information; inclusion is not an endorsement of every policy or event.`,
      `Use this hub as a geographic starting point, then open individual listings for addresses (when published), contact channels, and house rules. Pair discovery with our events calendar for regional parties and conventions.`,
      `Throughout ${year} we refine listings as clubs update sites. If you operate a venue here, use the contact form so travelers and locals can find you responsibly.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'city') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    const h1 = `Lifestyle clubs in ${entry.displayName}`
    const paragraphs = [
      `Searching for swing and lifestyle clubs in ${entry.displayName}? Urban metros often host a mix of on-premise clubs, hotel-adjacent venues, and members-only lounges. This filtered view shows listings whose city and state align with ${entry.displayName} and ${entry.stateAbbr}. ${countLine}`,
      `Compare excerpts for BYOB rules, membership language, and whether single men are welcome on certain nights. Respect posted photography rules, consent culture, and staff direction.`,
      `For broader travel, browse the parent state hub and neighboring states from related links.`,
      `Listings change; confirm details on official sites. We aim to keep ${entry.displayName} coverage accurate for ${year} and welcome corrections via contact.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'tag') {
    const label = SWING_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `Swing clubs: ${label}`
    const paragraphs = [
      `This topic hub focuses on ${label} across our catalog. Tags are inferred from how venues describe themselves—BYOB, on-premise play, membership models, and who is welcome at the door. ${countLine}`,
      `Not every space fits a single label; some run both dance nights and private playrooms. Read each listing’s long description for nuance.`,
      `Combine this view with state or city hubs to narrow geography. Events listed below are upcoming happenings in states where matching clubs exist.`,
      `We refresh the underlying data through ${year}. If you represent a venue, ensure your public site states policies clearly so our inference stays aligned.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'stateTag') {
    const st = parsed.stateSlug
    const { name } = EAST_COAST_STATES[st]
    const label = SWING_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `${label} in ${name}`
    const paragraphs = [
      `Looking for ${label.toLowerCase()} in ${name}? This combined filter surfaces venues tagged for that theme while located in ${name}. ${countLine}`,
      `Regional density varies: some states have several clubs; others rely on travel to neighboring metros. Check individual pages for exact cities and whether addresses are public or released after registration.`,
      `Upcoming events below are filtered to the same state so you can align travel with parties that week.`,
      `Tags are heuristic; verify on official channels. We will continue tuning coverage for ${year} as spaces update programming.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'cityTag') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    const label = SWING_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `${label} — ${entry.displayName}`
    const paragraphs = [
      `This page combines ${entry.displayName} geography with the “${(parsed.tagSlug as SwingSeoHubTagSlug).replace(/-/g, ' ')}” theme. ${countLine}`,
      `Metro spaces may share parking, transit, and hotel corridors with larger events—cross-check the events block for dates near your trip.`,
      `Explore neighboring city and state hubs if this filter returns few results.`,
      `We monitor listings through ${year}; suggest updates via the site contact form if something is outdated.`,
    ]
    return { h1, paragraphs }
  }

  throw new Error('Unreachable swing hub variant')
}
