'use client'

import { useCallback, useRef, useState } from 'react'
import { MapZoneOverlay } from '@/components/dancecard/venue/MapZoneOverlay'
import { VenueMapViewport } from '@/components/dancecard/venue/VenueMapViewport'
import { mapPinDisplayName } from '@/lib/dancecard/mapPinLabels'
import { normalizeMapZonePin, type MapZonePin } from '@/lib/dancecard/mapPinZones'

export type VenueMapPin = MapZonePin

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

/** Only show zones that have been placed away from the default center (or are being edited). */
function pinIsPlaced(pin: MapZonePin, editingLocationId: string | null) {
  if (editingLocationId === pin.locationId) return true
  return pin.x !== 0.5 || pin.y !== 0.5
}

export function VenueMapCanvas({
  imageUrl,
  alt,
  pins,
  locationNames,
  readOnly = false,
  mode,
  dropHighlightLocationId = null,
  onDropOnLocation,
  onPinMove,
  editingLocationId = null,
  onMapClickPlace,
  showZoom = true,
}: {
  imageUrl: string
  alt: string
  pins: VenueMapPin[]
  locationNames: Record<string, string>
  readOnly?: boolean
  mode: 'drop' | 'edit'
  dropHighlightLocationId?: string | null
  onDropOnLocation?: (locationId: string, slotId: string) => void
  onPinMove?: (locationId: string, x: number, y: number) => void
  editingLocationId?: string | null
  onMapClickPlace?: (locationId: string, x: number, y: number) => void
  showZoom?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragOverLoc, setDragOverLoc] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  const coordsFromClient = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return null
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    }
  }, [])

  function handleMapClick(e: React.MouseEvent) {
    if (mode !== 'edit' || readOnly || !editingLocationId || !onMapClickPlace) return
    if ((e.target as HTMLElement).closest('[data-map-zone]')) return
    const c = coordsFromClient(e.clientX, e.clientY)
    if (!c) return
    onMapClickPlace(editingLocationId, c.x, c.y)
  }

  const visiblePins = pins.filter((p) => pinIsPlaced(p, editingLocationId))

  const mapInner = (
    <div
      ref={containerRef}
      className="relative overflow-visible"
      onClick={handleMapClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={alt} className="block w-full select-none" draggable={false} />
      {visiblePins.map((raw) => {
        const pin = normalizeMapZonePin(raw)
        const name = mapPinDisplayName(pin, locationNames)
        const isDrop = mode === 'drop'
        const highlighted =
          isDrop && (dragOverLoc === pin.locationId || dropHighlightLocationId === pin.locationId)
        const focused = editingLocationId === pin.locationId

        if (isDrop) {
          return (
            <MapZoneOverlay
              key={pin.locationId}
              pin={pin}
              displayName={name}
              variant="drop"
              focused={focused}
              highlighted={highlighted}
              className={readOnly ? 'pointer-events-none opacity-60' : undefined}
              data-map-zone
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                setDragOverLoc(pin.locationId)
              }}
              onDragLeave={() => setDragOverLoc((id) => (id === pin.locationId ? null : id))}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverLoc(null)
                const sid = e.dataTransfer.getData('text/slot-id')
                if (!sid || readOnly) return
                onDropOnLocation?.(pin.locationId, sid)
              }}
            />
          )
        }

        return (
          <div key={pin.locationId} data-map-zone>
            <MapZoneOverlay
              pin={pin}
              displayName={name}
              variant="edit"
              focused={focused}
              className={readOnly ? 'cursor-default opacity-70' : undefined}
              onPointerDown={(e) => {
                if (readOnly) return
                e.preventDefault()
                e.stopPropagation()
                const target = e.currentTarget
                target.setPointerCapture(e.pointerId)
                const onMove = (ev: PointerEvent) => {
                  const c = coordsFromClient(ev.clientX, ev.clientY)
                  if (c) onPinMove?.(pin.locationId, c.x, c.y)
                }
                const onUp = (ev: PointerEvent) => {
                  target.releasePointerCapture(ev.pointerId)
                  window.removeEventListener('pointermove', onMove)
                  window.removeEventListener('pointerup', onUp)
                }
                window.addEventListener('pointermove', onMove)
                window.addEventListener('pointerup', onUp)
              }}
            />
          </div>
        )
      })}
    </div>
  )

  if (!showZoom) {
    return (
      <div className="overflow-hidden rounded-xl border border-dc-border bg-dc-surface-muted">
        {mapInner}
      </div>
    )
  }

  return <VenueMapViewport zoom={zoom} onZoomChange={setZoom} className="min-w-0">{mapInner}</VenueMapViewport>
}
