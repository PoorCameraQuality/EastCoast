import Link from 'next/link'
import { getAllDungeons } from '@/data/dungeons'
import VendorImage from '@/components/vendors/VendorImage'

export default function FeaturedDungeonsSection() {
  const dungeons = getAllDungeons().slice(0, 6)

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black relative overflow-hidden" aria-labelledby="featured-dungeons-title">
      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h2 id="featured-dungeons-title" className="text-3xl md:text-5xl font-serif font-bold text-white mb-3">
              Featured Dungeons & Spaces
            </h2>
            <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
              Explore community spaces and venues across the region.
            </p>
          </div>
          <Link href="/dungeons" className="btn-outline text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center w-full sm:w-auto md:w-auto" aria-label="View all dungeons and spaces">
            View All Spaces
          </Link>
        </div>

        {/* Mobile: horizontal swipe */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
            {dungeons.map((dungeon) => (
              <Link
                key={dungeon.slug}
                href={`/dungeons/${dungeon.slug}`}
                className="snap-start min-w-[280px] group"
                aria-label={`View listing: ${dungeon.name}`}
              >
                <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 group-hover:border-primary-400/25 group-hover:shadow-elegant-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-primary-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      {dungeon.logo ? (
                        <VendorImage src={dungeon.logo} alt={`${dungeon.name} — BDSM space in ${dungeon.location.city}, ${dungeon.location.state}`} size={48} className="flex-shrink-0" />
                      ) : null}
                      <h3 className="text-lg font-serif font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-300 transition-colors duration-300">
                        {dungeon.name}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      {dungeon.location.city}, {dungeon.location.state}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {dungeon.excerpt}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 text-primary-300 font-semibold">
                      <span>View Listing</span>
                      <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dungeons.map((dungeon) => (
            <Link
              key={dungeon.slug}
              href={`/dungeons/${dungeon.slug}`}
              className="group"
              aria-label={`View listing: ${dungeon.name}`}
            >
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-colors duration-500 md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 hover:border-primary-400/25 hover:shadow-elegant-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-primary-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    {dungeon.logo ? (
                      <VendorImage src={dungeon.logo} alt={`${dungeon.name} — BDSM space in ${dungeon.location.city}, ${dungeon.location.state}`} size={48} className="flex-shrink-0" />
                    ) : null}
                    <h3 className="text-xl font-serif font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary-300 transition-colors duration-300">
                      {dungeon.name}
                    </h3>
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    {dungeon.location.city}, {dungeon.location.state}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
                    {dungeon.excerpt}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

