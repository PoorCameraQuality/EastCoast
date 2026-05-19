import type { Metadata } from 'next'
import { DoorModePanel } from '@/components/dancecard/organizer/door/DoorModePanel'
import { requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const metadata: Metadata = {
  title: 'Door check-in',
  manifest: '/dancecard-door-manifest.json',
}

export default async function DoorModePage({ params }: { params: { eventSlug: string } }) {
  const { organizerRole } = await requireOrganizerForSlug(params.eventSlug)
  const readOnly = organizerRole === 'viewer'

  return (
    <div data-dc-theme="event" className="min-h-screen bg-dc-surface">
      <DoorModePanel eventSlug={params.eventSlug} readOnly={readOnly} />
    </div>
  )
}
