'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AttendeeAnnouncements } from '@/components/dancecard/attendee/AttendeeAnnouncements'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { Panel } from '@/components/dancecard/ui/Panel'

export default function DancecardNewsPage() {
  const params = useParams()
  const slug = String(params?.eventSlug ?? '').toLowerCase()
  const [title, setTitle] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/schedule`)
        const j = (await res.json()) as { meta?: { eventTitle?: string } }
        if (!cancelled && res.ok) setTitle(j.meta?.eventTitle ?? null)
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <>
      <DancecardEventNav eventSlug={slug} eventTitle={title} />
      <div className="mx-auto max-w-2xl px-4 py-8 text-dc-text">
        <p className="text-dc-micro uppercase tracking-[0.25em] text-dc-muted">Event news</p>
        <h1 className="mt-2 font-serif text-3xl text-dc-text">Announcements</h1>
        <p className="mt-3 text-sm leading-relaxed text-dc-muted">
          Updates from organizers appear here when they publish an announcement from Communications.
        </p>
        <Link href={`/dancecard/${slug}`} className="mt-3 inline-block text-sm text-dc-accent hover:underline">
          ← Back to dancecard
        </Link>
        <div className="mt-6">
          <AttendeeAnnouncements eventSlug={slug} variant="feed" poll />
        </div>
        <Panel variant="muted" className="mt-6 text-sm text-dc-muted">
          The same feed appears at the top of your dancecard after you sign in. Email delivery is separate and optional.
        </Panel>
      </div>
    </>
  )
}
