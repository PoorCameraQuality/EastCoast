import Link from 'next/link'
import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'

/** Curated adjacency for internal linking (SEO); not geographic perfection */
const STATE_NEIGHBORS: Partial<Record<StateSlug, StateSlug[]>> = {
  'new-jersey': ['pennsylvania', 'new-york', 'delaware'],
  pennsylvania: ['new-jersey', 'new-york', 'maryland'],
  'new-york': ['new-jersey', 'pennsylvania', 'connecticut'],
  delaware: ['pennsylvania', 'new-jersey', 'maryland'],
  maryland: ['pennsylvania', 'virginia', 'delaware'],
  virginia: ['maryland', 'north-carolina', 'washington-dc'],
  'north-carolina': ['virginia', 'south-carolina', 'georgia'],
  'south-carolina': ['north-carolina', 'georgia', 'florida'],
  georgia: ['florida', 'north-carolina', 'south-carolina'],
  florida: ['georgia', 'south-carolina'],
}

const DEFAULT_TAG_SAMPLES = ['beginner-friendly', 'rope', 'munch', 'play-party', 'classes', 'lgbtq-friendly']

const CITY_SAMPLES: string[] = [
  'philadelphia',
  'new-york-city',
  'baltimore',
  'atlanta',
  'miami',
  'charlotte',
]

function pickStates(contextState?: StateSlug): StateSlug[] {
  if (contextState && STATE_NEIGHBORS[contextState]?.length) {
    return STATE_NEIGHBORS[contextState]!.slice(0, 3)
  }
  return (['new-jersey', 'pennsylvania', 'new-york'] as StateSlug[])
}

function pickCities(contextCity?: string): string[] {
  const pool = CITY_SAMPLES.filter((c) => c !== contextCity)
  return pool.slice(0, 4)
}

type Props = {
  parsed: DiscoveryParsed
}

export default function DiscoveryRelatedLinks({ parsed }: Props) {
  let contextState: StateSlug | undefined
  let contextCity: string | undefined

  if (parsed.kind === 'state' || parsed.kind === 'stateTag') {
    contextState = parsed.stateSlug
  }
  if (parsed.kind === 'city' || parsed.kind === 'cityTag') {
    contextCity = parsed.citySlug
    const entry = CITY_BY_SLUG[parsed.citySlug]
    if (entry) {
      const abbr = entry.stateAbbr
      const match = (Object.keys(EAST_COAST_STATES) as StateSlug[]).find(
        (s) => EAST_COAST_STATES[s].abbr === abbr
      )
      contextState = match
    }
  }
  if (parsed.kind === 'special') {
    contextState = 'pennsylvania'
  }

  const stateLinks = pickStates(contextState)
  const cityLinks = pickCities(contextCity)
  const tagBaseState = contextState || ('new-jersey' as StateSlug)

  return (
    <nav className="mt-12 pt-8 border-t border-gray-800" aria-label="Explore more BDSM events">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Explore more</h2>
      <div className="grid md:grid-cols-3 gap-8 text-sm">
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Nearby states</h3>
          <ul className="space-y-2">
            {stateLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/bdsm-events/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  BDSM events in {EAST_COAST_STATES[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">City hubs</h3>
          <ul className="space-y-2">
            {cityLinks.map((slug) => {
              const c = CITY_BY_SLUG[slug]
              const label = c?.displayName || slug
              return (
                <li key={slug}>
                  <Link
                    href={`/bdsm-events/${slug}`}
                    className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Popular tags</h3>
          <ul className="space-y-2">
            {DEFAULT_TAG_SAMPLES.slice(0, 6).map((tag) => (
              <li key={tag}>
                <Link
                  href={`/bdsm-events/${tagBaseState}/${tag}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {tag.replace(/-/g, ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-6 text-xs text-gray-500">
        Also see state directories:{' '}
        <Link href="/states" className="text-primary-400 hover:underline">
          All states
        </Link>
        {' · '}
        <Link href="/events" className="text-primary-400 hover:underline">
          All events
        </Link>
      </p>
    </nav>
  )
}
