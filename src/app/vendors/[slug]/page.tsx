import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVendorBySlug } from '@/data/vendors'
import { getVendorPaidImage125Url } from '@/lib/vendorFiltering'
import { BASE_URL } from '@/lib/seo'
import VendorImage from '@/components/vendors/VendorImage'
import Breadcrumb from '@/components/Breadcrumb'
import { VendorStructuredData } from '@/components/StructuredData'
import { buildVendorKeywords } from '@/lib/vendorMetadata'

/**
 * Generates metadata for vendor detail pages using the vendor logo as OG image.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const vendor = getVendorBySlug(params.slug)

  if (!vendor) {
    return {
      title: 'Vendor Not Found',
      description: 'The requested vendor could not be found.',
    }
  }

  const rawLogoUrl = vendor.logo125Url
  const logoUrl = rawLogoUrl
    ? rawLogoUrl.startsWith('http')
      ? rawLogoUrl
      : `${BASE_URL}${rawLogoUrl}`
    : `${BASE_URL}/og-image.png`
  const rawDesc = (vendor.description || vendor.story || 'Vendor listing').trim()
  const description = rawDesc.length > 160 ? `${rawDesc.slice(0, 157)}…` : rawDesc
  const ogDescription = rawDesc.length > 200 ? `${rawDesc.slice(0, 197)}…` : rawDesc
  const keywords = buildVendorKeywords(vendor)

  return {
    title: `${vendor.name} | East Coast Kink Events`,
    description,
    keywords,
    openGraph: {
      title: vendor.name,
      description: ogDescription,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `${vendor.name} logo`,
        },
      ],
      type: 'website',
      url: `${BASE_URL}/vendors/${vendor.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: vendor.name,
      description: ogDescription,
      images: [logoUrl],
    },
    alternates: {
      canonical: `${BASE_URL}/vendors/${vendor.slug}`,
    },
  }
}

export default function VendorDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams?: { tag?: string | string[] }
}) {
  const vendor = getVendorBySlug(params.slug)

  if (!vendor) {
    notFound()
  }

  const selected = searchParams?.tag
    ? Array.isArray(searchParams.tag)
      ? searchParams.tag
      : [searchParams.tag]
    : []

  const paidImageUrl = getVendorPaidImage125Url({ vendor, selectedTagSlugs: selected })

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
            <Link href="/vendors" className="inline-flex min-h-touch items-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors">
              ← Back to Vendors
            </Link>
          </div>

          <header className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-8 shadow-dark ${vendor.isPaid ? 'vendor-paid-sparkle' : ''}`}>
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
                  <VendorImage src={paidImageUrl} alt={`Featured product image for ${vendor.name}`} size={125} />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {vendor.websiteUrl ? (
                <a
                  href={vendor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-center min-h-touch inline-flex items-center justify-center"
                  aria-label="Visit vendor website (opens in a new tab)"
                >
                  Visit Website
                </a>
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

