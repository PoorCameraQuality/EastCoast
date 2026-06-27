import { Metadata } from 'next'
import { getAllSwingClubs } from '@/data/swingClubs'
import { getAllEvents } from '@/data/events'
import PlacesPageClient from '@/components/places/PlacesPageClient'
import { buildPlaceIndex } from '@/lib/publicPlaceIndex'
import { getUnifiedEvents } from '@/lib/unifiedEvents'
import { getUnifiedDungeonsAsync } from '@/lib/unifiedDungeons'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Places — dungeons, clubs, studios & venues',
  description:
    'Discover dungeons, swing and lifestyle clubs, studios, and community spaces. Public venue profiles for the kink scene — confirm access on each official site.',
  alternates: {
    canonical: `${BASE_URL}/dungeons`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${BASE_URL}/dungeons`,
    siteName: 'East Coast Kink Events',
    title: 'Places — dungeons, clubs, studios & venues',
    description:
      'Evergreen venue profiles for dungeons, clubs, studios, and community spaces across the scene.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events — Places',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Places — dungeons, clubs, studios & venues',
    description: 'Public venue profiles for the kink and lifestyle scene.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  items.forEach((item) => map.set(item.slug, item))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default async function DungeonsPage() {
  const allDungeons = dedupeBySlug(await getUnifiedDungeonsAsync())
  const allSwingClubs = dedupeBySlug(getAllSwingClubs())
  const allEvents = getAllEvents()
  const unifiedEvents = await getUnifiedEvents()
  const kinkSocialVenues = await fetchPublishedListingsIndex('venue')

  const places = buildPlaceIndex(allDungeons, allSwingClubs, kinkSocialVenues, unifiedEvents)

  return (
    <PlacesPageClient
      places={places}
      searchEvents={allEvents}
      searchDungeons={allDungeons}
      searchSwingClubs={allSwingClubs}
    />
  )
}
