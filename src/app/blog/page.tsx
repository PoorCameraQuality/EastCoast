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

export const metadata: Metadata = {
  title: 'BDSM & Kink Guides — Blog | East Coast Kink Events',
  description:
    'Long-form guides: what is BDSM, safety, first events, and regional funnels to calendars, vendors, and dungeons.',
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

  const paths = buildAllowlistedBlogPaths()
    .filter((p) => p !== 'blog' && p.includes('/'))
    .filter((p) => p.startsWith('blog/bdsm-events-in/') || p.startsWith('blog/how-to-start-bdsm-in/'))
    .map((p) => {
      const rest = p.replace(/^blog\//, '')
      const [a, b] = rest.split('/')
      if (a === 'bdsm-events-in' && b && b in EAST_COAST_STATES) {
        return {
          href: `/blog/${rest}`,
          label: `BDSM events & venues — ${EAST_COAST_STATES[b as StateSlug].name}`,
        }
      }
      if (a === 'how-to-start-bdsm-in' && b && b in CITY_BY_SLUG) {
        return {
          href: `/blog/${rest}`,
          label: `How to start kink — ${CITY_BY_SLUG[b].displayName}`,
        }
      }
      return { href: `/blog/${rest}`, label: rest }
    })

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog', current: true },
  ]

  return (
    <div className="min-h-screen bg-black section-padding">
      <div className="container-custom max-w-3xl">
        <Breadcrumb items={breadcrumbItems} />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mt-6 mb-4">
          Guides &amp; programmatic articles
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Editorial-style pillars and regional pages designed to connect reading with{' '}
          <Link href="/events" className="text-primary-400 underline underline-offset-2">
            events
          </Link>
          ,{' '}
          <Link href="/vendors" className="text-primary-400 underline underline-offset-2">
            vendors
          </Link>
          , and{' '}
          <Link href="/dungeons" className="text-primary-400 underline underline-offset-2">
            dungeons
          </Link>
          . For the Supabase article library, see{' '}
          <Link href="/education" className="text-primary-400 underline underline-offset-2">
            Education
          </Link>
          .
        </p>

        <h2 className="text-xl font-serif font-semibold text-white mb-4">Pillar guides</h2>
        <ul className="space-y-4 list-none p-0 m-0 mb-12">
          {pillars.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block card-elegant p-4 sm:p-6 hover:border-primary-500/30 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{p.title}</span>
                <p className="text-sm text-gray-400 mt-2">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-serif font-semibold text-white mb-4">Regional guides</h2>
        <p className="text-sm text-gray-500 mb-4">
          US states, Canadian provinces and territories, and major city entry guides. Set{' '}
          <code className="text-gray-400">NEXT_PUBLIC_DISCOVERY_LIMITED=true</code> only if you need the older
          tiered rollout.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
          {paths.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                className="block text-primary-400 hover:text-primary-300 underline underline-offset-2 py-2"
              >
                {p.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
