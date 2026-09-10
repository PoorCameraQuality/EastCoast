import type { Metadata } from 'next'
import EckeLink from '@/components/EckeLink'
import OrgManageNav from '@/components/org/OrgManageNav'
import OrgEventPostForm from '@/components/org/OrgEventPostForm'
import { listAllEventPosts } from '@/lib/eckeOrgEvents'
import { requireManagePage } from '@/lib/eckeOrgEventPages'

export const metadata: Metadata = { title: 'Event posts', robots: { index: false, follow: false } }

export default async function EventPostsPage({ params }: { params: { slug: string } }) {
  const { event } = await requireManagePage(params.slug, 'post')
  const posts = await listAllEventPosts(event.id)

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <EckeLink href="/events/my-events" className="text-sm text-sf-muted underline">
          ← My events
        </EckeLink>
        <h1 className="mt-4 text-3xl font-semibold text-sf-strong">Event updates</h1>
        <p className="mt-2 text-sm text-sf-muted">Posts appear on the public event page so the listing stays alive.</p>
        <div className="mt-6">
          <OrgManageNav slug={event.slug} current="posts" />
        </div>
        <div className="mt-8">
          <OrgEventPostForm slug={event.slug} />
        </div>
        <ul className="mt-10 space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="rounded-xl border border-white/10 p-4">
              <p className="text-sm text-sf-muted">
                {post.status} · {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'unpublished'}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-sf-strong">{post.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-sf-body">{post.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
