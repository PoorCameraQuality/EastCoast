import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SeoIntroCollapsible from '@/components/seo/SeoIntroCollapsible'
import SwingDiscoveryHubGrid from '@/components/swingclubs/SwingDiscoveryHubGrid'
import DungeonDiscoveryEventsStrip, {
  type HubEventRow,
} from '@/components/dungeons/DungeonDiscoveryEventsStrip'
import SwingDiscoveryRelatedLinks from '@/components/swingclubs/SwingDiscoveryRelatedLinks'
import SwingDiscoveryStructuredData from '@/components/swingclubs/SwingDiscoveryStructuredData'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import DiscoverySectionHeading from '@/components/discovery/DiscoverySectionHeading'
import type { ParsedSwingDiscovery } from '@/lib/parseSwingDiscoverySlug'
import type { UnifiedSwingClub } from '@/lib/unifiedSwingClubs'

type Props = {
  path: string
  h1: string
  paragraphs: string[]
  descriptionForLd: string
  clubs: UnifiedSwingClub[]
  events: HubEventRow[]
  parsed: Extract<ParsedSwingDiscovery, { kind: 'hub' }>
}

export default function SwingDiscoveryHubLayout({
  path,
  h1,
  paragraphs,
  descriptionForLd,
  clubs,
  events,
  parsed,
}: Props) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Dungeons & clubs', href: '/dungeons' },
    { label: h1, href: path, current: true },
  ]

  return (
    <DiscoveryPageShell accent="violet">
      <SwingDiscoveryStructuredData
        urlPath={path}
        name={h1}
        description={descriptionForLd}
        clubs={clubs.map((c) => ({ name: c.name, slug: c.slug }))}
      />

      <section className="section-padding">
        <div className="container-custom">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            href="/dungeons#swing-clubs"
            className="mt-2 inline-flex min-h-touch items-center text-gray-300 underline underline-offset-4 decoration-white/20 transition-colors hover:text-white hover:decoration-white/50"
          >
            ← Back to swing clubs
          </Link>

          <div className="mb-8 mt-8 max-w-3xl">
            <SeoIntroCollapsible h1={h1} paragraphs={paragraphs} summaryLabel="About this area" />
          </div>

          <DiscoverySectionHeading title="Matching" accent="clubs" className="mb-4" />
          <SwingDiscoveryHubGrid clubs={clubs} />

          <DiscoverySectionHeading
            title="Upcoming events in"
            accent="this area"
            subtitle={
              <p className="text-sm text-gray-500">
                Geographic matches from our events calendar; not every event is hosted at a listed club.
              </p>
            }
            className="mb-4 mt-12"
          />
          <DungeonDiscoveryEventsStrip events={events} />

          <SwingDiscoveryRelatedLinks parsed={parsed} />
        </div>
      </section>
    </DiscoveryPageShell>
  )
}
