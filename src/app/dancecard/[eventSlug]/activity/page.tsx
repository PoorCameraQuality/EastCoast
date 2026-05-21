'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { AttendeeSubpageLoader } from '@/components/dancecard/attendee/AttendeeSubpageLoader'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { DancecardListSkeleton } from '@/components/dancecard/organizer/ui'
import { Panel } from '@/components/dancecard/ui/Panel'

type ActivityItem = { id: string; kind: 'announcement' | 'iso'; title: string; body: string; at: string }

export default function ActivityPage() {
  const params = useParams()
  const slug = String(params.eventSlug ?? '').toLowerCase()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    void (async () => {
      try {
        const [ann, iso, gate] = await Promise.all([
          dancecardFetch<{ announcements: { id: string; subject: string; bodyText: string; sentAt: string }[] }>(
            slug,
            '/announcements',
          ).catch(() => ({ announcements: [] })),
          dancecardFetch<{ posts: { id: string; title: string; body: string; createdAt: string; curatedPin: boolean }[] }>(
            slug,
            '/iso',
          ).catch(() => ({ posts: [] })),
          dancecardFetch<{ eventTitle?: string }>(slug, '/gate').catch(() => ({})),
        ])
        setTitle((gate as { eventTitle?: string }).eventTitle ?? slug)
        const merged: ActivityItem[] = [
          ...(ann.announcements ?? []).map((a) => ({
            id: `ann-${a.id}`,
            kind: 'announcement' as const,
            title: a.subject,
            body: a.bodyText,
            at: a.sentAt,
          })),
          ...(iso.posts ?? [])
            .filter((p) => p.curatedPin)
            .map((p) => ({
              id: `iso-${p.id}`,
              kind: 'iso' as const,
              title: p.title,
              body: p.body,
              at: p.createdAt,
            })),
        ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
        setItems(merged)
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  if (!slug) return null

  if (loading && !title) {
    return <AttendeeSubpageLoader eventSlug={slug} label="Loading activity…" maxWidth="2xl" />
  }

  return (
    <>
      <DancecardEventNav eventSlug={slug} eventTitle={title} showNews={false} />
      <main className="mx-auto max-w-2xl px-4 py-8 text-dc-text">
        <h1 className="font-serif text-2xl text-dc-text">Activity</h1>
        <p className="mt-1 text-sm text-dc-muted">Organizer updates and pinned ISO posts.</p>
        {loading ? (
          <div className="mt-6">
            <DancecardListSkeleton rows={4} />
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Panel className="p-4">
                  <p className="text-dc-micro uppercase text-dc-muted">{item.kind}</p>
                  <p className="mt-1 font-semibold text-dc-text">{item.title}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-dc-subtle">{item.body}</p>
                  <p className="mt-2 text-dc-micro text-dc-muted">{new Date(item.at).toLocaleString()}</p>
                </Panel>
              </li>
            ))}
          </ul>
        )}
        {!loading && !items.length ? <p className="mt-6 text-dc-muted">No activity yet.</p> : null}
      </main>
    </>
  )
}
