import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { getAllDungeons } from '@/data/dungeons'
import { getAllEvents } from '@/data/events'
import { buildDirectoryStats } from '@/lib/directoryExport'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 900

export const metadata: Metadata = {
  title: 'Directory snapshot — listings & coverage',
  description:
    'Public counts for venues and events indexed on East Coast Kink Events: dungeons, swing clubs, conventions, and geographic coverage. Updated on a schedule; download JSON for research.',
  alternates: {
    canonical: `${BASE_URL}/directory-snapshot`,
  },
  openGraph: {
    title: 'Directory snapshot — listings & coverage | East Coast Kink Events',
    description:
      'Venue and event counts, states with listings, and last updated date. Machine-readable JSON available.',
    url: `${BASE_URL}/directory-snapshot`,
    siteName: 'East Coast Kink Events',
    type: 'website',
    images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630, alt: 'East Coast Kink Events' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Directory snapshot — listings & coverage | East Coast Kink Events',
    description: 'Public counts and coverage for the ECKE directory. JSON export available.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default function DirectorySnapshotPage() {
  const dungeons = getAllDungeons()
  const events = getAllEvents()
  const stats = buildDirectoryStats(dungeons, events)

  const jsonUrl = `${BASE_URL}/export/stats.json`

  const rows: { label: string; value: string | number }[] = [
    { label: 'Last updated', value: stats.last_updated },
    { label: 'Total venue listings (dungeons + clubs)', value: stats.total_venues },
    { label: 'BDSM / play-space style venues', value: stats.total_bdsm_dungeons },
    { label: 'Swing & lifestyle clubs', value: stats.total_swing_clubs },
    { label: 'Other venue types', value: stats.total_other_venues },
    { label: 'Convention & event listings (catalog)', value: stats.total_conventions },
    { label: 'US states + DC (coverage map)', value: stats.states_covered },
    { label: 'States with at least one venue listing', value: stats.states_with_venues },
  ]

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Directory snapshot', href: '/directory-snapshot', current: true },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom section-padding max-w-3xl">
        <Breadcrumb items={breadcrumbItems} />

        <header className="mb-10">
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">Directory snapshot</h1>
          <p className="mt-4 text-gray-300 leading-relaxed">
            Aggregate counts from the East Coast Kink Events directory. Figures reflect listings in our database at{' '}
            <time dateTime={stats.last_updated}>{stats.last_updated}</time>, not the entire worldwide scene.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Method: static venue rows are classified by category (BDSM dungeon vs swing/lifestyle vs other); event rows
            include conferences and parties in the events catalog. US state total uses 50 states + DC for the coverage
            field; “states with venues” counts states that have at least one dungeon or club listing.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <table className="w-full text-left text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-white/10 last:border-0">
                  <th scope="row" className="px-4 py-3 font-medium text-gray-400 align-top w-[45%] sm:w-1/2">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-white tabular-nums">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/export/stats.json"
            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-primary-500/40 bg-primary-500/10 px-5 py-3 text-sm font-medium text-primary-200 hover:bg-primary-500/20"
          >
            Download JSON data
          </Link>
          <Link href="/states" className="text-sm text-gray-400 hover:text-primary-300 underline-offset-2">
            Browse by state →
          </Link>
        </div>
      </div>
    </div>
  )
}
