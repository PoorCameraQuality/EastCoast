import { Metadata } from 'next'
import { getAllEvents, generateEventSEO } from '@/data/events'
import { resolveEventForPage } from '@/lib/unifiedEvents'
import { notFound } from 'next/navigation'
import EventDetailView from '@/components/events/EventDetailView'
import { BASE_URL } from '@/lib/seo'

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

  return <EventDetailView event={event} />
}
