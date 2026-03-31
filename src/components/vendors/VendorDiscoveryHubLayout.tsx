import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import VendorDiscoveryHubGrid from '@/components/vendors/VendorDiscoveryHubGrid'
import VendorDiscoveryRelatedLinks from '@/components/vendors/VendorDiscoveryRelatedLinks'
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
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto mb-8">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            href="/vendors"
            className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors mt-2"
          >
            ← Back to Vendors
          </Link>
        </div>

        <header className="max-w-3xl mx-auto mb-10">
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

        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-serif font-semibold text-white mb-4">Matching vendors</h2>
          <VendorDiscoveryHubGrid
            vendors={vendors}
            selectedTagSlugs={selectedTagSlugs}
            itemListName={path.replace(/^\//, '').replace(/\//g, '_')}
          />
          <VendorDiscoveryRelatedLinks parsed={parsed} />
        </div>
      </div>
    </section>
  )
}
