import { Metadata } from 'next'
import { getAllEvents, generateEventSEO } from '@/data/events'
import { resolveEventForPage } from '@/lib/unifiedEvents'
import { notFound } from 'next/navigation'
import EventDetailView from '@/components/events/EventDetailView'
import { BASE_URL } from '@/lib/seo'
import { normalizeEventMedia } from '@/lib/eventMedia'
import { deriveEventBrandTheme } from '@/lib/eventBrandTheme.server'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await resolveEventForPage(params.slug)

  if (!event) {
    return {
      title: 'Event Not Found',
      description: 'The requested event could not be found.',
    }
  }

  const seo = generateEventSEO(event)

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
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
  const event = await resolveEventForPage(params.slug)

  if (!event) {
    notFound()
  }

  const media = normalizeEventMedia({
    name: event.name,
    logo: event.logo,
    source: event.c2kSourceId ? 'supabase' : 'static',
    c2kSourceId: event.c2kSourceId,
  })
  const brand = await deriveEventBrandTheme(media, event.slug, event.category)

  return <EventDetailView event={event} media={media} brand={brand} />
}
