import EckeLink from '@/components/EckeLink'
import type { HubCategoryCounts } from '@/lib/homeHubCounts'

type Props = {
  counts: HubCategoryCounts
}

const CATEGORIES = [
  {
    key: 'events',
    title: 'Find an event',
    description: 'Conventions, parties, workshops, and community nights.',
    href: '/events',
    cta: 'Browse events',
    gradient: 'from-sf-violet/20 via-sf-card to-sf-surface',
    bar: 'bg-sf-violet',
    countKey: 'events' as const,
  },
  {
    key: 'places',
    title: 'Explore places',
    description: 'Dungeons, clubs, studios, and play spaces.',
    href: '/dungeons',
    cta: 'Explore places',
    gradient: 'from-sf-blue/15 via-sf-card to-sf-surface',
    bar: 'bg-sf-blue',
    countKey: 'dungeons' as const,
  },
  {
    key: 'vendors',
    title: 'Shop vendors',
    description: 'Makers, gear shops, artists, and convention vendors.',
    href: '/vendors',
    cta: 'Shop vendors',
    gradient: 'from-sf-warm/12 via-sf-card to-sf-surface',
    bar: 'bg-sf-warm',
    countKey: 'vendors' as const,
  },
  {
    key: 'education',
    title: 'Learn before you go',
    description: 'Etiquette, consent, safety, and event prep guides.',
    href: '/education',
    cta: 'Read guides',
    gradient: 'from-sf-fresh/10 via-sf-card to-sf-surface',
    bar: 'bg-sf-fresh',
    countKey: null,
  },
] as const

export default function IntentCategoryGrid({ counts }: Props) {
  return (
    <section className="sf-section-tight bg-sf-surface/50" aria-labelledby="intent-categories-title">
      <div className="container-custom">
        <h2 id="intent-categories-title" className="sf-title">
          Browse by intent
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const count = cat.countKey ? counts[cat.countKey] : null
            return (
              <EckeLink
                key={cat.key}
                href={cat.href}
                className={`sf-card-lift group flex min-h-[10.5rem] flex-col rounded-xl border border-white/10 bg-gradient-to-br p-5 ${cat.gradient}`}
              >
                <span className={`h-1 w-8 rounded-full ${cat.bar}`} aria-hidden />
                <h3 className="mt-3 font-sans text-base font-semibold text-sf-strong">{cat.title}</h3>
                {count != null ? (
                  <p className="mt-1 text-xs tabular-nums text-sf-violet">{count} listings</p>
                ) : null}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-sf-muted">{cat.description}</p>
                <span className="mt-3 text-sm font-medium text-sf-blue group-hover:text-sf-strong">
                  {cat.cta} →
                </span>
              </EckeLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
