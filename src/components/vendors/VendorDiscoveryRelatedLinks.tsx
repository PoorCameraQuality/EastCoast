import Link from 'next/link'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import type { ParsedVendorDiscovery } from '@/lib/parseVendorDiscoverySlug'

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

const DEFAULT_TAG_HUBS = ['rope', 'latex', 'leather', 'impact'] as const
const DEFAULT_STATE_HUBS = (['new-jersey', 'pennsylvania', 'new-york'] as const).filter(
  (s) => s in EAST_COAST_STATES
)

function pickTagHubs(contextTag?: string): string[] {
  const pool = DEFAULT_TAG_HUBS.filter((t) => t !== contextTag)
  return pool.slice(0, 3)
}

function pickStateHubs(contextState?: StateSlug): StateSlug[] {
  if (contextState && STATE_NEIGHBORS[contextState]?.length) {
    return STATE_NEIGHBORS[contextState]!.slice(0, 3)
  }
  return [...DEFAULT_STATE_HUBS]
}

type Props = {
  parsed: Extract<ParsedVendorDiscovery, { kind: 'hub' }>
}

export default function VendorDiscoveryRelatedLinks({ parsed }: Props) {
  let contextState: StateSlug | undefined
  let contextTag: string | undefined

  if (parsed.variant === 'state' || parsed.variant === 'stateTag') {
    contextState = parsed.stateSlug
  }
  if (parsed.variant === 'tag' || parsed.variant === 'stateTag') {
    contextTag = parsed.seoTagSlug
  }
  if (parsed.variant === 'online') {
    contextState = 'pennsylvania'
  }

  const stateLinks = pickStateHubs(contextState)
  const tagLinks = pickTagHubs(contextTag)

  return (
    <nav className="mt-12 pt-8 border-t border-gray-800" aria-label="More vendor discovery">
      <h2 className="text-2xl font-serif font-bold text-white mb-6">Explore more</h2>
      <div className="grid md:grid-cols-3 gap-8 text-sm">
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Vendor topics</h3>
          <ul className="space-y-2">
            {tagLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/vendors/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {slug.replace(/-/g, ' ')} vendors
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Vendors by state</h3>
          <ul className="space-y-2">
            {stateLinks.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/vendors/${slug}`}
                  className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
                >
                  {EAST_COAST_STATES[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="text-primary-400 font-semibold mb-3">Events & calendar</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/bdsm-events/new-jersey"
                className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
              >
                BDSM events in New Jersey
              </Link>
            </li>
            <li>
              <Link
                href="/bdsm-events/pennsylvania"
                className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
              >
                BDSM events in Pennsylvania
              </Link>
            </li>
            <li>
              <Link
                href="/bdsm-events/this-weekend"
                className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
              >
                BDSM events this weekend
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                className="text-gray-300 hover:text-primary-300 underline-offset-2 hover:underline"
              >
                All upcoming events
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </nav>
  )
}
