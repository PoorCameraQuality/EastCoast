import { Metadata } from 'next'
import EventsPageClient from './EventsPageClient'
import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { getUnifiedEvents, unifiedEventToEventsPageShape } from '@/lib/unifiedEvents'
import { EventListStructuredData } from '@/components/StructuredData'
import { parseEventsListSearchParams } from '@/lib/eventsListSearchParams'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const count = (await getUnifiedEvents()).length
  const description = `${count}+ BDSM & kink events, conventions, and parties—search by state or type. Find kink events near you on the East Coast & Midwest. Updated list with conferences & workshops.`
  const ogDescription = description.slice(0, 200)

  return {
    title: 'BDSM & Kink Events Near You | Conventions & Parties',
    description: description.slice(0, 160),
    alternates: {
      canonical: `${BASE_URL}/events`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${BASE_URL}/events`,
      siteName: 'East Coast Kink Events',
      title: 'BDSM & Kink Events — Conventions, Parties & Workshops',
      description: ogDescription,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'East Coast Kink Events - All Events',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BDSM & Kink Events — Conventions & Workshops',
      description: ogDescription,
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const unified = await getUnifiedEvents()
  const allEvents = unified.map(unifiedEventToEventsPageShape)
  const allDungeons = getAllDungeons()
  const allSwingClubs = getAllSwingClubs()
  const selectedCategory = parseEventsListSearchParams(searchParams)

  return (
    <>
      <EventListStructuredData />
      <EventsPageClient
        allEvents={allEvents}
        allDungeons={allDungeons}
        allSwingClubs={allSwingClubs}
        selectedCategory={selectedCategory}
      />
    </>
  )
}
