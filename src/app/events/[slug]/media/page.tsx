import type { Metadata } from 'next'
import EckeLink from '@/components/EckeLink'
import OrgEventMediaManager from '@/components/org/OrgEventMediaManager'
import OrgManageNav from '@/components/org/OrgManageNav'
import { requireManagePage } from '@/lib/eckeOrgEventPages'

export const metadata: Metadata = { title: 'Event media', robots: { index: false, follow: false } }

export default async function EventMediaPage({ params }: { params: { slug: string } }) {
  const { event } = await requireManagePage(params.slug, 'media')

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">Media</h1>
        <p className="mt-2 text-sm text-sf-muted">
          Upload a hero, logo, gallery, optional program, and optional map. Size notes are next to each field.
        </p>
        <div className="mt-6">
          <OrgManageNav slug={event.slug} current="media" />
        </div>
        <div className="mt-8">
          <OrgEventMediaManager
            slug={event.slug}
            heroImage={event.hero_image}
            logo={event.logo}
            gallery={event.images}
            programUrl={event.program_url}
            mapUrl={event.map_url}
          />
        </div>
      </div>
    </main>
  )
}
