import { Suspense } from 'react'
import { OrganizerDancecardClient } from './OrganizerDancecardClient'
import { OrganizerDancecardShell } from './OrganizerDancecardShell'

export default function OrganizerDancecardPage({ params }: { params: { eventSlug: string } }) {
  return (
    <OrganizerDancecardShell>
      <Suspense
        fallback={<p className="px-6 py-12 text-sm text-dc-muted">Loading event…</p>}
      >
        <OrganizerDancecardClient eventSlug={params.eventSlug} />
      </Suspense>
    </OrganizerDancecardShell>
  )
}
