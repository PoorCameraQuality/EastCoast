import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { generateDungeonSEO } from '@/data/dungeons'
import {
  parseDungeonDiscoverySlug,
  parseDungeonDiscoverySlugSafe,
  dungeonHubFilterFromParsed,
} from '@/lib/parseDungeonDiscoverySlug'
import {
  filterDungeonsForHub,
  getUnifiedDungeonsAsync,
  getUpcomingEventsForDungeonHub,
  resolveDungeonBySlugAsync,
} from '@/lib/unifiedDungeons'
import { buildDungeonDiscoveryIntro } from '@/lib/seo/dungeonDiscoveryCopy'
import { dungeonDiscoveryRobotsMeta } from '@/lib/dungeonDiscoveryRobots'
import { BASE_URL } from '@/lib/seo'
import DungeonDetailView from '@/components/dungeons/DungeonDetailView'
import DungeonDiscoveryHubLayout from '@/components/dungeons/DungeonDiscoveryHubLayout'

export const revalidate = 1800

interface PageProps {
  params: { slug: string[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseDungeonDiscoverySlugSafe(params.slug)
  if (!parsed) {
    return {
      title: 'Not found',
      description: 'The requested page could not be found.',
    }
  }

  if (parsed.kind === 'dungeonDetail') {
    const dungeon = await resolveDungeonBySlugAsync(parsed.slug)
    if (!dungeon) {
      return {
        title: 'Dungeon Not Found',
        description: 'The requested dungeon could not be found.',
      }
    }
    const seo = generateDungeonSEO(dungeon)
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      openGraph: {
        title: seo.title,
        description: seo.description,
        images: seo.openGraph.images,
        type: 'website',
        url: `${BASE_URL}/dungeons/${parsed.slug}`,
        siteName: 'East Coast Kink Events',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo.title,
        description: seo.description,
        images: seo.openGraph.images,
      },
      alternates: {
        canonical: `${BASE_URL}/dungeons/${parsed.slug}`,
      },
    }
  }

  const year = new Date().getFullYear()
  const all = await getUnifiedDungeonsAsync()
  const filter = dungeonHubFilterFromParsed(parsed)
  const filtered = filterDungeonsForHub(all, filter)
  const robots = dungeonDiscoveryRobotsMeta(params.slug, filtered.length)
  const { h1, paragraphs } = buildDungeonDiscoveryIntro({
    parsed,
    dungeonCount: filtered.length,
    year,
  })
  const path = `/dungeons/${params.slug.join('/')}`
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
  const { getAllDungeons } = await import('@/data/dungeons')
  return getAllDungeons().map((d) => ({
    slug: [d.slug],
  }))
}

export default async function DungeonsCatchAllPage({ params }: PageProps) {
  const parsed = parseDungeonDiscoverySlug(params.slug)
  if (!parsed) {
    notFound()
  }

  if (parsed.kind === 'dungeonDetail') {
    const dungeon = await resolveDungeonBySlugAsync(parsed.slug)
    if (!dungeon) {
      notFound()
    }
    return <DungeonDetailView dungeon={dungeon} />
  }

  const year = new Date().getFullYear()
  const all = await getUnifiedDungeonsAsync()
  const filter = dungeonHubFilterFromParsed(parsed)
  const filtered = filterDungeonsForHub(all, filter)
  const events = getUpcomingEventsForDungeonHub({
    variant: parsed.variant,
    stateSlug: parsed.variant === 'state' || parsed.variant === 'stateTag' ? parsed.stateSlug : undefined,
    citySlug: parsed.variant === 'city' || parsed.variant === 'cityTag' ? parsed.citySlug : undefined,
    filteredDungeons: filtered,
  })
  const { h1, paragraphs } = buildDungeonDiscoveryIntro({
    parsed,
    dungeonCount: filtered.length,
    year,
  })
  const path = `/dungeons/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')
  const eventRows = events.map((e) => ({
    slug: e.slug,
    name: e.name,
    logo: e.logo,
    date: { display: e.date.display },
  }))

  return (
    <DungeonDiscoveryHubLayout
      path={path}
      h1={h1}
      paragraphs={paragraphs}
      descriptionForLd={desc}
      dungeons={filtered}
      events={eventRows}
      parsed={parsed}
    />
  )
}
