'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { trackSelectItemEntity } from '@/lib/analyticsEntities'

export type HubEventRow = {
  slug: string
  name: string
  logo?: string
  date: { display: string }
}

export default function DungeonDiscoveryEventsStrip({ events }: { events: HubEventRow[] }) {
  if (events.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No upcoming events in this geographic slice right now. See{' '}
        <Link href="/events" className="text-primary-400 underline underline-offset-2">
          all events
        </Link>{' '}
        or{' '}
        <Link href="/bdsm-events" className="text-primary-400 underline underline-offset-2">
          discovery hubs
        </Link>
        .
      </p>
    )
  }

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {events.map((e) => (
        <li key={e.slug}>
          <EventRow event={e} />
        </li>
      ))}
    </ul>
  )
}

function EventRow({ event }: { event: HubEventRow }) {
  const [err, setErr] = useState(false)
  const src = err || !event.logo ? '/images/placeholder-logo.svg' : event.logo

  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-primary-400/30 transition-colors min-h-touch"
      onClick={() =>
        trackSelectItemEntity({
          entityType: 'event',
          slug: event.slug,
          name: event.name,
          itemListName: 'dungeon_discovery_events_strip',
        })
      }
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white/5">
        <Image
          src={src}
          alt={`${event.name} logo`}
          width={48}
          height={48}
          className="object-contain"
          onError={() => setErr(true)}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white truncate">{event.name}</p>
        <p className="text-xs text-gray-400">{event.date.display}</p>
      </div>
    </Link>
  )
}
