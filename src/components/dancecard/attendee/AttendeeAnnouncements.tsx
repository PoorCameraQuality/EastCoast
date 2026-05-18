'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Panel } from '@/components/dancecard/ui/Panel'
import { cn } from '@/lib/cn'

export type Announcement = {
  id: string
  subject: string
  bodyText: string
  sentAt: string
}

const POLL_MS = 60_000

function formatSentAt(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

function AnnouncementCard({ item, defaultExpanded }: { item: Announcement; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const long = item.bodyText.length > 220 || item.bodyText.split('\n').length > 4

  return (
    <Panel className="overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        onClick={() => long && setExpanded((v) => !v)}
        aria-expanded={long ? expanded : undefined}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-dc-text">{item.subject}</p>
          <p className="mt-1 text-dc-micro text-dc-muted">{formatSentAt(item.sentAt)}</p>
        </div>
        {long ? (
          <span className="shrink-0 text-dc-micro font-semibold text-dc-accent">{expanded ? 'Less' : 'More'}</span>
        ) : null}
      </button>
      <p
        className={cn(
          'mt-2 whitespace-pre-wrap text-sm leading-relaxed text-dc-muted',
          long && !expanded && 'line-clamp-4',
        )}
      >
        {item.bodyText}
      </p>
    </Panel>
  )
}

export function AttendeeAnnouncements({
  eventSlug,
  className = '',
  variant = 'feed',
  poll = true,
}: {
  eventSlug: string
  className?: string
  variant?: 'feed' | 'compact' | 'inline'
  poll?: boolean
}) {
  const slug = eventSlug.toLowerCase()
  const [items, setItems] = useState<Announcement[]>([])
  const [loaded, setLoaded] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/announcements`, {
        cache: 'no-store',
      })
      const j = (await res.json()) as { announcements?: Announcement[] }
      if (res.ok) setItems(j.announcements ?? [])
    } catch {
      setItems([])
    } finally {
      setLoaded(true)
      setRefreshing(false)
    }
  }, [slug])

  useEffect(() => {
    void load(true)
  }, [load])

  useEffect(() => {
    if (!poll) return
    const id = window.setInterval(() => void load(true), POLL_MS)
    return () => window.clearInterval(id)
  }, [load, poll])

  if (!loaded) {
    return variant === 'inline' ? null : (
      <div className={cn('text-dc-micro text-dc-muted', className)}>Loading announcements…</div>
    )
  }

  if (!items.length) {
    if (variant === 'inline') return null
    return null
  }

  const latest = items[0]
  const rest = items.slice(1)

  if (variant === 'compact') {
    return (
      <Panel className={className}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-dc-micro font-semibold uppercase tracking-wide text-dc-accent">Event news</p>
          <Link href={`/dancecard/${slug}/news`} className="text-dc-micro font-semibold text-dc-accent hover:underline">
            View all
          </Link>
        </div>
        <p className="mt-1 text-sm font-semibold text-dc-text">{latest.subject}</p>
        <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-dc-muted">{latest.bodyText}</p>
        <p className="mt-1 text-dc-micro text-dc-muted">{formatSentAt(latest.sentAt)}</p>
        {rest.length ? (
          <p className="mt-2 text-dc-micro text-dc-muted">
            +{rest.length} earlier announcement{rest.length === 1 ? '' : 's'}
          </p>
        ) : null}
      </Panel>
    )
  }

  if (variant === 'inline') {
    return (
      <ul className={cn('space-y-2', className)}>
        {items.slice(0, 3).map((a) => (
          <li key={a.id} className="rounded-lg border border-dc-border bg-dc-surface-muted/50 px-3 py-2">
            <p className="text-xs font-semibold text-dc-text">{a.subject}</p>
            <p className="mt-0.5 line-clamp-2 text-dc-micro text-dc-muted">{a.bodyText}</p>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <section className={className} aria-label="Event announcements">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-dc-micro font-semibold uppercase tracking-[0.2em] text-dc-muted">Announcements</p>
          <p className="mt-0.5 text-dc-micro text-dc-muted">Updates from organizers — newest first</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dancecard/${slug}/news`}
            className="rounded-lg border border-dc-border px-2.5 py-1 text-dc-micro text-dc-muted hover:border-dc-accent-border hover:text-dc-accent"
          >
            All news
          </Link>
          <button
            type="button"
            className="rounded-lg border border-dc-border px-2.5 py-1 text-dc-micro text-dc-muted hover:border-dc-accent-border hover:text-dc-accent"
            disabled={refreshing}
            onClick={() => void load()}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((a, i) => (
          <li key={a.id}>
            <AnnouncementCard item={a} defaultExpanded={i === 0} />
          </li>
        ))}
      </ul>
    </section>
  )
}
