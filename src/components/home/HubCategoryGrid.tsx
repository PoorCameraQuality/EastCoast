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
  /** Subtle per-card hover border tint */
  hoverBorderClass: string
}

const formatCountLabel = (count: number, singularLabel: string) => {
  return `${count} ${count === 1 ? singularLabel : `${singularLabel}s`}`
}

function buildHubCards(counts: HubCategoryCounts): HubCard[] {
  return [
    {
      title: 'Events & Conventions',
      description: 'Weekends, conferences, and hotel takeovers—sorted by date with indoor/outdoor filters.',
      href: '/events',
      cta: 'Browse Events',
      count: counts.events,
      countLabel: 'event',
      accentClassName: 'from-cyan-500/20 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-cyan-400/35',
    },
    {
      title: 'Dungeons & Play Spaces',
      description: 'Clubs, rentals, and education-first venues—always confirm rules and vetting with the space.',
      href: '/dungeons',
      cta: 'Explore Spaces',
      count: counts.dungeons,
      countLabel: 'space',
      accentClassName: 'from-violet-500/20 via-primary-700/10 to-transparent',
      hoverBorderClass: 'hover:border-violet-400/35',
    },
    {
      title: 'Education & Learning',
      description: 'Safety frameworks, negotiation, and community norms in plain language.',
      href: '/education',
      cta: 'Start Learning',
      count: counts.articles,
      countLabel: 'article',
      accentClassName: 'from-amber-500/15 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-amber-400/30',
    },
    {
      title: 'Vendor Marketplace',
      description: 'Makers and shops you might meet at cons—filter by craft and specialty.',
      href: '/vendors',
      cta: 'Browse Vendors',
      count: counts.vendors,
      countLabel: 'vendor',
      accentClassName: 'from-rose-500/15 via-primary-600/10 to-transparent',
      hoverBorderClass: 'hover:border-rose-400/30',
    },
  ]
}

export default function HubCategoryGrid({ counts }: { counts: HubCategoryCounts }) {
  const HUB_CARDS = buildHubCards(counts)
  return (
    <section className="section-padding relative overflow-hidden bg-black" aria-labelledby="hub-title">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] motion-reduce:opacity-0"
        aria-hidden
      >
        <div className="absolute -right-20 top-16 h-80 w-80 rounded-full bg-primary-600 blur-3xl" />
        <div className="absolute bottom-10 left-[-3rem] h-72 w-72 rounded-full bg-violet-600 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-cyan-600/70 blur-3xl" />
      </div>

      <div className="container-custom relative z-10">
        <header className="mb-ecke-8 max-w-4xl md:mx-0 md:text-left mx-auto text-center md:mb-ecke-10">
          <p className="mb-ecke-2 text-sm font-medium uppercase tracking-wider text-primary-400/90">
            All 50 states · East Coast roots, nationwide reach
          </p>
          <h1 id="hub-title" className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
            Discover{' '}
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-300 bg-clip-text text-transparent">
              BDSM events &amp; dungeons
            </span>{' '}
            <span className="text-gray-200">and kink community</span>{' '}
            <span className="bg-gradient-to-r from-violet-300 to-primary-400 bg-clip-text text-transparent">
              across the United States
            </span>
          </h1>
          <p className="mx-auto mt-ecke-4 max-w-2xl text-base leading-relaxed text-gray-300 md:mx-0 md:max-w-3xl md:text-lg">
            One directory for planning—coverage in all 50 states plus more regions we list: conventions and parties by{' '}
            <Link href="/states" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              state
            </Link>
            , the monthly{' '}
            <Link href="/calendar" className="text-primary-400 underline underline-offset-2 hover:text-primary-300">
              calendar
            </Link>
            , education articles, vendors, and play-space listings. Pick a doorway below—every card opens a full hub.
          </p>

          <div className="mt-ecke-6 flex flex-wrap justify-center gap-ecke-3 md:justify-start">
            <Link
              href="/calendar"
              className="inline-flex min-h-touch items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              Calendar
            </Link>
            <Link
              href="/states"
              className="inline-flex min-h-touch items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-white/25 hover:bg-white/10"
            >
              State hubs
            </Link>
            <Link
              href="/support"
              className="inline-flex min-h-touch items-center rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-medium text-primary-100 transition hover:border-primary-400/50"
            >
              Support the site
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-ecke-6 sm:grid-cols-2">
          {HUB_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative flex min-h-touch flex-col justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-[border-color,transform] duration-300 hover:scale-[1.01] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100 md:p-8 ${card.hoverBorderClass}`}
              aria-label={`${card.title}: ${card.cta}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentClassName} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
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

