import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import FAQ from '@/components/FAQ'
import { BASE_URL } from '@/lib/seo'
import {
  KINK_SOCIAL_PLATFORM_FAQ,
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
} from '@/lib/kinkSocialMarketing'

export const metadata: Metadata = {
  title: 'kink.social and East Coast Kink Events',
  description:
    'ECKE is the public discovery directory for events, places, vendors, and education. kink.social is the member platform for accounts, organizations, and registration.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: `${BASE_URL}/kink-social`,
  },
  openGraph: {
    title: 'kink.social and East Coast Kink Events',
    description:
      'Public discovery on ECKE. Community, organizations, and registration on kink.social.',
    type: 'website',
    url: `${BASE_URL}/kink-social`,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'kink.social and East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'kink.social and East Coast Kink Events',
    description:
      'Public discovery on ECKE. Community, organizations, and registration on kink.social.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

const ctaClass =
  'inline-flex items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-400'

const secondaryCtaClass =
  'inline-flex items-center justify-center rounded-md border border-primary-400/40 px-4 py-2 text-sm font-semibold text-primary-300 hover:bg-primary-500/10'

export default function KinkSocialExplainerPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'kink.social', href: '/kink-social', current: true },
  ]

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'kink.social and East Coast Kink Events',
    description:
      'ECKE is the public discovery directory. kink.social is the member community and publishing platform.',
    url: `${BASE_URL}/kink-social`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'East Coast Kink Events',
      url: BASE_URL,
    },
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        id="kink-social-explainer-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Public discovery on ECKE. Community on kink.social.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-gray-300">
        East Coast Kink Events (ECKE) is the public, searchable directory for kink events, places,
        vendors, and education. kink.social is the account-based platform where members register
        for events, run organizations, and publish public-safe listings that can appear here.
      </p>
      <p className="mt-3 text-base leading-relaxed text-gray-300">
        Browse freely on ECKE. Join kink.social when you are ready to save events, follow organizers,
        or publish.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a className={ctaClass} href={getKinkSocialJoinUrl('footer')}>
          Join kink.social
        </a>
        <a className={secondaryCtaClass} href={getKinkSocialOrgUrl('organizer')}>
          Create an organization
        </a>
        <Link className={secondaryCtaClass} href="/events">
          Browse ECKE events
        </Link>
      </div>
      <section className="mt-12" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-xl font-semibold text-white">
          How the two sites work together
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-300">
          <li>Organizers publish public-safe events, places, vendors, and education from kink.social.</li>
          <li>ECKE shows those listings for discovery and search — with registration CTAs back to kink.social.</li>
          <li>Private member data, messages, and org ops stay on kink.social and are not indexed here.</li>
        </ul>
      </section>
      <div className="mt-12">
        <FAQ items={[...KINK_SOCIAL_PLATFORM_FAQ]} title="kink.social FAQ" />
      </div>
    </main>
  )
}
