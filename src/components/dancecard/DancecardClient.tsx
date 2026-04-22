'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError } from '@/components/dancecard/api-client'
import { discordLine, formatRange, formatTime, groupSlotsByDay } from '@/components/dancecard/time'
import { trackChipClass, trackChipStyle } from '@/components/dancecard/trackColor'

type ScheduleMeta = {
  productTitle: string
  eventTitle: string
  subtitle: string | null
  timezone: string
  windowStartsAt: string
  windowEndsAt: string
  sharedByLabel: string
  sharedByDetail: string | null
  logoUrl: string | null
}

type ProgramSlot = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  track: string | null
  room: string | null
  description: string | null
  sortOrder: number
}

type MeResponse = {
  account: { id: string; username: string; displayName: string }
  prefs: { bufferMinutes: number }
  selections: {
    id: string
    kind: string
    slotId: string | null
    startsAt: string
    endsAt: string
    programTitle?: string | null
    programRoom?: string | null
  }[]
}

type ShareResponse = {
  host: { displayName: string }
  viewerYou: string | null
  mutualFreeGaps: { start: string; end: string }[] | null
}

type Tab = 'program' | 'dancecard' | 'mutual' | 'reservations'
type ScheduleView = 'simple' | 'expanded' | 'venue' | 'grid'

function groupSlotsByStart(slots: ProgramSlot[]): [string, ProgramSlot[]][] {
  const m = new Map<string, ProgramSlot[]>()
  for (const s of slots) {
    const k = s.startsAt
    const arr = m.get(k) ?? []
    arr.push(s)
    m.set(k, arr)
  }
  return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}

function groupByVenue(slots: ProgramSlot[]): { room: string; items: ProgramSlot[] }[] {
  const m = new Map<string, ProgramSlot[]>()
  for (const s of slots) {
    const r = s.room?.trim() || 'Other'
    const arr = m.get(r) ?? []
    arr.push(s)
    m.set(r, arr)
  }
  return Array.from(m.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([room, items]) => ({
      room,
      items: items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    }))
}

