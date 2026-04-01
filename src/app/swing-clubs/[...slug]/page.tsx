import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSwingClubBySlug, generateSwingClubSEO } from '@/data/swingClubs'
import {
  parseSwingDiscoverySlug,
  parseSwingDiscoverySlugSafe,
  swingHubFilterFromParsed,
} from '@/lib/parseSwingDiscoverySlug'
import {
  filterSwingClubsForHub,
  getUnifiedSwingClubs,
  getUpcomingEventsForSwingHub,
} from '@/lib/unifiedSwingClubs'
import { buildSwingDiscoveryIntro } from '@/lib/seo/swingDiscoveryCopy'
import { swingDiscoveryRobotsMeta } from '@/lib/swingDiscoveryRobots'
import { BASE_URL } from '@/lib/seo'
import SwingClubDetailView from '@/components/swingclubs/SwingClubDetailView'
import SwingDiscoveryHubLayout from '@/components/swingclubs/SwingDiscoveryHubLayout'

export const revalidate = 1800

interface PageProps {
  params: { slug: string[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseSwingDiscoverySlugSafe(params.slug)
  if (!parsed) {
    return {
      title: 'Not found',
      description: 'The requested page could not be found.',
    }
  }

  if (parsed.kind === 'swingDetail') {
    const club = getSwingClubBySlug(parsed.slug)
    if (!club) {
      return {
        title: 'Not found',
        description: 'The requested club could not be found.',
      }
    }
    const seo = generateSwingClubSEO(club)
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: {
        title: seo.title,
        description: seo.description,
        images: seo.openGraph.images,
        type: 'website',
        url: `${BASE_URL}/swing-clubs/${parsed.slug}`,
        siteName: 'East Coast Kink Events',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
        images: seo.openGraph.images,
      },
      alternates: {
        canonical: `${BASE_URL}/swing-clubs/${parsed.slug}`,
      },
    }
  }

  const year = new Date().getFullYear()
  const all = getUnifiedSwingClubs()
  const filter = swingHubFilterFromParsed(parsed)
  const filtered = filterSwingClubsForHub(all, filter)
  const robots = swingDiscoveryRobotsMeta(params.slug, filtered.length)
  const { h1, paragraphs } = buildSwingDiscoveryIntro({
    parsed,
    swingCount: filtered.length,
    year,
  })
  const path = `/swing-clubs/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')

  return {
    title: h1,
    description: desc.slice(0, 160),
    robots,
    alternates: {
      canonical: `${BASE_URL}${path}`,
    },
    openGraph: {
      title: h1,
      description: desc.slice(0, 200),
      url: `${BASE_URL}${path}`,
      siteName: 'East Coast Kink Events',
      type: 'website',
    },
  }
}

export async function generateStaticParams() {
  const { getAllSwingClubs } = await import('@/data/swingClubs')
  return getAllSwingClubs().map((c) => ({
    slug: [c.slug],
  }))
}

export default function SwingClubsCatchAllPage({ params }: PageProps) {
  const parsed = parseSwingDiscoverySlug(params.slug)
  if (!parsed) {
    notFound()
  }

  if (parsed.kind === 'swingDetail') {
    const club = getSwingClubBySlug(parsed.slug)
    if (!club) {
      notFound()
    }
    return <SwingClubDetailView club={club} />
  }

  const year = new Date().getFullYear()
  const all = getUnifiedSwingClubs()
  const filter = swingHubFilterFromParsed(parsed)
  const filtered = filterSwingClubsForHub(all, filter)
  const events = getUpcomingEventsForSwingHub({
    variant: parsed.variant,
    stateSlug: parsed.variant === 'state' || parsed.variant === 'stateTag' ? parsed.stateSlug : undefined,
    citySlug: parsed.variant === 'city' || parsed.variant === 'cityTag' ? parsed.citySlug : undefined,
    filteredSwingClubs: filtered,
  })
  const { h1, paragraphs } = buildSwingDiscoveryIntro({
    parsed,
    swingCount: filtered.length,
    year,
  })
  const path = `/swing-clubs/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')
  const eventRows = events.map((e) => ({
    slug: e.slug,
    name: e.name,
    logo: e.logo,
    date: { display: e.date.display },
  }))

  return (
    <SwingDiscoveryHubLayout
      path={path}
      h1={h1}
      paragraphs={paragraphs}
      descriptionForLd={desc}
      clubs={filtered}
      events={eventRows}
      parsed={parsed}
    />
  )
}
