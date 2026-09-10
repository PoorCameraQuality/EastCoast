'use client'

import { useMemo, useState } from 'react'
import EckeLink from '@/components/EckeLink'
import { publicEventLifecycle, type ManagedEventRow } from '@/lib/eckeOrgEventShared'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past events' },
  { id: 'archived', label: 'Archived' },
] as const

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function OrgMyEventsClient({ events }: { events: ManagedEventRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((event) => {
      const life = publicEventLifecycle(event)
      if (filter === 'published' && life !== 'published') return false
      if (filter === 'draft' && life !== 'draft') return false
      if (filter === 'upcoming' && life !== 'published') return false
      if (filter === 'past' && life !== 'past') return false
      if (filter === 'archived' && life !== 'archived') return false
      if (!q) return true
      return `${event.title} ${event.city} ${event.state}`.toLowerCase().includes(q)
    })
  }, [events, filter, query])

  async function duplicate(slug: string) {
    setBusy(slug)
    const response = await fetch(`/api/org/events/${slug}/duplicate`, { method: 'POST' })
    const data = (await response.json()) as { slug?: string; error?: string }
    if (response.ok && data.slug) window.location.assign(`/events/${data.slug}/manage`)
    else setBusy(null)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === item.id ? 'bg-white/15 text-sf-strong' : 'text-sf-muted hover:text-sf-strong'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <input
        className="mt-4 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong"
        placeholder="Search your events..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-sf-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Activity</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-sf-muted" colSpan={6}>
                  No events in this view yet.
                </td>
              </tr>
            ) : (
              visible.map((event) => {
                const life = publicEventLifecycle(event)
                return (
                  <tr key={event.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-sf-strong">{event.title}</td>
                    <td className="px-4 py-3 text-sf-body">{formatDate(event.start_date)}</td>
                    <td className="px-4 py-3 text-sf-body">
                      {event.is_online ? 'Online' : `${event.city}, ${event.state}`}
                    </td>
                    <td className="px-4 py-3 capitalize text-sf-body">{life}</td>
                    <td className="px-4 py-3 text-sf-body">{event.post_count || 0} updates</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <EckeLink href={`/events/${event.slug}`} className="underline">
                          View
                        </EckeLink>
                        <EckeLink href={`/events/${event.slug}/edit`} className="underline">
                          Edit
                        </EckeLink>
                        <button type="button" className="underline" disabled={busy === event.slug} onClick={() => duplicate(event.slug)}>
                          Duplicate
                        </button>
                        <EckeLink href={`/events/${event.slug}/posts`} className="underline">
                          Posts
                        </EckeLink>
                        <EckeLink href={`/events/${event.slug}/settings`} className="underline">
                          Settings
                        </EckeLink>
                        <EckeLink href={`/events/${event.slug}/manage`} className="underline">
                          Manage
                        </EckeLink>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
