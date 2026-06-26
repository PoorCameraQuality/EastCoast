import EckeLink from '@/components/EckeLink'
import type { TopStateEntry } from '@/lib/topStatesByActivity'

type Props = {
  featuredState: TopStateEntry | null
  states: TopStateEntry[]
}

export default function RegionalDiscovery({ featuredState, states }: Props) {
  const gridStates = states.filter((s) => s.slug !== featuredState?.slug).slice(0, 8)

  return (
    <section className="sf-section-tight" aria-labelledby="regional-discovery-title">
      <div className="container-custom">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="regional-discovery-title" className="sf-title">
              Explore by region
            </h2>
            <p className="sf-subhead">Start where you are, or where you will travel.</p>
          </div>
          <EckeLink href="/states" className="sf-btn-ghost shrink-0 text-sm">
            All states
          </EckeLink>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {featuredState ? (
            <EckeLink
              href={`/states/${featuredState.slug}`}
              className="sf-card-lift inline-flex items-center gap-3 rounded-lg border border-sf-violet/30 bg-sf-violet/10 px-4 py-3"
            >
              <span className="text-lg font-bold tabular-nums text-sf-violet">{featuredState.abbr}</span>
              <span>
                <span className="block text-sm font-semibold text-sf-strong">{featuredState.name}</span>
                <span className="text-xs text-sf-muted">
                  {featuredState.eventCount} events · {featuredState.dungeonCount} spaces
                </span>
              </span>
            </EckeLink>
          ) : null}
          {gridStates.map((state) => (
            <EckeLink
              key={state.slug}
              href={`/states/${state.slug}`}
              className="sf-card-lift rounded-lg border border-white/10 bg-sf-card px-3 py-2.5 transition-colors hover:border-sf-violet/25"
            >
              <span className="text-sm font-bold tabular-nums text-sf-blue">{state.abbr}</span>
              <span className="ml-2 text-sm text-sf-body">{state.name}</span>
            </EckeLink>
          ))}
        </div>
      </div>
    </section>
  )
}
