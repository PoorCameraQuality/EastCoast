import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GroupListingDetailView from '@/components/groups/GroupListingDetailView'
import { BASE_URL } from '@/lib/seo'
import { fetchPublishedGroupListingBySlug } from '@/lib/unifiedGroupListings'

export const revalidate = 1800

type PageProps = {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const group = await fetchPublishedGroupListingBySlug(params.slug)
  if (!group) {
    return {
      title: 'Group Not Found',
      description: 'The requested group listing could not be found.',
    }
  }

  const description =
    group.description?.slice(0, 160) ||
    `${group.name} — kink community group on East Coast Kink Events.`

  return {
    title: group.name,
    description,
    alternates: {
      canonical: `${BASE_URL}/groups/${group.slug}`,
    },
    openGraph: {
      title: group.name,
      description,
      type: 'website',
      url: `${BASE_URL}/groups/${group.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary',
      title: group.name,
      description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function GroupListingPage({ params }: PageProps) {
  const group = await fetchPublishedGroupListingBySlug(params.slug)
  if (!group) notFound()

  return (
    <main className="min-h-screen bg-black">
      <GroupListingDetailView group={group} />
    </main>
  )
}
