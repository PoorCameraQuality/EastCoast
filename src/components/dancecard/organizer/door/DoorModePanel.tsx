'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'
import { enqueueDoorCheckIn, listDoorQueue, removeDoorQueueItem } from '@/lib/dancecard/door/doorOfflineQueue'
import { cacheDoorRoster, registerDoorServiceWorker } from '@/lib/dancecard/door/registerDoorSw'

type Registrant = {
  id: string
  sceneDisplayName: string
  categoryName: string | null
  status: string
  checkInEligibility?: string
  checkInTiming?: string | null
  checkedInAt?: string | null
  pronouns?: string | null
}

function toneClass(r: Registrant): string {
  if (r.status === 'checked_in') {
    if (r.checkInTiming === 'late') return 'border-sky-400 bg-sky-100 text-sky-900'
    if (r.checkInTiming === 'early_override') return 'border-red-400 bg-red-100 text-red-900'
    return 'border-dc-accent-border bg-dc-accent-muted text-dc-accent-hover'
  }
  if (r.checkInEligibility === 'early') return 'border-red-300 bg-red-50 text-red-800'
  if (r.checkInEligibility === 'late') return 'border-sky-300 bg-sky-50 text-sky-800'
  return 'border-dc-border bg-dc-elevated-solid text-dc-text'
}

