import type { Metadata } from 'next'
import { Suspense } from 'react'
import { DancecardClient } from '@/components/dancecard/DancecardClient'
import { DancecardAttendeeShellSkeleton } from '@/components/dancecard/organizer/ui'
import { PreviewRoleBanner } from '@/components/dancecard/PreviewRoleBanner'
import { BASE_URL } from '@/lib/seo'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

const DANCECARD_SOCIAL_IMAGE = `${BASE_URL}/images/dancecard/dancecard-social.png`
const DANCECARD_TITLE = 'Dancecard'
const DANCECARD_DESCRIPTION =
  'Share availability, compare mutual free time, and reserve plans privately with Dancecard.'

async function resolveEventTitle(eventSlug: string): Promise<string | null> {
  try {
    const admin = getDancecardAdmin()
    const event = await loadEventBySlug(admin, normalizeEventSlug(eventSlug))
    const title = event?.event_title?.trim()
    return title || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { eventSlug: string } }): Promise<Metadata> {
  const slug = params.eventSlug.toLowerCase()
  const url = `${BASE_URL}/dancecard/${encodeURIComponent(slug)}`
  const eventTitle = await resolveEventTitle(slug)
  const title = eventTitle ? `${eventTitle} | Dancecard` : DANCECARD_TITLE
  const description = eventTitle
    ? `Share availability, compare mutual free time, and reserve plans privately for ${eventTitle} with Dancecard.`
    : DANCECARD_DESCRIPTION

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: DANCECARD_SOCIAL_IMAGE,
          width: 1024,
          height: 1024,
          alt: eventTitle
            ? `Dancecard availability sharing for ${eventTitle}`
            : 'Dancecard availability sharing preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DANCECARD_SOCIAL_IMAGE],
    },
  }
}

export default function DancecardEventPage({ params }: { params: { eventSlug: string } }) {
  const slug = params.eventSlug.toLowerCase()
  return (
    <>
      <Suspense fallback={null}>
        <PreviewRoleBanner />
      </Suspense>
      <Suspense
        fallback={
          <div className="relative min-h-screen overflow-hidden bg-dc-surface text-dc-text">
            <DancecardAttendeeShellSkeleton />
          </div>
        }
      >
        <DancecardClient eventSlug={slug} />
      </Suspense>
    </>
  )
}
