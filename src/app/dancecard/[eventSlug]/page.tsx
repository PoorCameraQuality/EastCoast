import { DancecardClient } from '@/components/dancecard/DancecardClient'

export default function DancecardEventPage({ params }: { params: { eventSlug: string } }) {
  return <DancecardClient eventSlug={params.eventSlug} />
}
