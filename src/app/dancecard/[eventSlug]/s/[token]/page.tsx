import type { Metadata } from 'next'
import { ShareDancecardClient } from '@/components/dancecard/ShareDancecardClient'
import { BASE_URL } from '@/lib/seo'

const DANCECARD_SOCIAL_IMAGE = `${BASE_URL}/images/dancecard/dancecard-social.png`
const DANCECARD_TITLE = 'Shared Dancecard'
const DANCECARD_DESCRIPTION = 'Open a shared Dancecard to compare availability and claim a mutual free time.'

export async function generateMetadata({
  params,
}: {
  params: { eventSlug: string; token: string }
}): Promise<Metadata> {
  const url = `${BASE_URL}/dancecard/${encodeURIComponent(params.eventSlug.toLowerCase())}/s/${encodeURIComponent(params.token)}`
  return {
    robots: { index: false, follow: false },
    title: DANCECARD_TITLE,
    description: DANCECARD_DESCRIPTION,
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

export default function DancecardSharePage({ params }: { params: { eventSlug: string; token: string } }) {
  return <ShareDancecardClient eventSlug={params.eventSlug} token={params.token} />
}
