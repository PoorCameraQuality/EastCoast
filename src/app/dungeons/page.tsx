import { Metadata } from 'next'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { getAllSwingClubs } from '@/data/swingClubs'
import DungeonsPageClient from './DungeonsPageClient'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Dungeons & swing clubs',
  description:
    'Browse BDSM dungeons, play spaces, and swing & lifestyle clubs nationwide. Member clubs and on-premise venues—always confirm rules on the venue site before you go.',
  alternates: {
    canonical: `${BASE_URL}/dungeons`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${BASE_URL}/dungeons`,
    siteName: 'East Coast Kink Events',
    title: 'BDSM Dungeons & Swing Clubs',
    description:
      'Discover kink play spaces and swing & lifestyle clubs. Filter by venue type, search by city, and link through to official sites.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - BDSM Dungeons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDSM Dungeons & Swing Clubs',
    description: 'Kink venues and swing & lifestyle clubs in one directory.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  items.forEach(item => map.set(item.slug, item))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default function DungeonsPage() {
  const allDungeons = dedupeBySlug(getAllDungeons())
  const allSwingClubs = dedupeBySlug(getAllSwingClubs())
  const allEvents = getAllEvents()
  return (
    <DungeonsPageClient allDungeons={allDungeons} allSwingClubs={allSwingClubs} allEvents={allEvents} />
  )
}
