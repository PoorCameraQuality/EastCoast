import Link from 'next/link'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import {
  getEventDiscoveryHubLinks,
  getLearningDiscoveryHubLinks,
  getVendorDiscoveryHubLinks,
} from '@/lib/discoveryCrossLinks'
import {
  SWING_SEO_HUB_LABELS,
  SWING_SEO_HUB_TAG_SLUGS,
  type SwingSeoHubTagSlug,
} from '@/lib/swingHubTagMap'
import type { ParsedSwingDiscovery } from '@/lib/parseSwingDiscoverySlug'

function stateSlugFromAbbr(abbr: string): StateSlug | undefined {
  for (const slug of Object.keys(EAST_COAST_STATES) as StateSlug[]) {
    if (EAST_COAST_STATES[slug].abbr === abbr) return slug
  }
  return undefined
}

const STATE_NEIGHBORS: Partial<Record<StateSlug, StateSlug[]>> = {
  'new-jersey': ['pennsylvania', 'new-york', 'delaware'],
  pennsylvania: ['new-jersey', 'new-york', 'maryland'],
  'new-york': ['new-jersey', 'pennsylvania', 'connecticut'],
  delaware: ['pennsylvania', 'new-jersey', 'maryland'],
  maryland: ['pennsylvania', 'virginia', 'delaware'],
  virginia: ['maryland', 'north-carolina', 'washington-dc'],
  florida: ['georgia', 'south-carolina'],
  california: ['nevada', 'arizona', 'oregon'],
  texas: ['oklahoma', 'louisiana', 'arkansas'],
  nevada: ['california', 'arizona', 'utah'],
}

const DEFAULT_TAG_HUBS: SwingSeoHubTagSlug[] = ['byob', 'on-premise', 'members-only']
const DEFAULT_STATE_HUBS = (['new-jersey', 'pennsylvania', 'california', 'texas'] as const).filter(
  (s) => s in EAST_COAST_STATES
)

function pickTagHubs(contextTag?: SwingSeoHubTagSlug): SwingSeoHubTagSlug[] {
  return DEFAULT_TAG_HUBS.filter((t) => t !== contextTag).slice(0, 3)
}

function pickStateHubs(contextState?: StateSlug): StateSlug[] {
  if (contextState && STATE_NEIGHBORS[contextState]?.length) {
    return STATE_NEIGHBORS[contextState]!.slice(0, 3)
  }
  return [...DEFAULT_STATE_HUBS]
}

type Props = {
  parsed: Extract<ParsedSwingDiscovery, { kind: 'hub' }>
}

export default function SwingDiscoveryRelatedLinks({ parsed }: Props) {
  let contextState: StateSlug | undefined
  let contextTag: SwingSeoHubTagSlug | undefined

  if (parsed.variant === 'state' || parsed.variant === 'stateTag') {
    contextState = parsed.stateSlug
  }
  if (parsed.variant === 'tag' || parsed.variant === 'stateTag' || parsed.variant === 'cityTag') {
    contextTag = parsed.tagSlug
  }
  if (
    (parsed.variant === 'city' || parsed.variant === 'cityTag') &&
    parsed.citySlug in CITY_BY_SLUG
  ) {
    const abbr = CITY_BY_SLUG[parsed.citySlug].stateAbbr
    contextState = stateSlugFromAbbr(abbr)
  }

  const stateLinks = pickStateHubs(contextState)
  const tagLinks = pickTagHubs(contextTag)
  const extraTagLinks: SwingSeoHubTagSlug[] = (SWING_SEO_HUB_TAG_SLUGS as readonly SwingSeoHubTagSlug[])
    .filter((t) => !tagLinks.includes(t))
    .slice(0, 1)

  const eventHubLinks = getEventDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 5)
  const shopGuideLinks = [
    ...getVendorDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 2),
    ...getLearningDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 3),
  ].slice(0, 5)

  return (
    <nav className="mt-12 pt-8 border-t border-gray-800" aria-label="More swing club discovery">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Explore more</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <section>
          <h3 className="text-violet-400 font-semibold mb-3">Club topics</h3>
          <ul className="space-y-2">
            {tagLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/swing-clubs/${slug}`}
                  className="text-gray-300 hover:text-violet-300 underline-offset-2 hover:underline"
                >
                  {SWING_SEO_HUB_LABELS[slug]}
                </Link>
              </li>
            ))}
            {extraTagLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/swing-clubs/${slug}`}
                  className="text-gray-300 hover:text-violet-300 underline-offset-2 hover:underline"
                >
                  {SWING_SEO_HUB_LABELS[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-violet-400 font-semibold mb-3">By state</h3>
          <ul className="space-y-2">
            {stateLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/swing-clubs/${slug}`}
                  className="text-gray-300 hover:text-violet-300 underline-offset-2 hover:underline"
                >
                  {EAST_COAST_STATES[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-violet-400 font-semibold mb-3">Events</h3>
          <ul className="space-y-2">
            {eventHubLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-gray-300 hover:text-violet-300 underline-offset-2 hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-violet-400 font-semibold mb-3">Shops & guides</h3>
          <ul className="space-y-2">
            {shopGuideLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-gray-300 hover:text-violet-300 underline-offset-2 hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Looking for kink-first venues?{' '}
        <Link href="/dungeons" className="text-primary-400 hover:underline">
          Browse dungeons &amp; play spaces
        </Link>
      </p>
    </nav>
  )
}
