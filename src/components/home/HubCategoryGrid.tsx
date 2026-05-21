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
  hoverBorderClass: string
}

const formatCountLabel = (count: number, singularLabel: string) => {
  return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`
}

function buildHubCards(counts: HubCategoryCounts): HubCard[] {
  return [
    {
      title: 'Events & Conventions',
      description: 'Weekends and hotel takeovers—sorted by date.',
      href: '/events',
      cta: 'Browse Events',
      count: counts.events,
      countLabel: 'event',
      accentClassName: 'from-cyan-500/20 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-cyan-400/35',
    },
    {
      title: 'Dungeons & Play Spaces',
      description: 'Clubs and venues—confirm rules with each space.',
      href: '/dungeons',
      cta: 'Explore Spaces',
      count: counts.dungeons,
      countLabel: 'space',
      accentClassName: 'from-violet-500/20 via-primary-700/10 to-transparent',
      hoverBorderClass: 'hover:border-violet-400/35',
    },
    {
      title: 'Vendor Marketplace',
      description: 'Makers and shops you may see at cons.',
      href: '/vendors',
      cta: 'Browse Vendors',
      count: counts.vendors,
      countLabel: 'vendor',
      accentClassName: 'from-rose-500/15 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-rose-400/30',
    },
    {
      title: 'Event Calendar',
      description: 'Plan by month across regions.',
      href: '/calendar',
      cta: 'Open Calendar',
      count: counts.events,
      countLabel: 'listing',
      accentClassName: 'from-amber-500/15 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-amber-400/30',
    },
  ]
}

export default function HubCategoryGrid({ counts }: { counts: HubCategoryCounts }) {
  const HUB_CARDS = buildHubCards(counts)
  return (
    <section className="section-padding relative overflow-hidden bg-black" aria-labelledby="hub-cards-title">
      <div
        className="home-ambient -left-16 top-1/4 h-72 w-72 bg-violet-600/15 opacity-50 motion-reduce:opacity-0"
        aria-hidden
      />
      <div
        className="home-ambient -right-10 bottom-0 h-64 w-64 bg-primary-600/12 opacity-50 motion-reduce:opacity-0"
        aria-hidden
      />
      <div className="container-custom relative z-10">
        <h2 id="hub-cards-title" className="sr-only">
          Explore the directory
        </h2>
        <div className="grid grid-cols-1 gap-ecke-6 sm:grid-cols-2">
          {HUB_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative flex min-h-touch flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-[border-color,transform,box-shadow] duration-300 hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100 md:p-8 ${card.hoverBorderClass}`}
              aria-label={`${card.title}: ${card.cta}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentClassName} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              <div className="relative z-10">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-serif font-semibold text-white transition-colors duration-300 group-hover:text-primary-300 md:text-2xl">
                    {card.title}
                  </h3>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-200/80">
                    {formatCountLabel(card.count, card.countLabel)}
                  </span>
                </div>
                <p className="mb-4 line-clamp-1 text-gray-400">{card.description}</p>
                <div className="inline-flex items-center gap-2 font-semibold text-primary-300">
                  <span>{card.cta}</span>
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
