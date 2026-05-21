import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SeoIntroCollapsible from '@/components/seo/SeoIntroCollapsible'
import VendorDiscoveryHubGrid from '@/components/vendors/VendorDiscoveryHubGrid'
import VendorDiscoveryRelatedLinks from '@/components/vendors/VendorDiscoveryRelatedLinks'
import DiscoveryPageShell from '@/components/discovery/DiscoveryPageShell'
import DiscoverySectionHeading from '@/components/discovery/DiscoverySectionHeading'
import type { ParsedVendorDiscovery } from '@/lib/parseVendorDiscoverySlug'
import type { VendorRecord } from '@/lib/vendorFiltering'
import { selectedTaxonomySlugsForVendorHub } from '@/lib/vendorHubTagMap'

type Props = {
  pathSegments: string[]
  h1: string
  paragraphs: string[]
  vendors: VendorRecord[]
  parsed: Extract<ParsedVendorDiscovery, { kind: 'hub' }>
}

export default function VendorDiscoveryHubLayout({
  pathSegments,
  h1,
  paragraphs,
  vendors,
  parsed,
}: Props) {
  const path = `/vendors/${pathSegments.join('/')}`
  const selectedTagSlugs = selectedTaxonomySlugsForVendorHub({
    variant: parsed.variant,
    seoTagSlug:
      parsed.variant === 'tag' || parsed.variant === 'stateTag'
        ? parsed.seoTagSlug
        : undefined,
  })

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Vendors', href: '/vendors' },
    { label: h1, href: path, current: true },
  ]

  return (
    <DiscoveryPageShell accent="teal">
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-8 max-w-4xl">
            <Breadcrumb items={breadcrumbItems} />
            <Link
              href="/vendors"
              className="mt-2 inline-flex min-h-touch items-center text-gray-300 underline underline-offset-4 decoration-white/20 transition-colors hover:text-white hover:decoration-white/50"
            >
              ← Back to Vendors
            </Link>
          </div>

          <div className="mx-auto mb-8 max-w-3xl">
            <SeoIntroCollapsible h1={h1} paragraphs={paragraphs} summaryLabel="About this hub" />
          </div>

          <div className="mx-auto max-w-5xl">
            <DiscoverySectionHeading title="Matching" accent="vendors" className="mb-4" />
            <VendorDiscoveryHubGrid
              vendors={vendors}
              selectedTagSlugs={selectedTagSlugs}
              itemListName={path.replace(/^\//, '').replace(/\//g, '_')}
            />
            <VendorDiscoveryRelatedLinks parsed={parsed} />
          </div>
        </div>
      </section>
    </DiscoveryPageShell>
  )
}
