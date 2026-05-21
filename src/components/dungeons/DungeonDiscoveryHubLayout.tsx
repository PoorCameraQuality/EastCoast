import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SeoIntroCollapsible from '@/components/seo/SeoIntroCollapsible'
import DungeonDiscoveryHubGrid from '@/components/dungeons/DungeonDiscoveryHubGrid'
import DungeonDiscoveryEventsStrip, {
  type HubEventRow,
} from '@/components/dungeons/DungeonDiscoveryEventsStrip'
import DungeonDiscoveryRelatedLinks from '@/components/dungeons/DungeonDiscoveryRelatedLinks'
import DungeonDiscoveryStructuredData from '@/components/dungeons/DungeonDiscoveryStructuredData'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import DiscoverySectionHeading from '@/components/discovery/DiscoverySectionHeading'
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
    <DiscoveryPageShell accent="violet">
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
            className="mt-2 inline-flex min-h-touch items-center text-gray-300 underline underline-offset-4 decoration-white/20 transition-colors hover:text-white hover:decoration-white/50"
          >
            ← Back to Dungeons
          </Link>

          <div className="mb-8 mt-8 max-w-3xl">
            <SeoIntroCollapsible h1={h1} paragraphs={paragraphs} summaryLabel="About this area" />
          </div>

          <DiscoverySectionHeading title="Matching" accent="venues" className="mb-4" />
          <DungeonDiscoveryHubGrid dungeons={dungeons} />

          <DiscoverySectionHeading
            title="Upcoming events in"
            accent="this area"
            subtitle={
              <p className="text-sm text-gray-500">
                Geographic matches from our events calendar; not every event is hosted at a listed venue.
              </p>
            }
            className="mb-4 mt-12"
          />
          <DungeonDiscoveryEventsStrip events={events} />

          <DungeonDiscoveryRelatedLinks parsed={parsed} />
        </div>
      </section>
    </DiscoveryPageShell>
  )
}
