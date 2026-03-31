import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import DungeonDiscoveryHubGrid from '@/components/dungeons/DungeonDiscoveryHubGrid'
import DungeonDiscoveryEventsStrip, {
  type HubEventRow,
} from '@/components/dungeons/DungeonDiscoveryEventsStrip'
import DungeonDiscoveryRelatedLinks from '@/components/dungeons/DungeonDiscoveryRelatedLinks'
import DungeonDiscoveryStructuredData from '@/components/dungeons/DungeonDiscoveryStructuredData'
import type { ParsedDungeonDiscovery } from '@/lib/parseDungeonDiscoverySlug'
import type { UnifiedDungeon } from '@/lib/unifiedDungeons'

type Props = {
  path: string
  h1: string
  paragraphs: string[]
  descriptionForLd: string
  dungeons: UnifiedDungeon[]
  events: HubEventRow[]
  parsed: Extract<ParsedDungeonDiscovery, { kind: 'hub' }>
}

export default function DungeonDiscoveryHubLayout({
  path,
  h1,
  paragraphs,
  descriptionForLd,
  dungeons,
  events,
  parsed,
}: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons', href: '/dungeons' },
    { label: h1, href: path, current: true },
  ]

  return (
    <div className="min-h-screen bg-black">
      <DungeonDiscoveryStructuredData
        urlPath={path}
        name={h1}
        description={descriptionForLd}
        dungeons={dungeons.map((d) => ({ name: d.name, slug: d.slug }))}
      />

      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            href="/dungeons"
            className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors mt-2"
          >
            ← Back to Dungeons
          </Link>

          <header className="max-w-3xl mt-8 mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              {h1}
            </h1>
            <div className="prose prose-invert prose-lg max-w-none text-gray-300 space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </header>

          <h2 className="text-xl font-serif font-semibold text-white mb-4">Matching venues</h2>
          <DungeonDiscoveryHubGrid dungeons={dungeons} />

          <h2 className="text-xl font-serif font-semibold text-white mt-12 mb-4">
            Upcoming events in this area
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Geographic matches from our events calendar; not every event is hosted at a listed venue.
          </p>
          <DungeonDiscoveryEventsStrip events={events} />

          <DungeonDiscoveryRelatedLinks parsed={parsed} />
        </div>
      </section>
    </div>
  )
}
