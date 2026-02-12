import { Metadata } from 'next'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import { BASE_URL } from '@/lib/seo'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'

export const metadata: Metadata = {
  title: 'Kink Events & Dungeons by State',
  description: 'Find BDSM events and dungeons by state. Browse New York, DC, Florida, and more—discover local kink events and venues near you.',
  keywords: [
    'kink events by state',
    'BDSM east coast',
    'dungeons by state',
    'fetish events near me',
    'kink community locations',
  ],
  alternates: {
    canonical: `${BASE_URL}/states`,
  },
}

// State configuration
const EAST_COAST_STATES = {
  'new-york': { name: 'New York', abbr: 'NY', region: 'Northeast', emoji: '🗽' },
  'pennsylvania': { name: 'Pennsylvania', abbr: 'PA', region: 'Mid-Atlantic', emoji: '🔔' },
  'new-jersey': { name: 'New Jersey', abbr: 'NJ', region: 'Mid-Atlantic', emoji: '🏖️' },
  'maryland': { name: 'Maryland', abbr: 'MD', region: 'Mid-Atlantic', emoji: '🦀' },
  'delaware': { name: 'Delaware', abbr: 'DE', region: 'Mid-Atlantic', emoji: '🏛️' },
  'virginia': { name: 'Virginia', abbr: 'VA', region: 'South', emoji: '🏔️' },
  'north-carolina': { name: 'North Carolina', abbr: 'NC', region: 'South', emoji: '🏝️' },
  'south-carolina': { name: 'South Carolina', abbr: 'SC', region: 'South', emoji: '🌴' },
  'georgia': { name: 'Georgia', abbr: 'GA', region: 'South', emoji: '🍑' },
  'florida': { name: 'Florida', abbr: 'FL', region: 'South', emoji: '🌞' },
  'tennessee': { name: 'Tennessee', abbr: 'TN', region: 'South', emoji: '🎸' },
  'louisiana': { name: 'Louisiana', abbr: 'LA', region: 'South', emoji: '🎷' },
  'maine': { name: 'Maine', abbr: 'ME', region: 'New England', emoji: '🦞' },
  'vermont': { name: 'Vermont', abbr: 'VT', region: 'New England', emoji: '🍁' },
  'new-hampshire': { name: 'New Hampshire', abbr: 'NH', region: 'New England', emoji: '⛰️' },
  'massachusetts': { name: 'Massachusetts', abbr: 'MA', region: 'New England', emoji: '🎓' },
  'rhode-island': { name: 'Rhode Island', abbr: 'RI', region: 'New England', emoji: '⚓' },
  'connecticut': { name: 'Connecticut', abbr: 'CT', region: 'New England', emoji: '🌳' },
  'washington-dc': { name: 'Washington DC', abbr: 'DC', region: 'Mid-Atlantic', emoji: '🏛️' },
  'ohio': { name: 'Ohio', abbr: 'OH', region: 'Midwest', emoji: '🌰' },
  'michigan': { name: 'Michigan', abbr: 'MI', region: 'Midwest', emoji: '🧤' },
  'illinois': { name: 'Illinois', abbr: 'IL', region: 'Midwest', emoji: '🌽' },
  'indiana': { name: 'Indiana', abbr: 'IN', region: 'Midwest', emoji: '🏁' },
  'missouri': { name: 'Missouri', abbr: 'MO', region: 'Midwest', emoji: '🧭' },
  'colorado': { name: 'Colorado', abbr: 'CO', region: 'Mountain West', emoji: '🏔️' },
} as const

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
    'South': stateStats.filter(s => s.info.region === 'South'),
    'Midwest': stateStats.filter(s => s.info.region === 'Midwest'),
    'Mountain West': stateStats.filter(s => s.info.region === 'Mountain West'),
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states', current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <SupportCTAInline contextLabel="States" />

        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-primary-500 bg-clip-text text-transparent">
              Kink Events & Dungeons by State
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Explore kink events and dungeons by state
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
                className="group card-elegant hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{info.emoji}</span>
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
                    className="card-elegant hover:scale-105 transition-all duration-300 text-center"
                  >
                    <span className="text-3xl mb-2 block">{info.emoji}</span>
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary" aria-label="Contact us">
              {CONTACT_US_LABEL}
            </Link>
            <Link href="/contact" className="btn-outline" aria-label="Contact us">
              {CONTACT_US_LABEL}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

