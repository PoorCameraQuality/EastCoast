'use client'

import type { ReactNode } from 'react'
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import {
  extractDancecardShareToken,
  formatRange,
  formatTime,
  groupSlotsByDay,
  toDatetimeLocalValue,
  utcMillisAtZonedWallClock,
  zonedCalendarDateFromUtc,
} from '@/components/dancecard/time'
import type { StaffShift, StaffShiftPerson, StaffShiftRoster } from '@/lib/dancecard/staffSchedule'
import { formatStaffShiftTitle, staffShiftKey } from '@/lib/dancecard/staffSchedule'
import {
  buildDancecardIcs,
  countDancecardIcsEvents,
  downloadIcsFile,
  googleCalendarCreateEventUrl,
  googleCalendarImportHintUrl,
} from '@/lib/dancecard/dancecardIcs'
import { CompareAvailabilityPanel } from '@/components/dancecard/CompareAvailabilityPanel'
import { MutualReserveTogetherModal } from '@/components/dancecard/MutualReserveTogetherModal'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { DancecardTopBar } from '@/components/dancecard/DancecardTopBar'
import { DancecardCompactList } from '@/components/dancecard/DancecardCompactList'
import { roleColor } from '@/lib/dancecard/roleColors'
import { locationColor } from '@/lib/dancecard/locationColors'
import { cn } from '@/lib/cn'

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
  account: { id: string; username: string; displayName: string; isStaff: boolean }
  prefs: {
    bufferMinutes: number
    availabilityStartsAt: string
    availabilityEndsAt: string
    allowCompareByUsername?: boolean
  }
  selections: {
    id: string
    kind: string
    slotId: string | null
    startsAt: string
    endsAt: string
    programTitle?: string | null
    programRoom?: string | null
    programTrack?: string | null
    note?: string | null
  }[]
}

/** Payload from GET /share/:token or POST /compare/by-username (availability + optional mutual gaps). */
type MutualSharePayload = {
  meta: ScheduleMeta | null
  host: { displayName: string; id?: string }
  viewerYou: string | null
  hostFreeGaps: { start: string; end: string }[]
  hostBusy: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
}

type Tab = 'program' | 'dancecard' | 'mutual' | 'reservations'
type ScheduleView = 'simple' | 'venue' | 'grid'

type ReservationRow = {
  id: string
  status: string
  startsAt: string
  endsAt: string
  note: string | null
  role: string
  host: { id: string; displayName: string }
  guest: { id: string; displayName: string }
}

const SHARE_LINK_PRIVACY_BLURB =
  'Anyone with the link only sees free vs busy — not your block titles or private notes.'

const TAB_OPTIONS: Array<{ key: Tab; label: string; blurb: string }> = [
  { key: 'dancecard', label: 'My availability', blurb: 'Block off time, share your code, and export your plans.' },
  {
    key: 'mutual',
    label: 'Compare',
    blurb: 'By login name or share link — shared open windows and reserve.',
  },
  { key: 'reservations', label: 'Reservations', blurb: 'Track confirmed time with other people.' },
]

const VIEW_OPTIONS: Array<{ key: ScheduleView; label: string }> = [
  { key: 'simple', label: 'Timeline' },
  { key: 'venue', label: 'By venue' },
  { key: 'grid', label: 'Grid' },
]

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function shortDayLabel(day: string) {
  return day.split(',')[0]?.trim() ?? day
}

type ProgramPolicyTone = 'amber' | 'rose' | 'sky' | 'violet'
type ProgramPolicy = { key: string; label: string; tone: ProgramPolicyTone }

const PROGRAM_POLICY_RULES: Array<{ key: string; label: string; tone: ProgramPolicyTone; patterns: string[] }> = [
  { key: 'no-late-entry', label: 'No late entry', tone: 'amber', patterns: ['no late entry', 'no-late-entry', 'late entry not allowed'] },
  { key: 'no-reentry', label: 'No re-entry', tone: 'rose', patterns: ['no re-entry', 'no reentry', 're-entry not allowed', 'no ins and outs'] },
  { key: 'hard-start', label: 'Hard start', tone: 'sky', patterns: ['hard start', 'starts promptly', 'arrive early'] },
  { key: 'closed-door', label: 'Closed door', tone: 'violet', patterns: ['closed door', 'doors closed'] },
]

function programPoliciesForSlots(slots: ProgramSlot[]): ProgramPolicy[] {
  const found = new Map<string, ProgramPolicy>()
  for (const slot of slots) {
    const text = `${slot.title} ${slot.description ?? ''}`.toLowerCase()
    for (const rule of PROGRAM_POLICY_RULES) {
      if (rule.patterns.some((p) => text.includes(p))) {
        found.set(rule.key, { key: rule.key, label: rule.label, tone: rule.tone })
      }
    }
  }
  return Array.from(found.values())
}

function policyChipClass(tone: ProgramPolicyTone): string {
  if (tone === 'amber') return 'border-amber-400/35 bg-amber-500/15 text-amber-100'
  if (tone === 'rose') return 'border-rose-400/35 bg-rose-500/15 text-rose-100'
  if (tone === 'sky') return 'border-sky-400/35 bg-sky-500/15 text-sky-100'
  return 'border-violet-400/35 bg-violet-500/15 text-violet-100'
}

type MutualReserveBanner = null | { kind: 'success' } | { kind: 'error'; message: string }

function reservationPartnerName(r: ReservationRow): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

function eventWindowLabel(meta: ScheduleMeta | null) {
  if (!meta) return ''
  const fmt = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: meta.timezone || 'America/New_York',
  })
  return `${fmt.format(new Date(meta.windowStartsAt))} - ${fmt.format(new Date(meta.windowEndsAt))}`
}

function todayLabel(tz: string) {
  const now = new Date()
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: tz,
  }).format(now)
  const date = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: tz,
  }).format(now)
  return `${weekday.toUpperCase()} ${date}`
}

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

const hostMobileDayChipsScrollClass =
  'flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

/** Scrollable day chips (inline in day panel); ref targets the row for IntersectionObserver docking. */
const HostMobileDayChipsRow = forwardRef<
  HTMLDivElement,
  {
    days: { key: string; label: string }[]
    activeKey: string
    onSelect: (key: string) => void
    className?: string
  }
>(function HostMobileDayChipsRow({ days, activeKey, onSelect, className }, ref) {
  if (!days.length) return null
  return (
    <div ref={ref} className={cn(hostMobileDayChipsScrollClass, className)}>
      {days.map((day) => (
        <button
          key={day.key}
          type="button"
          className={cn(
            'shrink-0 touch-manipulation rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100',
            activeKey === day.key
              ? 'border-cyan-300 bg-cyan-100 text-slate-950'
              : 'border-white/12 bg-white/[0.05] text-slate-200 hover:border-white/20'
          )}
          onClick={() => onSelect(day.key)}
        >
          {day.label}
        </button>
      ))}
    </div>
  )
})

/** Fixed day chips for mobile host schedule (minimal + classic dancecard tab). */
function MobileDayStripBar(props: {
  days: { key: string; label: string }[]
  activeKey: string
  onSelect: (key: string) => void
  /** Override bottom offset, e.g. to sit above the tab bar in classic layout. */
  positionClassName?: string
}) {
  const { days, activeKey, onSelect, positionClassName } = props
  if (!days.length) return null
  return (
    <nav
      aria-label="Select schedule day"
      className={cn(
        'fixed inset-x-0 z-[42] border-t border-white/10 bg-[#050b18]/96 shadow-[0_-10px_36px_rgba(2,6,23,0.55)] backdrop-blur-md md:hidden',
        positionClassName ??
          'bottom-0 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5'
      )}
    >
      <HostMobileDayChipsRow
        days={days}
        activeKey={activeKey}
        onSelect={onSelect}
        className="mx-auto max-w-5xl px-2 sm:px-3"
      />
    </nav>
  )
}

