import EckeLink from '@/components/EckeLink'
import type { TopStateEntry } from '@/lib/topStatesByActivity'

/** Pinned homepage states (handoff top performers). */
const PINNED_STATE_SLUGS = [
  'pennsylvania',
  'california',
  'texas',
  'florida',
  'maryland',
  'illinois',
  'washington-dc',
  'new-york',
] as const

type Props = {
  states: TopStateEntry[]
}

function pickPinnedStates(states: TopStateEntry[]): TopStateEntry[] {
  const bySlug = new Map(states.map((state) => [state.slug, state]))
  const pinned = PINNED_STATE_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (state): state is TopStateEntry => Boolean(state),
  )
  if (pinned.length >= 6) return pinned.slice(0, 8)
  const pinnedSet = new Set<string>(PINNED_STATE_SLUGS)
  const extras = states.filter((state) => !pinnedSet.has(state.slug))
  return [...pinned, ...extras].slice(0, 8)
}

export default function RegionalDiscovery({ states }: Props) {
  const visibleStates = pickPinnedStates(states)

  return (
    <section className="sf-section-tight" aria-labelledby="regional-discovery-title">
      <div className="container-custom">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="regional-discovery-title" className="sf-title">
              Find events near you
            </h2>
          </div>
          <EckeLink
            href="/states"
            className="inline-flex min-h-11 items-center text-sm font-medium text-sf-blue hover:text-sf-strong"
          >
            View all states →
          </EckeLink>
        </div>

        <ul className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {visibleStates.map((state) => (
            <li key={state.slug}>
              <EckeLink
                href={`/states/${state.slug}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-md px-1 py-2.5 text-sm text-sf-body transition-colors hover:bg-white/5 hover:text-sf-strong"
              >
                <span>
                  <span className="font-semibold text-sf-strong">{state.name}</span>
                  <span className="ml-2 text-sf-muted">{state.abbr}</span>
                </span>
                <span className="tabular-nums text-xs text-sf-muted">
                  {state.eventCount} events
                </span>
              </EckeLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
