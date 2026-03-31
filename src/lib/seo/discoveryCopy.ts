import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import type { UnifiedEvent } from '@/lib/unifiedEvents'

const STATE_INTRO: Partial<
  Record<
    StateSlug,
    { lead: string; body: string }
  >
> = {
  'new-jersey': {
    lead: `If you are looking for BDSM events in New Jersey, you are in the right place. New Jersey has a growing and active kink community with everything from beginner friendly munches to large scale play parties and educational workshops.`,
    body: `Most kink events in New Jersey take place in areas like Newark, Jersey City, and along the Philadelphia corridor. You will find a mix of public social gatherings and private ticketed events that focus on safety, consent, and community building.

This page is designed to help you find BDSM events near you without having to dig through multiple platforms. Below you will find a regularly updated list of kink events, fetish parties, and BDSM friendly venues across the state.`,
  },
  pennsylvania: {
    lead: `Pennsylvania is home to one of the most active BDSM communities on the East Coast. From Philadelphia to Pittsburgh, there are regular kink events happening every week that range from casual meetups to large themed play parties.`,
    body: `Whether you are searching for a munch, a class, or a full weekend convention, Pennsylvania’s calendar mixes education, social connection, and play-forward programming. Use the listings below to plan ahead—dates and venues change, so check back often.`,
  },
  'new-york': {
    lead: `New York has one of the largest and most diverse BDSM communities in the country. From New York City to surrounding areas, there are kink events happening almost every day of the week.`,
    body: `You will find rope and impact education, LGBTQ+ inclusive spaces, newcomer-friendly socials, and larger fetish and leather gatherings. The directory below highlights upcoming events with clear dates and locations so you can find something that fits your experience level and interests.`,
  },
}

function uniqueCategories(events: UnifiedEvent[]): string[] {
  const s = new Set<string>()
  for (const e of events) {
    if (e.category) s.add(e.category)
  }
  return Array.from(s).slice(0, 8)
}

function majorCitiesHint(stateName: string): string {
  if (stateName === 'New Jersey') return 'Newark, Jersey City, and the Philadelphia metro area'
  if (stateName === 'Pennsylvania') return 'Philadelphia, Pittsburgh, and the Lehigh Valley'
  if (stateName === 'New York') return 'New York City, Brooklyn, Queens, and upstate hubs like Buffalo and Rochester'
  if (stateName === 'Florida') return 'Miami, Orlando, Tampa, and Jacksonville'
  if (stateName === 'North Carolina') return 'Charlotte, Raleigh, Durham, and Greensboro'
  return 'major metros across the state'
}

function humanizeTag(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function buildDiscoveryIntro(params: {
  parsed: DiscoveryParsed
  events: UnifiedEvent[]
  year: number
}): { h1: string; paragraphs: string[] } {
  const { parsed, events, year } = params
  const cats = uniqueCategories(events)
  const catPhrase =
    cats.length > 0
      ? cats.slice(0, 5).join(', ')
      : 'munches, classes, play parties, and conventions'

  if (parsed.kind === 'special') {
    if (parsed.special === 'weekend') {
      return {
        h1: `BDSM & Kink Events This Weekend (${year})`,
        paragraphs: [
          `Looking for kink events happening in the next few days? This page lists upcoming BDSM and fetish events with start dates within the next three days—ideal when you are searching for something immediate without sorting through months of calendar noise.`,
          `You will see a mix of socials, workshops, and play-forward gatherings where listed. Always read each organizer’s rules, dress code, and consent practices before you attend.`,
        ],
      }
    }
    return {
      h1: `BDSM Events Near Philadelphia (${year} Guide)`,
      paragraphs: [
        `The Philadelphia region draws attendees from southeastern Pennsylvania, southern New Jersey, and northern Delaware. This hub focuses on events in and around that corridor—use it when you want local options without bouncing between unrelated metro listings.`,
        `Expect a blend of rope and impact education, LGBTQ+ friendly spaces, dungeon-adjacent programming, and newcomer-oriented munches. Confirm ticketing, membership requirements, and venue policies on the organizer’s site.`,
      ],
    }
  }

  if (parsed.kind === 'state') {
    const info = EAST_COAST_STATES[parsed.stateSlug]
    const custom = STATE_INTRO[parsed.stateSlug]
    const h1 = `BDSM Events in ${info.name} (${year} Guide)`
    if (custom) {
      return {
        h1,
        paragraphs: [
          custom.lead,
          custom.body,
          `Upcoming listings below include ${catPhrase}. Venues and dates change—bookmark this page if you are tracking the ${info.name} scene over time.`,
        ],
      }
    }
    return {
      h1,
      paragraphs: [
        `If you are looking for BDSM events in ${info.name}, this directory surfaces upcoming kink events, fetish-friendly gatherings, and educational workshops in one place. We focus on consent-forward, community-rooted listings you can scan by date.`,
        `Activity clusters around ${majorCitiesHint(info.name)}. You will often find munches and classes paired with larger weekend events and conventions. The calendar below is a practical snapshot—always verify details with organizers.`,
        `For broader discovery, explore nearby states and city hubs linked at the bottom of the page. That internal map helps search engines and readers alike understand how ${info.name} fits into the wider East Coast kink ecosystem.`,
      ],
    }
  }

  if (parsed.kind === 'city') {
    const city = CITY_BY_SLUG[parsed.citySlug]
    const h1 = `BDSM Events in ${city.displayName} (${year})`
    return {
      h1,
      paragraphs: [
        `When people search for kink events near ${city.displayName}, they usually want a tight read on what is actually happening soon—not a national dump of unrelated parties. This page filters upcoming listings tied to ${city.displayName} and its immediate metro patterns.`,
        `You will see ${catPhrase} represented where data exists. If you are new, prioritize events that advertise orientation or newcomer language; if you are experienced, look for skill-specific intensives and member-driven play spaces.`,
        `Nearby dungeon and venue listings (where available) complement the event calendar so you can plan travel, parking, and accessibility with fewer surprises.`,
      ],
    }
  }

  if (parsed.kind === 'stateTag') {
    const info = EAST_COAST_STATES[parsed.stateSlug]
    const tagLabel = humanizeTag(parsed.tagSlug)
    return {
      h1: `${tagLabel} BDSM Events in ${info.name} (${year})`,
      paragraphs: [
        `If you are looking for ${tagLabel.toLowerCase()} BDSM events in ${info.name}, this page lists upcoming listings that match that tag alongside ${catPhrase}. These events take place across ${majorCitiesHint(info.name)} and range from social meetups to structured play and education.`,
        `Tags are a practical filter for long-tail searches—think “beginner rope events in New Jersey” rather than generic “BDSM events.” We still recommend reading each organizer’s framing, prerequisites, and consent norms before you RSVP.`,
        `Use related links to explore neighboring states and other tags so you can widen or narrow your search without losing context.`,
      ],
    }
  }

  const city = CITY_BY_SLUG[parsed.citySlug]
  const tagLabel = humanizeTag(parsed.tagSlug)
  return {
    h1: `${tagLabel} Events in ${city.displayName} (${year})`,
    paragraphs: [
      `This page combines the “${tagLabel}” filter with a ${city.displayName}-focused location filter. That pairing is useful when you want kink events near a specific metro rather than an entire state’s calendar.`,
      `Below you will find ${catPhrase} where listings match both the tag and the city scope. Availability changes seasonally—especially for rope intensives, conventions, and ticketed play parties.`,
    ],
  }
}
