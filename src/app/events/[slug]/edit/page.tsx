import type { Metadata } from 'next'
import EckeLink from '@/components/EckeLink'
import OrgEventForm from '@/components/org/OrgEventForm'
import OrgManageNav from '@/components/org/OrgManageNav'
import { managedToFormValues } from '@/lib/eckeOrgEvents'
import { toOrgEventHostPlace } from '@/lib/eckeOrgDungeonShared'
import { requireOwnedPlace } from '@/lib/eckeOrgDungeons'
import { requireManagePage } from '@/lib/eckeOrgEventPages'

export const metadata: Metadata = { title: 'Edit event', robots: { index: false, follow: false } }

export default async function EditEventPage({ params }: { params: { slug: string } }) {
  const { event } = await requireManagePage(params.slug, 'edit')
  const { place } = await requireOwnedPlace()
  const hostPlace = place ? toOrgEventHostPlace(place) : null

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">{event.title}</h1>
        <div className="mt-6">
          <OrgManageNav slug={event.slug} current="edit" />
        </div>
        <div className="mt-8">
          <OrgEventForm
            mode="edit"
            slug={event.slug}
            hostPlace={hostPlace}
            initial={managedToFormValues(event)}
            media={{
              heroImage: event.hero_image,
              logo: event.logo,
              gallery: event.images,
              programUrl: event.program_url,
              mapUrl: event.map_url,
            }}
          />
        </div>
      </div>
    </main>
  )
}
