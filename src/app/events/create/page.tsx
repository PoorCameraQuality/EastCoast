import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import OrgEventForm from '@/components/org/OrgEventForm'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { toOrgEventHostPlace } from '@/lib/eckeOrgDungeonShared'
import { requireOwnedPlace } from '@/lib/eckeOrgDungeons'

export const metadata: Metadata = {
  title: 'Create event',
  robots: { index: false, follow: false },
}

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: { at?: string }
}) {
  const session = await requireOrgSession()
  if (!session) redirect('/auth/org/login')
  const { place } = await requireOwnedPlace()
  const hostPlace = place ? toOrgEventHostPlace(place) : null
  const atPlace = searchParams.at === 'place' && Boolean(hostPlace)

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">
          {atPlace && hostPlace ? `Create event at ${hostPlace.name}` : 'Create event'}
        </h1>
        <p className="mt-2 text-sm text-sf-muted">
          {atPlace
            ? 'This night will publish into the public catalog and on your location calendar.'
            : 'Publish into the same public events catalog people already browse on ECKE.'}
        </p>
        <div className="mt-8">
          <OrgEventForm
            mode="create"
            hostPlace={hostPlace}
            initial={{
              organizer: session.organization.name,
              ...(atPlace && hostPlace
                ? {
                    kind: 'play_event',
                    hostAtPlace: true,
                    venue: hostPlace.name,
                    city: hostPlace.city,
                    state: hostPlace.state,
                    address: hostPlace.showAddressPublicly ? hostPlace.address : '',
                    showAddressPublicly: Boolean(hostPlace.showAddressPublicly),
                  }
                : hostPlace
                  ? { hostAtPlace: true }
                  : {}),
            }}
          />
        </div>
      </div>
    </main>
  )
}
