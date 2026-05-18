'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { formatInTimeZone } from 'date-fns-tz'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { ProgramSlotRow } from '@/lib/dancecard/organizerProgramSlotDto'

export default function PrintSchedulePage() {
  const params = useParams()
  const slug = String(params?.eventSlug ?? '').toLowerCase()
  const [timezone, setTimezone] = useState('America/New_York')
  const [title, setTitle] = useState('')
  const [slots, setSlots] = useState<ProgramSlotRow[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!slug) return
    setErr(null)
    try {
      const res = await organizerDancecardFetch<{
        slots: ProgramSlotRow[]
        timezone: string
        event?: { eventTitle?: string }
      }>(slug, '/program-slots')
      setSlots(res.slots ?? [])
      setTimezone(res.timezone)
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
        }
      `}</style>
      {err ? <p className="text-red-700">{err}</p> : null}
      <div className="no-print mb-4 flex gap-2">
        <button type="button" className="rounded border border-slate-400 px-3 py-1 text-sm" onClick={() => window.print()}>
          Print / Save as PDF
        </button>
        <button type="button" className="rounded border border-slate-400 px-3 py-1 text-sm" onClick={() => window.close()}>
          Close
        </button>
      </div>
      <h1 className="font-serif text-2xl">{title || slug}</h1>
      <p className="text-sm text-slate-600">Schedule export · {timezone}</p>
      <table className="mt-6 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 pr-2">When</th>
            <th className="py-2 pr-2">Session</th>
            <th className="py-2 pr-2">Track</th>
            <th className="py-2 pr-2">Room / location</th>
            <th className="py-2 pr-2">Published</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id} className="border-b border-slate-300">
              <td className="py-1.5 pr-2 align-top whitespace-nowrap text-xs">
                {s.startsAt && s.endsAt
                  ? `${formatInTimeZone(new Date(s.startsAt), timezone, 'EEE MMM d ha')} – ${formatInTimeZone(new Date(s.endsAt), timezone, 'ha')}`
                  : '—'}
              </td>
              <td className="py-1.5 pr-2 align-top font-medium">{s.title}</td>
              <td className="py-1.5 pr-2 align-top text-xs">{s.trackName ?? s.track ?? '—'}</td>
              <td className="py-1.5 pr-2 align-top text-xs">{s.locationName ?? s.room ?? '—'}</td>
              <td className="py-1.5 pr-2 align-top text-xs">{s.isPublished ? 'yes' : 'no'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!slots.length && !err ? <p className="mt-8 text-slate-500">No sessions.</p> : null}
    </div>
  )
}
