import { Metadata } from 'next'
import { parseDiscoverySlug, parseDiscoverySlugSafe } from '@/lib/discoverySlug'
import { getUnifiedEvents } from '@/lib/unifiedEvents'
import { filterDiscoveryEvents } from '@/lib/discoveryQueries'
import { buildDiscoveryIntro } from '@/lib/seo/discoveryCopy'
import DiscoveryHubLayout from '@/components/discovery/DiscoveryHubLayout'
import { discoveryRobotsMeta } from '@/lib/discoveryRobots'
import { BASE_URL } from '@/lib/seo'
import { countDungeonsForDiscovery } from '@/lib/discoveryDungeonCount'
import DiscoveryStructuredData from '@/components/discovery/DiscoveryStructuredData'

export const revalidate = 1800

interface PageProps {
  params: { slug: string[] }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseDiscoverySlugSafe(params.slug)
  if (!parsed) {
    return { title: 'Not found' }
  }
  const all = await getUnifiedEvents()
  const filtered = filterDiscoveryEvents(all, parsed)
  const dCount = countDungeonsForDiscovery(parsed)
  const robots = discoveryRobotsMeta(params.slug, filtered.length, dCount)
  const year = new Date().getFullYear()
  const { h1 } = buildDiscoveryIntro({ parsed, events: filtered, year })
  const path = `/bdsm-events/${params.slug.join('/')}`
  const desc = `${h1}. Upcoming BDSM and kink events, dungeons, and community listings across the US and Canada.`

  return {
    title: `${h1} | East Coast Kink Events`,
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

export default async function DiscoverySlugPage({ params }: PageProps) {
  const parsed = parseDiscoverySlug(params.slug)
  const all = await getUnifiedEvents()
  const filtered = filterDiscoveryEvents(all, parsed)
  const year = new Date().getFullYear()
  const { h1, paragraphs } = buildDiscoveryIntro({ parsed, events: filtered, year })
  const path = `/bdsm-events/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')

  return (
    <>
      <DiscoveryStructuredData urlPath={path} name={h1} description={desc} />
      <DiscoveryHubLayout parsed={parsed} h1={h1} paragraphs={paragraphs} events={filtered} />
    </>
  )
}
