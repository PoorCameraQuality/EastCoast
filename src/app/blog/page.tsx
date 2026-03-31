import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_URL } from '@/lib/seo'
import { BLOG_PILLAR_SLUGS } from '@/lib/blogPillarRegistry'
import { loadBlogPillar } from '@/lib/loadBlogPillar'
import { buildAllowlistedBlogPaths } from '@/lib/blogDiscoveryTier'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import { CITY_BY_SLUG } from '@/lib/discoveryCityRegistry'

export const revalidate = 1800

/** Regions ordered for reading (roughly east → west, Canada last). */
const REGION_ORDER = [
  'New England',
  'Northeast',
  'Mid-Atlantic',
  'South',
  'Midwest',
  'Great Plains',
  'South Central',
  'Mountain West',
  'Southwest',
  'Pacific',
  'Canada',
] as const

function regionRank(region: string): number {
  const i = REGION_ORDER.indexOf(region as (typeof REGION_ORDER)[number])
  return i === -1 ? 100 : i
}

function labelForStateAbbr(abbr: string): string {
  const row = (Object.values(EAST_COAST_STATES) as { name: string; abbr: string }[]).find(
    (s) => s.abbr === abbr
  )
  return row ? `${row.name} (${abbr})` : abbr
}

export const metadata: Metadata = {
  title: 'BDSM & Kink Guides — Blog',
  description:
    'Long-form guides on BDSM, safety, and first events—plus regional write-ups that point to calendars, vendors, and venue listings.',
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: 'BDSM & Kink Guides — Blog',
    description: 'Education that links to real events, vendors, and venue listings.',
    url: `${BASE_URL}/blog`,
    siteName: 'East Coast Kink Events',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const pillars = BLOG_PILLAR_SLUGS.map((slug) => {
    const doc = loadBlogPillar(slug)
    return doc ? { slug, title: doc.title, description: doc.description } : null
  }).filter(Boolean) as { slug: string; title: string; description: string }[]

  const allowlisted = new Set(buildAllowlistedBlogPaths())

  const stateRows = (Object.keys(EAST_COAST_STATES) as StateSlug[]).map((slug) => {
    const s = EAST_COAST_STATES[slug]
    const path = `blog/bdsm-events-in/${slug}`
    return {
      slug,
      path,
      name: s.name,
      abbr: s.abbr,
      region: s.region,
      href: `/blog/bdsm-events-in/${slug}`,
      missing: !allowlisted.has(path),
    }
  })

  const byRegion = new Map<string, typeof stateRows>()
  for (const row of stateRows) {
    if (row.missing) continue
    if (!byRegion.has(row.region)) byRegion.set(row.region, [])
    byRegion.get(row.region)!.push(row)
  }
  for (const list of Array.from(byRegion.values())) {
    list.sort((a, b) => a.name.localeCompare(b.name))
  }
  const regionsSorted = Array.from(byRegion.keys()).sort(
    (a, b) => regionRank(a) - regionRank(b) || a.localeCompare(b)
  )

  const cityGroups = new Map<string, { displayName: string; href: string }[]>()
  for (const [slug, entry] of Object.entries(CITY_BY_SLUG)) {
    const path = `blog/how-to-start-bdsm-in/${slug}`
    if (!allowlisted.has(path)) continue
    const abbr = entry.stateAbbr
    if (!cityGroups.has(abbr)) cityGroups.set(abbr, [])
    cityGroups.get(abbr)!.push({
      displayName: entry.displayName,
      href: `/blog/how-to-start-bdsm-in/${slug}`,
    })
  }
  for (const cities of Array.from(cityGroups.values())) {
    cities.sort((a, b) => a.displayName.localeCompare(b.displayName))
  }
  const cityAbbrSorted = Array.from(cityGroups.keys()).sort((a, b) =>
    labelForStateAbbr(a).localeCompare(labelForStateAbbr(b))
  )

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog', current: true },
  ]

  const stateLinkClass =
    'group flex flex-col rounded-lg border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent px-4 py-3 transition hover:border-primary-500/35 hover:from-primary-500/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'

  const cityLinkClass =
    'rounded-md border border-white/5 bg-white/[0.02] px-3 py-2 text-sm text-gray-200 transition hover:border-primary-500/25 hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500'

  return (
    <div className="min-h-screen bg-black section-padding">
      <div className="container-custom max-w-3xl">
        <Breadcrumb items={breadcrumbItems} />
        <p className="text-primary-400/90 text-sm font-medium tracking-wide uppercase mt-6 mb-2">
          Guides
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-5">
          Practical reads for curious adults
        </h1>
        <p className="text-lg text-gray-300 leading-relaxed mb-3">
          Start with the essentials below, then dig into listings that match how people actually search:{' '}
          <Link href="/events" className="text-primary-400 underline underline-offset-2 decoration-primary-400/40 hover:decoration-primary-300">
            events
          </Link>
          ,{' '}
          <Link href="/vendors" className="text-primary-400 underline underline-offset-2 decoration-primary-400/40 hover:decoration-primary-300">
            vendors
          </Link>
          , and{' '}
          <Link href="/dungeons" className="text-primary-400 underline underline-offset-2 decoration-primary-400/40 hover:decoration-primary-300">
            dungeons
          </Link>
          .
        </p>
        <p className="text-base text-gray-400 leading-relaxed mb-12">
          Looking for a bigger article library from our editors?{' '}
          <Link href="/education" className="text-primary-400 underline underline-offset-2">
            Browse Education
          </Link>
          .
        </p>

        <h2 className="text-2xl font-serif font-semibold text-white mb-2">Start here</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl">
          Foundational topics we point newcomers to first—consent, safety, vocabulary, and what a first night out can look like.
        </p>
        <ul className="space-y-4 list-none p-0 m-0 mb-16">
          {pillars.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className={`${stateLinkClass} sm:flex-row sm:items-start sm:gap-6`}>
                <span className="text-base font-semibold text-white group-hover:text-primary-100">{p.title}</span>
                <p className="text-sm text-gray-400 mt-2 sm:mt-0 sm:flex-1 sm:font-normal leading-relaxed">
                  {p.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-custom max-w-5xl border-t border-white/10 pt-14 pb-8">
        <h2 className="text-2xl font-serif font-semibold text-white mb-2">By state or province</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-10 max-w-3xl leading-relaxed">
          Hubs that summarize what&apos;s happening in each area—upcoming events, venue context, and ways to explore without guesswork. Organized by region so you can scan what&apos;s near you.
        </p>

        <div className="space-y-12">
          {regionsSorted.map((region) => {
            const rows = byRegion.get(region)!
            return (
              <section key={region} aria-labelledby={`region-${region.replace(/\s+/g, '-').toLowerCase()}`}>
                <h3
                  id={`region-${region.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-lg font-serif text-white/95 border-b border-white/10 pb-2 mb-4"
                >
                  {region}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
                  {rows.map((row) => (
                    <li key={row.slug}>
                      <Link href={row.href} className={stateLinkClass}>
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary-400/90">
                          {row.abbr}
                        </span>
                        <span className="text-sm font-medium text-white mt-1">{row.name}</span>
                        <span className="text-xs text-gray-500 mt-1">Events &amp; venues overview</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      <div className="container-custom max-w-5xl pb-16">
        <h2 className="text-2xl font-serif font-semibold text-white mb-2">City starter guides</h2>
        <p className="text-gray-400 text-sm sm:text-base mb-8 max-w-3xl leading-relaxed">
          Shorter entry points for bigger metros—how to find community, what to expect, and where to look next. Grouped by state or province.
        </p>
        <div className="space-y-10">
          {cityAbbrSorted.map((abbr) => {
            const cities = cityGroups.get(abbr)!
            return (
              <section key={abbr} aria-labelledby={`cities-${abbr}`}>
                <h3 id={`cities-${abbr}`} className="text-base font-semibold text-white mb-3">
                  {labelForStateAbbr(abbr)}
                </h3>
                <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {cities.map((c) => (
                    <li key={c.href}>
                      <Link href={c.href} className={cityLinkClass}>
                        {c.displayName}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>

        <p className="mt-14 text-xs text-gray-600 max-w-xl leading-relaxed">
          Operators: to stage a smaller set of regional URLs during rollout, use{' '}
          <code className="text-gray-500">NEXT_PUBLIC_DISCOVERY_LIMITED=true</code> with your tier settings
          elsewhere in the project.
        </p>
      </div>
    </div>
  )
}
