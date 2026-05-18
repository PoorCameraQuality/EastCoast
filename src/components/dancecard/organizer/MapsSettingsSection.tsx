'use client'

import { useCallback, useEffect, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import type { OrganizerLocationDto } from '@/lib/dancecard/organizerLocationDto'
import { useConfirmDialog } from '@/components/dancecard/organizer/ui'
import { VenueMapCanvas } from '@/components/dancecard/organizer/venue/VenueMapCanvas'
import {
  defaultZoneSizeForShape,
  MAP_ZONE_SHAPES,
  mapZoneShapeLabel,
  type MapZoneShape,
} from '@/lib/dancecard/mapPinZones'

type MapRow = {
  id: string
  title: string
  imagePath: string
  imageUrl: string | null
  sortOrder: number
}

export function MapsSettingsSection({ eventSlug, canEdit }: { eventSlug: string; canEdit: boolean }) {
  const [maps, setMaps] = useState<MapRow[]>([])
  const [locations, setLocations] = useState<OrganizerLocationDto[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null)
  type PinDraftEntry = {
    x: string
    y: string
    label: string
    shape: MapZoneShape
    width: string
    height: string
    rotation: string
  }

  function emptyPinDraft(partial?: Partial<PinDraftEntry>): PinDraftEntry {
    const shape = partial?.shape ?? 'circle'
    const size = defaultZoneSizeForShape(shape)
    return {
      x: '0.5',
      y: '0.5',
      label: '',
      shape,
      width: String(size.width),
      height: String(size.height),
      rotation: '0',
      ...partial,
    }
  }

  const [pinDraft, setPinDraft] = useState<Record<string, PinDraftEntry>>({})
  const [editingLocId, setEditingLocId] = useState<string | null>(null)
  const [pinSaving, setPinSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pinSaveFeedback, setPinSaveFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(
    null,
  )
  const { ask, dialog } = useConfirmDialog()

  const locationNames = Object.fromEntries(locations.map((l) => [l.id, l.name]))
  const selectedMap = maps.find((m) => m.id === selectedMapId) ?? null

  const pinsForCanvas = locations.map((loc) => {
    const d = pinDraft[loc.id] ?? emptyPinDraft()
    return {
      locationId: loc.id,
      x: Number(d.x) || 0.5,
      y: Number(d.y) || 0.5,
      label: d.label.trim() || null,
      shape: d.shape,
      width: Number(d.width) || defaultZoneSizeForShape(d.shape).width,
      height: Number(d.height) || defaultZoneSizeForShape(d.shape).height,
      rotation: Number(d.rotation) || 0,
    }
  })

  const load = useCallback(async () => {
    setMsg(null)
    try {
      const [m, loc] = await Promise.all([
        organizerDancecardFetch<{ maps: MapRow[]; needsMigration?: boolean }>(eventSlug, '/maps'),
        organizerDancecardFetch<{ locations: OrganizerLocationDto[] }>(eventSlug, '/locations'),
      ])
      if (m.needsMigration) {
        setMsg('Maps require migration dancecard_014_venue_maps_pins.sql.')
      }
      setMaps(m.maps ?? [])
      setLocations(loc.locations ?? [])
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not load maps')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  async function uploadFile(file: File) {
    if (!canEdit) return
    setMsg(null)
    const fd = new FormData()
    fd.set('file', file)
    const res = await fetch(`/api/organizer/dancecard/${encodeURIComponent(eventSlug)}/maps/upload`, {
      method: 'POST',
      body: fd,
      credentials: 'include',
    })
    const j = (await res.json()) as { path?: string; error?: string }
    if (!res.ok) {
      setMsg(j.error ?? 'Upload failed')
      return undefined
    }
    return j.path
  }

  async function onPickMapFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !canEdit) return
    setUploading(true)
    setMsg(null)
    try {
      const path = await uploadFile(file)
      if (!path) return
      await organizerDancecardFetch(eventSlug, '/maps', {
        method: 'POST',
        body: JSON.stringify({ title: file.name, imagePath: path }),
      })
      setMsg(`Uploaded ${file.name}. Click Edit pins to place rooms on the map.`)
      await load()
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save map failed')
    } finally {
      setUploading(false)
    }
  }

  async function loadPins(mapId: string) {
    try {
      const locRes = await organizerDancecardFetch<{ locations: OrganizerLocationDto[] }>(eventSlug, '/locations')
      const locs = locRes.locations ?? []
      setLocations(locs)
      const res = await organizerDancecardFetch<{
        pins: {
          locationId: string
          x: number
          y: number
          label: string | null
          shape?: MapZoneShape
          width?: number
          height?: number
          rotation?: number
        }[]
      }>(eventSlug, `/maps/${mapId}/pins`)
      const draft: Record<string, PinDraftEntry> = {}
      for (const loc of locs) {
        const hit = (res.pins ?? []).find((p) => p.locationId === loc.id)
        draft[loc.id] = hit
          ? emptyPinDraft({
              x: String(hit.x),
              y: String(hit.y),
              label: hit.label ?? '',
              shape: hit.shape ?? 'circle',
              width: String(hit.width ?? defaultZoneSizeForShape(hit.shape ?? 'circle').width),
              height: String(hit.height ?? defaultZoneSizeForShape(hit.shape ?? 'circle').height),
              rotation: String(hit.rotation ?? 0),
            })
          : emptyPinDraft()
      }
      setPinDraft(draft)
      setSelectedMapId(mapId)
      setEditingLocId(locs[0]?.id ?? null)
      setPinSaveFeedback(null)
    } catch {
      setMsg('Could not load pins')
    }
  }

  function clearPinSaveFeedback() {
    setPinSaveFeedback(null)
  }

  async function savePins(mapId: string) {
    if (!canEdit || pinSaving) return
    const pins = locations
      .map((loc) => {
        const d = pinDraft[loc.id] ?? emptyPinDraft()
        const x = Math.max(0, Math.min(1, Number(d.x) || 0))
        const y = Math.max(0, Math.min(1, Number(d.y) || 0))
        return {
          locationId: loc.id,
          x,
          y,
          label: d.label.trim() || null,
          shape: d.shape,
          width: Math.max(0.04, Math.min(0.75, Number(d.width) || defaultZoneSizeForShape(d.shape).width)),
          height: Math.max(0.04, Math.min(0.75, Number(d.height) || defaultZoneSizeForShape(d.shape).height)),
          rotation: Math.max(-180, Math.min(180, Number(d.rotation) || 0)),
        }
      })
      .filter((p) => p.x !== 0.5 || p.y !== 0.5)
    setPinSaving(true)
    setPinSaveFeedback(null)
    try {
      const res = await organizerDancecardFetch<{ ok: boolean; count: number }>(eventSlug, `/maps/${mapId}/pins`, {
        method: 'PUT',
        body: JSON.stringify({ pins }),
      })
      await loadPins(mapId)
      const n = res.count ?? pins.length
      setPinSaveFeedback({
        kind: 'success',
        text: `Saved ${n} room pin${n === 1 ? '' : 's'}. They are live on Room availability and the attendee map.`,
      })
    } catch (e) {
      setPinSaveFeedback({
        kind: 'error',
        text: e instanceof Error ? e.message : 'Save pins failed',
      })
    } finally {
      setPinSaving(false)
    }
  }

  async function delMap(id: string) {
    if (!canEdit) return
    if (!(await ask({ title: 'Delete map?', message: 'Delete this map and its pins?', destructive: true }))) return
    try {
      await organizerDancecardFetch(eventSlug, `/maps/${id}`, { method: 'DELETE' })
      if (selectedMapId === id) setSelectedMapId(null)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      {dialog}
      <h3 className="font-serif text-lg text-white">Venue maps</h3>
      <p className="mt-1 text-xs text-slate-400">
        Upload a floor plan image (Supabase Storage bucket <code className="text-dc-accent">dancecard-maps</code>).
        Attendees: <code className="text-dc-accent">/dancecard/[slug]/map</code>
      </p>
      {msg ? <p className="mt-2 text-sm text-amber-200">{msg}</p> : null}
      <label className="mt-3 block text-sm text-slate-300">
        Upload map image
        <input
          type="file"
          accept="image/*"
          disabled={!canEdit || uploading}
          className="mt-1 block text-xs"
          onChange={(e) => void onPickMapFile(e)}
        />
        {uploading ? <span className="ml-2 text-xs text-dc-accent">Uploading…</span> : null}
      </label>
      <ul className="mt-4 space-y-2">
        {maps.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-2">
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.imageUrl} alt="" className="h-16 w-auto rounded border border-white/10" />
            ) : null}
            <span className="text-sm text-white">{m.title}</span>
            <button
              type="button"
              className="text-xs text-dc-accent hover:underline"
              onClick={() => void loadPins(m.id)}
            >
              Edit pins
            </button>
            <button type="button" className="text-xs text-rose-300 hover:underline" onClick={() => void delMap(m.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {selectedMapId ? (
        <div className="mt-6 border-t border-white/10 pt-4">
          <h4 className="text-sm font-semibold text-white">Place room zones</h4>
          <p className="mt-1 text-xs text-slate-500">
            Select a room, pick a shape, click the map to place (or drag the zone). Adjust width and height to fit
            barns, halls, and dungeons. Use rotation for angled rooms. Zoom in for detail. Requires migrations{' '}
            <code className="text-dc-accent">dancecard_035_map_pin_zone_shapes.sql</code> and{' '}
            <code className="text-dc-accent">dancecard_037_map_pin_rotation.sql</code>.
          </p>
          {selectedMap?.imageUrl ? (
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <VenueMapCanvas
                imageUrl={selectedMap.imageUrl}
                alt={selectedMap.title}
                pins={pinsForCanvas}
                locationNames={locationNames}
                readOnly={!canEdit}
                mode="edit"
                editingLocationId={editingLocId}
                onMapClickPlace={(locationId, x, y) => {
                  clearPinSaveFeedback()
                  setPinDraft((d) => ({
                    ...d,
                    [locationId]: {
                      ...(d[locationId] ?? emptyPinDraft()),
                      x: String(x),
                      y: String(y),
                    },
                  }))
                }}
                onPinMove={(locationId, x, y) => {
                  clearPinSaveFeedback()
                  setPinDraft((d) => ({
                    ...d,
                    [locationId]: {
                      ...(d[locationId] ?? emptyPinDraft()),
                      x: String(x),
                      y: String(y),
                    },
                  }))
                }}
              />
              <div className="max-h-80 space-y-2 overflow-y-auto text-xs">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`flex w-full flex-wrap items-center gap-2 rounded-lg border px-2 py-1.5 text-left ${
                      editingLocId === loc.id
                        ? 'border-dc-accent-border bg-dc-accent-muted'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                    onClick={() => setEditingLocId(loc.id)}
                  >
                    <span className="w-28 truncate font-medium text-slate-300">{loc.name}</span>
                    <span className="text-slate-600">
                      {pinDraft[loc.id]?.x ?? '0.5'}, {pinDraft[loc.id]?.y ?? '0.5'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Map image missing — re-upload the floor plan.</p>
          )}
          <div className="mt-4 max-h-40 space-y-2 overflow-y-auto text-xs">
            {locations.map((loc) => (
              <div key={loc.id} className="flex flex-wrap items-center gap-2">
                <span className="w-32 truncate text-slate-400">{loc.name}</span>
                <label className="text-slate-500">
                  x
                  <input
                    className="ml-1 w-14 rounded border border-white/10 bg-black/40 px-1 text-white"
                    value={pinDraft[loc.id]?.x ?? '0.5'}
                    disabled={!canEdit}
                    onChange={(e) => {
                      clearPinSaveFeedback()
                      setPinDraft((d) => ({
                        ...d,
                        [loc.id]: { ...(d[loc.id] ?? emptyPinDraft()), x: e.target.value },
                      }))
                    }}
                  />
                </label>
                <label className="text-slate-500">
                  y
                  <input
                    className="ml-1 w-14 rounded border border-white/10 bg-black/40 px-1 text-white"
                    value={pinDraft[loc.id]?.y ?? '0.5'}
                    disabled={!canEdit}
                    onChange={(e) => {
                      clearPinSaveFeedback()
                      setPinDraft((d) => ({
                        ...d,
                        [loc.id]: { ...(d[loc.id] ?? emptyPinDraft()), y: e.target.value },
                      }))
                    }}
                  />
                </label>
                <input
                  className="min-w-[120px] flex-1 rounded border border-white/10 bg-black/40 px-1 text-white"
                  placeholder="Map label (optional)"
                  value={pinDraft[loc.id]?.label ?? ''}
                  disabled={!canEdit}
                  onChange={(e) => {
                    clearPinSaveFeedback()
                    setPinDraft((d) => ({
                      ...d,
                      [loc.id]: { ...(d[loc.id] ?? emptyPinDraft()), label: e.target.value },
                    }))
                  }}
                />
                <select
                  className="rounded border border-white/10 bg-black/40 px-1 text-white"
                  value={pinDraft[loc.id]?.shape ?? 'circle'}
                  disabled={!canEdit}
                  onChange={(e) => {
                    const shape = e.target.value as MapZoneShape
                    const size = defaultZoneSizeForShape(shape)
                    clearPinSaveFeedback()
                    setPinDraft((d) => ({
                      ...d,
                      [loc.id]: {
                        ...(d[loc.id] ?? emptyPinDraft()),
                        shape,
                        width: String(size.width),
                        height: String(size.height),
                      },
                    }))
                  }}
                >
                  {MAP_ZONE_SHAPES.map((s) => (
                    <option key={s} value={s}>
                      {mapZoneShapeLabel(s)}
                    </option>
                  ))}
                </select>
                <label className="text-slate-500">
                  w
                  <input
                    type="number"
                    min={4}
                    max={75}
                    step={1}
                    className="ml-1 w-12 rounded border border-white/10 bg-black/40 px-1 text-white"
                    value={Math.round((Number(pinDraft[loc.id]?.width) || 0.12) * 100)}
                    disabled={!canEdit}
                    onChange={(e) => {
                      clearPinSaveFeedback()
                      setPinDraft((d) => ({
                        ...d,
                        [loc.id]: {
                          ...(d[loc.id] ?? emptyPinDraft()),
                          width: String(Math.max(0.04, Math.min(0.75, Number(e.target.value) / 100))),
                        },
                      }))
                    }}
                  />
                </label>
                <label className="text-slate-500">
                  h
                  <input
                    type="number"
                    min={4}
                    max={75}
                    step={1}
                    className="ml-1 w-12 rounded border border-white/10 bg-black/40 px-1 text-white"
                    value={Math.round((Number(pinDraft[loc.id]?.height) || 0.12) * 100)}
                    disabled={!canEdit}
                    onChange={(e) => {
                      clearPinSaveFeedback()
                      setPinDraft((d) => ({
                        ...d,
                        [loc.id]: {
                          ...(d[loc.id] ?? emptyPinDraft()),
                          height: String(Math.max(0.04, Math.min(0.75, Number(e.target.value) / 100))),
                        },
                      }))
                    }}
                  />
                </label>
                <label className="text-slate-500">
                  °
                  <input
                    type="number"
                    min={-180}
                    max={180}
                    step={1}
                    className="ml-1 w-12 rounded border border-white/10 bg-black/40 px-1 text-white"
                    value={pinDraft[loc.id]?.rotation ?? '0'}
                    disabled={!canEdit}
                    title="Rotation in degrees"
                    onChange={(e) => {
                      clearPinSaveFeedback()
                      setPinDraft((d) => ({
                        ...d,
                        [loc.id]: {
                          ...(d[loc.id] ?? emptyPinDraft()),
                          rotation: String(Math.max(-180, Math.min(180, Number(e.target.value) || 0))),
                        },
                      }))
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={!canEdit || pinSaving}
              className="rounded-lg bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => void savePins(selectedMapId)}
            >
              {pinSaving ? 'Saving pins…' : 'Save pins'}
            </button>
            {pinSaving ? (
              <span className="text-sm text-slate-400" aria-live="polite">
                Writing pin positions to the database…
              </span>
            ) : null}
            {pinSaveFeedback && !pinSaving ? (
              <p
                className={`text-sm ${pinSaveFeedback.kind === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}
                role="status"
                aria-live="polite"
              >
                {pinSaveFeedback.kind === 'success' ? '✓ ' : ''}
                {pinSaveFeedback.text}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
