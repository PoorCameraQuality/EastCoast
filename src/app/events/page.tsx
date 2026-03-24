import { Metadata } from 'next'
import EventsPageClient from './EventsPageClient'
import { getAllEvents } from '@/data/events'
import { getAllDungeons } from '@/data/dungeons'
import { EventListStructuredData } from '@/components/StructuredData'
import { parseEventsListSearchParams } from '@/lib/eventsListSearchParams'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const { getAllEvents } = await import('@/data/events')
  const count = getAllEvents().length
  const description = `Browse ${count} BDSM events, kink conferences, and community gatherings across the East Coast. Find workshops, fetish events, and conventions near you.`
  const ogDescription = description.slice(0, 200)

  return {
    title: 'BDSM Events & Kink Conventions',
    description: description.slice(0, 160),
    keywords: [
      'kink events',
      'BDSM events',
      'east coast',
      'fetish events',
      'lifestyle events',
      'conferences',
      'workshops',
      'community events',
    ],
    alternates: {
      canonical: 'https://www.eastcoastkinkevents.com/events',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://www.eastcoastkinkevents.com/events',
      siteName: 'East Coast Kink Events',
      title: 'All Events - East Coast Kink Events',
      description: ogDescription,
      images: [
        {
          url: 'https://www.eastcoastkinkevents.com/og-image.png',
          width: 1200,
          height: 630,
          alt: 'East Coast Kink Events - All Events',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'All Events - East Coast Kink Events',
      description: ogDescription,
      images: ['https://www.eastcoastkinkevents.com/og-image.png'],
    },
  }
}

export default function EventsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const allEvents = getAllEvents()
  const allDungeons = getAllDungeons()
  const selectedCategory = parseEventsListSearchParams(searchParams)

  return (
    <>
      <EventListStructuredData />
      <EventsPageClient
        allEvents={allEvents}
        allDungeons={allDungeons}
        selectedCategory={selectedCategory}
      />
    </>
  )
}
