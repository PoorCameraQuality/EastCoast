import EventCard from '@/components/EventCard'
import DungeonCard from '@/components/dungeons/DungeonCard'
import Link from 'next/link'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { listDungeonsForDiscovery } from '@/lib/discoveryDungeonCount'
import { getAllDungeons } from '@/data/dungeons'
import DiscoveryRelatedLinks from '@/components/discovery/DiscoveryRelatedLinks'
import Breadcrumb from '@/components/Breadcrumb'
import SeoIntroCollapsible from '@/components/seo/SeoIntroCollapsible'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import DiscoverySectionHeading from '@/components/discovery/DiscoverySectionHeading'

type Dungeon = ReturnType<typeof getAllDungeons>[number]

type Props = {
  parsed: DiscoveryParsed
  h1: string
  paragraphs: string[]
  events: UnifiedEvent[]
  /** Canonical path e.g. /bdsm-events/ny */
  path: string
}

/** Map unified event back to EventCard shape */
function toEventCardShape(e: UnifiedEvent) {
  return {
    name: e.name,
    slug: e.slug,
    date: e.date,
    location: {
      city: e.location.city,
      state: e.location.state,
      region: e.location.region || `${e.location.city}, ${e.location.state}`,
    },
    excerpt: e.excerpt,
    category: e.category,
    logo: e.logo,
  }
}

function toDungeonCardShape(d: Dungeon) {
  return {
    name: d.name,
    slug: d.slug,
    location: d.location,
    category: d.category,
    excerpt: d.excerpt,
    description: d.description,
    logo: d.logo,
  }
}

export default function DiscoveryHubLayout({ parsed, h1, paragraphs, events, path }: Props) {
  const dungeons: Dungeon[] = listDungeonsForDiscovery(parsed).slice(0, 9)
  const currentLabel = h1.length > 80 ? `${h1.slice(0, 77)}…` : h1
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'BDSM events', href: '/bdsm-events' },
    { label: currentLabel, href: path, current: true },
  ]

  return (
    <DiscoveryPageShell accent="primary">
      <article className="section-padding">
        <div className="container-custom">
          <div className="mb-6 md:mb-8">
            <div className="mb-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
            <SeoIntroCollapsible h1={h1} paragraphs={paragraphs} />
          </div>

          <section className="mb-16" aria-labelledby="discovery-events-heading">
            <DiscoverySectionHeading
              id="discovery-events-heading"
              eyebrow="Calendar"
              accent="Upcoming events"
              subtitle={
                <p className="text-sm text-gray-500">
                  {events.length > 0
                    ? `${events.length} listing${events.length === 1 ? '' : 's'} in this view`
                    : 'No matches in this slice right now'}
                </p>
              }
              className="mb-6"
            />
            {events.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {events.map((e) => (
                  <EventCard
                    key={e.slug}
                    event={toEventCardShape(e)}
                    variant="compact"
                    itemListName="discovery_hub_events"
                  />
                ))}
              </div>
            ) : (
              <div className="discovery-empty-panel py-12">
                <p className="mb-4 text-lg text-gray-400">No matching upcoming events in this view right now.</p>
                <Link href="/events" className="font-medium text-primary-400 hover:text-primary-300">
                  Browse all events →
                </Link>
              </div>
            )}
          </section>

          <section className="mb-16" aria-labelledby="discovery-venues-heading">
            <DiscoverySectionHeading
              id="discovery-venues-heading"
              title="Dungeons &"
              accent="kink venues"
              className="mb-6"
            />
            {dungeons.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
                {dungeons.map((dungeon) => (
                  <DungeonCard key={dungeon.slug} dungeon={toDungeonCardShape(dungeon)} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No venue listings in this area yet.{' '}
                <Link href="/dungeons" className="text-primary-400 hover:underline">
                  View all dungeons
                </Link>
              </p>
            )}
          </section>

          <DiscoveryRelatedLinks parsed={parsed} />
        </div>
      </article>
    </DiscoveryPageShell>
  )
}