export function DancecardClient({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const [schedule, setSchedule] = useState<{ meta: ScheduleMeta | null; slots: ProgramSlot[] } | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>('program')
  const [scheduleView, setScheduleView] = useState<ScheduleView>('simple')
  const [trackFilter, setTrackFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [buffer, setBuffer] = useState(0)
  const [manualOpen, setManualOpen] = useState(false)
  const [mStart, setMStart] = useState('')
  const [mEnd, setMEnd] = useState('')
  const [mutualToken, setMutualToken] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(`eck_dc_mutual_${slug}`) ?? '' : ''
  )
  const [mutualData, setMutualData] = useState<ShareResponse | null>(null)
  const saveTimer = useRef<number | null>(null)
  const selectionsRef = useRef<MeResponse['selections']>([])

  const tz = schedule?.meta?.timezone ?? 'America/New_York'

  const loadSchedule = useCallback(async () => {
    try {
      const s = await dancecardFetch<{ meta: ScheduleMeta | null; slots: ProgramSlot[] }>(slug, '/schedule')
      setSchedule(s)
      setLoadErr(null)
    } catch (e) {
      setLoadErr(e instanceof DancecardApiError ? e.body : 'Could not load schedule')
    }
  }, [slug])

  const checkSession = useCallback(async () => {
    try {
      const m = await dancecardFetch<MeResponse>(slug, '/me')
      setMe(m)
    } catch {
      setMe(null)
    } finally {
      setAuthChecked(true)
    }
  }, [slug])

  useEffect(() => {
    void loadSchedule()
  }, [loadSchedule])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  useEffect(() => {
    selectionsRef.current = me?.selections ?? []
  }, [me])

  const tracks = useMemo(() => {
    const s = schedule?.slots ?? []
    return Array.from(new Set(s.map((x) => x.track).filter(Boolean))) as string[]
  }, [schedule])

  const rooms = useMemo(() => {
    const s = schedule?.slots ?? []
    return Array.from(new Set(s.map((x) => x.room).filter(Boolean))) as string[]
  }, [schedule])

  const filteredSlots = useMemo(() => {
    let s = schedule?.slots ?? []
    if (trackFilter) s = s.filter((x) => (x.track ?? '') === trackFilter)
    if (roomFilter) s = s.filter((x) => (x.room ?? '') === roomFilter)
    return s
  }, [schedule, trackFilter, roomFilter])

  const grouped = useMemo(() => groupSlotsByDay(filteredSlots, tz), [filteredSlots, tz])
  const venueGroups = useMemo(() => groupByVenue(filteredSlots), [filteredSlots])
  const uniqueRoomsForGrid = useMemo(() => {
    const r = Array.from(new Set(filteredSlots.map((s) => s.room || 'Other'))).sort()
    return r.slice(0, 8)
  }, [filteredSlots])

  const programSelected = useMemo(() => {
    const set = new Set<string>()
    for (const x of me?.selections ?? []) {
      if (x.kind === 'program' && x.slotId) set.add(x.slotId)
    }
    return set
  }, [me])

  const refreshMe = useCallback(async () => {
    const m = await dancecardFetch<MeResponse>(slug, '/me')
    setMe(m)
    setBuffer(m.prefs.bufferMinutes)
  }, [slug])

  const persist = useCallback(
    async (nextSelections: MeResponse['selections'], nextBuffer: number) => {
      setSaving(true)
      try {
        await dancecardFetch(slug, '/dancecard', {
          method: 'PUT',
          body: JSON.stringify({
            bufferMinutes: nextBuffer,
            selections: nextSelections.map((s) => ({
              kind: s.kind,
              slotId: s.slotId ?? undefined,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
            })),
          }),
        })
        await refreshMe()
      } catch (e) {
        setToast(e instanceof DancecardApiError ? e.body : 'Save failed')
      } finally {
        setSaving(false)
      }
    },
    [slug, refreshMe]
  )

  const queueSave = useCallback(
    (nextSelections: MeResponse['selections'], nextBuffer: number) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void persist(nextSelections, nextBuffer)
      }, 450)
    },
    [persist]
  )

  function toggleProgram(slot: ProgramSlot) {
    const cur = me?.selections ?? []
    const isOn = programSelected.has(slot.id)
    let next: MeResponse['selections']
    if (isOn) {
      next = cur.filter((s) => !(s.kind === 'program' && s.slotId === slot.id))
    } else {
      next = [
        ...cur,
        {
          id: crypto.randomUUID(),
          kind: 'program',
          slotId: slot.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
        },
      ]
    }
    setMe((m) => (m ? { ...m, selections: next } : m))
    queueSave(next, buffer)
  }

  function removeSelection(id: string) {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => s.id !== id)
    setMe((m) => (m ? { ...m, selections: next } : m))
    queueSave(next, buffer)
  }

  function applyBuffer(next: number) {
    setBuffer(next)
    setMe((m) => (m ? { ...m, prefs: { bufferMinutes: next } } : m))
    queueSave(selectionsRef.current, next)
  }

  async function addManualBlock() {
    if (!mStart || !mEnd) return
    const cur = me?.selections ?? []
    const next = [
      ...cur,
      {
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: new Date(mStart).toISOString(),
        endsAt: new Date(mEnd).toISOString(),
      },
    ]
    setMe((m) => (m ? { ...m, selections: next } : m))
    setManualOpen(false)
    setMStart('')
    setMEnd('')
    await persist(next, buffer)
  }

  async function copyShare() {
    try {
      const res = await dancecardFetch<{ token: string }>(slug, '/share', { method: 'POST' })
      const url = `${window.location.origin}/dancecard/${slug}/s/${res.token}`
      const line = discordLine({
        displayName: me?.account.displayName ?? 'Guest',
        eventTitle: schedule?.meta?.eventTitle ?? 'Event',
        url,
      })
      await navigator.clipboard.writeText(line)
      setToast('Copied for Discord.')
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, res.token)
      setMutualToken(res.token)
    } catch {
      setToast('Could not create share link.')
    }
  }

  async function fetchShare(token: string): Promise<ShareResponse> {
    const clean = token.trim().replace(/^\/s\//, '').replace(/^\/?s\//, '')
    return dancecardFetch<ShareResponse>(slug, `/share/${encodeURIComponent(clean)}`)
  }

  async function refreshMutual() {
    if (!mutualToken.trim()) {
      setMutualData(null)
      return
    }
    try {
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, mutualToken.trim())
      const d = await fetchShare(mutualToken.trim())
      setMutualData(d)
    } catch {
      setMutualData(null)
      setToast('Could not load share preview.')
    }
  }

  useEffect(() => {
    if (tab === 'mutual' && mutualToken.trim()) void refreshMutual()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when switching to mutual tab
  }, [tab])

  async function submitAuth() {
    try {
      if (authMode === 'register') {
        await dancecardFetch(slug, '/register', {
          method: 'POST',
          body: JSON.stringify({ username, password, displayName }),
        })
      } else {
        await dancecardFetch(slug, '/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
      }
      setPassword('')
      await checkSession()
    } catch (e) {
      setToast(e instanceof DancecardApiError ? e.body : 'Auth failed')
    }
  }

  async function logout() {
    await dancecardFetch(slug, '/logout', { method: 'POST' })
    setMe(null)
    await checkSession()
  }

  async function rename() {
    const next = window.prompt('New display name', me?.account.displayName ?? '')
    if (!next) return
    try {
      await dancecardFetch(slug, '/me', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: next }),
      })
      await refreshMe()
    } catch {
      setToast('Rename failed.')
    }
  }

  if (!schedule && loadErr) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-slate-100">
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-6">
          <h1 className="text-lg font-semibold text-rose-100">Schedule unavailable</h1>
          <p className="mt-2 text-sm text-rose-200/80">{loadErr}</p>
          <p className="mt-3 text-xs text-slate-400">
            Apply <code className="rounded bg-black/30 px-1">database/dancecard_000_schema.sql</code> and{' '}
            <code className="rounded bg-black/30 px-1">dancecard_seed_paf26_demo.sql</code> in Supabase, then refresh.
          </p>
        </div>
      </div>
    )
  }

  if (!schedule || !authChecked) {
    return <div className="px-4 py-12 text-slate-400">Loading…</div>
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 text-slate-100">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">{schedule.meta?.productTitle}</p>
          <h1 className="font-serif text-2xl font-semibold">{schedule.meta?.eventTitle ?? 'Dancecard'}</h1>
          <p className="mt-1 text-sm text-slate-400">Username and password (no email).</p>
        </header>
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm ${authMode === 'login' ? 'bg-amber-500 text-slate-900' : 'border border-white/15 text-slate-300'}`}
            onClick={() => setAuthMode('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-sm ${authMode === 'register' ? 'bg-amber-500 text-slate-900' : 'border border-white/15 text-slate-300'}`}
            onClick={() => setAuthMode('register')}
          >
            Register
          </button>
        </div>
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <label className="block text-xs text-slate-400">Username</label>
          <input
            className="w-full rounded border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <label className="block text-xs text-slate-400">Password</label>
          <input
            type="password"
            className="w-full rounded border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
          />
          {authMode === 'register' ? (
            <>
              <label className="block text-xs text-slate-400">Display name (shown to friends)</label>
              <input
                className="w-full rounded border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </>
          ) : null}
          <button
            type="button"
            className="mt-2 w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
            onClick={() => void submitAuth()}
          >
            {authMode === 'register' ? 'Create account' : 'Log in'}
          </button>
        </div>
        {toast ? <p className="mt-3 text-sm text-rose-300">{toast}</p> : null}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-slate-100">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-200/80">{schedule.meta?.productTitle}</p>
          <h1 className="font-serif text-2xl font-semibold text-white">{schedule.meta?.eventTitle}</h1>
          <p className="text-sm text-slate-400">
            Hi <span className="text-white">{me.account.displayName}</span> ({me.account.username})
            <button type="button" className="ml-2 text-amber-300 hover:underline" onClick={() => void rename()}>
              Rename
            </button>
            <button type="button" className="ml-3 text-slate-500 hover:text-white" onClick={() => void logout()}>
              Log out
            </button>
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
          My dancecard: <span className="font-semibold text-amber-200">{me.selections.length}</span> blocks
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="tablist">
        {(
          [
            ['program', 'Program'],
            ['dancecard', 'My dancecard'],
            ['mutual', 'Mutual'],
            ['reservations', 'Reservations'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === k ? 'bg-amber-500 text-slate-900' : 'border border-white/15 text-slate-300 hover:bg-white/5'}`}
            aria-selected={tab === k}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'program' ? (
        <div className="space-y-4">
          {schedule.slots.length ? (
            <p className="text-sm text-slate-400">
              Browse the official schedule below. <strong className="text-slate-200">Click any class</strong> to add
              it to <strong className="text-slate-200">My dancecard</strong> (pick as many as you like); click again
              to remove. Switch to the My dancecard tab to see your list and add manual busy blocks.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase text-slate-500">View</span>
            {(['simple', 'expanded', 'venue', 'grid'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`rounded px-2 py-1 text-xs ${scheduleView === v ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setScheduleView(v)}
              >
                {v}
              </button>
            ))}
            <button
              type="button"
              className="ml-auto text-xs text-amber-300 hover:underline"
              onClick={() => void loadSchedule()}
            >
              Refresh schedule
            </button>
          </div>
          {grouped.length > 1 && scheduleView !== 'venue' && scheduleView !== 'grid' ? (
            <nav className="sticky top-0 z-20 -mx-2 mb-2 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur">
              {grouped.map((g, idx) => (
                <a
                  key={g.day}
                  href={`#dc-day-${idx}`}
                  className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-300 hover:bg-amber-500/20"
                >
                  {g.day.split(',')[0]?.trim() ?? g.day}
                </a>
              ))}
            </nav>
          ) : null}
          <div className="flex flex-wrap gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-3">
            <select
              className="rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
            >
              <option value="">All tracks</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-white/10 bg-slate-950 px-2 py-1 text-sm text-white"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="">All rooms</option>
              {rooms.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {scheduleView === 'venue' ? (
            <div className="space-y-6">
              {venueGroups.map((vg) => (
                <section key={vg.room} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <h2 className="mb-3 font-serif text-lg text-white">{vg.room}</h2>
                  <div className="space-y-2">
                    {vg.items.map((slot) => (
                      <SessionCard
                        key={slot.id}
                        slot={slot}
                        tz={tz}
                        expanded={false}
                        selected={programSelected.has(slot.id)}
                        onToggle={() => toggleProgram(slot)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : scheduleView === 'grid' ? (
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60 p-2">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr>
                    <th className="border border-white/10 p-2 text-slate-400">Time</th>
                    {uniqueRoomsForGrid.map((room) => (
                      <th key={room} className="border border-white/10 p-2 text-slate-300">
                        {room}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupSlotsByStart(filteredSlots).map(([startIso, slotsAt]) => (
                    <tr key={startIso}>
                      <td className="border border-white/10 p-2 text-amber-100/90">{formatTime(startIso, tz)}</td>
                      {uniqueRoomsForGrid.map((room) => {
                        const slot = slotsAt.find((s) => (s.room || 'Other') === room)
                        return (
                          <td key={room} className="border border-white/10 p-1 align-top">
                            {slot ? (
                              <button
                                type="button"
                                className={`w-full rounded p-1 text-left text-[11px] transition hover:ring-1 hover:ring-amber-400/50 ${programSelected.has(slot.id) ? 'bg-amber-500/20' : 'bg-slate-950/80'}`}
                                onClick={() => toggleProgram(slot)}
                              >
                                {slot.title}
                              </button>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            grouped.map((g, dayIdx) => (
              <section
                key={g.day}
                id={`dc-day-${dayIdx}`}
                className="scroll-mt-24 rounded-xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="mb-3 flex flex-wrap items-baseline gap-2">
                  <h2 className="font-serif text-lg font-semibold text-white">{g.day}</h2>
                  <span className="text-xs text-slate-500">{tz}</span>
                </div>
                <div className="space-y-4">
                  {groupSlotsByStart(g.items).map(([startIso, slotsAt]) => (
                    <div key={startIso}>
                      <div className="mb-2 text-sm font-medium text-amber-100/90">{formatTime(startIso, tz)}</div>
                      <div className="flex flex-wrap gap-2">
                        {slotsAt.map((slot) => (
                          <SessionCard
                            key={slot.id}
                            slot={slot}
                            tz={tz}
                            expanded={scheduleView === 'expanded'}
                            selected={programSelected.has(slot.id)}
                            onToggle={() => toggleProgram(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
          {!schedule.slots.length ? (
            <div className="rounded-xl border border-amber-500/25 bg-amber-950/25 p-4 text-sm text-amber-50/95">
              <p className="font-medium text-amber-100">No program is loaded for this event yet.</p>
              <p className="mt-2 text-slate-300">
                Publishing the website only ships the app. Sessions live in your Supabase project (
                <code className="rounded bg-black/40 px-1">dancecard_program_slots</code>). Run the import once
                against <strong>production</strong> using the service-role key and the checked-in JSON (see{' '}
                <code className="rounded bg-black/40 px-1">docs/dancecard-first-run.md</code>).
              </p>
            </div>
          ) : !filteredSlots.length ? (
            <p className="text-sm text-slate-500">No sessions match filters.</p>
          ) : null}
          <p className="text-xs text-slate-500">{saving ? 'Saving…' : ''}</p>
        </div>
      ) : null}

      {tab === 'dancecard' ? (
        <div className="max-w-2xl space-y-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <h2 className="font-serif text-lg text-white">Your commitments</h2>
          <label className="block text-xs text-slate-400">Buffer (minutes, multiple of 15)</label>
          <input
            type="number"
            min={0}
            max={120}
            step={15}
            className="w-32 rounded border border-white/10 bg-slate-950 px-2 py-1 text-white"
            value={buffer}
            onChange={(e) => applyBuffer(Number(e.target.value))}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900"
              onClick={() => setManualOpen(true)}
            >
              Manual busy block
            </button>
            <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-sm" onClick={() => void copyShare()}>
              Copy share for Discord
            </button>
          </div>
          <ul className="space-y-2">
            {me.selections.length ? (
              me.selections.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-slate-950/60 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-white">
                      {s.kind === 'program'
                        ? s.programTitle || 'Program session'
                        : s.kind === 'manual'
                          ? 'Manual busy block'
                          : s.kind}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {s.kind === 'program' && s.programRoom ? (
                        <span className="text-slate-400">{s.programRoom} · </span>
                      ) : null}
                      {formatRange(s.startsAt, s.endsAt, tz)}
                    </span>
                  </span>
                  <button type="button" className="shrink-0 text-rose-300 hover:underline" onClick={() => removeSelection(s.id)}>
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-500">Nothing on your dancecard yet.</li>
            )}
          </ul>
        </div>
      ) : null}

      {tab === 'mutual' ? (
        <div className="max-w-xl space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <h2 className="font-serif text-lg text-white">Mutual availability</h2>
          <p className="text-sm text-slate-400">Paste a friend&apos;s share token from their link.</p>
          <input
            className="w-full rounded border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            value={mutualToken}
            onChange={(e) => setMutualToken(e.target.value)}
            placeholder="token from /s/…"
          />
          <button
            type="button"
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-900"
            onClick={() => void refreshMutual()}
          >
            Load mutual preview
          </button>
          {mutualData ? (
            <div className="text-sm">
              <p>
                Host: <span className="text-white">{mutualData.host.displayName}</span>
                {mutualData.viewerYou ? (
                  <span className="text-slate-400">
                    {' '}
                    · You: <span className="text-emerald-200">{mutualData.viewerYou}</span>
                  </span>
                ) : (
                  <span className="text-slate-500"> · Log in to see mutual free time.</span>
                )}
              </p>
              {mutualData.mutualFreeGaps?.length ? (
                <ul className="mt-2 space-y-1 text-emerald-200/90">
                  {mutualData.mutualFreeGaps.map((g, i) => (
                    <li key={i}>{formatRange(g.start, g.end, tz)}</li>
                  ))}
                </ul>
              ) : mutualData.viewerYou ? (
                <p className="mt-2 text-slate-500">No mutual gaps (check dancecards).</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'reservations' ? <ReservationsPanel slug={slug} tz={tz} /> : null}

      {manualOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-4 text-slate-100 shadow-xl">
            <div className="mb-3 flex justify-between">
              <h3 className="font-semibold">Manual busy block</h3>
              <button type="button" className="text-slate-400 hover:text-white" onClick={() => setManualOpen(false)}>
                Close
              </button>
            </div>
            <p className="mb-3 text-xs text-slate-500">Times use your browser local timezone; stored as UTC.</p>
            <label className="text-xs text-slate-400">Start</label>
            <input
              type="datetime-local"
              className="mb-2 mt-1 w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-white"
              value={mStart}
              onChange={(e) => setMStart(e.target.value)}
            />
            <label className="text-xs text-slate-400">End</label>
            <input
              type="datetime-local"
              className="mt-1 w-full rounded border border-white/10 bg-slate-950 px-2 py-1 text-white"
              value={mEnd}
              onChange={(e) => setMEnd(e.target.value)}
            />
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-amber-500 py-2 text-sm font-semibold text-slate-900"
              onClick={() => void addManualBlock()}
            >
              Add block
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-2 rounded-lg border border-white/20 bg-slate-900/95 px-3 py-2 text-sm text-white shadow-lg">
          <span>{toast}</span>
          <button type="button" className="text-amber-300 hover:underline" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}

function SessionCard(props: {
  slot: ProgramSlot
  tz: string
  expanded: boolean
  selected: boolean
  onToggle: () => void
}) {
  const { slot, tz, expanded, selected, onToggle } = props
  const addLabel = selected ? 'On your dancecard — click to remove' : 'Click to add to My dancecard'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${slot.title}. ${addLabel}`}
      className={`flex max-w-md min-w-[200px] flex-1 flex-col gap-1 rounded-lg border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        selected ? 'border-amber-400/60 bg-amber-500/10' : 'border-white/10 bg-slate-950/70 hover:border-amber-400/40 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white">{slot.title}</div>
          <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
            {slot.track ? (
              <span className={`rounded px-1.5 py-0.5 ${trackChipClass()}`} style={trackChipStyle(slot.track)}>
                {slot.track}
              </span>
            ) : null}
            {slot.room ? <span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">{slot.room}</span> : null}
          </div>
          {expanded && slot.description ? <p className="mt-2 text-xs text-slate-400">{slot.description}</p> : null}
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
            selected ? 'border-emerald-400 bg-emerald-500/30 text-emerald-100' : 'border-white/20 text-slate-500'
          }`}
          aria-hidden
        >
          {selected ? '✓' : ''}
        </span>
      </div>
      <div className="text-[11px] text-slate-500">
        {formatTime(slot.startsAt, tz)} → {formatTime(slot.endsAt, tz)}
      </div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-amber-200/70">{addLabel}</div>
    </button>
  )
}

function ReservationsPanel({ slug, tz }: { slug: string; tz: string }) {
  const [rows, setRows] = useState<
    {
      id: string
      status: string
      startsAt: string
      endsAt: string
      note: string | null
      role: string
      host: { id: string; displayName: string }
      guest: { id: string; displayName: string }
    }[]
  >([])

  const load = useCallback(async () => {
    const r = await dancecardFetch<{ reservations: typeof rows }>(slug, '/reservations')
    setRows(r.reservations)
  }, [slug])

  useEffect(() => {
    void load().catch(() => null)
  }, [load])

  return (
    <div className="max-w-2xl space-y-3 rounded-xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex justify-between">
        <h2 className="font-serif text-lg text-white">Reservations</h2>
        <button type="button" className="text-xs text-amber-300 hover:underline" onClick={() => void load()}>
          Refresh
        </button>
      </div>
      <ul className="space-y-2 text-sm">
        {rows.length ? (
          rows.map((b) => (
            <li key={b.id} className="rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2">
              <div className="text-xs uppercase text-slate-500">{b.status}</div>
              <div className="text-white">
                {b.role === 'host' ? 'With' : 'With'}{' '}
                <span className="font-medium">{b.role === 'host' ? b.guest.displayName : b.host.displayName}</span>
              </div>
              <div className="text-xs text-slate-400">
                {formatRange(b.startsAt, b.endsAt, tz)}
              </div>
              {b.note ? <div className="text-xs text-slate-500">{b.note}</div> : null}
            </li>
          ))
        ) : (
          <li className="text-slate-500">No reservations yet.</li>
        )}
      </ul>
    </div>
  )
}
