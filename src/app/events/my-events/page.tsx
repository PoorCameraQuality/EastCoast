import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import OrgLogoutButton from '@/components/auth/OrgLogoutButton'
import OrgMyEventsClient from '@/components/org/OrgMyEventsClient'
import { listManagedEvents } from '@/lib/eckeOrgEvents'
import { requireOrgSession } from '@/lib/eckeOrgAuth'

export const metadata: Metadata = {
  title: 'My events',
  robots: { index: false, follow: false },
}

export default async function MyEventsPage() {
  const session = await requireOrgSession()
  if (!session) redirect('/auth/org/login')
  const events = await listManagedEvents(session.organization.id)

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-sf-muted">My events</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-sf-strong">{session.organization.name}</h1>
            <p className="mt-2 text-sm text-sf-muted">Manage your events, posts, updates, and event information.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <EckeLink href="/events/create" className="sf-btn-primary min-h-11 px-4">
              + Create event
            </EckeLink>
            <OrgLogoutButton />
          </div>
        </div>
        <div className="mt-8">
          <OrgMyEventsClient events={events} />
        </div>
      </div>
    </main>
  )
}
