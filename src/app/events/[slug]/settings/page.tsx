import type { Metadata } from 'next'
import EckeLink from '@/components/EckeLink'
import OrgEventSettings from '@/components/org/OrgEventSettings'
import OrgManageNav from '@/components/org/OrgManageNav'
import { requireManagePage } from '@/lib/eckeOrgEventPages'

export const metadata: Metadata = { title: 'Event settings', robots: { index: false, follow: false } }

export default async function EventSettingsPage({ params }: { params: { slug: string } }) {
  const { event } = await requireManagePage(params.slug, 'settings')

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">Settings</h1>
        <div className="mt-6">
          <OrgManageNav slug={event.slug} current="settings" />
        </div>
        <div className="mt-8">
          <OrgEventSettings
            slug={event.slug}
            status={event.status || 'draft'}
            applications={{
              staffApplicationUrl: event.staff_application_url || '',
              vendorApplicationUrl: event.vendor_application_url || '',
              presenterApplicationUrl: event.presenter_application_url || '',
              photographerApplicationUrl: event.photographer_application_url || '',
              staffApplicationsOpen: Boolean(event.staff_applications_open),
              vendorApplicationsOpen: Boolean(event.vendor_applications_open),
              presenterApplicationsOpen: Boolean(event.presenter_applications_open),
              photographerApplicationsOpen: Boolean(event.photographer_applications_open),
            }}
          />
        </div>
      </div>
    </main>
  )
}
