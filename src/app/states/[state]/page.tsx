import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'
import StateHubView, { StateHubRail } from '@/components/states/hub/StateHubView'
import StateSponsorCard from '@/components/states/hub/StateSponsorCard'
import { FaqStructuredData } from '@/components/StructuredData'
import { EAST_COAST_STATES, type StateSlug } from '@/lib/eastCoastStates'
import {
  buildStateHubDetail,
  getStateHubListingTotalFromStats,
  loadStateHubContext,
} from '@/lib/publicStateIndex'
import { buildStateHubFaqs } from '@/lib/seo/stateHubFaqs'
import { BASE_URL } from '@/lib/seo'

interface PageProps {
  params: { state: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const stateInfo = EAST_COAST_STATES[params.state as StateSlug]

  if (!stateInfo) {
    return {
      title: 'State Not Found',
      description: 'The requested state page could not be found.',
    }
  }

  const ctx = await loadStateHubContext()
  const hub = buildStateHubDetail(params.state as StateSlug, ctx)
  const totalListings = getStateHubListingTotalFromStats(hub.stats)
  const isThinPage = totalListings < 2
  const year = new Date().getFullYear()
  const title = `${stateInfo.name} kink events, places, vendors & education (${year})`

  return {
    title: title.length <= 60 ? title : `${stateInfo.name} kink scene hub (${year})`,
    ...(isThinPage && {
      robots: { index: false, follow: true },
    }),
    description: `${year}: upcoming kink events, conventions, venues, vendors, and education in ${stateInfo.name}. Public listings from ECKE and kink.social.`,
    alternates: {
      canonical: `${BASE_URL}/states/${params.state}`,
    },
    openGraph: {
      title,
      description: `Local scene hub for ${stateInfo.name}: events, places, vendors, and guides.`,
      type: 'website',
      url: `${BASE_URL}/states/${params.state}`,
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${stateInfo.name} — East Coast Kink Events`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: `Kink events, places, vendors, and education in ${stateInfo.name}.`,
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

export const revalidate = 1800

export async function generateStaticParams() {
  return Object.keys(EAST_COAST_STATES).map((state) => ({ state }))
}

export default async function StatePage({ params }: PageProps) {
  const stateInfo = EAST_COAST_STATES[params.state as StateSlug]

  if (!stateInfo) {
    notFound()
  }

  const ctx = await loadStateHubContext()
  const hub = buildStateHubDetail(params.state as StateSlug, ctx)
  const hubFaqs = buildStateHubFaqs(stateInfo.name, stateInfo.region)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'States', href: '/states' },
    { label: stateInfo.name, href: `/states/${params.state}`, current: true },
  ]

  return (
    <div className="st-hub-page">
      <FaqStructuredData faqs={hubFaqs} id="state-hub-faq-jsonld" />
      <div className="container-custom">
        <Breadcrumb items={breadcrumbItems} />

        <div className="st-layout">
          <div className="st-main">
            <StateHubView hub={hub} />

            <section className="st-section" aria-labelledby="state-faq-heading">
              <h2 id="state-faq-heading" className="st-section-title mb-3">
                Questions about this directory
              </h2>
              <div className="space-y-3 max-w-3xl">
                {hubFaqs.map((item) => (
                  <details
                    key={item.question}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 open:bg-white/[0.07]"
                  >
                    <summary className="cursor-pointer list-none text-sm font-medium text-gray-100 [&::-webkit-details-marker]:hidden">
                      {item.question}
                    </summary>
                    <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-relaxed text-gray-300">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <div className="st-mobile-sponsor">
              <StateSponsorCard />
            </div>
          </div>

          <StateHubRail hub={hub} />
        </div>
      </div>
    </div>
  )
}
