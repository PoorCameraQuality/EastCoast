'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { AttendeeSubpageLoader } from '@/components/dancecard/attendee/AttendeeSubpageLoader'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { MapZoneOverlay } from '@/components/dancecard/venue/MapZoneOverlay'
import { VenueMapViewport } from '@/components/dancecard/venue/VenueMapViewport'
import { Panel } from '@/components/dancecard/ui/Panel'
import { mapPinDisplayName } from '@/lib/dancecard/mapPinLabels'
import type { MapZonePin } from '@/lib/dancecard/mapPinZones'
import { cn } from '@/lib/cn'

type MapData = {
  id: string
  title: string
  imageUrl: string | null
  pins: MapZonePin[]
  locationNames?: Record<string, string>
}

function MapImage({
  src,
  alt,
  onReady,
}: {
  src: string
  alt: string
  onReady: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [src])

  return (
    <div className="relative">
      {!loaded ? (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl bg-dc-surface-muted"
          aria-hidden
        >
          <span className="inline-block h-8 w-8 rounded-full border-2 border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none" />
        </div>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn('block w-full transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
        decoding="async"
        fetchPriority="high"
        onLoad={() => {
          setLoaded(true)
          onReady()
        }}
      />
    </div>
  )
}

function DancecardVenueMapInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = String(params?.eventSlug ?? '').toLowerCase()
  const focusLocationId = searchParams.get('locationId')?.trim() ?? null

  const [loading, setLoading] = useState(true)
  const [eventTitle, setEventTitle] = useState<string | null>(null)
  const [maps, setMaps] = useState<MapData[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [activePin, setActivePin] = useState<MapZonePin | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/venue-map`, {
          cache: 'force-cache',
        })
        const j = (await res.json()) as { maps?: MapData[]; eventTitle?: string; error?: string }
        if (!res.ok) {
          if (!cancelled) setErr(j.error ?? 'Could not load map')
          return
        }
        const list = j.maps ?? []
        if (!cancelled) {
          setEventTitle(j.eventTitle ?? null)
          setMaps(list)
          setActiveId((prev) => {
            if (prev && list.some((m) => m.id === prev)) return prev
            return list[0]?.id ?? null
          })
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const m = useMemo(() => maps.find((x) => x.id === activeId) ?? maps[0], [maps, activeId])
  const focusPin = useMemo(
    () => (focusLocationId ? m?.pins.find((p) => p.locationId === focusLocationId) : null),
    [focusLocationId, m?.pins],
  )

  useEffect(() => {
    if (focusPin) setActivePin(focusPin)
  }, [focusPin])

  if (loading) {
    return <AttendeeSubpageLoader eventSlug={slug} label="Loading venue map…" maxWidth="4xl" />
  }

  const navTitle = m?.title ?? eventTitle

  return (
    <>
      <DancecardEventNav eventSlug={slug} eventTitle={navTitle} />
      <div className="mx-auto max-w-4xl px-4 py-8 text-dc-text">
        <p className="text-dc-micro uppercase tracking-[0.25em] text-dc-muted">Venue map</p>
        <h1 className="mt-2 font-serif text-3xl text-dc-text">{m?.title ?? 'Map'}</h1>
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <Link href={`/dancecard/${slug}`} className="text-dc-accent hover:underline">
            ← Back to dancecard
          </Link>
          <Link href={`/dancecard/${slug}/policies`} className="text-dc-muted hover:text-dc-accent hover:underline">
            Published policies
          </Link>
        </div>
        {maps.length > 1 ? (
          <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Venue maps">
            {maps.map((map) => (
              <button
                key={map.id}
                type="button"
                role="tab"
                aria-selected={m?.id === map.id}
                className={
                  m?.id === map.id
                    ? 'dc-hallway-target rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-dc-micro font-semibold text-dc-accent'
                    : 'dc-hallway-target rounded-full border border-dc-border bg-dc-surface-muted px-3 py-1.5 text-dc-micro text-dc-muted hover:border-dc-border-strong'
                }
                onClick={() => setActiveId(map.id)}
              >
                {map.title || 'Map'}
              </button>
            ))}
          </div>
        ) : null}
        {focusLocationId ? (
          <p className="mt-2 text-sm text-dc-muted">
            Showing:{' '}
            <span className="font-semibold text-dc-text">
              {focusPin
                ? mapPinDisplayName(focusPin, m?.locationNames ?? {})
                : activePin
                  ? mapPinDisplayName(activePin, m?.locationNames ?? {})
                  : focusLocationId}
            </span>
          </p>
        ) : null}
        {err ? <p className="mt-4 text-sm text-dc-danger">{err}</p> : null}
        {!m?.imageUrl ? (
          <p className="mt-6 text-sm text-dc-muted">No published map yet for this event.</p>
        ) : (
          <VenueMapViewport zoom={zoom} onZoomChange={setZoom} className="mt-6">
            <div className="relative">
              <MapImage src={m.imageUrl} alt={m.title || 'Venue map'} onReady={() => {}} />
              {m.pins.map((p) => {
                const focused = focusLocationId === p.locationId || activePin?.locationId === p.locationId
                const locationNames = m.locationNames ?? {}
                const name = mapPinDisplayName(p, locationNames)
                return (
                  <MapZoneOverlay
                    key={`${p.locationId}-${p.x}-${p.y}`}
                    pin={p}
                    displayName={name}
                    variant="view"
                    focused={focused}
                    onClick={() => setActivePin(p)}
                  />
                )
              })}
            </div>
          </VenueMapViewport>
        )}
        {activePin ? (
          <Panel className="mt-4">
            <p className="text-sm font-semibold text-dc-text">
              {mapPinDisplayName(activePin, m?.locationNames ?? {})}
            </p>
            <Link
              href={`/dancecard/${slug}#program`}
              className="mt-2 inline-flex min-h-touch items-center text-sm text-dc-accent hover:underline"
            >
              View program
            </Link>
          </Panel>
        ) : null}
      </div>
    </>
  )
}

export default function DancecardVenueMapPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-dc-muted">Loading venue map…</div>
      }
    >
      <DancecardVenueMapInner />
    </Suspense>
  )
}
