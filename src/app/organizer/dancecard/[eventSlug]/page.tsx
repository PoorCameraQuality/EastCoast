import { Suspense } from 'react'
import { OrganizerBootstrapScreen } from '@/components/dancecard/organizer/ui'
import { OrganizerDancecardClient } from './OrganizerDancecardClient'
import { OrganizerDancecardShell } from './OrganizerDancecardShell'

export default function OrganizerDancecardPage({ params }: { params: { eventSlug: string } }) {
  return (
    <OrganizerDancecardShell>
      <Suspense fallback={<OrganizerBootstrapScreen eventSlug={params.eventSlug} />}>
        <OrganizerDancecardClient eventSlug={params.eventSlug} />
      </Suspense>
    </OrganizerDancecardShell>
  )
}
