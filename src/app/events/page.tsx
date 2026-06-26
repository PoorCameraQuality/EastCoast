import { Metadata } from 'next'
import EventsPageClient from './EventsPageClient'
import { getAllDungeons } from '@/data/dungeons'
import { getAllSwingClubs } from '@/data/swingClubs'
import { getUnifiedEvents, unifiedEventToEventsPageShape } from '@/lib/unifiedEvents'
import { EventListStructuredData } from '@/components/StructuredData'
import {
  eventsListHasActiveFilter,
  parseEventsListIntent,
  parseEventsListLocation,
  parseEventsListSearchParams,
} from '@/lib/eventsListSearchParams'
import { buildIndexFromUnified } from '@/lib/publicEventIndex'
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

  const baseDescription = `${count}+ kink events and conventions across the East Coast & Midwest: hotel weekends, classes, parties, vendor markets, and community gatherings.`
  const filterSuffix = filtered ? ` Filtered: ${selection}.` : ''
  const description = `${baseDescription}${filterSuffix}`.slice(0, 160)
  const ogDescription = `${baseDescription}${filterSuffix}`.slice(0, 200)

  const defaultTitle = 'Events & Conventions — Kink Calendar | East Coast Kink Events'
  const title = filtered ? `${selection} — Events & Conventions`.slice(0, 70) : defaultTitle

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
      title: filtered ? `${selection} — Events & Conventions` : defaultTitle,
      description: ogDescription,
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'East Coast Kink Events - Events & Conventions',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: filtered ? `${selection} — Events & Conventions` : defaultTitle,
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
  const indexItems = buildIndexFromUnified(unified)
  const searchEvents = unified.map(unifiedEventToEventsPageShape)
  const allDungeons = getAllDungeons()
  const allSwingClubs = getAllSwingClubs()
  const selectedIntent = parseEventsListIntent(searchParams)
  const locationFilter = parseEventsListLocation(searchParams)

  return (
    <>
      <EventListStructuredData />
      <EventsPageClient
        indexItems={indexItems}
        searchEvents={searchEvents}
        allDungeons={allDungeons}
        allSwingClubs={allSwingClubs}
        selectedIntent={selectedIntent}
        locationFilter={locationFilter}
      />
    </>
  )
}
