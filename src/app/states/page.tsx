import { Metadata } from 'next'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import { BASE_URL } from '@/lib/seo'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'

export const metadata: Metadata = {
  title: 'Kink & BDSM Events by State — Dungeons & Parties Near You',
  description:
    'Pick your state for upcoming kink & BDSM events plus dungeon listings—NY, NJ, DC, FL, PA, and more. Built for “near me” and regional search.',
  alternates: {
    canonical: `${BASE_URL}/states`,
  },
}

export default function StatesIndexPage() {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const now = new Date()

  // Count events and dungeons by state
  const stateStats = Object.entries(EAST_COAST_STATES).map(([slug, info]) => {
    const eventCount = allEvents.filter(
      event => event.location.state === info.abbr && new Date(event.date.end) >= now
    ).length
    const dungeonCount = allDungeons.filter(
      dungeon => dungeon.location.state === info.abbr
    ).length
    
    return { slug, info, eventCount, dungeonCount, total: eventCount + dungeonCount }
  }).sort((a, b) => b.total - a.total) // Sort by total activity

  // Group by region
  const regions = {
    'New England': stateStats.filter(s => s.info.region === 'New England'),
    'Mid-Atlantic': stateStats.filter(s => s.info.region === 'Mid-Atlantic'),
    'Northeast': stateStats.filter(s => s.info.region === 'Northeast'),
    South: stateStats.filter(s => s.info.region === 'South'),
    'South Central': stateStats.filter(s => s.info.region === 'South Central'),
    Midwest: stateStats.filter(s => s.info.region === 'Midwest'),
    'Great Plains': stateStats.filter(s => s.info.region === 'Great Plains'),
    'Mountain West': stateStats.filter(s => s.info.region === 'Mountain West'),
    Pacific: stateStats.filter(s => s.info.region === 'Pacific'),
    Southwest: stateStats.filter(s => s.info.region === 'Southwest'),
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-8 md:py-16">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="States" />

        {/* Hero Section */}
        <div className="mb-10 md:mb-12 text-center px-1">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              Kink Events & Dungeons by State
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Upcoming parties &amp; conventions plus vetted dungeons—organized by state so you can find what&apos;s close
            to you faster than scrolling the full{' '}
            <Link href="/events" className="text-primary-300 hover:text-primary-200 underline underline-offset-2">
              events list
            </Link>
            .
          </p>
          <p className="text-gray-400">
            {stateStats.reduce((sum, s) => sum + s.eventCount, 0)} upcoming events • {' '}
            {stateStats.reduce((sum, s) => sum + s.dungeonCount, 0)} dungeons • {' '}
            {Object.keys(EAST_COAST_STATES).length} states
          </p>
        </div>

        {/* Most Active States */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">
            Most Active States
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stateStats.slice(0, 6).map(({ slug, info, eventCount, dungeonCount }) => (
              <Link 
                key={slug}
                href={`/states/${slug}`}
                className="group card-elegant md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 transition-transform duration-300 min-h-touch flex flex-col p-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl shrink-0" aria-hidden>{info.emoji}</span>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-white group-hover:text-primary-400 transition-colors">
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-400">{info.region}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-300">
                    {eventCount} {eventCount === 1 ? 'event' : 'events'}
                  </span>
                  <span className="text-gray-300">
                    {dungeonCount} {dungeonCount === 1 ? 'dungeon' : 'dungeons'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Region */}
        {Object.entries(regions).map(([regionName, states]) => (
          states.length > 0 && (
            <section key={regionName} className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-white mb-6">
                {regionName}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {states.map(({ slug, info, eventCount, dungeonCount }) => (
                  <Link 
                    key={slug}
                    href={`/states/${slug}`}
                    className="card-elegant md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 transition-transform duration-300 text-center min-h-touch flex flex-col justify-center p-3"
                  >
                    <span className="text-3xl mb-2 block" aria-hidden>{info.emoji}</span>
                    <h3 className="text-white font-semibold mb-1">{info.name}</h3>
                    <p className="text-xs text-gray-400">
                      {eventCount}E • {dungeonCount}D
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )
        ))}

        {/* Call to Action */}
        <section className="card-elegant text-center mt-16">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">
            Don't See Your State?
          </h2>
          <p className="text-gray-300 mb-6">
            We focus on East Coast locations, but expand nationwide. Help us grow by submitting events and dungeons in your area.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/contact" className="btn-primary min-h-touch inline-flex items-center justify-center" aria-label="Contact us">
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

