import { Metadata } from 'next'
import EventsPageClient from './EventsPageClient'
import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { getUnifiedEvents, unifiedEventToEventsPageShape } from '@/lib/unifiedEvents'
import { EventListStructuredData } from '@/components/StructuredData'
import {
  eventsListHasActiveFilter,
  parseEventsListSearchParams,
} from '@/lib/eventsListSearchParams'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

type EventsIndexProps = {
  searchParams: Record<string, string | string[] | undefined>
}

export async function generateMetadata({
  searchParams,
}: EventsIndexProps): Promise<Metadata> {
  const count = (await getUnifiedEvents()).length
  const filtered = eventsListHasActiveFilter(searchParams)
  const selection = parseEventsListSearchParams(searchParams)

  const baseDescription = `${count}+ BDSM & kink events, conventions, and parties—search by state or type. Find kink events near you on the East Coast & Midwest. Updated list with conferences & workshops.`
  const filterSuffix = filtered
    ? ` Filtered: ${selection}.`
    : ''
  const description = `${baseDescription}${filterSuffix}`.slice(0, 160)
  const ogDescription = `${baseDescription}${filterSuffix}`.slice(0, 200)

  const defaultTitle = 'BDSM & Kink Events Near You | Conventions & Parties'
  const title = filtered ? `${selection} — Kink Events`.slice(0, 70) : defaultTitle

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/events`,
    },
    ...(filtered && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${BASE_URL}/events`,
      siteName: 'East Coast Kink Events',
      title: filtered ? `${selection} — Kink Events` : 'BDSM & Kink Events — Conventions, Parties & Workshops',
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
      title: filtered ? `${selection} — Kink Events` : 'BDSM & Kink Events — Conventions & Workshops',
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
