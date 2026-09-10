import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import OrgPlaceForm from '@/components/org/OrgPlaceForm'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { requireOwnedPlace } from '@/lib/eckeOrgDungeons'
import { managedPlaceToFormValues } from '@/lib/eckeOrgDungeonShared'

export const metadata: Metadata = {
  title: 'My dungeon / club',
  robots: { index: false, follow: false },
}

export default async function MyPlacePage() {
  const session = await requireOrgSession()
  if (!session) redirect('/auth/org/login')

  const gated = await requireOwnedPlace()
  const place = gated.place

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/dashboard" className="text-sm text-sf-muted underline">
          ← Dashboard
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">
          {place ? 'My dungeon / club' : 'Create a dungeon or club'}
        </h1>
        <p className="mt-2 text-sm text-sf-muted">
          One permanent location in the public catalog. Use events for nights, munches, and conventions.
        </p>
        {place ? (
          <p className="mt-3 text-sm text-sf-body">
            Public page:{' '}
            <EckeLink href={`/dungeons/${place.slug}`} className="underline">
              eastcoastkinkevents.com/dungeons/{place.slug}
            </EckeLink>
            {place.status === 'draft' ? ' · Draft' : ' · Published'}
          </p>
        ) : null}
        {place ? (
          <p className="mt-3">
            <EckeLink href="/events/create?at=place" className="sf-btn-primary inline-flex min-h-11 px-4">
              Add a night at this location
            </EckeLink>
          </p>
        ) : null}

        <div className="mt-8">
          <OrgPlaceForm
            mode={place ? 'edit' : 'create'}
            initial={
              place
                ? managedPlaceToFormValues(place)
                : { status: 'published', contactEmail: session.organization.email }
            }
            media={
              place
                ? {
                    heroImage: place.cover_url,
                    logo: place.logo_url,
                    gallery: place.gallery_urls || [],
                  }
                : undefined
            }
          />
        </div>
      </div>
    </main>
  )
}
