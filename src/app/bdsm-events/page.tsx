import { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { buildAllowlistedDiscoveryPaths } from '@/lib/discoveryTier'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const title = 'BDSM Events by State & City | Discovery Hub'
  const description =
    'Find BDSM events, kink parties, and fetish-friendly gatherings by state, province, city, and tag—US and Canada.'
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/bdsm-events` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/bdsm-events`,
      siteName: 'East Coast Kink Events',
      type: 'website',
    },
  }
}

const ALL_STATE_SLUGS = Object.keys(EAST_COAST_STATES) as StateSlug[]
const US_SLUGS = ALL_STATE_SLUGS.filter((s) => EAST_COAST_STATES[s].region !== 'Canada').sort((a, b) =>
  EAST_COAST_STATES[a].name.localeCompare(EAST_COAST_STATES[b].name)
)
const CA_SLUGS = ALL_STATE_SLUGS.filter((s) => EAST_COAST_STATES[s].region === 'Canada').sort((a, b) =>
  EAST_COAST_STATES[a].name.localeCompare(EAST_COAST_STATES[b].name)
)

export default function BdsmEventsHubPage() {
  const samples = buildAllowlistedDiscoveryPaths().slice(0, 36)

  const hubBreadcrumb = [
    { label: 'Home', href: '/' },
    { label: 'BDSM events', href: '/bdsm-events', current: true },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-8 md:py-16">
        <div className="mb-6">
          <Breadcrumb items={hubBreadcrumb} />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4">
          BDSM events discovery hub
        </h1>
        <p className="text-lg text-gray-300 max-w-3xl mb-10">
          Browse programmatic hubs for US states, Canadian provinces and territories, major cities, tags, and special
          lists (this weekend, near Philadelphia). These pages combine upcoming events, dungeon listings where
          available, and internal links to explore safely and consensually.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">United States</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {US_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/bdsm-events/${slug}`}
                className="card-elegant text-center py-4 px-3 hover:border-primary-500/50 transition-colors"
              >
                <span className="text-white font-medium">{EAST_COAST_STATES[slug].name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Canada</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {CA_SLUGS.map((slug) => (
              <Link
                key={slug}
                href={`/bdsm-events/${slug}`}
                className="card-elegant text-center py-4 px-3 hover:border-primary-500/50 transition-colors"
              >
                <span className="text-white font-medium">{EAST_COAST_STATES[slug].name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Special hubs</h2>
          <ul className="flex flex-wrap gap-3">
            <li>
              <Link href="/bdsm-events/this-weekend" className="text-primary-400 hover:underline">
                This weekend
              </Link>
            </li>
            <li>
              <Link href="/bdsm-events/near-philadelphia" className="text-primary-400 hover:underline">
                Near Philadelphia
              </Link>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif font-bold text-white mb-4">Sample programmatic URLs</h2>
          <ul className="text-sm text-gray-400 space-y-2 max-h-64 overflow-y-auto">
            {samples.map((p) => (
              <li key={p}>
                <Link href={`/${p}`} className="hover:text-primary-300">
                  /{p}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
