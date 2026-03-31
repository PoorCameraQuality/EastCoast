import EventCard from '@/components/EventCard'
import DungeonLogo from '@/components/DungeonLogo'
import Link from 'next/link'
import TrackedEntityLink from '@/components/analytics/TrackedEntityLink'
import type { UnifiedEvent } from '@/lib/unifiedEvents'
import type { DiscoveryParsed } from '@/lib/discoverySlug'
import { listDungeonsForDiscovery } from '@/lib/discoveryDungeonCount'
import { getAllDungeons } from '@/data/dungeons'
import DiscoveryRelatedLinks from '@/components/discovery/DiscoveryRelatedLinks'

type Dungeon = ReturnType<typeof getAllDungeons>[number]

type Props = {
  parsed: DiscoveryParsed
  h1: string
  paragraphs: string[]
  events: UnifiedEvent[]
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

export default function DiscoveryHubLayout({ parsed, h1, paragraphs, events }: Props) {
  const dungeons: Dungeon[] = listDungeonsForDiscovery(parsed).slice(0, 9)

  return (
    <div className="min-h-screen bg-black">
      <article className="container-custom py-8 md:py-16">
        <header className="mb-10 md:mb-12">
          <p className="text-sm text-primary-400 mb-2">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <Link href="/bdsm-events" className="hover:underline">
              BDSM events
            </Link>
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">{h1}</h1>
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </header>

        <section className="mb-16" aria-labelledby="discovery-events-heading">
          <h2 id="discovery-events-heading" className="text-2xl font-serif font-bold text-white mb-6">
            Upcoming events
          </h2>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e) => (
                <EventCard key={e.slug} event={toEventCardShape(e)} itemListName="discovery_hub_events" />
              ))}
            </div>
          ) : (
            <div className="card-elegant text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No matching upcoming events in this view right now.</p>
              <Link href="/events" className="text-primary-400 hover:text-primary-300">
                Browse all events →
              </Link>
            </div>
          )}
        </section>

        <section className="mb-16" aria-labelledby="discovery-venues-heading">
          <h2 id="discovery-venues-heading" className="text-2xl font-serif font-bold text-white mb-6">
            Dungeons & kink venues
          </h2>
          {dungeons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dungeons.map((dungeon) => (
                <TrackedEntityLink
                  key={dungeon.slug}
                  href={`/dungeons/${dungeon.slug}`}
                  entityType="dungeon"
                  slug={dungeon.slug}
                  name={dungeon.name}
                  itemListName="discovery_hub_dungeons"
                  className="block"
                >
                  <div className="card-elegant md:hover:scale-[1.02] motion-reduce:md:hover:scale-100 transition-transform duration-300 cursor-pointer h-full">
                    {dungeon.logo && (
                      <div className="mb-4">
                        <DungeonLogo
                          src={dungeon.logo}
                          alt={`${dungeon.name} — BDSM dungeon in ${dungeon.location.city}, ${dungeon.location.state}`}
                          size="medium"
                          className="mx-auto"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-serif font-bold text-white mb-2">{dungeon.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {dungeon.location.city}, {dungeon.location.state}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-3">{dungeon.excerpt}</p>
                  </div>
                </TrackedEntityLink>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No venue listings in this area yet.{' '}
              <Link href="/dungeons" className="text-primary-400 hover:underline">
                View all dungeons
              </Link>
            </p>
          )}
        </section>

        <DiscoveryRelatedLinks parsed={parsed} />
      </article>
    </div>
  )
}
