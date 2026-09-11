import EckeLink from '@/components/EckeLink'
import type { TopStateEntry } from '@/lib/topStatesByActivity'

type Props = {
  states: TopStateEntry[]
}

export default function RegionalDiscovery({ states }: Props) {
  const visibleStates = states.filter((state) => state.eventCount > 0).slice(0, 8)

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