export function DancecardClient({ eventSlug }: { eventSlug: string }) {
  const slug = eventSlug.toLowerCase()
  const useMinimalLayout = process.env.NEXT_PUBLIC_DANCECARD_CLASSIC_UI !== '1'
  const entryGateKey = `eck_dc_entry_gate_${slug}`
  const regCodeKey = useMemo(() => `eck_dc_reg_code_${slug}`, [slug])
  const [schedule, setSchedule] = useState<{ meta: ScheduleMeta | null; slots: ProgramSlot[] } | null>(null)
  const [staffRoster, setStaffRoster] = useState<StaffShiftRoster | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>('dancecard')
  const [scheduleView, setScheduleView] = useState<ScheduleView>('simple')
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [trackFilter, setTrackFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [staffUnlockCode, setStaffUnlockCode] = useState('')
  const [staffUnlockBusy, setStaffUnlockBusy] = useState(false)
  const [staffUnlockErr, setStaffUnlockErr] = useState<string | null>(null)
  const [authNotice, setAuthNotice] = useState<null | { kind: 'success' | 'error'; text: string }>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [undoSnapshot, setUndoSnapshot] = useState<null | { previous: MeResponse['selections']; label: string }>(null)
  const [entryGateInput, setEntryGateInput] = useState('')
  const [entryGateErr, setEntryGateErr] = useState<string | null>(null)
  const [entryGateUnlocked, setEntryGateUnlocked] = useState(false)
  const [gateReady, setGateReady] = useState(false)
  const [buffer, setBuffer] = useState(0)
  const [availabilityStart, setAvailabilityStart] = useState('')
  const [availabilityEnd, setAvailabilityEnd] = useState('')
  const [mobileDayKey, setMobileDayKey] = useState('')
  const [mobileHostDayDocked, setMobileHostDayDocked] = useState(false)
  const mobileHostDayChipsRef = useRef<HTMLDivElement | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [editingManualId, setEditingManualId] = useState<string | null>(null)
  const [mStart, setMStart] = useState('')
  const [mEnd, setMEnd] = useState('')
  const [mTitle, setMTitle] = useState('')
  const [mutualToken, setMutualToken] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(`eck_dc_mutual_${slug}`) ?? '' : ''
  )
  const [mutualCompareUsername, setMutualCompareUsername] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(`eck_dc_compare_user_${slug}`) ?? '' : ''
  )
  const [mutualAdvancedTokenOpen, setMutualAdvancedTokenOpen] = useState(false)
  const [mutualData, setMutualData] = useState<MutualSharePayload | null>(null)
  const [reservations, setReservations] = useState<ReservationRow[]>([])
  const [reserveMutualOpen, setReserveMutualOpen] = useState(false)
  const [reserveMutualStart, setReserveMutualStart] = useState('')
  const [reserveMutualEnd, setReserveMutualEnd] = useState('')
  const [reserveMutualNote, setReserveMutualNote] = useState('')
  const [reserveMutualPreview, setReserveMutualPreview] = useState<boolean | null>(null)
  const [reserveMutualBusy, setReserveMutualBusy] = useState(false)
  const [reserveMutualBanner, setReserveMutualBanner] = useState<MutualReserveBanner>(null)
  const saveTimer = useRef<number | null>(null)
  const undoTimerRef = useRef<number | null>(null)
  const selectionsRef = useRef<MeResponse['selections']>([])
  const mutualTokenRef = useRef(mutualToken)

  const tz = schedule?.meta?.timezone ?? 'America/New_York'

  const splitLocalDateTime = useCallback((value: string) => {
    const [date = '', rawTime = ''] = value.split('T')
    return { date, time: rawTime.slice(0, 5) }
  }, [])

  const mergeLocalDateTime = useCallback(
    (current: string, patch: { date?: string; time?: string }) => {
      const cur = splitLocalDateTime(current)
      const nextDate = patch.date ?? cur.date
      const nextTime = patch.time ?? cur.time
      if (!nextDate) return ''
      return `${nextDate}T${nextTime || '00:00'}`
    },
    [splitLocalDateTime]
  )

  const normalizeAvailabilityBounds = useCallback(
    (startInput: string, endInput: string) => {
      const sDate = splitLocalDateTime(startInput).date || startInput.slice(0, 10)
      const eDate = splitLocalDateTime(endInput).date || endInput.slice(0, 10)
      if (!sDate || !eDate) return null
      const startMs = utcMillisAtZonedWallClock(tz, sDate, 0, 0)
      const endBaseMs = utcMillisAtZonedWallClock(tz, eDate, 0, 0)
      if (startMs == null || endBaseMs == null) return null
      const dayMs = 24 * 60 * 60 * 1000
      const start = new Date(startMs)
      const end = new Date(endBaseMs + dayMs)
      if (end <= start) return null
      return {
        startLocal: `${sDate}T00:00`,
        endLocal: `${eDate}T00:00`,
        startIso: start.toISOString(),
        endIso: end.toISOString(),
      }
    },
    [splitLocalDateTime, tz]
  )

  const availabilityStateFromServer = useCallback(
    (startIso: string, endIso: string) => {
      const startMs = Date.parse(startIso)
      const endMs = Date.parse(endIso)
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null
      const startDate = zonedCalendarDateFromUtc(startMs, tz)
      const inclusiveEndDate = zonedCalendarDateFromUtc(endMs - 1, tz)
      return {
        startLocal: `${startDate}T00:00`,
        endLocal: `${inclusiveEndDate}T00:00`,
      }
    },
    [tz]
  )

  const mealPresetOptions = useMemo(
    () => [
      { key: 'breakfast' as const, label: 'Breakfast', startHour: 8, startMinute: 30, endHour: 9, endMinute: 30 },
      { key: 'lunch' as const, label: 'Lunch', startHour: 12, startMinute: 0, endHour: 13, endMinute: 0 },
      { key: 'dinner' as const, label: 'Dinner', startHour: 18, startMinute: 0, endHour: 19, endMinute: 0 },
    ],
    []
  )

  const mealPresetLabel = useCallback((p: { label: string; startHour: number; startMinute: number; endHour: number; endMinute: number }) => {
    const start = new Date(2000, 0, 1, p.startHour, p.startMinute, 0, 0)
    const end = new Date(2000, 0, 1, p.endHour, p.endMinute, 0, 0)
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${p.label} ${fmt.format(start)}-${fmt.format(end)}`
  }, [])

  const localDateKey = useCallback((iso: string) => toDatetimeLocalValue(new Date(iso)).slice(0, 10), [])

  const selectedDayKey = useMemo(
    () => mobileDayKey || splitLocalDateTime(mStart || availabilityStart).date || toDatetimeLocalValue(new Date()).slice(0, 10),
    [mobileDayKey, mStart, availabilityStart, splitLocalDateTime]
  )

  /** Inclusive calendar dates + exclusive end instant for manual busy-time clamping. */
  const manualDateRangeBounds = useMemo(() => {
    const n = normalizeAvailabilityBounds(availabilityStart, availabilityEnd)
    if (!n) return null
    const dateMin = splitLocalDateTime(n.startLocal).date
    const dateMax = splitLocalDateTime(n.endLocal).date
    if (!dateMin || !dateMax) return null
    return {
      dateMin,
      dateMax,
      rangeStartMs: Date.parse(n.startIso),
      rangeEndMs: Date.parse(n.endIso),
    }
  }, [availabilityStart, availabilityEnd, normalizeAvailabilityBounds, splitLocalDateTime])

  useLayoutEffect(() => {
    mutualTokenRef.current = mutualToken
  }, [mutualToken])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem(`eck_dc_onboard_seen_${slug}`) === '1'
    setShowOnboarding(!seen)
  }, [slug])

  useEffect(
    () => () => {
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    },
    []
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (entryGateUnlocked) window.sessionStorage.setItem(entryGateKey, 'ok')
  }, [entryGateKey, entryGateUnlocked])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const g = await dancecardFetch<{ requiresRegistrationCode: boolean }>(slug, '/gate')
        if (cancelled) return
        if (!g.requiresRegistrationCode) {
          setEntryGateUnlocked(true)
        } else if (typeof window !== 'undefined') {
          const ok = window.sessionStorage.getItem(entryGateKey) === 'ok'
          const code = window.sessionStorage.getItem(regCodeKey)
          if (ok && code) setEntryGateUnlocked(true)
        }
      } catch {
        if (!cancelled) setEntryGateUnlocked(true)
      } finally {
        if (!cancelled) setGateReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, entryGateKey, regCodeKey])

  const loadSchedule = useCallback(async () => {
    try {
      const s = await dancecardFetch<{ meta: ScheduleMeta | null; slots: ProgramSlot[] }>(slug, '/schedule')
      setSchedule(s)
      setLoadErr(null)
    } catch (e) {
      setLoadErr(e instanceof DancecardApiError ? e.body : 'Could not load schedule')
    }
  }, [slug])

  const loadStaffRoster = useCallback(async () => {
    try {
      const roster = await dancecardFetch<StaffShiftRoster>(slug, '/staff')
      if (roster?.people?.length) setStaffRoster(roster)
      else setStaffRoster(null)
    } catch {
      setStaffRoster(null)
    }
  }, [slug])

  const checkSession = useCallback(async () => {
    try {
      const m = await dancecardFetch<MeResponse>(slug, '/me')
      setMe({
        ...m,
        account: { ...m.account, isStaff: Boolean(m.account.isStaff) },
      })
      setBuffer(m.prefs.bufferMinutes)
      const fromServer = availabilityStateFromServer(m.prefs.availabilityStartsAt, m.prefs.availabilityEndsAt)
      if (fromServer) {
        setAvailabilityStart(fromServer.startLocal)
        setAvailabilityEnd(fromServer.endLocal)
      } else {
        setAvailabilityStart(toDatetimeLocalValue(new Date(m.prefs.availabilityStartsAt)))
        setAvailabilityEnd(toDatetimeLocalValue(new Date(m.prefs.availabilityEndsAt)))
      }
    } catch {
      setMe(null)
    } finally {
      setAuthChecked(true)
    }
  }, [slug, availabilityStateFromServer])

  useEffect(() => {
    void loadSchedule()
  }, [loadSchedule])

  useEffect(() => {
    if (me?.account.isStaff) void loadStaffRoster()
    else setStaffRoster(null)
  }, [me?.account.isStaff, loadStaffRoster])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  // Before paint so selectionsRef is never stale when the user taps buffer (useEffect ran too late).
  useLayoutEffect(() => {
    selectionsRef.current = me?.selections ?? []
  }, [me])

  useEffect(() => {
    if (typeof window === 'undefined' || !staffRoster) return
    const saved = window.localStorage.getItem(`eck_dc_staff_${slug}`) ?? ''
    setSelectedStaffName(saved)
  }, [slug, staffRoster])

  useEffect(() => {
    if (typeof window === 'undefined' || !staffRoster) return
    window.localStorage.setItem(`eck_dc_staff_${slug}`, selectedStaffName)
  }, [selectedStaffName, slug, staffRoster])

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

  const selectedProgramCount = useMemo(
    () => (me?.selections ?? []).filter((s) => s.kind === 'program').length,
    [me]
  )

  const manualSelectionCount = useMemo(
    () => (me?.selections ?? []).filter((s) => s.kind === 'manual').length,
    [me]
  )

  const calendarExportCount = useMemo(
    () => (me ? countDancecardIcsEvents(me.selections ?? [], reservations) : 0),
    [me, reservations]
  )

  type NextAgendaItem =
    | { type: 'selection'; selection: MeResponse['selections'][number] }
    | { type: 'reservation'; reservation: ReservationRow }

  const nextAgendaItem = useMemo(() => {
    const now = Date.now()
    const cands: NextAgendaItem[] = []
    for (const s of me?.selections ?? []) {
      if (new Date(s.endsAt).getTime() >= now) cands.push({ type: 'selection', selection: s })
    }
    for (const r of reservations) {
      if (new Date(r.endsAt).getTime() >= now) cands.push({ type: 'reservation', reservation: r })
    }
    cands.sort(
      (a, b) =>
        new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
        new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
    )
    return cands[0] ?? null
  }, [me, reservations])

  type DancecardAgendaRow =
    | { type: 'selection'; selection: MeResponse['selections'][number] }
    | { type: 'reservation'; reservation: ReservationRow }

  const dancecardGrouped = useMemo(() => {
    const rows: DancecardAgendaRow[] = []
    for (const selection of me?.selections ?? []) {
      rows.push({ type: 'selection', selection })
    }
    for (const reservation of reservations) {
      rows.push({ type: 'reservation', reservation })
    }
    const map = new Map<string, DancecardAgendaRow[]>()
    for (const row of rows) {
      const startsAt = row.type === 'selection' ? row.selection.startsAt : row.reservation.startsAt
      const key = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: tz,
      }).format(new Date(startsAt))
      const arr = map.get(key) ?? []
      arr.push(row)
      map.set(key, arr)
    }
    return Array.from(map.entries()).map(([day, items]) => ({
      day,
      items: items.sort(
        (a, b) =>
          new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
          new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
      ),
    }))
  }, [me, reservations, tz])

  const dancecardFlat = useMemo(
    () =>
      [...dancecardGrouped.flatMap((g) => g.items)].sort(
        (a, b) =>
          new Date(a.type === 'selection' ? a.selection.startsAt : a.reservation.startsAt).getTime() -
          new Date(b.type === 'selection' ? b.selection.startsAt : b.reservation.startsAt).getTime()
      ),
    [dancecardGrouped]
  )

  const availabilityHourRows = useMemo(() => {
    const normalized = normalizeAvailabilityBounds(availabilityStart, availabilityEnd)
    if (!normalized) return [] as Array<{ start: Date; end: Date; busy: boolean; title: string }>
    const startMs = Date.parse(normalized.startIso)
    const endMs = Date.parse(normalized.endIso)
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return []
    const hostClaims = reservations.filter((r) => r.role === 'host')
    const bufferMs = Math.max(0, buffer) * 60 * 1000
    const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd
    const rows: Array<{ start: Date; end: Date; busy: boolean; title: string }> = []
    for (let t = startMs; t < endMs; t += 60 * 60 * 1000) {
      const slotStart = new Date(t)
      const slotEnd = new Date(Math.min(t + 60 * 60 * 1000, endMs))
      const slotStartMs = slotStart.getTime()
      const slotEndMs = slotEnd.getTime()
      const covering = (me?.selections ?? []).find((s) => {
        const sStart = Date.parse(s.startsAt)
        const sEnd = Date.parse(s.endsAt)
        return overlaps(sStart - bufferMs, sEnd + bufferMs, slotStartMs, slotEndMs)
      })
      const coveringClaim = hostClaims.find((r) => {
        const rStart = Date.parse(r.startsAt)
        const rEnd = Date.parse(r.endsAt)
        return overlaps(rStart - bufferMs, rEnd + bufferMs, slotStartMs, slotEndMs)
      })
      const isBusy = Boolean(covering || coveringClaim)
      const claimTitle = coveringClaim ? `Claimed by ${coveringClaim.guest.displayName}` : null
      rows.push({
        start: slotStart,
        end: slotEnd,
        busy: isBusy,
        title: covering?.note?.trim() || claimTitle || (isBusy ? 'Busy' : 'Open'),
      })
    }
    return rows
  }, [availabilityStart, availabilityEnd, me?.selections, reservations, buffer, normalizeAvailabilityBounds])

  const manualSelections = useMemo(
    () =>
      (me?.selections ?? [])
        .filter((s) => s.kind === 'manual')
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)),
    [me?.selections]
  )

  const manualDraftSummary = useMemo(() => {
    if (!mStart || !mEnd) return null
    const s = new Date(mStart)
    const e = new Date(mEnd)
    if (!Number.isFinite(s.getTime()) || !Number.isFinite(e.getTime()) || e <= s) return null
    const hours = (e.getTime() - s.getTime()) / 36e5
    const days = new Set([splitLocalDateTime(mStart).date, splitLocalDateTime(mEnd).date]).size
    return { hours, days }
  }, [mStart, mEnd, splitLocalDateTime])

  const upcomingHostClaims = useMemo(
    () =>
      reservations
        .filter((r) => r.role === 'host')
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .slice(0, 6),
    [reservations]
  )

  const availabilityDays = useMemo(() => {
    const map = new Map<string, typeof availabilityHourRows>()
    for (const row of availabilityHourRows) {
      const key = zonedCalendarDateFromUtc(row.start.getTime(), tz)
      const arr = map.get(key) ?? []
      arr.push(row)
      map.set(key, arr)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, rows]) => {
        const labelAnchorMs = utcMillisAtZonedWallClock(tz, key, 12, 0) ?? Date.parse(`${key}T12:00:00Z`)
        return {
          key,
          label: new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: tz,
          }).format(new Date(labelAnchorMs)),
          rows,
        }
      })
  }, [availabilityHourRows, tz])

  const desktopDayGroups = useMemo(
    () =>
      availabilityDays.map((day) => ({
        ...day,
        openCount: day.rows.filter((r) => !r.busy).length,
        busyCount: day.rows.filter((r) => r.busy).length,
      })),
    [availabilityDays]
  )

  const availabilityDaysKeySig = useMemo(
    () => availabilityDays.map((d) => d.key).join(','),
    [availabilityDays]
  )

  const availabilityDaysRef = useRef(availabilityDays)
  availabilityDaysRef.current = availabilityDays

  /** Label + rows for the mobile day schedule (times are wall-clock only; label makes day switches obvious). */
  const mobileSchedulePanel = useMemo(() => {
    const d = availabilityDays.find((x) => x.key === mobileDayKey)
    return { label: d?.label ?? null, rows: d?.rows ?? [] }
  }, [availabilityDays, mobileDayKey])

  useEffect(() => {
    const days = availabilityDaysRef.current
    if (!days.length) {
      if (mobileDayKey) setMobileDayKey('')
      return
    }
    if (days.some((d) => d.key === mobileDayKey)) return
    setMobileDayKey(days[0]!.key)
  }, [availabilityDaysKeySig, availabilityDays.length, mobileDayKey])

  useEffect(() => {
    const hostDaysInDom = tab === 'dancecard'
    if (!hostDaysInDom || !availabilityDays.length) {
      setMobileHostDayDocked(false)
      return
    }
    const el = mobileHostDayChipsRef.current
    if (!el) {
      setMobileHostDayDocked(false)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setMobileHostDayDocked(!entry.isIntersecting)
      },
      { root: null, threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [availabilityDaysKeySig, availabilityDays.length, tab])

  const mutualAvailabilityDays = useMemo(
    () => (schedule ? dayRangesFromSchedule(schedule.slots, schedule.meta, tz, shortDayLabel) : []),
    [schedule, tz]
  )

  const mutualStripDays = useMemo(() => {
    if (mutualAvailabilityDays.length) return mutualAvailabilityDays
    if (!schedule?.meta) return []
    const s = Date.parse(schedule.meta.windowStartsAt)
    const e = Date.parse(schedule.meta.windowEndsAt)
    if (!(e > s)) return []
    return [{ label: 'Event', startMs: s, endMs: e }]
  }, [mutualAvailabilityDays, schedule])

  const mutualPlayableWindow = useMemo(() => {
    if (!schedule?.meta) return null
    let startMs = Date.parse(schedule.meta.windowStartsAt)
    let endMs = Date.parse(schedule.meta.windowEndsAt)
    if (!(endMs > startMs)) return null

    // PAF26 requested playable hours: Thu 10:00 AM → Mon 4:00 AM.
    if (slug === 'paf26' && mutualStripDays.length) {
      const firstYmd = zonedCalendarDateFromUtc(mutualStripDays[0].startMs, tz)
      const lastYmd = zonedCalendarDateFromUtc(mutualStripDays[mutualStripDays.length - 1].startMs, tz)
      const pafStart = utcMillisAtZonedWallClock(tz, firstYmd, 10, 0)
      const pafEnd = utcMillisAtZonedWallClock(tz, lastYmd, 4, 0)
      if (pafStart != null) startMs = pafStart
      if (pafEnd != null) endMs = pafEnd
    }
    return endMs > startMs ? { startMs, endMs } : null
  }, [schedule, slug, mutualStripDays, tz])

  const staffPeople = useMemo(() => staffRoster?.people ?? [], [staffRoster])
  const selectedStaffEntry = useMemo(
    () => staffPeople.find((person) => person.name === selectedStaffName) ?? null,
    [staffPeople, selectedStaffName]
  )

  const loadReservations = useCallback(async () => {
    try {
      const r = await dancecardFetch<{ reservations: ReservationRow[] }>(slug, '/reservations')
      setReservations((r.reservations ?? []).filter((x) => x.status === 'confirmed'))
    } catch {
      setReservations([])
    }
  }, [slug])

  const refreshMe = useCallback(async () => {
    const m = await dancecardFetch<MeResponse>(slug, '/me')
    setMe({
      ...m,
      account: { ...m.account, isStaff: Boolean(m.account.isStaff) },
    })
    setBuffer(m.prefs.bufferMinutes)
    const fromServer = availabilityStateFromServer(m.prefs.availabilityStartsAt, m.prefs.availabilityEndsAt)
    if (fromServer) {
      setAvailabilityStart(fromServer.startLocal)
      setAvailabilityEnd(fromServer.endLocal)
    } else {
      setAvailabilityStart(toDatetimeLocalValue(new Date(m.prefs.availabilityStartsAt)))
      setAvailabilityEnd(toDatetimeLocalValue(new Date(m.prefs.availabilityEndsAt)))
    }
    void loadReservations()
  }, [slug, loadReservations, availabilityStateFromServer])

  useEffect(() => {
    if (!me) {
      setReservations([])
      return
    }
    void loadReservations()
  }, [me, loadReservations])

  const persist = useCallback(
    async (
      nextSelections: MeResponse['selections'],
      nextBuffer: number,
      nextAvailabilityStart: string,
      nextAvailabilityEnd: string
    ) => {
      setSaving(true)
      try {
        if (!nextAvailabilityStart || !nextAvailabilityEnd) throw new Error('Set availability range first.')
        const normalized = normalizeAvailabilityBounds(nextAvailabilityStart, nextAvailabilityEnd)
        if (!normalized) throw new Error('Availability range is invalid.')
        await dancecardFetch(slug, '/dancecard', {
          method: 'PUT',
          body: JSON.stringify({
            bufferMinutes: nextBuffer,
            availabilityStartsAt: normalized.startIso,
            availabilityEndsAt: normalized.endIso,
            selections: nextSelections.map((s) => ({
              kind: s.kind,
              slotId: s.slotId ?? undefined,
              startsAt: s.startsAt,
              endsAt: s.endsAt,
              note: s.note?.trim() ? s.note.trim().slice(0, 1000) : undefined,
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
    [slug, refreshMe, normalizeAvailabilityBounds]
  )

  const queueSave = useCallback(
    (nextSelections: MeResponse['selections'], nextBuffer: number) => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
      saveTimer.current = window.setTimeout(() => {
        void persist(nextSelections, nextBuffer, availabilityStart, availabilityEnd)
      }, 450)
    },
    [persist, availabilityStart, availabilityEnd]
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
          note: null,
        },
      ]
    }
    setMe((m) => (m ? { ...m, selections: next } : m))
    queueSave(next, buffer)
  }

  async function persistWithUndo(next: MeResponse['selections'], previous: MeResponse['selections'], label: string) {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setUndoSnapshot({ previous, label })
    undoTimerRef.current = window.setTimeout(() => setUndoSnapshot(null), 10000)
    setMe((m) => (m ? { ...m, selections: next } : m))
    await persist(next, buffer, availabilityStart, availabilityEnd)
  }

  async function undoLastSelectionChange() {
    if (!undoSnapshot) return
    const previous = undoSnapshot.previous
    setUndoSnapshot(null)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setMe((m) => (m ? { ...m, selections: previous } : m))
    await persist(previous, buffer, availabilityStart, availabilityEnd)
    setToast('Undid last change.')
  }

  async function removeSelection(id: string) {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => s.id !== id)
    if (next.length === cur.length) return
    await persistWithUndo(next, cur, 'Removed unavailable time.')
    setToast('Removed unavailable time. Undo?')
  }

  async function cancelReservation(reservationId: string) {
    if (!window.confirm('Cancel this reservation? The time will become available again.')) return
    try {
      await dancecardFetch(slug, '/reservations', {
        method: 'PATCH',
        body: JSON.stringify({ reservationId }),
      })
      setToast('Reservation cancelled.')
      void loadReservations()
    } catch (e) {
      setToast(formatDancecardApiMessage(e))
    }
  }

  function applyBuffer(next: number) {
    setBuffer(next)
    setMe((m) =>
      m
        ? {
            ...m,
            prefs: {
              ...m.prefs,
              bufferMinutes: next,
            },
          }
        : m
    )
    queueSave(selectionsRef.current, next)
  }

  async function saveAvailabilityRange() {
    const normalized = normalizeAvailabilityBounds(availabilityStart, availabilityEnd)
    if (!normalized) {
      setToast('Set both start and end.')
      return
    }
    setAvailabilityStart(normalized.startLocal)
    setAvailabilityEnd(normalized.endLocal)
    await persist(selectionsRef.current, buffer, normalized.startLocal, normalized.endLocal)
  }

  function closeManualModal() {
    setManualOpen(false)
    setEditingManualId(null)
    setMStart('')
    setMEnd('')
    setMTitle('')
  }

  function openManualFromOpenSlot(row: { start: Date; end: Date; busy: boolean }) {
    if (row.busy) return
    setEditingManualId(null)
    setMStart(toDatetimeLocalValue(row.start))
    setMEnd(toDatetimeLocalValue(row.end))
    setMTitle('')
    setMobileDayKey(zonedCalendarDateFromUtc(row.start.getTime(), tz))
    setManualOpen(true)
  }

  function beginManualEdit(selectionId: string) {
    const selection = (me?.selections ?? []).find((s) => s.id === selectionId && s.kind === 'manual')
    if (!selection) return
    setEditingManualId(selection.id)
    setMStart(toDatetimeLocalValue(new Date(selection.startsAt)))
    setMEnd(toDatetimeLocalValue(new Date(selection.endsAt)))
    setMTitle(selection.note ?? '')
    setManualOpen(true)
  }

  async function submitManualBlock() {
    if (!mStart || !mEnd) {
      setToast('Set both start and end for unavailable time.')
      return
    }
    if (new Date(mEnd).getTime() <= new Date(mStart).getTime()) {
      setToast('Unavailable end must be after start.')
      return
    }
    if (manualDateRangeBounds) {
      const sMs = new Date(mStart).getTime()
      const eMs = new Date(mEnd).getTime()
      if (
        !Number.isFinite(sMs) ||
        !Number.isFinite(eMs) ||
        sMs < manualDateRangeBounds.rangeStartMs ||
        eMs > manualDateRangeBounds.rangeEndMs
      ) {
        setToast('Unavailable time must stay within your saved date range.')
        return
      }
    }
    const cur = me?.selections ?? []
    const startsAt = new Date(mStart).toISOString()
    const endsAt = new Date(mEnd).toISOString()
    const note = mTitle.trim() ? mTitle.trim().slice(0, 1000) : null
    const isEditing = Boolean(editingManualId)
    const provisional = isEditing
      ? cur.map((s) =>
          s.id === editingManualId && s.kind === 'manual'
            ? { ...s, startsAt, endsAt, note }
            : s
        )
      : [
          ...cur,
          {
            id: crypto.randomUUID(),
            kind: 'manual',
            slotId: null,
            startsAt,
            endsAt,
            note,
          },
        ]

    const candidate = provisional.find((s) => (isEditing ? s.id === editingManualId : s.id !== undefined && s.startsAt === startsAt && s.endsAt === endsAt && s.note === note))
    const candidateId = candidate?.id ?? editingManualId
    let merged = false
    let next = provisional
    if (candidateId) {
      const candidateSelection = provisional.find((s) => s.id === candidateId && s.kind === 'manual')
      if (candidateSelection) {
        const cStart = Date.parse(candidateSelection.startsAt)
        const cEnd = Date.parse(candidateSelection.endsAt)
        const overlaps = provisional.filter((s) => {
          if (s.kind !== 'manual' || s.id === candidateId) return false
          const sStart = Date.parse(s.startsAt)
          const sEnd = Date.parse(s.endsAt)
          return cStart < sEnd && sStart < cEnd
        })
        if (overlaps.length) {
          merged = true
          const mergedStart = Math.min(cStart, ...overlaps.map((s) => Date.parse(s.startsAt)))
          const mergedEnd = Math.max(cEnd, ...overlaps.map((s) => Date.parse(s.endsAt)))
          const overlapIds = new Set(overlaps.map((s) => s.id))
          next = provisional
            .filter((s) => !overlapIds.has(s.id))
            .map((s) =>
              s.id === candidateId && s.kind === 'manual'
                ? { ...s, startsAt: new Date(mergedStart).toISOString(), endsAt: new Date(mergedEnd).toISOString() }
                : s
            )
        }
      }
    }
    closeManualModal()
    await persist(next, buffer, availabilityStart, availabilityEnd)
    setToast(
      merged
        ? 'Updated unavailable time. Overlapping blocks were merged automatically.'
        : isEditing
          ? 'Updated unavailable time.'
          : 'Added unavailable time.'
    )
  }

  function applyManualPreset(presetKey: 'breakfast' | 'lunch' | 'dinner') {
    const preset = mealPresetOptions.find((p) => p.key === presetKey)
    if (!preset) {
      setToast('That preset is not in this event schedule.')
      return
    }
    const anchor = (() => {
      const candidate = mStart || availabilityStart
      if (!candidate) return new Date()
      const parsed = new Date(candidate)
      return Number.isFinite(parsed.getTime()) ? parsed : new Date()
    })()

    const makeLocal = (hour: number, minute: number, plusDays = 0) =>
      new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + plusDays, hour, minute, 0, 0)
    const start = makeLocal(preset.startHour, preset.startMinute)
    const wrapsNextDay =
      preset.endHour < preset.startHour ||
      (preset.endHour === preset.startHour && preset.endMinute <= preset.startMinute)
    const end = makeLocal(preset.endHour, preset.endMinute, wrapsNextDay ? 1 : 0)
    setMTitle(`Unavailable: ${preset.key}`)
    setMStart(toDatetimeLocalValue(start))
    setMEnd(toDatetimeLocalValue(end))
  }

  async function addDailyPresetAcrossAvailability(presetKey: 'breakfast' | 'lunch' | 'dinner') {
    const preset = mealPresetOptions.find((p) => p.key === presetKey)
    if (!preset) {
      setToast('That preset is not in this event schedule.')
      return
    }
    if (!availabilityStart || !availabilityEnd) {
      setToast('Set and save your date range first.')
      return
    }
    const rangeStart = new Date(availabilityStart)
    const rangeEnd = new Date(availabilityEnd)
    if (!Number.isFinite(rangeStart.getTime()) || !Number.isFinite(rangeEnd.getTime()) || rangeEnd <= rangeStart) {
      setToast('Your date range is invalid.')
      return
    }

    const current = me?.selections ?? []
    const dedupe = new Set(current.map((s) => `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`))
    const next = [...current]
    const startDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate())
    const endLimit = rangeEnd.getTime()

    for (let d = new Date(startDay); d.getTime() < endLimit; d.setDate(d.getDate() + 1)) {
      const blockStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), preset.startHour, preset.startMinute, 0, 0)
      const wrapsNextDay =
        preset.endHour < preset.startHour ||
        (preset.endHour === preset.startHour && preset.endMinute <= preset.startMinute)
      const blockEnd = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate() + (wrapsNextDay ? 1 : 0),
        preset.endHour,
        preset.endMinute,
        0,
        0
      )
      if (blockEnd <= rangeStart || blockStart >= rangeEnd) continue
      const clippedStart = blockStart < rangeStart ? rangeStart : blockStart
      const clippedEnd = blockEnd > rangeEnd ? rangeEnd : blockEnd
      if (clippedEnd <= clippedStart) continue
      const startsAt = clippedStart.toISOString()
      const endsAt = clippedEnd.toISOString()
      const note = `Unavailable: ${preset.key}`
      const key = `manual|${startsAt}|${endsAt}|${note}`
      if (dedupe.has(key)) continue
      dedupe.add(key)
      next.push({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt,
        endsAt,
        note,
      })
    }

    if (next.length === current.length) {
      setToast(`${preset.label} blocks already exist for this range.`)
      return
    }
    await persistWithUndo(next, current, `Added ${preset.key} to every event day.`)
    closeManualModal()
    setToast(`Added ${preset.key} to every event day.`)
  }

  async function clearMealPresetsAcrossAvailability() {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => !(s.kind === 'manual' && /^Unavailable: (breakfast|lunch|dinner)$/i.test(s.note ?? '')))
    if (next.length === cur.length) {
      setToast('No meal presets to clear.')
      return
    }
    await persistWithUndo(next, cur, 'Cleared meal presets.')
    setToast('Cleared meal presets. Undo?')
  }

  async function clearUnavailableForSelectedDay() {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => !(s.kind === 'manual' && localDateKey(s.startsAt) === selectedDayKey))
    if (next.length === cur.length) {
      setToast('No unavailable times found for that day.')
      return
    }
    await persistWithUndo(next, cur, `Cleared unavailable times for ${selectedDayKey}.`)
    setToast(`Cleared unavailable times for ${selectedDayKey}. Undo?`)
  }

  async function duplicateYesterdayToSelectedDay() {
    const cur = me?.selections ?? []
    const dayStart = new Date(`${selectedDayKey}T00:00`)
    if (!Number.isFinite(dayStart.getTime())) {
      setToast('Could not determine target day.')
      return
    }
    const prevDay = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000)
    const prevKey = toDatetimeLocalValue(prevDay).slice(0, 10)
    const source = cur.filter((s) => s.kind === 'manual' && localDateKey(s.startsAt) === prevKey)
    if (!source.length) {
      setToast('No unavailable times found yesterday to duplicate.')
      return
    }
    const dedupe = new Set(cur.map((s) => `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`))
    const shifted = source
      .map((s) => ({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: new Date(Date.parse(s.startsAt) + 24 * 60 * 60 * 1000).toISOString(),
        endsAt: new Date(Date.parse(s.endsAt) + 24 * 60 * 60 * 1000).toISOString(),
        note: s.note ?? null,
      }))
      .filter((s) => {
        const key = `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`
        if (dedupe.has(key)) return false
        dedupe.add(key)
        return true
      })
    if (!shifted.length) {
      setToast('Those unavailable times are already on this day.')
      return
    }
    const next = [...cur, ...shifted]
    await persistWithUndo(next, cur, 'Duplicated yesterday unavailable times.')
    setToast(`Copied ${shifted.length} unavailable time(s) to ${selectedDayKey}. Undo?`)
  }

  async function copyShare() {
    try {
      const res = await dancecardFetch<{ token: string; url?: string }>(slug, '/share', { method: 'POST' })
      const token = res.token.trim()
      const shareUrl = res.url?.trim()
        ? res.url.trim()
        : `${window.location.origin.replace(/\/+$/, '')}/dancecard/${encodeURIComponent(slug)}/s/${encodeURIComponent(token)}`
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setToast('Copied share link.')
      } else {
        window.prompt('Copy this share link:', shareUrl)
        setToast('Share link generated. Copy it from the prompt.')
      }
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, token)
      setMutualToken(token)
      setMutualCompareUsername('')
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
        } catch {
          /* ignore */
        }
      }
    } catch {
      setToast('Could not create share link.')
    }
  }

  function exportDancecardCalendar(target: 'ical' | 'google') {
    if (!me) return
    const n = countDancecardIcsEvents(me.selections ?? [], reservations)
    if (n === 0) {
      setToast('Add busy blocks or reservations to export your availability.')
      return
    }
    const eventTitle = schedule?.meta?.eventTitle ?? slug
    const body = buildDancecardIcs({
      calendarName: `${eventTitle} — availability`,
      attendeeDisplayName: me.account.displayName,
      selections: me.selections ?? [],
      reservations,
    })
    downloadIcsFile(`${slug}-availability.ics`, body)
    if (target === 'google') {
      window.open(googleCalendarImportHintUrl(), '_blank', 'noopener,noreferrer')
      setToast('Download started. In Google Calendar use Settings → Import (help opened in a new tab).')
    } else {
      setToast('Downloaded .ics file — open it in Apple Calendar, Outlook, or another calendar app.')
    }
  }

  const refreshMutual = useCallback(async (opts?: { mode?: 'username' | 'token' }) => {
    const forceToken = opts?.mode === 'token'
    const username = forceToken ? '' : mutualCompareUsername.trim().toLowerCase()
    if (username) {
      try {
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.setItem(`eck_dc_compare_user_${slug}`, username)
          } catch {
            /* ignore */
          }
        }
        const d = await dancecardFetch<MutualSharePayload>(slug, '/compare/by-username', {
          method: 'POST',
          body: JSON.stringify({ username }),
        })
        setMutualData(d)
        setMutualToken('')
        mutualTokenRef.current = ''
      } catch {
        setMutualData(null)
        setToast('Compare not available for that username.')
      }
      return
    }
    const raw = mutualTokenRef.current.trim()
    if (!raw) {
      setMutualData(null)
      return
    }
    if (forceToken) {
      setMutualCompareUsername('')
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
        } catch {
          /* ignore */
        }
      }
    }
    const clean = extractDancecardShareToken(raw)
    try {
      sessionStorage.setItem(`eck_dc_mutual_${slug}`, clean)
      const d = await dancecardFetch<MutualSharePayload>(
        slug,
        `/share/${encodeURIComponent(clean)}`
      )
      setMutualData(d)
      if (clean !== raw) setMutualToken(clean)
      setMutualCompareUsername('')
      if (typeof window !== 'undefined') {
        try {
          window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
        } catch {
          /* ignore */
        }
      }
    } catch {
      setMutualData(null)
      setToast('Could not load share preview.')
    }
  }, [slug, mutualCompareUsername])

  const copyMutualReservationSummary = useCallback(async () => {
    const host = mutualData?.host.displayName ?? 'Host'
    const you = me?.account.displayName ?? 'You'
    const sMs = new Date(reserveMutualStart).getTime()
    const eMs = new Date(reserveMutualEnd).getTime()
    if (!Number.isFinite(sMs) || !Number.isFinite(eMs) || eMs <= sMs) {
      setToast('Could not build summary — times are missing.')
      return
    }
    const range = formatRange(new Date(sMs).toISOString(), new Date(eMs).toISOString(), tz)
    const eventTitle = schedule?.meta?.eventTitle ?? slug
    const lines = [`Dancecard reservation — ${eventTitle}`, `Host: ${host}`, `You: ${you}`, `Time: ${range} (${tz})`]
    const note = reserveMutualNote.trim()
    if (note) lines.push(`Note: ${note}`)
    const text = lines.join('\n')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setToast('Copied summary — paste into Discord, Signal, or a text.')
      } else {
        window.prompt('Copy this text:', text)
      }
    } catch {
      setToast('Could not copy — select and copy manually.')
    }
  }, [
    me?.account.displayName,
    mutualData?.host.displayName,
    reserveMutualEnd,
    reserveMutualNote,
    reserveMutualStart,
    schedule?.meta?.eventTitle,
    slug,
    tz,
  ])

  const openMutualReserveInGoogleCalendar = useCallback(() => {
    const host = mutualData?.host.displayName ?? 'Host'
    const you = me?.account.displayName ?? 'You'
    const s = new Date(reserveMutualStart)
    const e = new Date(reserveMutualEnd)
    const calTitle = `Dancecard: ${schedule?.meta?.eventTitle ?? slug} (${host})`
    const details = [`Reservation with ${host}`, `You: ${you}`, `Times (${tz}): ${formatRange(s.toISOString(), e.toISOString(), tz)}`, reserveMutualNote.trim() ? `Note: ${reserveMutualNote.trim()}` : null]
      .filter(Boolean)
      .join('\n')
    const url = googleCalendarCreateEventUrl({ title: calTitle, details, start: s, end: e })
    if (!url) {
      setToast('Could not open Google Calendar — check start and end times.')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [
    me?.account.displayName,
    mutualData?.host.displayName,
    reserveMutualEnd,
    reserveMutualNote,
    reserveMutualStart,
    schedule?.meta?.eventTitle,
    slug,
    tz,
  ])

  const openMutualReserveFromStep = useCallback((startMs: number, endMs: number) => {
    setReserveMutualStart(toDatetimeLocalValue(new Date(startMs)))
    setReserveMutualEnd(toDatetimeLocalValue(new Date(endMs)))
    setReserveMutualNote('')
    setReserveMutualPreview(null)
    setReserveMutualBanner(null)
    setReserveMutualOpen(true)
  }, [])

  /** Always wired when mutual data is shown so green slots stay clickable; explains when reserve is not available yet. */
  const onMutualStripSlotClick = useCallback(
    (startMs: number, endMs: number) => {
      if (!me) {
        setToast('Sign in to request a mutual reservation.')
        return
      }
      if (!mutualData?.viewerYou) {
        setToast(
          'Green here is the host’s free time only. Use an account that isn’t the host, then tap Compare (username) or Load under Advanced — green is when you’re both free and you can reserve.'
        )
        return
      }
      openMutualReserveFromStep(startMs, endMs)
    },
    [me, mutualData?.viewerYou, openMutualReserveFromStep]
  )

  async function runMutualReservePreview() {
    setReserveMutualBanner(null)
    if (!reserveMutualStart || !reserveMutualEnd) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Set start and end times first — tap a green half-hour on the strips below.',
      })
      return
    }
    const hostUser = mutualCompareUsername.trim().toLowerCase()
    const tok = extractDancecardShareToken(mutualToken).trim()
    if (!hostUser && !tok) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Compare with someone first — enter their login name and Compare, or use a share link under Advanced.',
      })
      return
    }
    setReserveMutualBusy(true)
    try {
      const p = await dancecardFetch<{ ok: boolean }>(slug, '/preview', {
        method: 'POST',
        body: JSON.stringify({
          ...(hostUser ? { hostUsername: hostUser } : { shareToken: tok }),
          startsAt: new Date(reserveMutualStart).toISOString(),
          endsAt: new Date(reserveMutualEnd).toISOString(),
          note: reserveMutualNote.trim() || undefined,
        }),
      })
      setReserveMutualPreview(p.ok)
    } catch (e) {
      setReserveMutualPreview(false)
      const msg = formatDancecardApiMessage(e)
      setReserveMutualBanner({ kind: 'error', message: msg })
      setToast(msg)
    } finally {
      setReserveMutualBusy(false)
    }
  }

  async function submitMutualReserve() {
    setReserveMutualBanner(null)
    if (!reserveMutualStart || !reserveMutualEnd) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Set start and end times — tap a green half-hour on the strips below to fill this form.',
      })
      return
    }
    const sMs = new Date(reserveMutualStart).getTime()
    const eMs = new Date(reserveMutualEnd).getTime()
    if (!Number.isFinite(sMs) || !Number.isFinite(eMs) || eMs <= sMs) {
      setReserveMutualBanner({ kind: 'error', message: 'End time must be after start time.' })
      return
    }
    const hostUser = mutualCompareUsername.trim().toLowerCase()
    const tok = extractDancecardShareToken(mutualToken).trim()
    if (!hostUser && !tok) {
      setReserveMutualBanner({
        kind: 'error',
        message: 'Compare with someone first — enter their login name and Compare, or use a share link under Advanced.',
      })
      return
    }
    setReserveMutualBusy(true)
    try {
      await dancecardFetch(slug, '/reserve', {
        method: 'POST',
        body: JSON.stringify({
          ...(hostUser ? { hostUsername: hostUser } : { shareToken: tok }),
          startsAt: new Date(reserveMutualStart).toISOString(),
          endsAt: new Date(reserveMutualEnd).toISOString(),
          note: reserveMutualNote.trim() || undefined,
        }),
      })
      setReserveMutualPreview(null)
      setReserveMutualBanner({ kind: 'success' })
      setToast('Reservation saved — see the confirmation below.')
      void loadReservations()
      void refreshMutual()
      void refreshMe()
    } catch (e) {
      const msg = formatDancecardApiMessage(e)
      setReserveMutualBanner({ kind: 'error', message: msg })
      setToast(msg)
    } finally {
      setReserveMutualBusy(false)
    }
  }

  useEffect(() => {
    if (tab !== 'mutual') return
    if (mutualCompareUsername.trim()) {
      void refreshMutual()
      return
    }
    if (mutualTokenRef.current.trim()) void refreshMutual()
  }, [tab, refreshMutual, mutualCompareUsername])

  // After sign-in, mutual share payload must reload so `viewerYou` + green blocks get click handlers.
  useEffect(() => {
    if (tab !== 'mutual' || !me) return
    if (mutualCompareUsername.trim()) {
      void refreshMutual()
      return
    }
    if (!mutualTokenRef.current.trim()) return
    void refreshMutual()
  }, [me?.account.id, tab, refreshMutual, me, mutualCompareUsername])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const h = window.location.hash.toLowerCase()
    if (h === '#compare') setTab('mutual')
    if (h === '#reservations') setTab('reservations')
  }, [])

  function findMatchingStaffShift(selection: MeResponse['selections'][number]): StaffShift | null {
    if (!selectedStaffEntry || selection.kind !== 'manual') return null
    return (
      selectedStaffEntry.shifts.find(
        (shift) =>
          shift.startsAt === selection.startsAt &&
          shift.endsAt === selection.endsAt
      ) ?? null
    )
  }

  function staffManualBlockTitle(selection: MeResponse['selections'][number], fallback: string): string {
    const shift = findMatchingStaffShift(selection)
    return shift ? formatStaffShiftTitle(shift, tz) : fallback
  }

  async function applyStaffSchedule(nextName: string) {
    if (!me) {
      setSelectedStaffName(nextName)
      return
    }
    const prevEntry = selectedStaffEntry
    const nextEntry = staffPeople.find((person) => person.name === nextName) ?? null
    const removable = new Set<string>()
    ;[...(prevEntry?.shifts ?? []), ...(nextEntry?.shifts ?? [])].forEach((shift) => {
      removable.add(staffShiftKey(shift.startsAt, shift.endsAt))
    })

    const kept = (me.selections ?? []).filter((selection) => {
      if (selection.kind === 'program') return true
      return !removable.has(staffShiftKey(selection.startsAt, selection.endsAt))
    })

    const additions =
      nextEntry?.shifts.map((shift) => ({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: shift.startsAt,
        endsAt: shift.endsAt,
        note: null,
      })) ?? []

    const merged = [...kept, ...additions].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
    )
    setSelectedStaffName(nextName)
    setMe((current) => (current ? { ...current, selections: merged } : current))
    await persist(merged, buffer, availabilityStart, availabilityEnd)
    if (nextName) {
      setToast(`Applied staff schedule for ${nextName}.`)
    } else {
      setToast('Removed staff schedule autofill.')
    }
  }

  async function submitAuth() {
    try {
      if (authMode === 'register') {
        if (password !== passwordConfirm) {
          setAuthNotice({ kind: 'error', text: 'Passwords do not match.' })
          return
        }
        const regCode =
          typeof window !== 'undefined' ? window.sessionStorage.getItem(regCodeKey) : null
        await dancecardFetch(slug, '/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            displayName,
            ...(regCode ? { registrationAccessCode: regCode } : {}),
          }),
        })
        // Return to sign-in mode after registration to make completion unambiguous.
        await dancecardFetch(slug, '/logout', { method: 'POST' })
        setAuthMode('login')
        setPassword('')
        setPasswordConfirm('')
        setDisplayName('')
        setAuthNotice({ kind: 'success', text: 'Account created. Please sign in.' })
        return
      } else {
        const regCode =
          typeof window !== 'undefined' ? window.sessionStorage.getItem(regCodeKey) : null
        await dancecardFetch(slug, '/login', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            ...(regCode ? { registrationAccessCode: regCode } : {}),
          }),
        })
        setAuthNotice(null)
        setToast('Signed in successfully.')
      }
      setPassword('')
      setPasswordConfirm('')
      await checkSession()
    } catch (e) {
      setAuthNotice({ kind: 'error', text: e instanceof DancecardApiError ? e.body : 'Auth failed' })
    }
  }

  async function logout() {
    await dancecardFetch(slug, '/logout', { method: 'POST' })
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(regCodeKey)
    }
    setMe(null)
    setStaffRoster(null)
    await checkSession()
  }

  async function unlockStaff() {
    setStaffUnlockErr(null)
    setStaffUnlockBusy(true)
    try {
      await dancecardFetch(slug, '/staff/unlock', {
        method: 'POST',
        body: JSON.stringify({ code: staffUnlockCode.trim() }),
      })
      setStaffUnlockCode('')
      await refreshMe()
      setToast('Staff access unlocked.')
    } catch (e) {
      setStaffUnlockErr(formatDancecardApiMessage(e))
    } finally {
      setStaffUnlockBusy(false)
    }
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

  async function setAllowCompareByUsername(next: boolean) {
    try {
      await dancecardFetch(slug, '/me', {
        method: 'PATCH',
        body: JSON.stringify({ allowCompareByUsername: next }),
      })
      setMe((m) =>
        m ? { ...m, prefs: { ...m.prefs, allowCompareByUsername: next } } : m
      )
      setToast(
        next
          ? 'Others signed into this event can compare with you using your login name (Compare tab).'
          : 'Username compare is off. Share links still work.'
      )
    } catch (e) {
      setToast(formatDancecardApiMessage(e))
    }
  }

  async function unlockEntryGate() {
    setEntryGateErr(null)
    try {
      await dancecardFetch(slug, '/verify-entry-code', {
        method: 'POST',
        body: JSON.stringify({ code: entryGateInput.trim() }),
      })
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(entryGateKey, 'ok')
        window.sessionStorage.setItem(regCodeKey, entryGateInput.trim())
      }
      setEntryGateUnlocked(true)
      setEntryGateInput('')
    } catch (e) {
      setEntryGateErr(e instanceof DancecardApiError ? formatDancecardApiMessage(e) : 'That code is not correct.')
    }
  }

  if (!gateReady) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
          <div className="relative mx-auto flex max-w-lg flex-col items-center gap-3 text-center text-sm text-stone-400">
            <div
              className="h-9 w-9 rounded-full border-2 border-teal-400/30 border-t-teal-300 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            <span>Loading…</span>
          </div>
        </div>
      </>
    )
  }

  if (!entryGateUnlocked) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_32%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
          <div className="relative mx-auto max-w-lg">
            <GlassPanel className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Availability access</p>
              <h1 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Enter event password</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This event requires a password before sign-in or registration.
              </p>
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  void unlockEntryGate()
                }}
              >
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={entryGateInput}
                  onChange={(e) => {
                    setEntryGateInput(e.target.value)
                    setEntryGateErr(null)
                  }}
                  placeholder="Event access password"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                >
                  Unlock availability
                </button>
              </form>
              {entryGateErr ? <p className="mt-3 text-sm text-rose-300">{entryGateErr}</p> : null}
            </GlassPanel>
          </div>
        </div>
      </>
    )
  }

  if (!schedule && loadErr) {
    return (
      <>
        <DancecardTopBar />
        <div className="mx-auto max-w-lg px-4 py-12 text-slate-100">
        <div className="rounded-xl border border-cyan-500/30 bg-[#0b1426] p-6 text-center">
          <h1 className="text-lg font-semibold text-cyan-100">Dance card temporarily disabled</h1>
          <p className="mt-2 text-sm text-slate-300">
            The event is disabled for now. Please check back later.
          </p>
        </div>
      </div>
      </>
    )
  }

  if (!schedule || !authChecked) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] px-4 py-20 text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,#040816_0%,#070d1e_100%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-14 text-center shadow-[0_30px_120px_rgba(2,6,23,0.65)] backdrop-blur-xl">
            <div
              className="mx-auto h-12 w-12 rounded-full border-2 border-teal-400/30 border-t-teal-300 animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            <p className="text-xs uppercase tracking-[0.35em] text-teal-200/75">Loading availability</p>
            <h1 className="mt-4 font-serif text-3xl text-stone-50">Preparing your private planning view…</h1>
            <p className="mt-2 text-sm text-stone-400">Polished schedule view — almost ready.</p>
          </div>
        </div>
      </div>
      </>
    )
  }

  if (!me) {
    return (
      <>
        <DancecardTopBar />
        <div className="relative min-h-screen overflow-hidden bg-[#040816] text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(236,72,153,0.14),transparent_20%),radial-gradient(circle_at_25%_75%,rgba(251,191,36,0.12),transparent_20%),linear-gradient(180deg,#020617_0%,#081120_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-10">
          <GlassPanel className="overflow-hidden p-8 lg:p-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/75">{schedule.meta?.productTitle}</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-white sm:text-5xl">
                {schedule.meta?.eventTitle ?? 'Availability'}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                {schedule.meta?.subtitle ||
                  'A private planning surface for unavailable times, mutual free time, reservations, and calendar export.'}
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Today</p>
                <div className="mt-3 font-serif text-3xl text-white sm:text-4xl">{todayLabel(tz)}</div>
                <p className="mt-3 text-sm text-slate-400">{tz}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Coming up next</p>
                <div className="mt-3 text-2xl font-semibold text-white">Sign in to personalize this view.</div>
                <p className="mt-2 text-sm text-slate-400">
                  Once you log in, this panel will show your next unavailable time or reservation.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Preview the experience</p>
                  <h2 className="mt-2 font-serif text-2xl text-white">How availability sharing works</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  Calendar details stay private
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ['1', 'Block busy time', 'Add the windows you are not available.'],
                  ['2', 'Compare privately', 'Paste a share code to see only red/green free time.'],
                  ['3', 'Reserve together', 'Confirm a mutual window and export it to your calendar.'],
                ].map(([step, title, body]) => (
                  <div key={step} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_15px_45px_rgba(2,6,23,0.32)]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-sm font-semibold text-cyan-50">
                      {step}
                    </div>
                    <div className="mt-3 text-base font-semibold text-white">{title}</div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="self-center p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Access</p>
                <h2 className="mt-2 font-serif text-3xl text-white">Enter availability</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                Username + password only
              </div>
            </div>

            <div className="mt-6 inline-flex rounded-full border border-white/10 bg-black/20 p-1">
              {(['login', 'register'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={cx(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    authMode === mode ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300 hover:text-white'
                  )}
                  onClick={() => {
                    setAuthMode(mode)
                    setPasswordConfirm('')
                    setShowPassword(false)
                    setAuthNotice(null)
                  }}
                >
                  {mode === 'login' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                void submitAuth()
              }}
            >
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Username</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="rope-dreamer"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Password</label>
                  <button
                    type="button"
                    className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-200"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="Enter your password"
                />
              </div>
              {authMode === 'register' ? (
                <>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Confirm password</label>
                      <button
                        type="button"
                        className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-200"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Display name</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="How friends see you"
                    />
                  </div>
                  <div className="rounded-2xl border border-amber-500/35 bg-amber-950/40 p-4 text-sm leading-6 text-amber-50/95">
                    <p className="font-semibold text-amber-100">There is no password reset.</p>
                    <p className="mt-2 text-amber-50/90">
                      If you forget this password you will need to create a brand new account and re-enter your availability.
                      Write it down or save it in a password manager before you continue.
                    </p>
                  </div>
                </>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)] transition hover:scale-[1.01]"
              >
                {authMode === 'register' ? 'Create private access' : 'Open availability'}
              </button>
            </form>
            {authNotice ? (
              <p className={`mt-4 text-sm ${authNotice.kind === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {authNotice.text}
              </p>
            ) : null}
          </GlassPanel>
        </div>
      </div>
      </>
    )
  }

  if (useMinimalLayout) {
    return (
      <>
        <DancecardTopBar />
        <div
          className={cn(
            'relative min-h-screen overflow-hidden bg-[#050b18] text-slate-100',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'pb-[calc(7.25rem+env(safe-area-inset-bottom))] lg:pb-10'
              : 'pb-[calc(3.85rem+env(safe-area-inset-bottom))] lg:pb-10'
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_30%),linear-gradient(180deg,#040a16_0%,#07111e_100%)]" />
          <div className="relative z-[1] mx-auto max-w-5xl space-y-2 px-2.5 py-2 sm:space-y-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-6">
            <GlassPanel className="hidden p-2.5 lg:block">
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Dancecard sections">
                {TAB_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === option.key}
                    onClick={() => setTab(option.key)}
                    className={cx(
                      'flex min-w-0 flex-1 flex-col rounded-xl border px-3 py-2 text-left transition sm:min-w-[120px]',
                      tab === option.key
                        ? 'border-cyan-300/30 bg-white text-slate-950'
                        : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className={cx('mt-0.5 text-[10px] leading-tight', tab === option.key ? 'text-slate-600' : 'text-slate-400')}>
                      {option.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </GlassPanel>

            {tab === 'dancecard' ? (
              <>
            <GlassPanel className="space-y-2.5 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Your schedule</p>
                <h1 className="mt-0.5 font-serif text-lg leading-snug text-white sm:text-2xl">
                  {schedule.meta?.eventTitle ?? 'Availability'}
                </h1>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">
                  Block unavailable, set buffer, and share your link.{' '}
                  <span className="text-slate-500">· {tz}</span>
                </p>
                <button
                  type="button"
                  className="mt-2 touch-manipulation text-left text-[11px] font-semibold text-cyan-200 underline decoration-cyan-400/40 underline-offset-2 transition hover:text-cyan-100"
                  onClick={() => {
                    setTab('mutual')
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#compare`)
                    }
                  }}
                >
                  Open Compare — someone else’s free/busy strips
                </button>
              </div>
              {showOnboarding ? (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-cyan-400/25 bg-cyan-950/40 px-2 py-1.5">
                  <p className="text-[11px] leading-snug text-cyan-50/95">
                    <span className="font-semibold text-cyan-100">Tip:</span> dates → busy blocks → share.
                  </p>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-cyan-200/30 px-2 py-0.5 text-[10px] text-cyan-100"
                    onClick={() => {
                      setShowOnboarding(false)
                      if (typeof window !== 'undefined') window.localStorage.setItem(`eck_dc_onboard_seen_${slug}`, '1')
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Start</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#111a2c] px-2 py-2 text-xs text-white outline-none transition focus:border-cyan-300 sm:text-sm"
                    value={splitLocalDateTime(availabilityStart).date}
                    onChange={(e) => setAvailabilityStart(`${e.target.value}T00:00`)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">End</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-[#111a2c] px-2 py-2 text-xs text-white outline-none transition focus:border-cyan-300 sm:text-sm"
                    value={splitLocalDateTime(availabilityEnd).date}
                    onChange={(e) => setAvailabilityEnd(`${e.target.value}T00:00`)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2">
                <button
                  type="button"
                  className="rounded-lg border border-cyan-400/35 bg-cyan-500/15 px-2.5 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
                  onClick={() => void saveAvailabilityRange()}
                >
                  Save dates
                </button>
                <span className="w-full pl-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:w-auto">
                  Buffer
                </span>
                {[0, 15, 30, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={cx(
                      'rounded-full border px-2 py-1 text-[11px] font-medium transition',
                      buffer === minutes
                        ? 'border-cyan-300 bg-cyan-100 text-slate-950'
                        : 'border-slate-700 bg-[#111a2c] text-slate-200 hover:border-slate-500'
                    )}
                    onClick={() => applyBuffer(minutes)}
                  >
                    {minutes === 0 ? 'None' : `${minutes}m`}
                  </button>
                ))}
              </div>
              {me ? (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-2 sm:items-start sm:py-1.5">
                  <div className="min-w-0 pr-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Compare by username</p>
                    <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                      Allow others on this event to open your availability using your login{' '}
                      <span className="text-slate-300">@{me.account.username}</span> (no share link).
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(me.prefs.allowCompareByUsername)}
                    className={cn(
                      'shrink-0 touch-manipulation self-center rounded-full border px-3 py-2.5 text-xs font-semibold transition sm:py-1 sm:text-[10px]',
                      me.prefs.allowCompareByUsername
                        ? 'border-cyan-400/50 bg-cyan-500/25 text-cyan-50'
                        : 'border-slate-600 bg-[#111a2c] text-slate-300'
                    )}
                    onClick={() => void setAllowCompareByUsername(!Boolean(me.prefs.allowCompareByUsername))}
                  >
                    {me.prefs.allowCompareByUsername ? 'On' : 'Off'}
                  </button>
                </div>
              ) : null}
            </GlassPanel>

            <GlassPanel className="p-2.5">
              <p className="mb-2 text-[10px] leading-snug text-slate-500">{SHARE_LINK_PRIVACY_BLURB}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
                  onClick={() => {
                    setTab('mutual')
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#compare`)
                    }
                  }}
                >
                  Compare
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-3 py-2 text-xs font-semibold text-slate-950"
                  onClick={() => void copyShare()}
                >
                  Share link
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200"
                  onClick={() => {
                    setEditingManualId(null)
                    setMStart('')
                    setMEnd('')
                    setMTitle('')
                    setManualOpen(true)
                  }}
                >
                  Unavailable time
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200"
                  onClick={() => exportDancecardCalendar('ical')}
                >
                  Apple / iCal (.ics)
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-50"
                  onClick={() => exportDancecardCalendar('google')}
                >
                  Google Calendar
                </button>
              </div>
            </GlassPanel>

            <GlassPanel className="p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Claims</p>
              <div className="mt-1.5 space-y-1.5">
                {upcomingHostClaims.length ? (
                  upcomingHostClaims.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{r.guest.displayName}</p>
                        <p className="text-[10px] text-slate-400">{formatRange(r.startsAt, r.endsAt, tz)}</p>
                      </div>
                      {r.note ? <span className="max-w-full truncate text-[10px] text-slate-300 sm:max-w-[45%]">{r.note}</span> : null}
                      <button
                        type="button"
                        className="shrink-0 rounded-full border border-rose-400/30 bg-rose-500/15 px-2 py-1 text-[10px] font-medium text-rose-100 hover:bg-rose-500/25"
                        onClick={() => void cancelReservation(r.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No claims yet.</p>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-2.5 md:hidden">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Day schedule</p>
              {availabilityDays.length ? (
                <div
                  className="mt-2 border-b border-white/5 pb-2 md:hidden"
                  role="toolbar"
                  aria-label="Select schedule day"
                >
                  <HostMobileDayChipsRow
                    ref={mobileHostDayChipsRef}
                    days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
                    activeKey={mobileDayKey}
                    onSelect={setMobileDayKey}
                  />
                </div>
              ) : null}
              {mobileSchedulePanel.label ? (
                <p className="mt-2 text-xs font-semibold tracking-tight text-white" aria-live="polite">
                  {mobileSchedulePanel.label}
                </p>
              ) : null}
              <div
                key={mobileDayKey || 'none'}
                className="mt-1.5 max-h-[min(58vh,calc(100dvh-11.5rem))] space-y-1 overflow-y-auto pr-0.5 sm:max-h-[min(58vh,calc(100dvh-12rem))]"
              >
                {mobileSchedulePanel.rows.length === 0 ? (
                  <p className="py-6 text-center text-xs leading-relaxed text-slate-500">
                    {availabilityDays.length
                      ? 'No hours in your saved date range for this day.'
                      : 'Set start and end dates above to see hours here.'}
                  </p>
                ) : (
                  mobileSchedulePanel.rows.map((row, idx) => {
                    const slotCls = cx(
                      'grid w-full min-h-touch grid-cols-[98px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                      row.busy
                        ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                        : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-500/15'
                    )
                    const inner = (
                      <>
                        <span className="font-semibold text-white">{formatTime(row.start.toISOString(), tz)}</span>
                        <span className="truncate">{row.title}</span>
                      </>
                    )
                    return row.busy ? (
                      <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                        {inner}
                      </div>
                    ) : (
                      <button
                        key={`${row.start.toISOString()}-${idx}`}
                        type="button"
                        className={slotCls}
                        aria-label={`Add unavailable time ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                        onClick={() => openManualFromOpenSlot(row)}
                      >
                        {inner}
                      </button>
                    )
                  })
                )}
              </div>
              <p className="mt-2 border-t border-white/5 pt-2 text-[10px] leading-snug text-slate-500">
                Tap <span className="text-emerald-200">green</span> hours to mark busy. Times are for the highlighted day — day
                chips are above; the same row can dock at the bottom while you scroll.
              </p>
            </GlassPanel>

            <GlassPanel className="hidden p-3 md:block">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Calendar by day</p>
              {desktopDayGroups.length ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {desktopDayGroups.map((day) => (
                    <div key={day.key} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{day.label}</p>
                        <p className="text-xs text-slate-400">
                          {day.busyCount} unavailable · {day.openCount} open
                        </p>
                      </div>
                      <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
                        {day.rows.map((row, idx) => {
                          const slotCls = cx(
                            'grid w-full min-h-10 grid-cols-[84px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition motion-reduce:transition-none',
                            row.busy
                              ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                              : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-500/15'
                          )
                          const inner = (
                            <>
                              <span className="font-semibold text-white">{formatTime(row.start.toISOString(), tz)}</span>
                              <span className="truncate">{row.title}</span>
                            </>
                          )
                          return row.busy ? (
                            <div key={`${day.key}-${row.start.toISOString()}-${idx}`} className={slotCls}>
                              {inner}
                            </div>
                          ) : (
                            <button
                              key={`${day.key}-${row.start.toISOString()}-${idx}`}
                              type="button"
                              className={slotCls}
                              aria-label={`Add unavailable time ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                              onClick={() => openManualFromOpenSlot(row)}
                            >
                              {inner}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400">Set a date range to show times.</p>
              )}
            </GlassPanel>
              </>
            ) : tab === 'mutual' ? (
              <GlassPanel className="space-y-2 p-3 sm:p-4">
                <CompareAvailabilityPanel
                  compact
                  slug={slug}
                  tz={tz}
                  showStrips={Boolean(mutualData && schedule?.meta)}
                  mutualCompareUsername={mutualCompareUsername}
                  setMutualCompareUsername={setMutualCompareUsername}
                  mutualToken={mutualToken}
                  setMutualToken={setMutualToken}
                  mutualAdvancedTokenOpen={mutualAdvancedTokenOpen}
                  setMutualAdvancedTokenOpen={setMutualAdvancedTokenOpen}
                  refreshMutual={refreshMutual}
                  mutualData={mutualData}
                  mutualStripDays={mutualStripDays}
                  mutualPlayableWindow={mutualPlayableWindow}
                  onMutualStripSlotClick={onMutualStripSlotClick}
                  me={me}
                />
              </GlassPanel>
            ) : (
              <GlassPanel className="p-3 sm:p-4">
                <ReservationsPanel slug={slug} tz={tz} />
              </GlassPanel>
            )}
          </div>

          {toast ? (
            <div
              className={cn(
                'fixed left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-[0_18px_55px_rgba(2,6,23,0.75)] backdrop-blur-xl lg:bottom-4',
                tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
                  ? 'bottom-[calc(7rem+env(safe-area-inset-bottom))]'
                  : 'bottom-[calc(4.35rem+env(safe-area-inset-bottom))]'
              )}
            >
              <span>{toast}</span>
              <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300" onClick={() => setToast(null)}>
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#050b18]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
          aria-label="Dancecard sections"
        >
          <div className="mx-auto flex max-w-5xl gap-0.5">
            {TAB_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-current={tab === option.key ? 'page' : undefined}
                className={cx(
                  'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-center text-[10px] font-semibold leading-tight transition sm:text-[11px]',
                  tab === option.key ? 'bg-cyan-400/20 text-cyan-50' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                )}
                onClick={() => setTab(option.key)}
              >
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {tab === 'dancecard' && mobileHostDayDocked && availabilityDays.length ? (
          <MobileDayStripBar
            days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
            activeKey={mobileDayKey}
            onSelect={setMobileDayKey}
            positionClassName="bottom-[calc(3.65rem+env(safe-area-inset-bottom))] z-[42] pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1"
          />
        ) : null}

        {manualOpen ? (
          <div
            className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto overscroll-y-contain bg-slate-950/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:py-8"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeManualModal()
            }}
          >
            <GlassPanel className="flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden motion-reduce:transition-none sm:animate-in">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-[#0c1424]/98 px-5 pb-3 pt-5 backdrop-blur-sm sm:px-6 sm:pt-6">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Unavailable time</p>
                  <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Add time unavailable</h3>
                </div>
                <button
                  type="button"
                  className="shrink-0 touch-manipulation rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300"
                  onClick={closeManualModal}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Title</label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                    value={mTitle}
                    maxLength={150}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Work, gym, commute..."
                  />
                </div>
              <div className="mt-3">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Quick presets</p>
                <div className="flex flex-wrap gap-2">
                  {mealPresetOptions.map((preset) => (
                    <button
                      key={`once-${preset.key}`}
                      type="button"
                      className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                      onClick={() => applyManualPreset(preset.key)}
                    >
                      {mealPresetLabel(preset)}
                    </button>
                  ))}
                  {mealPresetOptions.map((preset) => (
                    <button
                      key={`daily-${preset.key}`}
                      type="button"
                      className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                      onClick={() => void addDailyPresetAcrossAvailability(preset.key)}
                    >
                      {preset.label} every event day
                    </button>
                  ))}
                  {!mealPresetOptions.length ? (
                    <p className="text-xs text-slate-500">No breakfast/lunch/dinner slots found in this event schedule.</p>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                    onClick={() => void clearMealPresetsAcrossAvailability()}
                  >
                    Clear meal presets
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                    onClick={() => void clearUnavailableForSelectedDay()}
                  >
                    Clear day ({selectedDayKey})
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                    onClick={() => void duplicateYesterdayToSelectedDay()}
                  >
                    Duplicate yesterday to {selectedDayKey}
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Start</label>
                  <div className="mb-2 grid grid-cols-2 gap-2 md:hidden">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                      value={splitLocalDateTime(mStart).date}
                      min={manualDateRangeBounds?.dateMin}
                      max={manualDateRangeBounds?.dateMax}
                      onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                    />
                    <input
                      type="time"
                      step={900}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                      value={splitLocalDateTime(mStart).time}
                      onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                    />
                  </div>
                  <input
                    type="datetime-local"
                    className="hidden w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white md:block"
                    value={mStart}
                    min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                    max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                    onChange={(e) => setMStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">End</label>
                  <div className="mb-2 grid grid-cols-2 gap-2 md:hidden">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                      value={splitLocalDateTime(mEnd).date}
                      min={manualDateRangeBounds?.dateMin}
                      max={manualDateRangeBounds?.dateMax}
                      onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                    />
                    <input
                      type="time"
                      step={900}
                      className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                      value={splitLocalDateTime(mEnd).time}
                      onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                    />
                  </div>
                  <input
                    type="datetime-local"
                    className="hidden w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white md:block"
                    value={mEnd}
                    min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                    max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                    onChange={(e) => setMEnd(e.target.value)}
                  />
                </div>
              </div>
              {manualSelections.length ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Existing unavailable times</p>
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                    {manualSelections.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
                    >
                      <button
                        type="button"
                        className="min-h-10 min-w-0 flex-1 text-left text-xs text-slate-200 hover:text-white"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        {formatRange(s.startsAt, s.endsAt, tz)} {s.note ? `· ${s.note}` : ''}
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-rose-300/35 bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/25"
                        aria-label="Delete unavailable time"
                        title="Delete unavailable time"
                        onClick={() => removeSelection(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {manualDraftSummary ? (
                <p className="mt-3 text-xs text-slate-400">
                  This will block about {manualDraftSummary.hours.toFixed(2)} hour(s) across {manualDraftSummary.days} day(s).
                </p>
              ) : null}
              </div>
              <div className="shrink-0 border-t border-white/10 bg-[#0c1424]/98 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-6">
                <button
                  type="button"
                  className="touch-manipulation w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950"
                  onClick={() => void submitManualBlock()}
                >
                  {editingManualId ? 'Save changes' : 'Save unavailable time'}
                </button>
              </div>
            </GlassPanel>
          </div>
        ) : null}

        <MutualReserveTogetherModal
          open={reserveMutualOpen}
          onDismiss={() => {
            setReserveMutualOpen(false)
            setReserveMutualPreview(null)
            setReserveMutualBanner(null)
          }}
          hostDisplayName={mutualData?.host.displayName ?? 'the host'}
          reserveMutualStart={reserveMutualStart}
          setReserveMutualStart={setReserveMutualStart}
          reserveMutualEnd={reserveMutualEnd}
          setReserveMutualEnd={setReserveMutualEnd}
          reserveMutualNote={reserveMutualNote}
          setReserveMutualNote={setReserveMutualNote}
          reserveMutualBanner={reserveMutualBanner}
          setReserveMutualBanner={setReserveMutualBanner}
          reserveMutualPreview={reserveMutualPreview}
          setReserveMutualPreview={setReserveMutualPreview}
          reserveMutualBusy={reserveMutualBusy}
          runMutualReservePreview={runMutualReservePreview}
          submitMutualReserve={submitMutualReserve}
          openMutualReserveInGoogleCalendar={openMutualReserveInGoogleCalendar}
          copyMutualReservationSummary={copyMutualReservationSummary}
          onSuccessGoReservations={() => {
            setReserveMutualOpen(false)
            setReserveMutualPreview(null)
            setReserveMutualBanner(null)
            setTab('reservations')
          }}
          onSuccessStayOnCompare={() => {
            setReserveMutualOpen(false)
            setReserveMutualPreview(null)
            setReserveMutualBanner(null)
          }}
          stayAfterSuccessLabel="Stay on Compare"
        />
      </>
    )
  }

  return (
    <>
      <DancecardTopBar />
      <div
        className={cn(
          'relative min-h-screen overflow-hidden bg-[#050b18] text-slate-100 lg:pb-10',
          tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
            ? 'pb-[calc(7.25rem+env(safe-area-inset-bottom))]'
            : 'pb-[calc(3.85rem+env(safe-area-inset-bottom))]'
        )}
      >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_26%),radial-gradient(circle_at_88%_14%,rgba(129,140,248,0.10),transparent_24%),linear-gradient(180deg,#040a16_0%,#081121_55%,#07111e_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:92px_92px] opacity-10" />

      <div className="relative z-[1] mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <GlassPanel className="overflow-hidden p-3 sm:p-4 lg:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/75 sm:text-xs sm:tracking-[0.38em]">
                    {schedule.meta?.productTitle}
                  </p>
                  <h1 className="mt-2 font-serif text-xl leading-tight text-white sm:mt-2 sm:text-3xl lg:text-[2.1rem]">
                    {schedule.meta?.eventTitle}
                  </h1>
                  <p className="mt-1 hidden max-w-3xl text-sm leading-6 text-slate-300 md:block">
                    Share your availability, compare free windows with someone else, and reserve time without exposing
                    the details of either person&apos;s calendar.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void loadSchedule()}
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Today</p>
                  <div className="mt-2 font-serif text-lg text-white sm:mt-2 sm:text-2xl">{todayLabel(tz)}</div>
                  <p className="mt-2 text-xs text-slate-400 sm:text-sm">{tz}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Coming up next</p>
                  {nextAgendaItem ? (
                    nextAgendaItem.type === 'selection' ? (
                      <>
                        <div className="mt-2 text-base font-semibold text-white sm:mt-2 sm:text-xl">
                          {staffManualBlockTitle(
                            nextAgendaItem.selection,
                            nextAgendaItem.selection.kind === 'program'
                              ? nextAgendaItem.selection.programTitle || 'Scheduled block'
                              : 'Unavailable time'
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-300">
                          {findMatchingStaffShift(nextAgendaItem.selection)
                            ? 'Imported unavailable time'
                            : `${nextAgendaItem.selection.kind === 'program' && nextAgendaItem.selection.programRoom ? `${nextAgendaItem.selection.programRoom} · ` : ''}${formatRange(nextAgendaItem.selection.startsAt, nextAgendaItem.selection.endsAt, tz)}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-base font-semibold text-white sm:mt-2 sm:text-xl">
                          Together with {reservationPartnerName(nextAgendaItem.reservation)}
                        </div>
                        <p className="mt-1 text-sm text-slate-300">
                          {formatRange(nextAgendaItem.reservation.startsAt, nextAgendaItem.reservation.endsAt, tz)}
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <div className="mt-2 text-base font-semibold text-white sm:text-xl">Nothing scheduled yet.</div>
                      <p className="mt-1 text-sm text-slate-400">Add times you are unavailable or make a reservation.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-black/20 p-3 sm:rounded-xl sm:p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in</p>
                  <h2 className="mt-1 truncate text-base font-semibold text-white sm:text-xl">{me.account.displayName}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-400 sm:text-sm">@{me.account.username}</p>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200 sm:px-3 sm:text-xs">
                  Live
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void rename()}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => {
                    setEditingManualId(null)
                    setMStart('')
                    setMEnd('')
                    setMTitle('')
                    setManualOpen(true)
                  }}
                >
                  Unavailable time
                </button>
                <button
                  type="button"
                  title={SHARE_LINK_PRIVACY_BLURB}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-200 transition hover:bg-white/[0.08]"
                  onClick={() => void copyShare()}
                >
                  Copy code
                </button>
                <button
                  type="button"
                  className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-xs text-rose-100 transition hover:bg-rose-400/20"
                  onClick={() => void logout()}
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </GlassPanel>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <GlassPanel className="hidden p-2.5 lg:block">
              <div className="flex flex-wrap gap-1.5" role="tablist">
                {TAB_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === option.key}
                    onClick={() => setTab(option.key)}
                    className={cx(
                      'flex min-w-0 flex-1 flex-col rounded-xl border px-3 py-2.5 text-left transition sm:min-w-[130px]',
                      tab === option.key
                        ? 'border-cyan-300/30 bg-white text-slate-950'
                        : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className={cx('mt-0.5 text-[11px]', tab === option.key ? 'text-slate-600' : 'text-slate-400')}>
                      {option.blurb}
                    </span>
                  </button>
                ))}
              </div>
            </GlassPanel>

            {tab === 'program' ? (
              <div className="space-y-4">
                <GlassPanel className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">View</span>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                      {VIEW_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={cx(
                            'rounded-full px-3 py-2 text-xs transition sm:px-4 sm:text-sm',
                            scheduleView === option.key
                              ? 'bg-white text-slate-950'
                              : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07]'
                          )}
                          onClick={() => setScheduleView(option.key)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {grouped.length > 1 && scheduleView !== 'venue' && scheduleView !== 'grid' ? (
                    <nav className="mt-5 flex flex-wrap gap-2">
                      {grouped.map((g, idx) => (
                        <a
                          key={g.day}
                          href={`#dc-day-${idx}`}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-slate-300 transition hover:bg-white/[0.08]"
                        >
                          {shortDayLabel(g.day)}
                        </a>
                      ))}
                    </nav>
                  ) : null}
                </GlassPanel>

                {scheduleView === 'venue' ? (
                  <div className="space-y-5">
                    {venueGroups.map((vg) => (
                      <GlassPanel key={vg.room} className="p-5 sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Venue</p>
                            <h3 className="mt-2 font-serif text-2xl text-white">{vg.room}</h3>
                          </div>
                          <div className="rounded-full border border-slate-800 bg-[#111a2c] px-3 py-1 text-xs text-slate-300">
                            Focused by venue
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
                          {vg.items.map((slot) => (
                            <SessionCard
                              key={slot.id}
                              slot={slot}
                              tz={tz}
                              selected={programSelected.has(slot.id)}
                              onToggle={() => toggleProgram(slot)}
                            />
                          ))}
                        </div>
                      </GlassPanel>
                    ))}
                  </div>
                ) : scheduleView === 'grid' ? (
                  <>
                  <GlassPanel className="hidden overflow-hidden p-3 lg:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-2 text-left text-xs">
                        <thead>
                          <tr>
                            <th className="rounded-2xl bg-white/[0.05] p-3 text-slate-400">Time</th>
                            {uniqueRoomsForGrid.map((room) => (
                              <th key={room} className="rounded-2xl bg-white/[0.05] p-3 text-slate-200">
                                {room}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {groupSlotsByStart(filteredSlots).map(([startIso, slotsAt]) => (
                            <tr key={startIso}>
                              <td className="min-w-[110px] rounded-2xl border border-white/10 bg-black/30 p-3 align-top">
                                <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Time</div>
                                <div className="mt-1 text-base font-semibold text-white">{formatTime(startIso, tz)}</div>
                              </td>
                              {uniqueRoomsForGrid.map((room) => {
                                const slot = slotsAt.find((s) => (s.room || 'Other') === room)
                                return (
                                  <td key={room} className="min-w-[180px] align-top">
                                    {slot ? (
                                      <button
                                        type="button"
                                        className={cx(
                                          'h-full w-full rounded-[24px] border p-3 text-left transition',
                                          programSelected.has(slot.id)
                                            ? 'border-cyan-300/35 bg-cyan-400/12 shadow-[0_20px_45px_rgba(34,211,238,0.12)]'
                                            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                                        )}
                                        onClick={() => toggleProgram(slot)}
                                      >
                                        <div className="text-sm font-semibold text-white">{slot.title}</div>
                                        <div className="mt-2 text-[11px] text-slate-400">{room}</div>
                                      </button>
                                    ) : (
                                      <div className="rounded-[24px] border border-white/5 bg-black/20 p-3 text-slate-600">—</div>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassPanel>
                  <GlassPanel className="border-amber-400/25 bg-amber-400/10 p-4 lg:hidden">
                    <p className="text-sm text-amber-50">
                      Grid view is built for wider screens. On your phone, use <strong>Timeline</strong> for the easiest
                      browsing.
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
                      onClick={() => setScheduleView('simple')}
                    >
                      Switch to timeline
                    </button>
                  </GlassPanel>
                  </>
                ) : (
                  grouped.map((g, dayIdx) => (
                    <GlassPanel key={g.day} className="scroll-mt-24 p-3 sm:p-4" >
                      <section id={`dc-day-${dayIdx}`}>
                        <div className="flex flex-wrap items-end justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Day {dayIdx + 1}</p>
                            <h3 className="mt-1.5 font-serif text-2xl text-white">{g.day}</h3>
                          </div>
                          <div className="rounded-full border border-slate-800 bg-[#111a2c] px-3 py-1 text-xs text-slate-300">{tz}</div>
                        </div>
                        <div className="mt-4 space-y-2.5">
                          {groupSlotsByStart(g.items).map(([startIso, slotsAt]) => {
                            const policies = programPoliciesForSlots(slotsAt)
                            const hasPolicy = policies.length > 0
                            return (
                            <div
                              key={startIso}
                              className="grid grid-cols-1 gap-2 rounded-xl border border-white/8 bg-black/20 p-2.5 md:grid-cols-[96px_minmax(0,1fr)]"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const first = slotsAt[0]
                                  if (!first) return
                                  const target = document.getElementById(`dc-slot-${first.id}`)
                                  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }}
                                className={cx(
                                  'rounded-lg border px-2.5 py-2 text-left transition hover:bg-white/10',
                                  hasPolicy
                                    ? 'border-amber-300/25 bg-amber-500/10'
                                    : 'border-cyan-300/15 bg-cyan-300/10'
                                )}
                                aria-label={`Jump to ${formatTime(startIso, tz)} sessions`}
                              >
                                <div
                                  className={cx(
                                    'text-[9px] uppercase tracking-[0.24em]',
                                    hasPolicy ? 'text-amber-100/80' : 'text-cyan-100/70'
                                  )}
                                >
                                  Start
                                </div>
                                <div className="mt-1 text-lg font-semibold text-white">{formatTime(startIso, tz)}</div>
                                {hasPolicy ? (
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {policies.slice(0, 2).map((policy) => (
                                      <span
                                        key={policy.key}
                                        className={cx(
                                          'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
                                          policyChipClass(policy.tone)
                                        )}
                                      >
                                        {policy.label}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-1.5 text-[10px] text-cyan-100/70">Tap to jump</div>
                                )}
                              </button>
                              <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
                                {slotsAt.map((slot) => (
                                  <SessionCard
                                    key={slot.id}
                                    htmlId={`dc-slot-${slot.id}`}
                                    slot={slot}
                                    tz={tz}
                                    showTime={false}
                                    selected={programSelected.has(slot.id)}
                                    onToggle={() => toggleProgram(slot)}
                                  />
                                ))}
                              </div>
                            </div>
                          )})}
                        </div>
                      </section>
                    </GlassPanel>
                  ))
                )}

                {!schedule.slots.length ? (
                  <GlassPanel className="border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-50">
                    <p className="font-medium text-amber-100">No program is loaded for this event yet.</p>
                    <p className="mt-2 text-amber-50/80">
                      The schedule API returned an empty list for this event. Common causes: no rows in{' '}
                      <code className="rounded bg-black/30 px-1">dancecard_program_slots</code>, production env pointed at
                      a different project, or the live deploy is older than the latest Dancecard routes.
                    </p>
                  </GlassPanel>
                ) : !filteredSlots.length ? (
                  <GlassPanel className="p-5 text-sm text-slate-400">No sessions match the current filters.</GlassPanel>
                ) : null}
              </div>
            ) : null}

            {tab === 'dancecard' ? (
              <div className="space-y-4">
                <GlassPanel className="p-3 sm:p-4">
                  <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Availability</p>
                        <h2 className="mt-1 font-serif text-2xl text-white sm:text-[2rem]">Your schedule</h2>
                        <p className="mt-1.5 hidden text-sm leading-6 text-slate-300 sm:block">
                          Set your range, mark busy time, and share your link.
                        </p>
                        <p className="mt-1 text-xs text-slate-400">All times shown in {tz}.</p>
                      </div>
                      {showOnboarding ? (
                        <div className="rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs text-cyan-50">1) Set range, 2) add unavailable times, 3) share link.</p>
                            <button
                              type="button"
                              className="rounded-full border border-cyan-200/30 px-2.5 py-1 text-[11px] text-cyan-100"
                              onClick={() => {
                                setShowOnboarding(false)
                                if (typeof window !== 'undefined') window.localStorage.setItem(`eck_dc_onboard_seen_${slug}`, '1')
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                        <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Buffer</label>
                        <p className="mt-1 text-xs text-slate-500">Add a small buffer so your unavailable range is realistic.</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[0, 15, 30, 45, 60].map((minutes) => (
                            <button
                              key={minutes}
                              type="button"
                              className={cx(
                                'rounded-full border px-3 py-1.5 text-sm transition',
                                buffer === minutes
                                  ? 'border-cyan-300 bg-cyan-100 text-slate-950'
                                  : 'border-slate-700 bg-[#111a2c] text-slate-200 hover:border-slate-500'
                              )}
                              onClick={() => applyBuffer(minutes)}
                            >
                              {minutes === 0 ? 'No buffer' : `${minutes} min`}
                            </button>
                          ))}
                        </div>
                      </div>
                      {me ? (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                          <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Compare by username</label>
                          <p className="mt-1 text-xs text-slate-500">
                            When on, others signed into this event can use the Compare tab with your login{' '}
                            <span className="text-slate-300">@{me.account.username}</span> instead of a share link.
                          </p>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(me.prefs.allowCompareByUsername)}
                            className={cn(
                              'mt-2 min-h-[44px] w-full touch-manipulation rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:min-h-0 sm:w-auto sm:rounded-full sm:py-1.5 sm:text-xs',
                              me.prefs.allowCompareByUsername
                                ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-50'
                                : 'border-slate-600 bg-[#111a2c] text-slate-300'
                            )}
                            onClick={() => void setAllowCompareByUsername(!Boolean(me.prefs.allowCompareByUsername))}
                          >
                            {me.prefs.allowCompareByUsername ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                        <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">Date range</label>
                        <div className="mt-2 grid gap-2">
                          <input
                            type="date"
                            className="w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            value={splitLocalDateTime(availabilityStart).date}
                            onChange={(e) => setAvailabilityStart(`${e.target.value}T00:00`)}
                          />
                          <input
                            type="date"
                            className="w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            value={splitLocalDateTime(availabilityEnd).date}
                            onChange={(e) => setAvailabilityEnd(`${e.target.value}T00:00`)}
                          />
                          <button
                            type="button"
                            className="rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
                            onClick={() => void saveAvailabilityRange()}
                          >
                            Save date range
                          </button>
                        </div>
                      </div>
                      {false && !me?.account.isStaff ? (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                          <label className="block text-xs uppercase tracking-[0.25em] text-slate-400">
                            Staff only — unlock roster
                          </label>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            Enter your staff access code once.
                          </p>
                          <input
                            type="password"
                            autoComplete="off"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            value={staffUnlockCode}
                            onChange={(e) => {
                              setStaffUnlockCode(e.target.value)
                              setStaffUnlockErr(null)
                            }}
                            placeholder="Staff access code"
                          />
                          {staffUnlockErr ? <p className="mt-2 text-sm text-rose-300">{staffUnlockErr}</p> : null}
                          <button
                            type="button"
                            disabled={staffUnlockBusy || !staffUnlockCode.trim()}
                            className="mt-2.5 w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => void unlockStaff()}
                          >
                            {staffUnlockBusy ? 'Unlocking…' : 'Unlock staff autofill'}
                          </button>
                        </div>
                      ) : false && staffPeople.length ? (
                        <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                          <label
                            htmlFor="staff-schedule"
                            className="block text-xs uppercase tracking-[0.25em] text-slate-400"
                          >
                            Staff and volunteer autofill
                          </label>
                          <p className="mt-2 text-sm leading-6 text-slate-300">
                            Choose your official staff/volunteer name.
                          </p>
                          <select
                            id="staff-schedule"
                            value={selectedStaffName}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#111a2c] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300"
                            onChange={(event) => void applyStaffSchedule(event.target.value)}
                          >
                            <option value="">Choose your staff or volunteer name</option>
                            {staffPeople.map((person) => (
                              <option key={person.name} value={person.name}>
                                {person.name}
                              </option>
                            ))}
                          </select>
                          {selectedStaffEntry ? (
                            <div className="mt-2.5 space-y-2 border-t border-white/10 pt-2.5">
                              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">
                                {selectedStaffEntry?.shifts.length ?? 0} shifts ready
                              </p>
                              <ul className="space-y-2">
                                {(selectedStaffEntry?.shifts ?? []).map((sh, i) => {
                                  const rc = roleColor(sh.role)
                                  return (
                                    <li key={`${sh.startsAt}-${i}`} className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                      <span
                                        className={cx(
                                          'rounded-full border px-2 py-0.5 font-semibold ring-1',
                                          rc.bg,
                                          rc.fg,
                                          rc.ring
                                        )}
                                      >
                                        {sh.role}
                                      </span>
                                      <span className="text-slate-400">{formatStaffShiftTitle(sh, tz)}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <p className="max-w-prose text-[11px] leading-relaxed text-slate-500">{SHARE_LINK_PRIVACY_BLURB}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                          onClick={() => void copyShare()}
                        >
                          Share link
                        </button>
                        <button
                          type="button"
                          className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200"
                          onClick={() => {
                            setEditingManualId(null)
                            setMStart('')
                            setMEnd('')
                            setMTitle('')
                            setManualOpen(true)
                          }}
                        >
                          Unavailable time
                        </button>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-[#0a1322] p-3">
                        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Export calendar</label>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('ical')}
                          >
                            Apple / iCal
                          </button>
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-50 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('google')}
                          >
                            Google Calendar
                          </button>
                        </div>
                        {calendarExportCount === 0 ? (
                          <p className="mt-2 text-xs text-slate-500">Nothing to export yet.</p>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">{calendarExportCount} event(s) in this export.</p>
                        )}
                        <p className="mt-2.5 text-xs uppercase tracking-[0.16em] text-slate-500">Unavailable times only</p>
                        {countDancecardIcsEvents(me?.selections ?? [], []) === 0 ? (
                          <p className="mt-2 text-xs text-slate-500">Add unavailable times first.</p>
                        ) : (
                          <a
                            href={`/api/dancecard/${slug}/ics`}
                            download
                            className="mt-1.5 inline-flex rounded-xl border border-violet-400/35 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-50 transition hover:bg-violet-500/25"
                          >
                            Download unavailable times (.ics)
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <GlassPanel className="p-3 md:hidden">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Day schedule</p>
                        {availabilityDays.length ? (
                          <div
                            className="mt-2 border-b border-white/5 pb-2 md:hidden"
                            role="toolbar"
                            aria-label="Select schedule day"
                          >
                            <HostMobileDayChipsRow
                              ref={mobileHostDayChipsRef}
                              days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
                              activeKey={mobileDayKey}
                              onSelect={setMobileDayKey}
                            />
                          </div>
                        ) : null}
                        {mobileSchedulePanel.label ? (
                          <p className="mt-2 text-xs font-semibold tracking-tight text-white" aria-live="polite">
                            {mobileSchedulePanel.label}
                          </p>
                        ) : null}
                        <div
                          key={mobileDayKey || 'none'}
                          className="mt-2 max-h-[min(52vh,calc(100dvh-15rem))] space-y-1.5 overflow-y-auto pr-1"
                        >
                          {mobileSchedulePanel.rows.length === 0 ? (
                            <p className="py-6 text-center text-xs leading-relaxed text-slate-500">
                              {availabilityDays.length
                                ? 'No hours in your saved date range for this day.'
                                : 'Set a date range to show your day schedule.'}
                            </p>
                          ) : (
                            mobileSchedulePanel.rows.map((row, idx) => {
                              const slotCls = cx(
                                'grid w-full min-h-touch grid-cols-[98px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                                row.busy
                                  ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                                  : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-500/15'
                              )
                              const inner = (
                                <>
                                  <span className="font-semibold text-white">{formatTime(row.start.toISOString(), tz)}</span>
                                  <span className="truncate">{row.title}</span>
                                </>
                              )
                              return row.busy ? (
                                <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                                  {inner}
                                </div>
                              ) : (
                                <button
                                  key={`${row.start.toISOString()}-${idx}`}
                                  type="button"
                                  className={slotCls}
                                  aria-label={`Add unavailable time ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                  onClick={() => openManualFromOpenSlot(row)}
                                >
                                  {inner}
                                </button>
                              )
                            })
                          )}
                        </div>
                        <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-snug text-slate-500">
                          Tap <span className="text-emerald-200">green</span> hours. Times are for the highlighted day — day chips
                          are above; the same row can pin above the bottom tabs while you scroll.
                        </p>
                      </GlassPanel>
                      <GlassPanel className="p-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Hour-by-hour</p>
                        <p className="mt-1 hidden text-[11px] text-slate-500 md:block">
                          Tap a green <span className="text-emerald-200">open</span> row to add unavailable time.
                        </p>
                        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1 hidden md:block">
                          {availabilityHourRows.length ? (
                            availabilityHourRows.map((row, idx) => {
                              const slotCls = cx(
                                'flex w-full min-h-10 items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                                row.busy
                                  ? 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                                  : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-500/15'
                              )
                              const inner = (
                                <>
                                  <span>{toDatetimeLocalValue(row.start).replace('T', ' ')}</span>
                                  <span className="truncate pl-2">{row.title}</span>
                                </>
                              )
                              return row.busy ? (
                                <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                                  {inner}
                                </div>
                              ) : (
                                <button
                                  key={`${row.start.toISOString()}-${idx}`}
                                  type="button"
                                  className={slotCls}
                                  aria-label={`Add unavailable time ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                  onClick={() => openManualFromOpenSlot(row)}
                                >
                                  {inner}
                                </button>
                              )
                            })
                          ) : (
                            <p className="text-xs text-slate-400">Set availability start and end to build hour blocks.</p>
                          )}
                        </div>
                      </GlassPanel>
                      {dancecardFlat.length ? (
                        <DancecardCompactList
                          rows={dancecardFlat}
                          tz={tz}
                          findMatchingStaffShift={findMatchingStaffShift}
                          staffManualBlockTitle={staffManualBlockTitle}
                          onRemoveSelection={(id) => removeSelection(id)}
                          onCancelReservation={(id) => void cancelReservation(id)}
                          onNoteBlur={(s, note) => {
                            const cur = me?.selections ?? []
                            const next = cur.map((x) =>
                              x.id === s.id ? { ...x, note: note.trim() ? note.trim().slice(0, 1000) : null } : x
                            )
                            setMe((m) => (m ? { ...m, selections: next } : m))
                            queueSave(next, buffer)
                          }}
                        />
                      ) : (
                        <GlassPanel className="p-5 text-sm text-slate-400">No unavailable times yet.</GlassPanel>
                      )}
                    </div>
                  </div>
                </GlassPanel>
              </div>
            ) : null}

            {tab === 'mutual' ? (
              <GlassPanel className="p-3 sm:p-5">
                <CompareAvailabilityPanel
                  slug={slug}
                  tz={tz}
                  showStrips={Boolean(mutualData && schedule.meta)}
                  mutualCompareUsername={mutualCompareUsername}
                  setMutualCompareUsername={setMutualCompareUsername}
                  mutualToken={mutualToken}
                  setMutualToken={setMutualToken}
                  mutualAdvancedTokenOpen={mutualAdvancedTokenOpen}
                  setMutualAdvancedTokenOpen={setMutualAdvancedTokenOpen}
                  refreshMutual={refreshMutual}
                  mutualData={mutualData}
                  mutualStripDays={mutualStripDays}
                  mutualPlayableWindow={mutualPlayableWindow}
                  onMutualStripSlotClick={onMutualStripSlotClick}
                  me={me}
                />
              </GlassPanel>
            ) : null}

            {tab === 'reservations' ? <ReservationsPanel slug={slug} tz={tz} /> : null}
          </div>

          <aside className="hidden xl:block">
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">About availability</p>
              <h2 className="mt-2 font-serif text-2xl text-white">Private planning</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Compare only the windows that matter: busy time stays abstract, mutual free time is easy to reserve,
                and confirmed plans can be exported to your calendar.
              </p>
            </GlassPanel>
          </aside>
        </div>
      </div>

      {manualOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto overscroll-y-contain bg-slate-950/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:py-8"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeManualModal()
          }}
        >
          <GlassPanel className="flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden motion-reduce:transition-none sm:animate-in">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-[#0c1424]/98 px-5 pb-3 pt-5 backdrop-blur-sm sm:px-6 sm:pt-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Custom block</p>
                <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Add unavailable time</h3>
              </div>
              <button
                type="button"
                className="shrink-0 touch-manipulation rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300"
                onClick={closeManualModal}
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <p className="text-sm text-slate-400">Times use your browser local timezone and are stored as UTC.</p>
            <div className="mt-4">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Title</label>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                value={mTitle}
                maxLength={150}
                onChange={(e) => setMTitle(e.target.value)}
                placeholder="Gym, dinner, commute..."
              />
            </div>
            <div className="mt-3">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-500">Quick presets</p>
              <div className="flex flex-wrap gap-2">
                {mealPresetOptions.map((preset) => (
                  <button
                    key={`once-alt-${preset.key}`}
                    type="button"
                    className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                    onClick={() => applyManualPreset(preset.key)}
                  >
                    {mealPresetLabel(preset)}
                  </button>
                ))}
                {mealPresetOptions.map((preset) => (
                  <button
                    key={`daily-alt-${preset.key}`}
                    type="button"
                    className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-100"
                    onClick={() => void addDailyPresetAcrossAvailability(preset.key)}
                  >
                    {preset.label} every event day
                  </button>
                ))}
                {!mealPresetOptions.length ? (
                  <p className="text-xs text-slate-500">No breakfast/lunch/dinner slots found in this event schedule.</p>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                  onClick={() => void clearMealPresetsAcrossAvailability()}
                >
                  Clear meal presets
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                  onClick={() => void clearUnavailableForSelectedDay()}
                >
                  Clear day ({selectedDayKey})
                </button>
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-200"
                  onClick={() => void duplicateYesterdayToSelectedDay()}
                >
                  Duplicate yesterday to {selectedDayKey}
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Start</label>
                <div className="mb-2 grid grid-cols-2 gap-2 md:hidden">
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                    value={splitLocalDateTime(mStart).date}
                    min={manualDateRangeBounds?.dateMin}
                    max={manualDateRangeBounds?.dateMax}
                    onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                  />
                  <input
                    type="time"
                    step={900}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                    value={splitLocalDateTime(mStart).time}
                    onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                  />
                </div>
                <input
                  type="datetime-local"
                  className="hidden w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white md:block"
                  value={mStart}
                  min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                  max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                  onChange={(e) => setMStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">End</label>
                <div className="mb-2 grid grid-cols-2 gap-2 md:hidden">
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                    value={splitLocalDateTime(mEnd).date}
                    min={manualDateRangeBounds?.dateMin}
                    max={manualDateRangeBounds?.dateMax}
                    onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                  />
                  <input
                    type="time"
                    step={900}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-3 py-3 text-sm text-white"
                    value={splitLocalDateTime(mEnd).time}
                    onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                  />
                </div>
                <input
                  type="datetime-local"
                  className="hidden w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white md:block"
                  value={mEnd}
                  min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                  max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                  onChange={(e) => setMEnd(e.target.value)}
                />
              </div>
            </div>
            {manualSelections.length ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Existing unavailable times</p>
                <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                  {manualSelections.slice(0, 8).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
                    >
                      <button
                        type="button"
                        className="min-h-10 min-w-0 flex-1 text-left text-xs text-slate-200 hover:text-white"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        {formatRange(s.startsAt, s.endsAt, tz)} {s.note ? `· ${s.note}` : ''}
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-rose-300/35 bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-100 hover:bg-rose-500/25"
                        aria-label="Delete unavailable time"
                        title="Delete unavailable time"
                        onClick={() => removeSelection(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {manualDraftSummary ? (
              <p className="mt-3 text-xs text-slate-400">
                This will block about {manualDraftSummary.hours.toFixed(2)} hour(s) across {manualDraftSummary.days} day(s).
              </p>
            ) : null}
            </div>
            <div className="shrink-0 border-t border-white/10 bg-[#0c1424]/98 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-6">
              <button
                type="button"
                className="touch-manipulation w-full rounded-2xl bg-[linear-gradient(135deg,#f8fafc_0%,#67e8f9_45%,#a78bfa_100%)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_50px_rgba(103,232,249,0.28)]"
                onClick={() => void submitManualBlock()}
              >
                {editingManualId ? 'Save changes' : 'Add unavailable time'}
              </button>
            </div>
          </GlassPanel>
        </div>
      ) : null}

      <MutualReserveTogetherModal
        open={reserveMutualOpen}
        onDismiss={() => {
          setReserveMutualOpen(false)
          setReserveMutualPreview(null)
          setReserveMutualBanner(null)
        }}
        hostDisplayName={mutualData?.host.displayName ?? 'the host'}
        reserveMutualStart={reserveMutualStart}
        setReserveMutualStart={setReserveMutualStart}
        reserveMutualEnd={reserveMutualEnd}
        setReserveMutualEnd={setReserveMutualEnd}
        reserveMutualNote={reserveMutualNote}
        setReserveMutualNote={setReserveMutualNote}
        reserveMutualBanner={reserveMutualBanner}
        setReserveMutualBanner={setReserveMutualBanner}
        reserveMutualPreview={reserveMutualPreview}
        setReserveMutualPreview={setReserveMutualPreview}
        reserveMutualBusy={reserveMutualBusy}
        runMutualReservePreview={runMutualReservePreview}
        submitMutualReserve={submitMutualReserve}
        openMutualReserveInGoogleCalendar={openMutualReserveInGoogleCalendar}
        copyMutualReservationSummary={copyMutualReservationSummary}
        onSuccessGoReservations={() => {
          setReserveMutualOpen(false)
          setReserveMutualPreview(null)
          setReserveMutualBanner(null)
          setTab('reservations')
        }}
        onSuccessStayOnCompare={() => {
          setReserveMutualOpen(false)
          setReserveMutualPreview(null)
          setReserveMutualBanner(null)
        }}
        stayAfterSuccessLabel="Stay on Mutual"
      />

      {tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked ? (
        <MobileDayStripBar
          days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
          activeKey={mobileDayKey}
          onSelect={setMobileDayKey}
          positionClassName="bottom-[calc(3.65rem+env(safe-area-inset-bottom))] z-[38] pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-1"
        />
      ) : null}

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-[#050b18]/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-xl lg:hidden"
        aria-label="Dancecard sections"
      >
        <div className="mx-auto flex max-w-7xl gap-0.5">
          {TAB_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-current={tab === option.key ? 'page' : undefined}
              className={cx(
                'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-center text-[10px] font-semibold leading-tight transition sm:text-[11px]',
                tab === option.key ? 'bg-cyan-400/20 text-cyan-50' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
              )}
              onClick={() => setTab(option.key)}
            >
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast ? (
        <div
          className={cn(
            'fixed left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-slate-950/95 px-4 py-3 text-sm text-white shadow-[0_18px_55px_rgba(2,6,23,0.75)] backdrop-blur-xl lg:bottom-4',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'bottom-[calc(7rem+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(4.35rem+env(safe-area-inset-bottom))]'
          )}
        >
          <span>{toast}</span>
          <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {undoSnapshot ? (
        <div
          className={cn(
            'fixed left-4 right-4 z-[101] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[18px] border border-cyan-300/35 bg-cyan-500/15 px-4 py-2.5 text-sm text-cyan-50 backdrop-blur-xl lg:bottom-20',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'bottom-[calc(8.5rem+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))]'
          )}
        >
          <span>{undoSnapshot.label}</span>
          <button type="button" className="rounded-full border border-cyan-200/35 px-3 py-1 text-xs" onClick={() => void undoLastSelectionChange()}>
            Undo
          </button>
        </div>
      ) : null}
    </div>
    </>
  )
}

function GlassPanel({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-stone-700/50 bg-[#0c1424]/96 shadow-[0_16px_48px_rgba(2,6,23,0.38)] backdrop-blur-sm transition-[box-shadow,border-color] duration-200 motion-reduce:transition-none',
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectionCard({
  title,
  meta,
  tone = 'cyan',
  action,
}: {
  title: string
  meta: string
  tone?: 'cyan' | 'violet' | 'amber' | 'emerald'
  action?: React.ReactNode
}) {
  const toneClass =
    tone === 'violet'
      ? 'border-violet-300/20 bg-violet-300/10'
      : tone === 'amber'
        ? 'border-amber-300/20 bg-amber-300/10'
        : tone === 'emerald'
          ? 'border-emerald-300/20 bg-emerald-300/10'
          : 'border-cyan-300/20 bg-cyan-300/10'

  return (
    <div className={cx('flex items-start justify-between gap-3 rounded-xl border p-3', toneClass)}>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-5 text-white">{title}</div>
        <div className="mt-1 text-xs text-slate-200/85 sm:text-sm">{meta}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

function SessionCard(props: {
  htmlId?: string
  slot: ProgramSlot
  tz: string
  showTime?: boolean
  selected: boolean
  onToggle: () => void
}) {
  const { htmlId, slot, tz, showTime = true, selected, onToggle } = props
  const addLabel = selected ? 'On your dancecard — click to remove' : 'Click to add to My dancecard'
  const compactActionLabel = selected ? 'Added' : 'Tap to add'
  const policyTags = programPoliciesForSlots([slot])
  const roomChip = locationColor(slot.room)
  const hasRoomTint = Boolean(slot.room)
  return (
    <button
      id={htmlId}
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`${slot.title}. ${addLabel}`}
      className={cx(
        'group flex w-full min-w-0 flex-1 flex-col rounded-lg border p-1.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:flex-row sm:items-stretch',
        selected
          ? 'border-cyan-300/35 bg-cyan-300/12'
          : hasRoomTint
            ? `${roomChip.border} ${roomChip.surface} hover:bg-white/[0.06]`
            : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
      )}
    >
      <div className={cx('flex flex-col gap-1.5 sm:items-stretch', showTime ? 'sm:flex-row' : '')}>
        {showTime ? (
        <div className="min-w-0 shrink-0 rounded-md border border-white/10 bg-black/35 px-2 py-2 sm:min-w-[84px]">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Time</div>
          <div className="mt-1 text-sm font-semibold text-white">{formatTime(slot.startsAt, tz)}</div>
          <div className="mt-1 text-xs text-slate-400">{formatTime(slot.endsAt, tz)}</div>
        </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-5 text-white">{slot.title}</div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                {slot.room ? (
                  <span
                    className={cx(
                      'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                      roomChip.bg,
                      roomChip.fg,
                      roomChip.ring
                    )}
                  >
                    {slot.room}
                  </span>
                ) : null}
                {slot.track ? (
                  (() => {
                    const rc = roleColor(slot.track)
                    return (
                      <span
                        className={cx(
                          'rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ring-1',
                          rc.bg,
                          rc.fg,
                          rc.ring
                        )}
                      >
                        {slot.track}
                      </span>
                    )
                  })()
                ) : null}
                {policyTags.map((policy) => (
                  <span
                    key={policy.key}
                    className={cx(
                      'rounded-full border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]',
                      policyChipClass(policy.tone)
                    )}
                  >
                    {policy.label}
                  </span>
                ))}
              </div>
            </div>
            <span
              className={cx(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                selected
                  ? 'border-cyan-200/40 bg-cyan-300/20 text-cyan-50'
                  : 'border-white/10 bg-black/20 text-slate-400'
              )}
              aria-hidden
            >
              {selected ? '✓' : '+'}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{compactActionLabel}</div>
            <div className="truncate text-[11px] text-slate-400">{formatRange(slot.startsAt, slot.endsAt, tz)}</div>
          </div>
        </div>
      </div>
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
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [panelErr, setPanelErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    const r = await dancecardFetch<{ reservations: typeof rows }>(slug, '/reservations')
    setRows(r.reservations)
  }, [slug])

  useEffect(() => {
    void load().catch(() => null)
  }, [load])

  async function cancelReservationRow(id: string) {
    if (!window.confirm('Cancel this reservation?')) return
    setPanelErr(null)
    setCancelId(id)
    try {
      await dancecardFetch(slug, '/reservations', {
        method: 'PATCH',
        body: JSON.stringify({ reservationId: id }),
      })
      await load()
    } catch (e) {
      setPanelErr(formatDancecardApiMessage(e))
    } finally {
      setCancelId(null)
    }
  }

  return (
    <GlassPanel className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Scheduling</p>
          <h2 className="mt-1 font-serif text-2xl text-white sm:text-3xl">Reservations</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-200 sm:px-4 sm:text-sm"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>
      {panelErr ? <p className="mb-3 text-sm text-rose-200">{panelErr}</p> : null}
      <div className="mt-4 space-y-3 text-sm sm:mt-5">
        {rows.length ? (
          rows.map((b) => (
            <div key={b.id} className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <SelectionCard
                  title={`Together with ${b.role === 'host' ? b.guest.displayName : b.host.displayName}`}
                  meta={`${b.status.toUpperCase()} · ${formatRange(b.startsAt, b.endsAt, tz)}${b.note ? ` · ${b.note}` : ''}`}
                  tone={b.status === 'confirmed' ? 'emerald' : 'amber'}
                />
              </div>
              {b.status === 'confirmed' ? (
                <button
                  type="button"
                  disabled={cancelId === b.id}
                  className="shrink-0 rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/25 disabled:opacity-50"
                  onClick={() => void cancelReservationRow(b.id)}
                >
                  {cancelId === b.id ? 'Cancelling…' : 'Cancel'}
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5 text-slate-400">No reservations yet.</div>
        )}
      </div>
    </GlassPanel>
  )
}
