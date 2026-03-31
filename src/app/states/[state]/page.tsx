import { Metadata } from 'next'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import Link from 'next/link'
import EventCard from '@/components/EventCard'
import DungeonLogo from '@/components/DungeonLogo'
import Breadcrumb from '@/components/Breadcrumb'
import SupportCTAInline from '@/components/SupportCTAInline'
import { BASE_URL } from '@/lib/seo'
import { notFound } from 'next/navigation'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'

interface PageProps {
  params: { state: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stateInfo = EAST_COAST_STATES[params.state as StateSlug]
  
  if (!stateInfo) {
    return {
      title: 'State Not Found',
      description: 'The requested state page could not be found.'
    }
  }

  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const now = new Date()
  const eventCount = allEvents.filter(
    (e: { location: { state: string }; date: { end: string } }) =>
      e.location.state === stateInfo.abbr && new Date(e.date.end) >= now
  ).length
  const dungeonCount = allDungeons.filter(
    (d: { location: { state: string } }) => d.location.state === stateInfo.abbr
  ).length
  const totalListings = eventCount + dungeonCount
  const isThinPage = totalListings < 2

  return {
    title: `${stateInfo.name} Kink Events & BDSM Dungeons`,
    ...(isThinPage && {
      robots: { index: false, follow: true },
    }),
    description: `Discover kink events, BDSM conferences, workshops, and dungeons in ${stateInfo.name}. Connect with the local kink community and explore ${stateInfo.name}'s alternative lifestyle scene.`,
    alternates: {
      canonical: `${BASE_URL}/states/${params.state}`,
    },
    openGraph: {
      title: `${stateInfo.name} Kink Events & Dungeons`,
      description: `Find BDSM events and dungeons in ${stateInfo.name}. ${eventCount} upcoming events and ${dungeonCount} dungeon listings in this directory (counts change as listings update).`,
      type: 'website',
      url: `${BASE_URL}/states/${params.state}`,
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${stateInfo.name} — East Coast Kink Events`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${stateInfo.name} Kink Events & Dungeons`,
      description: `Kink events and dungeons in ${stateInfo.name} (${stateInfo.abbr}).`,
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

// Generate static paths for all East Coast states
export async function generateStaticParams() {
  return Object.keys(EAST_COAST_STATES).map((state) => ({
    state,
  }))
}

export default function StatePage({ params }: PageProps) {
  const stateInfo = EAST_COAST_STATES[params.state as StateSlug]
  
  if (!stateInfo) {
    notFound()
  }

  // Get events and dungeons for this state
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  
  const now = new Date()
  const stateEvents = allEvents
    .filter(event => 
      event.location.state === stateInfo.abbr && 
      new Date(event.date.end) >= now
    )
    .sort((a, b) => new Date(a.date.start).getTime() - new Date(b.date.start).getTime())
  
  const stateDungeons = allDungeons.filter(dungeon => 
    dungeon.location.state === stateInfo.abbr
  )

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states' },
    { label: stateInfo.name, href: `/states/${params.state}`, current: true }
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom section-padding">
        <Breadcrumb items={breadcrumbItems} />

        {/* Hero Section */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-primary-400 via-primary-400 to-primary-500 bg-clip-text text-transparent">
              {stateInfo.name}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-2">
            Kink Events & BDSM Community
          </p>
          <p className="text-gray-400">
            {stateInfo.region} • {stateEvents.length} upcoming events • {stateDungeons.length} dungeons
          </p>
          <p className="text-gray-400 text-sm mt-4 max-w-2xl">
            New to kink or your first venue visit? Read{' '}
            <Link href="/blog/bdsm-beginner-guide" className="text-primary-400 hover:text-primary-300">
              How to start exploring kink and BDSM safely
            </Link>{' '}
            on ECKE, then browse{' '}
            <Link href="/dungeons" className="text-primary-400 hover:text-primary-300">
              dungeons &amp; clubs
            </Link>{' '}
            and{' '}
            <Link href="/events" className="text-primary-400 hover:text-primary-300">
              events
            </Link>{' '}
            nationwide.
          </p>
        </div>

        <SupportCTAInline contextLabel="States" />

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            Upcoming Events in {stateInfo.name}
          </h2>
          
          {stateEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateEvents.map((event) => (
                <EventCard key={event.slug} event={event} itemListName="state_page_events" />
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                No upcoming events currently listed for {stateInfo.name}.
              </p>
              <Link 
                href="/events"
                className="inline-flex min-h-touch items-center text-primary-400 hover:text-primary-300 transition-colors"
              >
                View all events →
              </Link>
            </div>
          )}
        </section>

        {/* Dungeons */}
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            BDSM Dungeons in {stateInfo.name}
          </h2>
          
          {stateDungeons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateDungeons.map((dungeon) => (
                <Link key={dungeon.slug} href={`/dungeons/${dungeon.slug}`}>
                  <div className="card-elegant md:hover:scale-105 transition-transform duration-300 motion-reduce:md:hover:scale-100 cursor-pointer h-full">
                    {dungeon.logo && (
                      <div className="mb-4">
                        <DungeonLogo 
                          src={dungeon.logo} 
                          alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
                          size="medium"
                          className="mx-auto"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-serif font-bold text-white mb-2">
                      {dungeon.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {dungeon.location.city}, {dungeon.location.state}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">
                      {dungeon.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <p className="text-gray-400 text-lg mb-4">
                No dungeons currently listed for {stateInfo.name}.
              </p>
              <Link 
                href="/dungeons"
                className="inline-flex min-h-touch items-center text-primary-400 hover:text-primary-300 transition-colors"
              >
                View all dungeons →
              </Link>
            </div>
          )}
        </section>

        {/* Other East Coast States */}
        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-6">
            Other East Coast States
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(EAST_COAST_STATES)
              .filter(([slug]) => slug !== params.state)
              .map(([slug, info]) => (
                <Link 
                  key={slug}
                  href={`/states/${slug}`}
                  className="card-elegant text-center md:hover:scale-105 transition-transform duration-300 motion-reduce:md:hover:scale-100 min-h-touch flex flex-col justify-center"
                >
                  <p className="text-white font-semibold">{info.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{info.abbr}</p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}

