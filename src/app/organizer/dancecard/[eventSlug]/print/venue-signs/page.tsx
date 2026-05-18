'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { OrganizerLocationDto } from '@/lib/dancecard/organizerLocationDto'

export default function PrintVenueSignsPage() {
  const params = useParams()
  const slug = String(params?.eventSlug ?? '').toLowerCase()
  const [title, setTitle] = useState('')
  const [locations, setLocations] = useState<OrganizerLocationDto[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!slug) return
    setErr(null)
    try {
      const res = await organizerDancecardFetch<{ locations: OrganizerLocationDto[] }>(slug, '/locations')
      setLocations(res.locations ?? [])
      const ev = await organizerDancecardFetch<{ event: { eventTitle: string } }>(slug, '/event').catch(() => null)
      if (ev?.event?.eventTitle) setTitle(ev.event.eventTitle)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
    }
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="min-h-screen bg-white p-6 text-black print:p-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sign-card { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
      {err ? <p className="text-red-700">{err}</p> : null}
      <div className="no-print mb-4 flex gap-2">
        <button type="button" className="rounded border border-slate-400 px-3 py-1 text-sm" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
      </div>
      <h1 className="font-serif text-2xl">{title || slug}</h1>
      <p className="text-sm text-slate-600">Venue / room signs</p>
      <div className="mt-8 grid gap-8">
        {locations.map((l) => (
          <section key={l.id} className="sign-card rounded-lg border-2 border-black p-6">
            <h2 className="text-center font-serif text-3xl">{l.name}</h2>
            {l.shortName ? <p className="mt-2 text-center text-lg text-slate-700">{l.shortName}</p> : null}
            {l.directionsPublic ? (
              <div className="mt-4 text-sm">
                <p className="font-semibold">Directions</p>
                <p className="whitespace-pre-wrap">{l.directionsPublic}</p>
              </div>
            ) : null}
            {l.accessibilityNotes ? (
              <div className="mt-4 text-sm">
                <p className="font-semibold">Accessibility</p>
                <p className="whitespace-pre-wrap">{l.accessibilityNotes}</p>
              </div>
            ) : null}
          </section>
        ))}
      </div>
      {!locations.length && !err ? <p className="mt-8 text-slate-500">No locations configured.</p> : null}
    </div>
  )
}
