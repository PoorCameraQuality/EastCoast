import { Metadata } from 'next'
import { getAllEvents, generateEventSEO } from '@/data/events'
import { fetchOwnedEventAsPageEvent, resolveEventForPage } from '@/lib/unifiedEvents'
import { notFound } from 'next/navigation'
import EventDetailView from '@/components/events/EventDetailView'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { listPublishedEventPostsBySlug } from '@/lib/eckeOrgEvents'
import { orgOwnsEventSlug } from '@/lib/eckeOrgListings'
import { BASE_URL } from '@/lib/seo'
import { normalizeEventMedia } from '@/lib/eventMedia'
import { deriveEventBrandTheme } from '@/lib/eventBrandTheme.server'

/** C2K-synced logos/covers can land after first publish — keep pages fresh. */
export const revalidate = 60

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let event = await resolveEventForPage(params.slug)
  if (!event) {
    const session = await requireOrgSession()
    if (session) event = await fetchOwnedEventAsPageEvent(params.slug, session.organization.id)
  }

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }

  const seo = generateEventSEO(event)
  const isPublic = event.status !== 'draft'

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    robots: isPublic ? undefined : { index: false, follow: false },
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
      type: 'website',
      url: `${BASE_URL}/events/${params.slug}`,
      siteName: 'East Coast Kink Events',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: seo.openGraph.images,
    },
    alternates: {
      canonical: `${BASE_URL}/events/${params.slug}`,
    },
  }
}

export async function generateStaticParams() {
  const events = getAllEvents()

  return events.map((event) => ({
    slug: event.slug,
  }))
}

export default async function EventPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'create' || params.slug === 'my-events') {
    notFound()
  }
  let event = await resolveEventForPage(params.slug)
  const session = await requireOrgSession()
  if (!event && session) {
    event = await fetchOwnedEventAsPageEvent(params.slug, session.organization.id)
  }

  if (!event) {
    notFound()
  }

  const media = normalizeEventMedia({
    name: event.name,
    logo: event.logo,
    heroImage: event.heroImage,
    source: event.c2kSourceId ? 'supabase' : 'static',
    c2kSourceId: event.c2kSourceId,
  })
  const brand = await deriveEventBrandTheme(media, event.slug, event.category)
  const canManage = Boolean(session && event.organizationId && event.organizationId === session.organization.id)
    || Boolean(session && (await orgOwnsEventSlug(session.organization.id, event.slug)))
  const posts = event.organizationId ? await listPublishedEventPostsBySlug(event.slug) : []

  return <EventDetailView event={event} media={media} brand={brand} canManage={canManage} posts={posts} />
}
