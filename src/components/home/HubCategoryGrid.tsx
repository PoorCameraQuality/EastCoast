import Link from 'next/link'

type HubCard = {
  title: string
  description: string
  href: string
  cta: string
  accentClassName: string
}

const HUB_CARDS: HubCard[] = [
  {
    title: 'Events & Conventions',
    description: 'Find conferences, workshops, and gatherings.',
    href: '/events',
    cta: 'Browse Events',
    accentClassName: 'from-primary-500/15 to-blue-500/10'
  },
  {
    title: 'Dungeons & Play Spaces',
    description: 'Explore vetted venues and community spaces.',
    href: '/dungeons',
    cta: 'Explore Spaces',
    accentClassName: 'from-blue-500/15 to-primary-500/10'
  },
  {
    title: 'Education & Learning',
    description: 'Safety guides, articles, and resources.',
    href: '/education',
    cta: 'Start Learning',
    accentClassName: 'from-primary-500/10 to-blue-500/15'
  },
  {
    title: 'Vendor Marketplace',
    description: 'Browse gear, apparel, and artisan shops.',
    href: '/vendors',
    cta: 'Browse Vendors',
    accentClassName: 'from-blue-500/10 to-primary-500/15'
  },
]

export default function HubCategoryGrid() {
  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black relative overflow-hidden" aria-labelledby="hub-title">
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 id="hub-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Choose Your Path
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            East Coast Kink Events is evolving into a discovery hub for community, spaces, learning, and marketplace listings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HUB_CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 transition-all duration-500 hover:scale-[1.02] hover:border-white/25 focus-visible:outline-none"
              aria-label={`${card.title}: ${card.cta}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.accentClassName} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300">
                  {card.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {card.description}
                </p>
                <div className="inline-flex items-center gap-2 text-primary-300 font-semibold">
                  <span>{card.cta}</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

