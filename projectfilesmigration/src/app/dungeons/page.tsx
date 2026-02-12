import { Metadata } from 'next'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import DungeonsPageClient from './DungeonsPageClient'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'BDSM Dungeons & Play Spaces',
  description: 'Explore BDSM dungeons and play spaces across the East Coast. Find vetted kink venues, private clubs, and community nights.',
  keywords: [
    'BDSM dungeons',
    'kink spaces',
    'east coast',
    'private sessions',
    'workshops',
    'community events',
    'safe spaces',
    'inclusive environments'
  ],
  alternates: {
    canonical: `${BASE_URL}/dungeons`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.eastcoastkinkevents.com/dungeons',
    siteName: 'East Coast Kink Events',
    title: 'BDSM Dungeons & Play Spaces',
    description: 'Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events.',
    images: [
      {
        url: 'https://www.eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - BDSM Dungeons',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BDSM Dungeons & Play Spaces',
    description: 'Discover BDSM dungeons and kink spaces across the East Coast.',
    images: ['https://www.eastcoastkinkevents.com/og-image.png'],
  },
}

function dedupeBySlug<T extends { slug: string; name: string }>(items: T[]): T[] {
  const map = new Map<string, T>()
  items.forEach(item => map.set(item.slug, item))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}

export default function DungeonsPage() {
  const allDungeons = dedupeBySlug(getAllDungeons())
  const allEvents = getAllEvents()
  return <DungeonsPageClient allDungeons={allDungeons} allEvents={allEvents} />
}
