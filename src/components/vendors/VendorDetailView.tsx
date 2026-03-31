import Link from 'next/link'
import { getVendorPaidImage125Url } from '@/lib/vendorFiltering'
import VendorImage from '@/components/vendors/VendorImage'
import Breadcrumb from '@/components/Breadcrumb'
import { VendorStructuredData } from '@/components/StructuredData'
import type { VendorRecord } from '@/lib/vendorFiltering'
import { parseVendorLocation } from '@/lib/unifiedVendors'
import DiscoveryEngineStrip from '@/components/discovery/DiscoveryEngineStrip'
import OutboundWebsiteLink from '@/components/analytics/OutboundWebsiteLink'

type Props = {
  vendor: VendorRecord
  selectedTagSlugs: string[]
}

export default function VendorDetailView({ vendor, selectedTagSlugs }: Props) {
  const paidImageUrl = getVendorPaidImage125Url({ vendor, selectedTagSlugs })
  const { stateAbbr } = parseVendorLocation(vendor.location)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Vendors', href: '/vendors' },
    { label: vendor.name, href: `/vendors/${vendor.slug}`, current: true },
  ]

  return (
    <section className="section-padding bg-gradient-to-br from-black via-dark-950 to-black">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <VendorStructuredData vendor={vendor} />
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <DiscoveryEngineStrip stateAbbr={stateAbbr ?? undefined} />
            <Link
              href="/vendors"
              className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              ← Back to Vendors
            </Link>
          </div>

          <header
            className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8 shadow-dark ${vendor.isPaid ? 'vendor-paid-sparkle' : ''}`}
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <VendorImage src={vendor.logo125Url} alt={`${vendor.name} logo`} size={125} />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white">
                    {vendor.name}
                  </h1>
                  {vendor.isPaid ? (
                    <span className="vendor-supporter-badge" aria-label="Supporter vendor">
                      Supporter
                    </span>
                  ) : null}
                </div>
                {vendor.location ? <p className="text-gray-300 mb-4">{vendor.location}</p> : null}
                <p className="text-gray-300 leading-relaxed">
                  {vendor.story || vendor.description}
                </p>
              </div>

              {vendor.isPaid ? (
                <div className="flex-shrink-0">
                  <VendorImage
                    src={paidImageUrl}
                    alt={`Featured product image for ${vendor.name}`}
                    size={125}
                  />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {vendor.websiteUrl ? (
                <OutboundWebsiteLink
                  href={vendor.websiteUrl}
                  entityType="vendor"
                  entitySlug={vendor.slug}
                  entityName={vendor.name}
                  className="btn-primary text-center min-h-touch inline-flex items-center justify-center"
                  aria-label="Visit vendor website (opens in a new tab)"
                >
                  Visit Website
                </OutboundWebsiteLink>
              ) : null}
              <Link
                href="/contact?subject=Vendor%20Inquiry"
                className="btn-outline text-center min-h-touch inline-flex items-center justify-center"
                aria-label="Contact us about this vendor"
              >
                Contact
              </Link>
            </div>
          </header>
        </div>
      </div>
    </section>
  )
}
