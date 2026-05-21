'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { AttendeeSubpageLoader } from '@/components/dancecard/attendee/AttendeeSubpageLoader'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { DancecardListSkeleton } from '@/components/dancecard/organizer/ui'
import { Panel } from '@/components/dancecard/ui/Panel'

type Exhibitor = {
  id: string
  name: string
  booth: string | null
  hours: string | null
  description: string | null
  tags: string[]
  specials: string | null
}

export default function ExhibitorsPage() {
  const params = useParams()
  const slug = String(params.eventSlug ?? '').toLowerCase()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<Exhibitor[]>([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    void (async () => {
      try {
        const gate = await dancecardFetch<{ eventTitle?: string }>(slug, '/gate').catch(() => ({ eventTitle: slug }))
        setTitle(gate.eventTitle ?? slug)
        const d = await dancecardFetch<{ exhibitors: Exhibitor[] }>(slug, '/exhibitors').catch(() => ({ exhibitors: [] }))
        setItems(d.exhibitors ?? [])
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  if (!slug) return null

  if (loading && !title) {
    return <AttendeeSubpageLoader eventSlug={slug} label="Loading exhibitors…" maxWidth="2xl" />
  }

  const filtered = items.filter((e) => {
    if (!q.trim()) return true
    const hay = `${e.name} ${e.booth ?? ''} ${(e.tags ?? []).join(' ')}`.toLowerCase()
    return hay.includes(q.toLowerCase())
  })

  return (
    <>
      <DancecardEventNav eventSlug={slug} eventTitle={title} />
      <main className="mx-auto max-w-2xl px-4 py-8 text-dc-text">
        <h1 className="font-serif text-2xl text-dc-text">Exhibitors</h1>
        <input
          className="mt-4 w-full rounded-lg border border-dc-border bg-dc-elevated px-3 py-2 text-sm"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {loading ? (
          <div className="mt-4">
            <DancecardListSkeleton rows={5} />
          </div>
        ) : (
        <ul className="mt-4 space-y-3 dc-tab-content-enter">
          {filtered.map((e) => (
            <li key={e.id}>
              <Panel className="p-4">
                <p className="font-semibold text-dc-text">{e.name}</p>
                {e.booth ? <p className="text-sm text-dc-muted">Booth {e.booth}</p> : null}
                {e.hours ? <p className="text-xs text-dc-subtle">{e.hours}</p> : null}
                {e.description ? <p className="mt-2 text-sm text-dc-text">{e.description}</p> : null}
                {e.specials ? <p className="mt-2 text-sm text-dc-accent">{e.specials}</p> : null}
              </Panel>
            </li>
          ))}
        </ul>
        )}
      </main>
    </>
  )
}
