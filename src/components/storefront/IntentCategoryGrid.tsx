import EckeLink from '@/components/EckeLink'
import type { HubCategoryCounts } from '@/lib/homeHubCounts'

type Props = {
  counts: HubCategoryCounts
}

const CATEGORIES = [
  {
    key: 'events',
    title: 'Find an event',
    href: '/events',
    countKey: 'events' as const,
  },
  {
    key: 'places',
    title: 'Explore places',
    href: '/dungeons',
    countKey: 'dungeons' as const,
  },
  {
    key: 'vendors',
    title: 'Shop vendors',
    href: '/vendors',
    countKey: 'vendors' as const,
  },
  {
    key: 'education',
    title: 'Learn',
    href: '/education',
    countKey: null,
  },
] as const

export default function IntentCategoryGrid({ counts }: Props) {
  return (
    <section className="sf-section-tight bg-sf-surface/50" aria-labelledby="intent-categories-title">
      <div className="container-custom">
        <h2 id="intent-categories-title" className="sf-title">
          Start exploring
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const count = cat.countKey ? counts[cat.countKey] : null
            return (
              <EckeLink
                key={cat.key}
                href={cat.href}
                className="sf-card-lift flex min-h-11 flex-col items-center justify-center rounded-xl border border-white/10 bg-sf-card px-3 py-4 text-center transition-colors hover:border-sf-violet/30 hover:bg-sf-surface"
              >
                <p className="text-xs font-medium text-sf-blue sm:text-sm">{cat.title}</p>
                {count != null ? (
                  <p className="mt-1 text-lg font-bold tabular-nums text-sf-strong">{count}</p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-sf-muted">Guides</p>
                )}
              </EckeLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
