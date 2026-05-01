import type { Metadata } from 'next'
import { DancecardClient } from '@/components/dancecard/DancecardClient'
import { BASE_URL } from '@/lib/seo'

const DANCECARD_SOCIAL_IMAGE = `${BASE_URL}/images/dancecard/dancecard-social.png`
const DANCECARD_TITLE = 'Dancecard'
const DANCECARD_DESCRIPTION =
  'Share availability, compare mutual free time, and reserve plans privately with Dancecard.'

export async function generateMetadata({ params }: { params: { eventSlug: string } }): Promise<Metadata> {
  const url = `${BASE_URL}/dancecard/${encodeURIComponent(params.eventSlug.toLowerCase())}`
  return {
    title: DANCECARD_TITLE,
    description: DANCECARD_DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: DANCECARD_TITLE,
      description: DANCECARD_DESCRIPTION,
      url,
      type: 'website',
      siteName: 'East Coast Kink Events',
      images: [
        {
          url: DANCECARD_SOCIAL_IMAGE,
          width: 1024,
          height: 1024,
          alt: 'Dancecard availability sharing preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: DANCECARD_TITLE,
      description: DANCECARD_DESCRIPTION,
      images: [DANCECARD_SOCIAL_IMAGE],
    },
  }
}

export default function DancecardEventPage({ params }: { params: { eventSlug: string } }) {
  const slug = params.eventSlug.toLowerCase()
  return <DancecardClient eventSlug={slug} />
}
