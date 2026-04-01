import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SwingDiscoveryHubGrid from '@/components/swingclubs/SwingDiscoveryHubGrid'
import DungeonDiscoveryEventsStrip, {
  type HubEventRow,
} from '@/components/dungeons/DungeonDiscoveryEventsStrip'
import SwingDiscoveryRelatedLinks from '@/components/swingclubs/SwingDiscoveryRelatedLinks'
import SwingDiscoveryStructuredData from '@/components/swingclubs/SwingDiscoveryStructuredData'
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
    <div className="min-h-screen bg-black">
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
            className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors mt-2"
          >
            ← Back to swing clubs
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

          <h2 className="text-xl font-serif font-semibold text-white mb-4">Matching clubs</h2>
          <SwingDiscoveryHubGrid clubs={clubs} />

          <h2 className="text-xl font-serif font-semibold text-white mt-12 mb-4">
            Upcoming events in this area
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Geographic matches from our events calendar; not every event is hosted at a listed club.
          </p>
          <DungeonDiscoveryEventsStrip events={events} />

          <SwingDiscoveryRelatedLinks parsed={parsed} />
        </div>
      </section>
    </div>
  )
}
