'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { collectDescendantIds, type LocationParentRow } from '@/lib/dancecard/locationHierarchyHelpers'
import type { OrganizerLocationDto } from '@/lib/dancecard/organizerLocationDto'
import { useConfirmDialog } from '@/components/dancecard/organizer/ui'

function depthOf(loc: OrganizerLocationDto, byId: Map<string, OrganizerLocationDto>): number {
  let d = 0
  let p: string | null = loc.parentId
  const seen = new Set<string>()
  while (p) {
    d++
    if (seen.has(p)) break
    seen.add(p)
    const next = byId.get(p)
    if (!next) break
    p = next.parentId
  }
  return d
}

function sortForDisplay(locs: OrganizerLocationDto[]): OrganizerLocationDto[] {
  const byId = new Map(locs.map((l) => [l.id, l]))
  return [...locs].sort((a, b) => {
    const da = depthOf(a, byId)
    const db = depthOf(b, byId)
    if (da !== db) return da - db
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    return a.name.localeCompare(b.name)
  })
}

export function LocationsSettingsSection({
  eventSlug,
  canEdit,
  embedded = false,
}: {
  eventSlug: string
  canEdit: boolean
  /** When true (e.g. setup wizard), avoid nested scroll regions and extra chrome. */
  embedded?: boolean
}) {
  const [locations, setLocations] = useState<OrganizerLocationDto[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState('')
  const { ask, dialog } = useConfirmDialog()

  const load = useCallback(async () => {
    setMsg(null)
    try {
      const res = await organizerDancecardFetch<{ locations: OrganizerLocationDto[] }>(eventSlug, '/locations')
      setLocations(res.locations ?? [])
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not load locations')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  const parentRows = useMemo((): LocationParentRow[] => {
    return locations.map((l) => ({ id: l.id, parentId: l.parentId }))
  }, [locations])

  const sorted = useMemo(() => sortForDisplay(locations), [locations])
  const byIdMap = useMemo(() => new Map(locations.map((x) => [x.id, x])), [locations])

  async function addLocation() {
    if (!canEdit || !newName.trim()) return
    setMsg(null)
    try {
      await organizerDancecardFetch(eventSlug, '/locations', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          parentId: newParentId || undefined,
        }),
      })
      setNewName('')
      setNewParentId('')
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed')
    }
  }

  async function patchLocation(id: string, patch: Record<string, unknown>) {
    if (!canEdit) return
    setMsg(null)
    try {
      await organizerDancecardFetch(eventSlug, `/locations/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed')
    }
  }

  async function delLocation(id: string) {
    if (!canEdit) return
    if (
      !(await ask({
        title: 'Delete location?',
        message: 'Delete this location? Slots referencing it will clear location_id.',
        destructive: true,
      }))
    )
      return
    setMsg(null)
    try {
      await organizerDancecardFetch(eventSlug, `/locations/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  function parentOptions(forId: string) {
    const excluded = collectDescendantIds(parentRows, forId)
    return sorted.filter((l) => !excluded.has(l.id))
  }

  const rootClass = embedded ? 'space-y-4' : 'rounded-xl border border-white/10 bg-black/30 p-4'
  const listClass = embedded ? 'mt-4 space-y-3' : 'mt-4 max-h-[480px] space-y-3 overflow-y-auto pr-1'

  return (
    <div className={rootClass}>
      {dialog}
      {!embedded ? (
        <>
          <h3 className="font-serif text-lg text-white">Locations and venues</h3>
          <p className="mt-1 text-xs text-slate-400">
            Hierarchical rooms and areas (hotel floors, halls, outdoor). Public directions stay off internal notes on
            attendee surfaces.
          </p>
        </>
      ) : (
        <p className="text-sm text-dc-muted">
          Add rooms and areas for the schedule. You can add more detail later in Settings.
        </p>
      )}
      {msg ? <p className="mt-2 text-sm text-amber-200">{msg}</p> : null}

      <div className="mt-4 flex flex-wrap items-end gap-2 border-b border-white/10 pb-4">
        <label className="text-xs uppercase tracking-wide text-slate-400">
          New location name
          <input
            className="mt-1 block min-w-[200px] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
            value={newName}
            disabled={!canEdit}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Main hall"
          />
        </label>
        <label className="text-xs uppercase tracking-wide text-slate-400">
          Parent (optional)
          <select
            className="mt-1 block min-w-[160px] rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-sm text-white"
            value={newParentId}
            disabled={!canEdit}
            onChange={(e) => setNewParentId(e.target.value)}
          >
            <option value="">— None —</option>
            {sorted.map((l) => (
              <option key={l.id} value={l.id}>
                {`${'— '.repeat(depthOf(l, byIdMap))}${l.name}`}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={!canEdit}
          className="rounded-full border border-dc-accent-border px-3 py-1.5 text-sm text-dc-text hover:bg-dc-accent-muted disabled:opacity-40"
          onClick={() => void addLocation()}
        >
          Add location
        </button>
      </div>

      <ul className={listClass}>
        {sorted.map((loc) => {
          const indent = depthOf(loc, byIdMap)
          return (
            <li
              key={loc.id}
              className="rounded-lg border border-white/10 bg-black/20 p-3"
              style={{ marginLeft: Math.min(indent, 6) * 12 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Name
                    <input
                      className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-sm text-white"
                      defaultValue={loc.name}
                      disabled={!canEdit}
                      key={`${loc.id}-name`}
                      onBlur={(e) => {
                        const v = e.target.value.trim()
                        if (v && v !== loc.name) void patchLocation(loc.id, { name: v })
                      }}
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Parent
                      <select
                        className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                        value={loc.parentId ?? ''}
                        disabled={!canEdit}
                        onChange={(e) => {
                          const v = e.target.value || null
                          void patchLocation(loc.id, { parentId: v })
                        }}
                      >
                        <option value="">— None —</option>
                        {parentOptions(loc.id).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Kind
                      <input
                        className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                        defaultValue={loc.kind ?? ''}
                        disabled={!canEdit}
                        key={`${loc.id}-kind`}
                        placeholder="room, floor, outdoor…"
                        onBlur={(e) => {
                          const v = e.target.value.trim() || null
                          if (v !== (loc.kind ?? null)) void patchLocation(loc.id, { kind: v })
                        }}
                      />
                    </label>
                    <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Capacity
                      <input
                        type="number"
                        className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                        defaultValue={loc.capacity ?? ''}
                        disabled={!canEdit}
                        key={`${loc.id}-cap`}
                        onBlur={(e) => {
                          const v = e.target.value === '' ? null : Number(e.target.value)
                          if (v !== loc.capacity && (v === null || Number.isFinite(v)))
                            void patchLocation(loc.id, { capacity: v })
                        }}
                      />
                    </label>
                    <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                      Sort order
                      <input
                        type="number"
                        className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                        defaultValue={loc.sortOrder}
                        disabled={!canEdit}
                        key={`${loc.id}-sort`}
                        onBlur={(e) => {
                          const v = Number(e.target.value)
                          if (Number.isFinite(v) && v !== loc.sortOrder) void patchLocation(loc.id, { sortOrder: v })
                        }}
                      />
                    </label>
                  </div>
                  <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Public directions
                    <textarea
                      className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                      rows={2}
                      defaultValue={loc.directionsPublic ?? ''}
                      disabled={!canEdit}
                      key={`${loc.id}-dir`}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (loc.directionsPublic ?? null)) void patchLocation(loc.id, { directionsPublic: v })
                      }}
                    />
                  </label>
                  {!embedded ? (
                  <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Accessibility notes (organizer + public policy; review before exposing)
                    <textarea
                      className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                      rows={2}
                      defaultValue={loc.accessibilityNotes ?? ''}
                      disabled={!canEdit}
                      key={`${loc.id}-acc`}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (loc.accessibilityNotes ?? null))
                          void patchLocation(loc.id, { accessibilityNotes: v })
                      }}
                    />
                  </label>
                  ) : null}
                  {!embedded ? (
                  <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Internal notes (organizer only)
                    <textarea
                      className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                      rows={2}
                      defaultValue={loc.internalNotes ?? ''}
                      disabled={!canEdit}
                      key={`${loc.id}-int`}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (loc.internalNotes ?? null)) void patchLocation(loc.id, { internalNotes: v })
                      }}
                    />
                  </label>
                  ) : null}
                  {!embedded ? (
                  <label className="block text-[10px] uppercase tracking-wide text-slate-500">
                    Legacy notes
                    <textarea
                      className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-xs text-white"
                      rows={2}
                      defaultValue={loc.notes ?? ''}
                      disabled={!canEdit}
                      key={`${loc.id}-notes`}
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null
                        if (v !== (loc.notes ?? null)) void patchLocation(loc.id, { notes: v })
                      }}
                    />
                  </label>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={!canEdit}
                  className="shrink-0 text-xs text-rose-300 hover:underline disabled:opacity-40"
                  onClick={() => void delLocation(loc.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
