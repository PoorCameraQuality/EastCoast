import type { Metadata } from 'next'
import { TAG_GROUPS, TAGS, tagGroupsById, tagsBySlug } from '@/data/vendorTaxonomy'
import { getUnifiedVendors } from '@/lib/unifiedVendors'
import VendorsPageClient from '@/components/vendors/VendorsPageClient'
import { VendorsIndexStructuredData } from '@/components/StructuredData'
import { getTagSlugsFromPageSearchParams } from '@/lib/vendorFiltering'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const count = (await getUnifiedVendors()).length
  const description = `Explore ${count} kink vendors and BDSM gear makers. Browse impact play, bondage, fetish wear, and artisan makers across the East Coast.`

  return {
    title: 'Kink Vendors & BDSM Gear — Marketplace Directory',
    description: description.slice(0, 160),
    alternates: { canonical: `${BASE_URL}/vendors` },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${BASE_URL}/vendors`,
      siteName: 'East Coast Kink Events',
      title: 'Kink Vendors & BDSM Gear',
      description: description.slice(0, 200),
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'East Coast Kink Events - Vendors',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kink Vendors & BDSM Gear',
      description: description.slice(0, 200),
      images: [`${BASE_URL}/og-image.png`],
    },
  }
}

export default async function VendorsIndexPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const vendors = await getUnifiedVendors()
  const selectedTagSlugs = getTagSlugsFromPageSearchParams(searchParams)

  return (
    <>
      <VendorsIndexStructuredData
        vendors={vendors.map((v) => ({ name: v.name, slug: v.slug }))}
      />
      <VendorsPageClient
        vendors={vendors}
        tagGroups={TAG_GROUPS}
        tags={TAGS}
        tagsBySlug={tagsBySlug}
        tagGroupsById={tagGroupsById}
        selectedTagSlugs={selectedTagSlugs}
      />
    </>
  )
}