export function DoorModePanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const [eventTitle, setEventTitle] = useState('')
  const [query, setQuery] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [results, setResults] = useState<Registrant[]>([])
  const [selected, setSelected] = useState<Registrant | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [queueCount, setQueueCount] = useState(0)
  const [lastChecked, setLastChecked] = useState<Registrant | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const searchRef = useRef<HTMLInputElement>(null)
  const qrRef = useRef<HTMLInputElement>(null)

  const refreshQueue = useCallback(async () => {
    const q = await listDoorQueue()
    setQueueCount(q.length)
  }, [])

  const loadRoster = useCallback(async () => {
    try {
      const data = await organizerDancecardFetch<{ eventTitle: string; roster: Registrant[] }>(
        eventSlug,
        '/door/roster',
      )
      setEventTitle(data.eventTitle)
      cacheDoorRoster(eventSlug, data)
    } catch {
      /* offline roster may be cached by SW */
    }
  }, [eventSlug])

  const syncQueue = useCallback(async () => {
    const items = await listDoorQueue()
    for (const item of items) {
      try {
        await organizerDancecardFetch(eventSlug, '/registrants/check-in', {
          method: 'POST',
          body: JSON.stringify({
            registrantId: item.registrantId,
            earlyCheckInOverride: item.earlyCheckInOverride,
          }),
        })
        await removeDoorQueueItem(item.id)
      } catch {
        break
      }
    }
    await refreshQueue()
  }, [eventSlug, refreshQueue])

  useEffect(() => {
    registerDoorServiceWorker()
    void loadRoster()
    void refreshQueue()
    const onOnline = () => {
      setOffline(false)
      void syncQueue()
    }
    const onOffline = () => setOffline(true)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    setOffline(!navigator.onLine)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [loadRoster, refreshQueue, syncQueue])

  const lookup = useCallback(
    async (params: { q?: string; qr?: string }) => {
      setErr(null)
      const sp = new URLSearchParams()
      if (params.q) sp.set('q', params.q)
      if (params.qr) sp.set('qr', params.qr)
      const data = await organizerDancecardFetch<{ registrants: Registrant[] }>(
        eventSlug,
        `/registrants/lookup?${sp.toString()}`,
      )
      setResults(data.registrants)
      if (data.registrants.length === 1) setSelected(data.registrants[0]!)
      return data.registrants
    },
    [eventSlug],
  )

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const t = window.setTimeout(() => {
      void lookup({ q: query.trim() }).catch((e) => setErr(e instanceof Error ? e.message : 'Search failed'))
    }, 250)
    return () => window.clearTimeout(t)
  }, [query, lookup])

  async function performCheckIn(registrantId: string, earlyOverride = false) {
    if (readOnly) return
    setBusy(true)
    setErr(null)
    setMessage(null)
    try {
      if (!navigator.onLine) {
        await enqueueDoorCheckIn({
          registrantId,
          earlyCheckInOverride: earlyOverride,
          clientTimestamp: new Date().toISOString(),
        })
        setMessage('Queued for sync when online')
        await refreshQueue()
        return
      }
      const data = await organizerDancecardFetch<{ registrant: Registrant }>(eventSlug, '/registrants/check-in', {
        method: 'POST',
        body: JSON.stringify({ registrantId, earlyCheckInOverride: earlyOverride }),
      })
      setLastChecked(data.registrant)
      setSelected(data.registrant)
      setMessage(`Checked in: ${data.registrant.sceneDisplayName}`)
      setQuery('')
      setResults([])
      void loadRoster()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Check-in failed'
      if (msg.includes('early') || msg.includes('409')) {
        if (window.confirm('Early check-in — allow override for this attendee?')) {
          await performCheckIn(registrantId, true)
          return
        }
      }
      setErr(msg)
    } finally {
      setBusy(false)
    }
  }

  async function onQrSubmit(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) return
    setQrInput('')
    try {
      const found = await lookup({ qr: trimmed })
      if (found.length === 1 && found[0]!.status !== 'checked_in') {
        await performCheckIn(found[0]!.id)
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'QR lookup failed')
    }
  }

  async function bulkCheckIn() {
    if (!selectedIds.size || readOnly) return
    setBusy(true)
    try {
      const data = await organizerDancecardFetch<{
        results: Array<{ registrantId: string; ok: boolean; error?: { code: string } }>
      }>(eventSlug, '/registrants/bulk-check-in', {
        method: 'POST',
        body: JSON.stringify({ registrantIds: Array.from(selectedIds), earlyCheckInOverride: false }),
      })
      const failed = data.results.filter((r) => !r.ok).length
      setMessage(`Bulk check-in: ${data.results.length - failed} ok, ${failed} need attention`)
      setSelectedIds(new Set())
      void loadRoster()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Bulk check-in failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col bg-dc-surface px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-dc-muted">Door mode</p>
          <h1 className="font-serif text-xl text-dc-text">{eventTitle || eventSlug}</h1>
        </div>
        <Link
          href={`/organizer/dancecard/${encodeURIComponent(eventSlug)}?tab=people&peopleTab=signups`}
          className="rounded-lg border border-dc-border px-3 py-2 text-xs text-dc-muted hover:bg-dc-surface-muted"
        >
          Exit
        </Link>
      </div>

      {offline ? (
        <p className="mb-2 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm text-amber-900">
          Offline — check-ins will queue ({queueCount} pending)
        </p>
      ) : null}
      {queueCount > 0 && !offline ? (
        <button
          type="button"
          className="mb-2 text-xs text-dc-accent hover:underline"
          onClick={() => void syncQueue()}
        >
          Sync {queueCount} queued check-in(s)
        </button>
      ) : null}
      {err ? <p className="mb-2 text-sm text-red-700">{err}</p> : null}
      {message ? <p className="mb-2 text-sm text-emerald-800">{message}</p> : null}

      <label className="text-xs font-medium text-dc-muted">Scan QR / badge</label>
      <input
        ref={qrRef}
        type="text"
        value={qrInput}
        onChange={(e) => setQrInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void onQrSubmit(qrInput)
        }}
        placeholder="Scan or paste QR payload…"
        className="mb-3 min-h-12 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-base"
        autoComplete="off"
      />

      <label className="text-xs font-medium text-dc-muted">Search name or email</label>
      <input
        ref={searchRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type to search…"
        className="mb-3 min-h-12 w-full rounded-xl border border-dc-border bg-dc-elevated-solid px-4 text-base"
      />

      {results.length > 0 ? (
        <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setSelected(r)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm ${toneClass(r)}`}
              >
                <span className="font-semibold">{r.sceneDisplayName}</span>
                <span className="text-xs opacity-80">{r.categoryName ?? r.status}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {selected ? (
        <div className={`mb-4 rounded-2xl border-2 p-4 ${toneClass(selected)}`}>
          <p className="text-2xl font-bold">{selected.sceneDisplayName}</p>
          {selected.pronouns ? <p className="text-sm opacity-80">{selected.pronouns}</p> : null}
          <p className="mt-1 text-sm">{selected.categoryName ?? '—'}</p>
          <p className="text-xs uppercase tracking-wide opacity-70">{selected.status.replace(/_/g, ' ')}</p>
          {!readOnly && selected.status !== 'checked_in' ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void performCheckIn(selected.id)}
              className="dc-gold-btn mt-4 w-full min-h-14 rounded-xl text-lg font-semibold"
            >
              {busy ? 'Checking in…' : 'Check in'}
            </button>
          ) : null}
          {selected.status === 'checked_in' ? (
            <p className="mt-3 text-center text-sm font-medium">Already on-site</p>
          ) : null}
        </div>
      ) : null}

      {lastChecked ? (
        <p className="text-center text-xs text-dc-muted">Last: {lastChecked.sceneDisplayName}</p>
      ) : null}

      {results.length > 1 && !readOnly ? (
        <div className="mt-auto border-t border-dc-border pt-4">
          <p className="mb-2 text-xs text-dc-muted">Bulk check-in search results</p>
          <div className="mb-2 flex flex-wrap gap-2">
            {results.map((r) => (
              <label key={r.id} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={selectedIds.has(r.id)}
                  onChange={(e) => {
                    const next = new Set(selectedIds)
                    if (e.target.checked) next.add(r.id)
                    else next.delete(r.id)
                    setSelectedIds(next)
                  }}
                />
                {r.sceneDisplayName.slice(0, 12)}
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={busy || selectedIds.size === 0}
            onClick={() => void bulkCheckIn()}
            className="w-full rounded-xl border border-dc-accent-border py-3 text-sm font-semibold text-dc-accent-hover"
          >
            Check in selected ({selectedIds.size})
          </button>
        </div>
      ) : null}
    </div>
  )
}
