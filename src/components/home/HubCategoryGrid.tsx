import Link from 'next/link'
import type { HubCategoryCounts } from '@/lib/homeHubCounts'

type HubCard = {
  title: string
  description: string
  href: string
  cta: string
  count: number
  countLabel: string
  accentClassName: string
}

const formatCountLabel = (count: number, singularLabel: string) => {
  return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`
}

function buildHubCards(counts: HubCategoryCounts): HubCard[] {
  return [
    {
      title: 'Events & Conventions',
      description: 'Find conferences, workshops, and gatherings.',
      href: '/events',
      cta: 'Browse Events',
      count: counts.events,
      countLabel: 'event',
      accentClassName: 'from-primary-500/15 to-blue-500/10',
    },
    {
      title: 'Dungeons & Play Spaces',
      description: 'Explore vetted venues and community spaces.',
      href: '/dungeons',
      cta: 'Explore Spaces',
      count: counts.dungeons,
      countLabel: 'space',
      accentClassName: 'from-blue-500/15 to-primary-500/10',
    },
    {
      title: 'Education & Learning',
      description: 'Safety guides, articles, and resources.',
      href: '/education',
      cta: 'Start Learning',
      count: counts.articles,
      countLabel: 'article',
      accentClassName: 'from-primary-500/10 to-blue-500/15',
    },
    {
      title: 'Vendor Marketplace',
      description: 'Browse gear, apparel, and artisan shops.',
      href: '/vendors',
      cta: 'Browse Vendors',
      count: counts.vendors,
      countLabel: 'vendor',
      accentClassName: 'from-blue-500/10 to-primary-500/15',
    },
  ]
}

export default function HubCategoryGrid({ counts }: { counts: HubCategoryCounts }) {
  const HUB_CARDS = buildHubCards(counts)
  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black relative overflow-hidden" aria-labelledby="hub-title">
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h1 id="hub-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Discover BDSM Events, Dungeons & Kink Community on the East Coast
          </h1>
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-gray-300 mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discovery hub for kink &amp; BDSM on the East Coast (and beyond): events near you by{' '}
            <Link href="/states" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
              state
            </Link>
            ,{' '}
            <Link href="/calendar" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
              calendar
            </Link>
            , education, vendors, and dungeons—all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HUB_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative flex min-h-touch flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 transition-[border-color,transform] duration-300 hover:scale-[1.01] hover:border-white/25 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
              aria-label={`${card.title}: ${card.cta}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentClassName} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white group-hover:text-primary-300 transition-colors duration-300">
                    {card.title}
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-200/80 bg-white/10 border border-white/10 rounded-full px-3 py-1">
                    {formatCountLabel(card.count, card.countLabel)}
                  </span>
                </div>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {card.description}
                </p>
                <div className="inline-flex items-center gap-2 text-primary-300 font-semibold">
                  <span>{card.cta}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

