import Link from 'next/link'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'
import {
  getEventDiscoveryHubLinks,
  getLearningDiscoveryHubLinks,
  getVendorDiscoveryHubLinks,
} from '@/lib/discoveryCrossLinks'
import {
  DUNGEON_SEO_HUB_LABELS,
  DUNGEON_SEO_HUB_TAG_SLUGS,
  type DungeonSeoHubTagSlug,
} from '@/lib/dungeonHubTagMap'
import type { ParsedDungeonDiscovery } from '@/lib/parseDungeonDiscoverySlug'

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
  'north-carolina': ['virginia', 'south-carolina', 'georgia'],
  'south-carolina': ['north-carolina', 'georgia', 'florida'],
  georgia: ['florida', 'north-carolina', 'south-carolina'],
  florida: ['georgia', 'south-carolina'],
}

const DEFAULT_TAG_HUBS: DungeonSeoHubTagSlug[] = [
  'rope-friendly',
  'members-only',
  'classes',
  'impact-play',
]
const DEFAULT_STATE_HUBS = (['new-jersey', 'pennsylvania', 'maryland'] as const).filter(
  (s) => s in EAST_COAST_STATES
)

function pickTagHubs(contextTag?: DungeonSeoHubTagSlug): DungeonSeoHubTagSlug[] {
  return DEFAULT_TAG_HUBS.filter((t) => t !== contextTag).slice(0, 3)
}

function pickStateHubs(contextState?: StateSlug): StateSlug[] {
  if (contextState && STATE_NEIGHBORS[contextState]?.length) {
    return STATE_NEIGHBORS[contextState]!.slice(0, 3)
  }
  return [...DEFAULT_STATE_HUBS]
}

type Props = {
  parsed: Extract<ParsedDungeonDiscovery, { kind: 'hub' }>
}

export default function DungeonDiscoveryRelatedLinks({ parsed }: Props) {
  let contextState: StateSlug | undefined
  let contextTag: DungeonSeoHubTagSlug | undefined

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
  const extraTagLinks: DungeonSeoHubTagSlug[] = (DUNGEON_SEO_HUB_TAG_SLUGS as readonly DungeonSeoHubTagSlug[])
    .filter((t) => !tagLinks.includes(t))
    .slice(0, 1)

  const eventHubLinks = getEventDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 5)
  const shopGuideLinks = [
    ...getVendorDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 2),
    ...getLearningDiscoveryHubLinks({ stateSlug: contextState }).slice(0, 3),
  ].slice(0, 5)

  return (
    <nav className="mt-12 pt-8 border-t border-gray-800" aria-label="More dungeon discovery">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Explore more</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Venue topics</h3>
          <ul className="space-y-2">
            {tagLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/dungeons/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {DUNGEON_SEO_HUB_LABELS[slug]}
                </Link>
              </li>
            ))}
            {extraTagLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/dungeons/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {DUNGEON_SEO_HUB_LABELS[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">By state</h3>
          <ul className="space-y-2">
            {stateLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/dungeons/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {EAST_COAST_STATES[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Events</h3>
          <ul className="space-y-2">
            {eventHubLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Shops & guides</h3>
          <ul className="space-y-2">
            {shopGuideLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </nav>
  )
}
