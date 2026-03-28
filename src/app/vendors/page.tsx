import type { Metadata } from 'next'
import { getAllVendors } from '@/data/vendors'
import { TAG_GROUPS, TAGS, tagGroupsById, tagsBySlug } from '@/data/vendorTaxonomy'
import VendorsPageClient from '@/components/vendors/VendorsPageClient'
import { getTagSlugsFromPageSearchParams } from '@/lib/vendorFiltering'

export const revalidate = 1800

export async function generateMetadata(): Promise<Metadata> {
  const count = getAllVendors().length
  const description = `Explore ${count} kink vendors and BDSM gear makers. Browse impact play, bondage, fetish wear, and artisan makers across the East Coast.`

  return {
    title: 'Kink Vendors & BDSM Gear — Marketplace Directory',
    description: description.slice(0, 160),
    alternates: { canonical: 'https://www.eastcoastkinkevents.com/vendors' },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://www.eastcoastkinkevents.com/vendors',
      siteName: 'East Coast Kink Events',
      title: 'Kink Vendors & BDSM Gear',
      description: description.slice(0, 200),
      images: [
        {
          url: 'https://www.eastcoastkinkevents.com/og-image.png',
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
      images: ['https://www.eastcoastkinkevents.com/og-image.png'],
    },
  }
}

export default function VendorsIndexPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const vendors = getAllVendors()
  const selectedTagSlugs = getTagSlugsFromPageSearchParams(searchParams)

  return (
    <VendorsPageClient
      vendors={vendors}
      tagGroups={TAG_GROUPS}
      tags={TAGS}
      tagsBySlug={tagsBySlug}
      tagGroupsById={tagGroupsById}
      selectedTagSlugs={selectedTagSlugs}
    />
  )
}

