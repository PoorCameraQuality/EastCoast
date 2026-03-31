import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { parseVendorDiscoverySlug, parseVendorDiscoverySlugSafe } from '@/lib/parseVendorDiscoverySlug'
import {
  filterVendorsForHub,
  getUnifiedVendors,
  resolveVendorBySlug,
  vendorHubFilterFromParsed,
} from '@/lib/unifiedVendors'
import { buildVendorDiscoveryIntro } from '@/lib/seo/vendorDiscoveryCopy'
import { vendorDiscoveryRobotsMeta } from '@/lib/vendorDiscoveryRobots'
import { BASE_URL } from '@/lib/seo'
import VendorDetailView from '@/components/vendors/VendorDetailView'
import VendorDiscoveryHubLayout from '@/components/vendors/VendorDiscoveryHubLayout'
import VendorDiscoveryStructuredData from '@/components/vendors/VendorDiscoveryStructuredData'
import {
  buildVendorKeywords,
  buildVendorMetaDescription,
  buildVendorOgDescription,
} from '@/lib/vendorMetadata'
import { getTagSlugsFromPageSearchParams } from '@/lib/vendorFiltering'

export const revalidate = 1800

interface PageProps {
  params: { slug: string[] }
  searchParams?: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseVendorDiscoverySlugSafe(params.slug)
  if (!parsed) {
    return {
      title: 'Vendor Not Found',
      description: 'The requested page could not be found.',
    }
  }

  if (parsed.kind === 'vendorDetail') {
    const vendor = await resolveVendorBySlug(parsed.slug)
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
    const description = buildVendorMetaDescription(vendor)
    const ogDescription = buildVendorOgDescription(vendor)
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

  const year = new Date().getFullYear()
  const all = await getUnifiedVendors()
  const filter = vendorHubFilterFromParsed(parsed)
  const filtered = filterVendorsForHub(all, filter)
  const robots = vendorDiscoveryRobotsMeta(params.slug, filtered.length)
  const { h1, paragraphs } = buildVendorDiscoveryIntro({
    parsed,
    vendorCount: filtered.length,
    year,
  })
  const path = `/vendors/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')

  return {
    title: `${h1} | East Coast Kink Events`,
    description: desc.slice(0, 160),
    robots,
    alternates: {
      canonical: `${BASE_URL}${path}`,
    },
    openGraph: {
      title: h1,
      description: desc.slice(0, 200),
      url: `${BASE_URL}${path}`,
      siteName: 'East Coast Kink Events',
      type: 'website',
    },
  }
}

export default async function VendorSlugPage({ params, searchParams }: PageProps) {
  const parsed = parseVendorDiscoverySlug(params.slug)
  if (!parsed) {
    notFound()
  }

  if (parsed.kind === 'vendorDetail') {
    const vendor = await resolveVendorBySlug(parsed.slug)
    if (!vendor) {
      notFound()
    }
    const selected = getTagSlugsFromPageSearchParams(searchParams || {})
    return <VendorDetailView vendor={vendor} selectedTagSlugs={selected} />
  }

  const year = new Date().getFullYear()
  const all = await getUnifiedVendors()
  const filter = vendorHubFilterFromParsed(parsed)
  const filtered = filterVendorsForHub(all, filter)
  const { h1, paragraphs } = buildVendorDiscoveryIntro({
    parsed,
    vendorCount: filtered.length,
    year,
  })
  const path = `/vendors/${params.slug.join('/')}`
  const desc = paragraphs.join(' ')

  return (
    <>
      <VendorDiscoveryStructuredData
        urlPath={path}
        name={h1}
        description={desc}
        vendors={filtered.map((v) => ({ name: v.name, slug: v.slug }))}
      />
      <VendorDiscoveryHubLayout
        pathSegments={params.slug}
        h1={h1}
        paragraphs={paragraphs}
        vendors={filtered}
        parsed={parsed}
      />
    </>
  )
}
