import type { ParsedDungeonDiscovery } from '@/lib/parseDungeonDiscoverySlug'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import { DUNGEON_SEO_HUB_LABELS, type DungeonSeoHubTagSlug } from '@/lib/dungeonHubTagMap'

const STATE_BLURB: Partial<Record<StateSlug, string>> = {
  'new-jersey': 'Newark, Jersey City, and shore communities',
  pennsylvania: 'Philadelphia, Pittsburgh, and statewide kink networks',
  'new-york': 'New York City, Buffalo, Rochester, and upstate',
  maryland: 'Baltimore, the DC suburbs, and the Chesapeake region',
  virginia: 'Northern Virginia, Richmond, and Hampton Roads',
  florida: 'Miami, Orlando, Tampa, and the Gulf and Atlantic coasts',
}

function stateCities(slug: StateSlug): string {
  return (
    STATE_BLURB[slug] ||
    `communities across ${EAST_COAST_STATES[slug].name}`
  )
}

type BuildArgs = {
  parsed: Extract<ParsedDungeonDiscovery, { kind: 'hub' }>
  dungeonCount: number
  year: number
}

export function buildDungeonDiscoveryIntro(args: BuildArgs): { h1: string; paragraphs: string[] } {
  const { parsed, dungeonCount, year } = args
  const countLine =
    dungeonCount === 0
      ? 'We are expanding coverage; submit a listing if your space is missing.'
      : `This directory slice lists ${dungeonCount} space${dungeonCount === 1 ? '' : 's'} that match your filters—nonprofits, private clubs, and hybrid venues.`

  if (parsed.variant === 'state') {
    const st = parsed.stateSlug
    const { name } = EAST_COAST_STATES[st]
    const h1 = `BDSM dungeons & kink venues in ${name}`
    const paragraphs = [
      `Looking for BDSM dungeons in ${name}? This page highlights physical venues that anchor local kink communities: play spaces, education nights, member socials, and structured environments for negotiation and consent. Many operate as 501(c)(7) social clubs or private memberships; others rent or partner for classes and rope shares. ${countLine}`,
      `Spaces in ${name} serve ${stateCities(st)}. Policies vary—RSVP, ID checks, membership tiers, and alcohol rules are common. Always read each venue’s site before you go: hours, pricing, and newcomer nights change. We list vetted public information; inclusion is not an endorsement of every policy or event.`,
      `Use this hub as a geographic starting point, then open individual listings for addresses (when published), contact channels, and programming. Pair discovery with our events calendar and regional BDSM event hubs for weekends and conventions that may visit or partner with these spaces.`,
      `Throughout ${year} we refine listings as clubs update sites. If you operate a venue here, use the dungeon submission flow on the main dungeons page so travelers and locals can find you responsibly.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'city') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    const h1 = `Kink clubs & dungeons in ${entry.displayName}`
    const paragraphs = [
      `Searching for kink clubs in ${entry.displayName}? Urban metros often host a mix of dedicated dungeons, creative collectives with rope-friendly studios, and private clubs with membership vetting. This filtered view shows listings whose city and state align with ${entry.displayName} and ${entry.stateAbbr}. ${countLine}`,
      `City venues are the physical anchor for classes, munches-adjacent socials, and facilitated play when scheduling allows. Compare excerpts for membership language, newcomer nights, and workshop series. Respect posted photography rules, consent culture, and staff direction.`,
      `For broader travel, browse the parent state hub and neighboring states from related links. Cross-link to vendors for gear and to education articles for negotiation and risk awareness before you attend a new space.`,
      `Listings change; confirm details on official sites. We aim to keep ${entry.displayName} coverage accurate for ${year} and welcome corrections via contact.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'tag') {
    const label = DUNGEON_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `BDSM venues: ${label}`
    const paragraphs = [
      `This topic hub focuses on ${label} across our catalog. Tags are inferred from how venues describe themselves—membership models, rope-friendly programming, impact-ready dungeons, workshops, and newcomer-friendly outreach. ${countLine}`,
      `Not every space fits a single label; some run both classes and members-only parties. Read each listing’s long description for nuance. When in doubt, email the venue or attend an advertised outreach night before committing to membership.`,
      `Combine this view with state or city hubs to narrow geography. Events listed below are upcoming happenings in states where matching venues exist—useful when planning travel around a specific play style or access model.`,
      `We refresh the underlying data through ${year}. If you represent a venue, ensure your public site states policies clearly so our inference and readers stay aligned.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'stateTag') {
    const st = parsed.stateSlug
    const { name } = EAST_COAST_STATES[st]
    const label = DUNGEON_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `${label} in ${name}`
    const paragraphs = [
      `Looking for ${label} in ${name}? This combined filter surfaces venues tagged for that theme while located in ${name} (or matching our registry for that state). ${countLine}`,
      `Regional density varies: some states have several nonprofits; others rely on traveling events or neighboring metros. Check individual pages for exact cities and whether addresses are public or released after registration.`,
      `Upcoming events below are filtered to the same state so you can align travel with parties, classes, or cons that week. Vendors and education guides in related links support safer gear choices and skills before you play.`,
      `Tags are heuristic; verify on official channels. We will continue tuning coverage for ${year} as spaces update programming.`,
    ]
    return { h1, paragraphs }
  }

  if (parsed.variant === 'cityTag') {
    const entry = CITY_BY_SLUG[parsed.citySlug]
    const label = DUNGEON_SEO_HUB_LABELS[parsed.tagSlug]
    const h1 = `${label} — ${entry.displayName}`
    const paragraphs = [
      `This page combines ${entry.displayName} geography with the “${parsed.tagSlug.replace(/-/g, ' ')}” theme. It is meant for locals and visitors who already know the metro and want a narrower slice of venues. ${countLine}`,
      `Metro spaces may share parking, transit, and hotel corridors with larger events—cross-check the events block for dates near your trip. Membership and guest policies still apply per venue.`,
      `Explore vendors for equipment and education for skills and consent frameworks. Neighboring city and state hubs help if this filter returns few results.`,
      `We monitor listings through ${year}; suggest updates via the site contact form if something is outdated.`,
    ]
    return { h1, paragraphs }
  }

  throw new Error('Unreachable dungeon hub variant')
}
