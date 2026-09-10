import type { Metadata } from 'next'
import EckeLink from '@/components/EckeLink'
import OrgManageNav from '@/components/org/OrgManageNav'
import OrgManageQuickActions from '@/components/org/OrgManageQuickActions'
import { listAllEventPosts, listEventAudit, publicEventLifecycle } from '@/lib/eckeOrgEvents'
import { manageHeader, requireManagePage } from '@/lib/eckeOrgEventPages'

export const metadata: Metadata = { title: 'Manage event', robots: { index: false, follow: false } }

export default async function ManageEventPage({ params }: { params: { slug: string } }) {
  const { event } = await requireManagePage(params.slug, 'view')
  const header = manageHeader(event)
  const audit = await listEventAudit(event.id)
  const posts = await listAllEventPosts(event.id)
  const life = publicEventLifecycle(event)

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">{event.title}</h1>
        <p className="mt-2 text-sm text-sf-muted">
          {header.life} · {header.date} · {header.where}
        </p>
        <div className="mt-6">
          <OrgManageNav slug={event.slug} current="manage" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-wider text-sf-muted">Event status</p>
            <p className="mt-2 capitalize text-sf-strong">{life}</p>
            <EckeLink href={`/events/${event.slug}`} className="mt-3 inline-block text-sm underline">
              View event →
            </EckeLink>
          </div>
          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-xs uppercase tracking-wider text-sf-muted">Event activity</p>
            <ul className="mt-2 space-y-1 text-sm text-sf-body">
              <li>{event.views || 0} views</li>
              <li>{posts.length} posts</li>
            </ul>
          </div>
        </div>

        <OrgManageQuickActions slug={event.slug} status={event.status || 'draft'} />

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-sf-strong">Recent activity</h2>
          <ul className="mt-3 space-y-2 text-sm text-sf-body">
            {audit.length === 0 ? <li className="text-sf-muted">No activity yet.</li> : null}
            {audit.map((row) => (
              <li key={row.id}>
                {row.summary}
                <span className="ml-2 text-sf-muted">{new Date(row.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}
