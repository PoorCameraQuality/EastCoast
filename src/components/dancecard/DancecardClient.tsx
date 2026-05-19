'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { dancecardFetch, DancecardApiError, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import {
  extractDancecardShareToken,
  formatRange,
  formatTime,
  exclusiveEndOfZonedCalendarDayMs,
  formatUtcMsAsDatetimeLocalInZone,
  groupSlotsByDay,
  parseDatetimeLocalInZone,
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
import {
  RescheduleReservationModal,
  type RescheduleReservationRow,
} from '@/components/dancecard/RescheduleReservationModal'
import { dayRangesFromSchedule } from '@/components/dancecard/eventAvailability'
import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { LoadingPhase } from '@/components/dancecard/attendee/LoadingPhase'
import { ScheduleChangeNotifications } from '@/components/dancecard/attendee/ScheduleChangeNotifications'
import { StaffOpenShiftsPanel } from '@/components/dancecard/attendee/StaffOpenShiftsPanel'
import { ShiftSwapPanel } from '@/components/dancecard/attendee/ShiftSwapPanel'
import { VettingApplicationForm } from '@/components/dancecard/attendee/VettingApplicationForm'
import { useConfirmDialog } from '@/components/dancecard/organizer/ui'
import type { DancecardModules } from '@/lib/dancecard/eventEntitlements'
import { DancecardCompactList } from '@/components/dancecard/DancecardCompactList'
import { roleColor } from '@/lib/dancecard/roleColors'
import { locationColor } from '@/lib/dancecard/locationColors'
import { cn } from '@/lib/cn'
import { DancecardAttendeeShellSkeleton } from '@/components/dancecard/organizer/ui'
import { AttendeeBottomNav, type AttendeeNavTab } from '@/components/dancecard/attendee/AttendeeBottomNav'
import { AttendeeSectionTabs, ATTENDEE_TAB_SHORT_LABEL } from '@/components/dancecard/attendee/AttendeeSectionTabs'
import { AttendeeProfileTab } from '@/components/dancecard/attendee/AttendeeProfileTab'
import {
  DEFAULT_ATTENDEE_PROFILE_CONFIG,
  type AttendeeProfileConfig,
  type AttendeeProfileStored,
  type AttendeePublicProfile,
} from '@/lib/dancecard/attendeeProfile'
import { GateTrustPanel } from '@/components/dancecard/attendee/GateTrustPanel'
import { HappeningNowRibbon } from '@/components/dancecard/attendee/program/HappeningNowRibbon'
import { VestibuleLoader } from '@/components/dancecard/loaders/VestibuleLoader'
import { SessionDetailSheet } from '@/components/dancecard/attendee/program/SessionDetailSheet'
import { MyScheduleView } from '@/components/dancecard/attendee/program/MyScheduleView'
import { ProgramSessionCard } from '@/components/dancecard/attendee/program/ProgramSessionCard'
import { policyChipClass, programPoliciesForSlots } from '@/lib/dancecard/programSlotPolicies'
import { IsoBoardTab } from '@/components/dancecard/attendee/iso/IsoBoardTab'
import { AttendeeGroupsTab } from '@/components/dancecard/attendee/attendee-groups/AttendeeGroupsTab'
import { IsoMarquee } from '@/components/dancecard/attendee/iso/IsoMarquee'
import { SessionFeedbackPanel } from '@/components/dancecard/attendee/SessionFeedbackPanel'
import { CompareRequestsInbox } from '@/components/dancecard/attendee/CompareRequestsInbox'
import { readScheduleSnapshot, writeScheduleSnapshot } from '@/lib/dancecard/scheduleCache'
import { VirtualProgramList } from '@/components/dancecard/attendee/program/VirtualProgramList'
import { PhotoPolicyChip } from '@/components/dancecard/attendee/PhotoPolicyChip'
import { AttendeeAnnouncements } from '@/components/dancecard/attendee/AttendeeAnnouncements'
import { AttendeeWeekendGuide } from '@/components/dancecard/attendee/AttendeeWeekendGuide'
import { PublicDancecardLanding } from '@/components/dancecard/attendee/PublicDancecardLanding'
import { PublicDancecardSignInPanel } from '@/components/dancecard/attendee/PublicDancecardSignInPanel'
import { programSlotDisplayRoom } from '@/lib/dancecard/programSlotDisplayRoom'
import { dayLabel } from '@/components/dancecard/time'
import type { PublicProgramSlotDto } from '@/lib/dancecard/publicProgramSlotsData'
import { resolveEventDisplayTitles } from '@/lib/dancecard/eventDisplay'

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
  trackId?: string | null
  trackDisplay?: string | null
  room: string | null
  locationId?: string | null
  description: string | null
  sortOrder: number
  tagNames?: string[]
  presenters?: {
    personId?: string
    sceneName: string
    role: string
    publicBio?: string | null
    photoUrl?: string | null
  }[]
  photoPolicy?: 'allowed' | 'restricted' | 'none'
  locationName?: string | null
}

type MeResponse = {
  account: { id: string; username: string; displayName: string; isStaff: boolean }
  prefs: {
    bufferMinutes: number
    availabilityStartsAt: string
    availabilityEndsAt: string
    allowCompareByUsername?: boolean
    compareVisibility?: 'off' | 'username' | 'link_only'
    showInCompareDirectory?: boolean
    hideBusyDetailsInCompare?: boolean
    icsRemindBeforeMinutes?: number
    profile?: AttendeeProfileStored
  }
  attendeeProfileConfig?: AttendeeProfileConfig
  publicProfile?: AttendeePublicProfile
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
  registrant?: { id: string; badgeTagline: string | null } | null
}

/** Payload from GET /share/:token or POST /compare/by-username (availability + optional mutual gaps). */
type MutualSharePayload = {
  meta: ScheduleMeta | null
  host: { displayName: string; id?: string }
  hostProfile?: AttendeePublicProfile | null
  viewerProfile?: AttendeePublicProfile | null
  viewerYou: string | null
  hostFreeGaps: { start: string; end: string }[]
  hostBusy: { start: string; end: string }[]
  mutualFreeGaps: { start: string; end: string }[] | null
}

type Tab = AttendeeNavTab
type ScheduleView = 'simple' | 'venue' | 'grid' | 'list'
type AvailabilityDisplayMode = 'all' | 'free'
type ManualPresetKey = 'break' | 'lunch' | 'dinner' | 'sleep'

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

type AvailabilityHourRow = {
  start: Date
  end: Date
  busy: boolean
  title: string
  editableManualId: string | null
}

const SHARE_LINK_PRIVACY_BLURB =
  'Anyone with the link only sees free vs busy — not your block titles or private notes.'
const DANCECARD_DISPLAY_TITLE = 'Dancecard'
const DANCECARD_DISPLAY_SUBTITLE =
  'A private planning surface for busy times, mutual free time, reservations, and calendar export.'

function scrubEventBrand(value: string | null | undefined, fallback = ''): string {
  const cleaned = (value ?? '')
    .replace(/Primal Arts Festival\s*2026/gi, DANCECARD_DISPLAY_TITLE)
    .replace(/Primal Arts Festival/gi, DANCECARD_DISPLAY_TITLE)
    .replace(/\bPAF\s*26\b/gi, DANCECARD_DISPLAY_TITLE)
    .replace(/\bPAF26\b/gi, DANCECARD_DISPLAY_TITLE)
    .replace(/\bPAF\b/gi, DANCECARD_DISPLAY_TITLE)
    .replace(/\s{2,}/g, ' ')
    .trim()
  return cleaned || fallback
}

const TAB_OPTIONS: Array<{ key: Tab; label: string; blurb: string }> = [
  {
    key: 'program',
    label: 'Program',
    blurb: 'Browse the official schedule and add or remove activities on your dancecard.',
  },
  { key: 'dancecard', label: 'My availability', blurb: 'Block off time, share your code, and export your plans.' },
  { key: 'profile', label: 'Profile', blurb: 'Photo, bio, contacts, and how others see you on Compare.' },
  {
    key: 'mutual',
    label: 'Compare',
    blurb: 'Shared schedules by login name or share link.',
  },
  { key: 'reservations', label: 'Reservations', blurb: 'Track confirmed time with other people.' },
  {
    key: 'iso',
    label: 'ISO board',
    blurb: 'Connection posts and threaded discussion.',
  },
  {
    key: 'attendee_groups',
    label: 'Attendee groups',
    blurb: 'Tent cities, room blocks, chores, and bring lists.',
  },
]

const VIEW_OPTIONS: Array<{ key: ScheduleView; label: string }> = [
  { key: 'simple', label: 'Timeline' },
  { key: 'venue', label: 'By venue' },
  { key: 'grid', label: 'Grid' },
  { key: 'list', label: 'List' },
]

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function shortDayLabel(day: string) {
  return day.split(',')[0]?.trim() ?? day
}

type MutualReserveBanner = null | { kind: 'success' } | { kind: 'error'; message: string }

function reservationPartnerName(r: ReservationRow): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

function isMealPresetNote(note: string | null | undefined): boolean {
  return /^Unavailable: (breakfast|break|lunch|dinner|sleep)$/i.test((note ?? '').trim())
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
    const r = programSlotDisplayRoom(s) || 'Other'
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
              ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground'
              : 'border-dc-border bg-dc-elevated-muted text-dc-text hover:border-dc-border'
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
        'fixed inset-x-0 z-[42] border-t border-dc-border bg-dc-surface/96 shadow-[0_-10px_36px_rgba(45,38,28,0.55)] backdrop-blur-md md:hidden',
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
  const router = useRouter()
  const useMinimalLayout = process.env.NEXT_PUBLIC_DANCECARD_CLASSIC_UI !== '1'
  const entryGateKey = `eck_dc_entry_gate_${slug}`
  const regCodeKey = useMemo(() => `eck_dc_reg_code_${slug}`, [slug])
  const [schedule, setSchedule] = useState<{ meta: ScheduleMeta | null; slots: ProgramSlot[] } | null>(null)
  const [staffRoster, setStaffRoster] = useState<StaffShiftRoster | null>(null)
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [loadErrStatus, setLoadErrStatus] = useState<number | null>(null)
  const [eventModules, setEventModules] = useState<DancecardModules | null>(null)
  const [eventProfile, setEventProfile] = useState<'camp' | 'hotel' | 'party' | 'conference' | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [tab, setTab] = useState<Tab>('dancecard')
  const [scheduleView, setScheduleView] = useState<ScheduleView>('simple')
  const [availabilityDisplayMode, setAvailabilityDisplayMode] = useState<AvailabilityDisplayMode>('all')
  const [selectedStaffName, setSelectedStaffName] = useState('')
  const [trackFilter, setTrackFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [presenterFilter, setPresenterFilter] = useState('')
  const [programSearch, setProgramSearch] = useState('')
  const [programDayFilter, setProgramDayFilter] = useState('')
  const [programTagFilters, setProgramTagFilters] = useState<Set<string>>(() => new Set())
  const [programFollowingOnly, setProgramFollowingOnly] = useState(false)
  const [followedPersonIds, setFollowedPersonIds] = useState<Set<string>>(() => new Set())
  const [scheduleStaleAt, setScheduleStaleAt] = useState<string | null>(null)
  const [compareRequestCount, setCompareRequestCount] = useState(0)
  const [attendeeGroupsBadge, setAttendeeGroupsBadge] = useState(0)
  const [groupsInviteToken, setGroupsInviteToken] = useState<string | null>(null)
  const [groupsDeepGroupId, setGroupsDeepGroupId] = useState<string | null>(null)
  const [scheduleChangeNotifyCount, setScheduleChangeNotifyCount] = useState(0)
  const { ask, dialog: confirmDialog } = useConfirmDialog()
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [compCode, setCompCode] = useState('')
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
  const [showAttendeeVestibule, setShowAttendeeVestibule] = useState(true)
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
  const [lastShareToken, setLastShareToken] = useState('')
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
  const mutualDataRef = useRef<MutualSharePayload | null>(null)
  const appTopRef = useRef<HTMLDivElement | null>(null)

  const tz = schedule?.meta?.timezone ?? 'America/New_York'
  const {
    productTitle: displayProductTitle,
    eventTitle: displayEventTitle,
    subtitle: displaySubtitle,
  } = useMemo(() => resolveEventDisplayTitles(schedule?.meta ?? null, slug), [schedule?.meta, slug])

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
      const selectedStartMs = utcMillisAtZonedWallClock(tz, sDate, 0, 0)
      if (selectedStartMs == null) return null
      const selectedEndMs = exclusiveEndOfZonedCalendarDayMs(tz, eDate)
      const eventStartMs = Date.parse(schedule?.meta?.windowStartsAt ?? '')
      const eventEndMs = Date.parse(schedule?.meta?.windowEndsAt ?? '')
      const startMs = Number.isFinite(eventStartMs) ? Math.max(selectedStartMs, eventStartMs) : selectedStartMs
      const endMs = Number.isFinite(eventEndMs) ? Math.min(selectedEndMs, eventEndMs) : selectedEndMs
      const start = new Date(startMs)
      const end = new Date(endMs)
      if (end <= start) return null
      return {
        startLocal: `${sDate}T00:00`,
        endLocal: `${eDate}T00:00`,
        startIso: start.toISOString(),
        endIso: end.toISOString(),
      }
    },
    [schedule?.meta?.windowEndsAt, schedule?.meta?.windowStartsAt, splitLocalDateTime, tz]
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

  /** Whole-event wall-clock presets (event timezone), including overnight sleep blocks. */
  const mealPresetOptions = useMemo(
    () => [
      { key: 'break' as ManualPresetKey, label: 'Break', startHour: 10, startMinute: 30, endHour: 11, endMinute: 0 },
      { key: 'lunch' as ManualPresetKey, label: 'Lunch', startHour: 12, startMinute: 0, endHour: 13, endMinute: 0 },
      { key: 'dinner' as ManualPresetKey, label: 'Dinner', startHour: 18, startMinute: 0, endHour: 19, endMinute: 0 },
      { key: 'sleep' as ManualPresetKey, label: 'Sleep', startHour: 23, startMinute: 0, endHour: 8, endMinute: 0 },
    ],
    []
  )

  const mealPresetLabel = useCallback((p: { label: string; startHour: number; startMinute: number; endHour: number; endMinute: number }) => {
    const start = new Date(2000, 0, 1, p.startHour, p.startMinute, 0, 0)
    const end = new Date(2000, 0, 1, p.endHour, p.endMinute, 0, 0)
    const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${p.label} ${fmt.format(start)}-${fmt.format(end)}`
  }, [])

  const localDateKey = useCallback(
    (iso: string) => zonedCalendarDateFromUtc(Date.parse(iso), tz),
    [tz]
  )

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

  useLayoutEffect(() => {
    mutualDataRef.current = mutualData
  }, [mutualData])

  const scrollToAppTop = useCallback(() => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      appTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    })
  }, [])

  const tabHash = useCallback((t: Tab): string => {
    if (t === 'mutual') return '#compare'
    if (t === 'dancecard') return ''
    if (t === 'attendee_groups') return '#groups'
    return `#${t}`
  }, [])

  const switchTab = useCallback(
    (next: Tab, opts?: { scroll?: boolean }) => {
      setTab(next)
      if (typeof window !== 'undefined') {
        const hash = tabHash(next)
        const href = hash
          ? `${window.location.pathname}${window.location.search}${hash}`
          : `${window.location.pathname}${window.location.search}`
        window.history.replaceState(null, '', href)
      }
      if (opts?.scroll) scrollToAppTop()
    },
    [scrollToAppTop, tabHash]
  )

  const openBlankManualModal = useCallback(() => {
    setEditingManualId(null)
    setMStart('')
    setMEnd('')
    setMTitle('')
    setManualOpen(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const seen = window.localStorage.getItem(`eck_dc_onboard_seen_${slug}`) === '1'
    setShowOnboarding(!seen)
  }, [slug])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.sessionStorage.getItem(`dc-vestibule-attendee:${slug}`) === '1') {
      setShowAttendeeVestibule(false)
    }
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
        const g = await dancecardFetch<{
          requiresRegistrationCode: boolean
          modules?: DancecardModules
          eventProfile?: 'camp' | 'hotel' | 'party' | 'conference'
        }>(slug, '/gate')
        if (cancelled) return
        if (g.modules) setEventModules(g.modules)
        if (g.eventProfile) setEventProfile(g.eventProfile)
        if (!g.requiresRegistrationCode) {
          setEntryGateUnlocked(true)
        } else if (typeof window !== 'undefined') {
          const ok = window.sessionStorage.getItem(entryGateKey) === 'ok'
          const code = window.sessionStorage.getItem(regCodeKey)
          if (ok && code) setEntryGateUnlocked(true)
        }
      } catch {
        /* Fail closed: do not unlock when gate endpoint fails. */
      } finally {
        if (!cancelled) setGateReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug, entryGateKey, regCodeKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('auth') === 'register') setAuthMode('register')
  }, [])

  const hiddenAttendeeTabs = useMemo((): AttendeeNavTab[] => {
    const hidden: AttendeeNavTab[] = []
    if (!me) hidden.push('profile')
    if (!eventModules?.iso_board) hidden.push('iso')
    if (!eventModules?.attendee_groups) hidden.push('attendee_groups')
    return hidden
  }, [eventModules, me])

  const visibleTabOptions = useMemo(
    () => TAB_OPTIONS.filter((o) => !hiddenAttendeeTabs.includes(o.key)),
    [hiddenAttendeeTabs],
  )

  const loadSchedule = useCallback(async () => {
    try {
      const s = await dancecardFetch<{ meta: ScheduleMeta | null; slots: ProgramSlot[] }>(slug, '/schedule')
      setSchedule(s)
      writeScheduleSnapshot(slug, s)
      setScheduleStaleAt(null)
      setLoadErr(null)
      setLoadErrStatus(null)
    } catch (e) {
      const cached = readScheduleSnapshot<{ meta: ScheduleMeta | null; slots: ProgramSlot[] }>(slug)
      if (cached) {
        setSchedule(cached.data)
        setScheduleStaleAt(cached.fetchedAt)
        setLoadErr(null)
        setLoadErrStatus(null)
        return
      }
      if (e instanceof DancecardApiError) {
        setLoadErrStatus(e.status)
        setLoadErr(formatDancecardApiMessage(e))
      } else {
        setLoadErrStatus(null)
        setLoadErr('Could not load schedule. Check your connection and try again.')
      }
    }
  }, [slug])

  function renderTopBar(options?: { luxury?: boolean }) {
    const title = schedule?.meta?.eventTitle?.trim() || displayEventTitle || slug
    return (
      <DancecardEventNav
        eventSlug={slug}
        eventTitle={title}
        variant={options?.luxury ? 'luxury' : 'default'}
      />
    )
  }

  useEffect(() => {
    void loadSchedule()
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadSchedule()
    }
    document.addEventListener('visibilitychange', onVis)
    const interval = window.setInterval(() => void loadSchedule(), 120_000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(interval)
    }
  }, [loadSchedule])

  const loadScheduleChangeNotifyCount = useCallback(async () => {
    if (!me) {
      setScheduleChangeNotifyCount(0)
      return
    }
    try {
      const res = await dancecardFetch<{ notifications: { id: string }[] }>(slug, '/schedule-change-notifications')
      setScheduleChangeNotifyCount(res.notifications?.length ?? 0)
    } catch {
      setScheduleChangeNotifyCount(0)
    }
  }, [slug, me])

  useEffect(() => {
    void loadScheduleChangeNotifyCount()
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadScheduleChangeNotifyCount()
    }
    document.addEventListener('visibilitychange', onVis)
    const interval = window.setInterval(() => void loadScheduleChangeNotifyCount(), 120_000)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.clearInterval(interval)
    }
  }, [loadScheduleChangeNotifyCount])

  const loadAttendeeGroupsBadge = useCallback(async () => {
    if (!me || !eventModules?.attendee_groups) {
      setAttendeeGroupsBadge(0)
      return
    }
    try {
      const res = await dancecardFetch<{ pendingOwnerCount: number }>(slug, '/attendee-groups/mine')
      setAttendeeGroupsBadge(res.pendingOwnerCount ?? 0)
    } catch {
      setAttendeeGroupsBadge(0)
    }
  }, [slug, me, eventModules?.attendee_groups])

  useEffect(() => {
    void loadAttendeeGroupsBadge()
  }, [loadAttendeeGroupsBadge])

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
    if (me?.account.isStaff) void loadStaffRoster()
    else setStaffRoster(null)
  }, [me?.account.isStaff, loadStaffRoster])

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  useEffect(() => {
    if (!me) {
      setFollowedPersonIds(new Set())
      return
    }
    void dancecardFetch<{ follows: { personId: string }[] }>(slug, '/follows').then(
      (d) => setFollowedPersonIds(new Set((d.follows ?? []).map((f) => f.personId))),
      () => setFollowedPersonIds(new Set())
    )
  }, [me, slug])

  useEffect(() => {
    if (!me || typeof window === 'undefined') return
    const key = `dc-land-program-after-auth:${slug}`
    if (window.sessionStorage.getItem(key) !== '1') return
    window.sessionStorage.removeItem(key)
    const compareUser = new URLSearchParams(window.location.search).get('compare')?.trim().replace(/^@/, '')
    if (compareUser) return
    const hash = window.location.hash.toLowerCase()
    if (hash === '#compare' || hash === '#mutual') return
    switchTab('program', { scroll: true })
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#program`)
  }, [me, slug, switchTab])

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
    return Array.from(
      new Set(
        s
          .map((x) => scrubEventBrand((x.trackDisplay ?? x.track) as string | null, '').trim())
          .filter(Boolean),
      ),
    ) as string[]
  }, [schedule])

  const programRoomsAll = useMemo(() => {
    const s = schedule?.slots ?? []
    return Array.from(
      new Set(s.map((x) => programSlotDisplayRoom(x)).filter(Boolean)),
    ).sort() as string[]
  }, [schedule])

  const presenterNames = useMemo(() => {
    const s = schedule?.slots ?? []
    const set = new Set<string>()
    for (const x of s) {
      for (const p of x.presenters ?? []) {
        const n = scrubEventBrand(p.sceneName, '').trim()
        if (n) set.add(n)
      }
    }
    return Array.from(set).sort()
  }, [schedule])

  const programDayKeys = useMemo(() => {
    const s = schedule?.slots ?? []
    const keys = new Set<string>()
    for (const x of s) {
      keys.add(zonedCalendarDateFromUtc(Date.parse(x.startsAt), tz))
    }
    return Array.from(keys).sort()
  }, [schedule, tz])

  const programTagOptions = useMemo(() => {
    const s = schedule?.slots ?? []
    const tags = new Set<string>()
    for (const slot of s) {
      for (const tag of slot.tagNames ?? []) {
        const t = tag.trim()
        if (t) tags.add(t)
      }
    }
    return Array.from(tags).sort((a, b) => a.localeCompare(b))
  }, [schedule])

  const filteredSlots = useMemo(() => {
    let s = (schedule?.slots ?? []).map((slot) => ({
      ...slot,
      title: scrubEventBrand(slot.title, 'Program activity'),
      track: slot.track ? scrubEventBrand(slot.track, '') || null : null,
      trackDisplay: slot.trackDisplay
        ? scrubEventBrand(slot.trackDisplay, '') || null
        : slot.track
          ? scrubEventBrand(slot.track, '') || null
          : null,
    }))
    if (trackFilter) s = s.filter((x) => ((x.trackDisplay ?? x.track) ?? '') === trackFilter)
    if (roomFilter) s = s.filter((x) => programSlotDisplayRoom(x) === roomFilter)
    if (presenterFilter) {
      s = s.filter((x) => (x.presenters ?? []).some((p) => scrubEventBrand(p.sceneName, '').trim() === presenterFilter))
    }
    if (programSearch.trim()) {
      const q = programSearch.trim().toLowerCase()
      s = s.filter((x) => {
        const pres = (x.presenters ?? []).map((p) => p.sceneName).join(' ')
        const blob = `${x.title} ${x.description ?? ''} ${programSlotDisplayRoom(x)} ${(x.trackDisplay ?? x.track) ?? ''} ${(x.tagNames ?? []).join(' ')} ${pres}`.toLowerCase()
        return blob.includes(q)
      })
    }
    if (programDayFilter) {
      s = s.filter((x) => zonedCalendarDateFromUtc(Date.parse(x.startsAt), tz) === programDayFilter)
    }
    if (programTagFilters.size > 0) {
      s = s.filter((x) => (x.tagNames ?? []).some((tag) => programTagFilters.has(tag.trim())))
    }
    if (programFollowingOnly && followedPersonIds.size > 0) {
      s = s.filter((x) =>
        (x.presenters ?? []).some((p) => p.personId && followedPersonIds.has(p.personId))
      )
    }
    return s
  }, [
    schedule,
    trackFilter,
    roomFilter,
    presenterFilter,
    programSearch,
    programDayFilter,
    programTagFilters,
    programFollowingOnly,
    followedPersonIds,
    tz,
  ])

  const grouped = useMemo(() => groupSlotsByDay(filteredSlots, tz), [filteredSlots, tz])
  const venueGroups = useMemo(() => groupByVenue(filteredSlots), [filteredSlots])
  const uniqueRoomsForGrid = useMemo(() => {
    return Array.from(new Set(filteredSlots.map((s) => programSlotDisplayRoom(s) || 'Other'))).sort()
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

  const toggleProgramTag = useCallback((tag: string) => {
    setProgramTagFilters((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }, [])

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
    if (!normalized) return [] as AvailabilityHourRow[]
    const startMs = Date.parse(normalized.startIso)
    const endMs = Date.parse(normalized.endIso)
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return []
    const hostClaims = reservations.filter((r) => r.role === 'host')
    const bufferMs = Math.max(0, buffer) * 60 * 1000
    const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd
    const selectionPriority = (s: MeResponse['selections'][number]): number => {
      if (s.kind === 'manual') {
        const note = (s.note ?? '').trim()
        if (note && !isMealPresetNote(note)) return 40
        if (isMealPresetNote(note)) return 20
        return 10
      }
      if (s.kind === 'program') return 30
      return 0
    }
    const selectionTitle = (s: MeResponse['selections'][number]): string => {
      if (s.kind === 'program') return scrubEventBrand(s.programTitle, 'Program activity')
      return s.note?.trim() || 'Busy'
    }
    const rows: AvailabilityHourRow[] = []
    for (let t = startMs; t < endMs; t += 60 * 60 * 1000) {
      const slotStart = new Date(t)
      const slotEnd = new Date(Math.min(t + 60 * 60 * 1000, endMs))
      const slotStartMs = slotStart.getTime()
      const slotEndMs = slotEnd.getTime()
      const coveringSelections = (me?.selections ?? [])
        .filter((s) => {
          const sStart = Date.parse(s.startsAt)
          const sEnd = Date.parse(s.endsAt)
          return overlaps(sStart - bufferMs, sEnd + bufferMs, slotStartMs, slotEndMs)
        })
        .sort((a, b) => selectionPriority(b) - selectionPriority(a))
      const covering = coveringSelections[0]
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
        title: claimTitle || (covering ? selectionTitle(covering) : isBusy ? 'Busy' : 'Open'),
        editableManualId: covering && covering.kind === 'manual' && !coveringClaim ? covering.id : null,
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
    const sMs = parseDatetimeLocalInZone(mStart, tz)
    const eMs = parseDatetimeLocalInZone(mEnd, tz)
    if (sMs == null || eMs == null || eMs <= sMs) return null
    const hours = (eMs - sMs) / 36e5
    const days = new Set([splitLocalDateTime(mStart).date, splitLocalDateTime(mEnd).date]).size
    return { hours, days }
  }, [mStart, mEnd, splitLocalDateTime, tz])

  const upcomingHostClaims = useMemo(
    () =>
      reservations
        .filter((r) => r.role === 'host')
        .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
        .slice(0, 6),
    [reservations]
  )

  const blockedTimesPanel = (compact = false) => (
    <GlassPanel className={compact ? 'p-2.5' : 'p-3'}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cx('font-semibold uppercase text-dc-muted/90', compact ? 'text-[10px] tracking-[0.18em]' : 'text-xs tracking-[0.25em]')}>
            Your blocked times
          </p>
          <p className={cx('mt-1 leading-snug text-dc-muted/80', compact ? 'text-[11px]' : 'text-xs')}>
            Presets and custom blocks currently on your dancecard.
          </p>
        </div>
        <button
          type="button"
          className={cx(
            'shrink-0 rounded-full border border-dc-accent-border bg-dc-accent-muted font-semibold text-dc-accent transition hover:border-dc-accent hover:bg-dc-accent-muted/80',
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs'
          )}
          onClick={openBlankManualModal}
        >
          Add busy time
        </button>
      </div>
      {manualSelections.length ? (
        <div className={cx('mt-3 space-y-1.5 overflow-y-auto pr-1', compact ? 'max-h-40' : 'max-h-52')}>
          {manualSelections.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-xl border border-dc-border bg-dc-elevated/80 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
            >
              <button
                type="button"
                className="min-h-10 min-w-0 flex-1 text-left text-xs leading-snug text-dc-text hover:text-dc-text"
                onClick={() => beginManualEdit(s.id)}
              >
                <span className="block font-semibold">{s.note?.trim() || 'Busy'}</span>
                <span className="block text-dc-muted/80">{formatRange(s.startsAt, s.endsAt, tz)}</span>
              </button>
              <button
                type="button"
                className="min-h-10 rounded-md border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1.5 text-xs font-semibold text-dc-accent hover:bg-dc-accent-muted/80"
                onClick={() => beginManualEdit(s.id)}
              >
                Edit
              </button>
              <button
                type="button"
                className="min-h-10 rounded-md border border-red-300 bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                aria-label="Delete busy time"
                title="Delete busy time"
                onClick={() => removeSelection(s.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dc-border bg-dc-elevated/80 px-3 py-2 text-xs text-dc-muted/80">
          Nothing blocked yet. Tap green hours below or use Add busy time.
        </p>
      )}
    </GlassPanel>
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

  const visibleAvailabilityHourRows = useMemo(
    () => (availabilityDisplayMode === 'free' ? availabilityHourRows.filter((row) => !row.busy) : availabilityHourRows),
    [availabilityDisplayMode, availabilityHourRows]
  )

  const visibleAvailabilityDays = useMemo(
    () =>
      availabilityDisplayMode === 'free'
        ? availabilityDays.map((day) => ({ ...day, rows: day.rows.filter((row) => !row.busy) }))
        : availabilityDays,
    [availabilityDisplayMode, availabilityDays]
  )

  const desktopDayGroups = useMemo(
    () =>
      visibleAvailabilityDays.map((day) => {
        const source = availabilityDays.find((candidate) => candidate.key === day.key) ?? day
        return {
          ...day,
          busyCount: source.rows.filter((r) => r.busy).length,
          openCount: source.rows.filter((r) => !r.busy).length,
        }
      }),
    [availabilityDays, visibleAvailabilityDays]
  )

  const availabilityDisplayToggle = (
    <div className="flex flex-wrap items-center gap-1.5">
      {[
        { key: 'all' as const, label: 'All hours' },
        { key: 'free' as const, label: 'Free only' },
      ].map((option) => (
        <button
          key={option.key}
          type="button"
          className={cx(
            'rounded-full border px-2.5 py-1 text-[11px] font-semibold transition',
            availabilityDisplayMode === option.key
              ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground'
              : 'border-dc-border bg-dc-elevated text-dc-text hover:border-dc-border-strong'
          )}
          onClick={() => setAvailabilityDisplayMode(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  const selectedDayLabel = useMemo(() => {
    const day = availabilityDays.find((d) => d.key === selectedDayKey)
    return day?.label ?? selectedDayKey
  }, [availabilityDays, selectedDayKey])

  const availabilityDaysKeySig = useMemo(
    () => availabilityDays.map((d) => d.key).join(','),
    [availabilityDays]
  )

  const availabilityDaysRef = useRef(availabilityDays)
  availabilityDaysRef.current = availabilityDays

  /** Label + rows for the mobile day schedule (times are wall-clock only; label makes day switches obvious). */
  const mobileSchedulePanel = useMemo(() => {
    const d = visibleAvailabilityDays.find((x) => x.key === mobileDayKey)
    return { label: d?.label ?? null, rows: d?.rows ?? [] }
  }, [visibleAvailabilityDays, mobileDayKey])

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

    return endMs > startMs ? { startMs, endMs } : null
  }, [schedule])

  const mutualSelectedRangeMs = useMemo(() => {
    if (!reserveMutualStart || !reserveMutualEnd) return { startMs: null as number | null, endMs: null as number | null }
    const startMs = new Date(reserveMutualStart).getTime()
    const endMs = new Date(reserveMutualEnd).getTime()
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      return { startMs: null, endMs: null }
    }
    return { startMs, endMs }
  }, [reserveMutualStart, reserveMutualEnd])

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
        const rangeStartMs = Date.parse(normalized.startIso)
        const rangeEndMs = Date.parse(normalized.endIso)
        if (!Number.isFinite(rangeStartMs) || !Number.isFinite(rangeEndMs) || rangeEndMs <= rangeStartMs) {
          throw new Error('Availability range is invalid.')
        }
        const outside = nextSelections.filter((s) => {
          const sStart = Date.parse(s.startsAt)
          const sEnd = Date.parse(s.endsAt)
          return (
            !Number.isFinite(sStart) ||
            !Number.isFinite(sEnd) ||
            sStart < rangeStartMs ||
            sEnd > rangeEndMs
          )
        })
        if (outside.length) {
          const kinds = Array.from(new Set(outside.map((s) => s.kind)))
          throw new Error(
            `${outside.length} block(s) fall outside your saved start/end dates (${kinds.join(', ')}). ` +
              'Widen the date range at the top, or remove those classes/blocks, then save again.'
          )
        }
        const bufferMinutes = Math.max(0, Math.min(120, Math.round(nextBuffer / 15) * 15))
        await dancecardFetch(slug, '/dancecard', {
          method: 'PUT',
          body: JSON.stringify({
            bufferMinutes,
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
        setToast(formatDancecardApiMessage(e))
        try {
          await refreshMe()
        } catch {
          /* ignore resync failure */
        }
        throw e
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
        void persist(nextSelections, nextBuffer, availabilityStart, availabilityEnd).catch(() => null)
      }, 450)
    },
    [persist, availabilityStart, availabilityEnd]
  )

  const updateProgramNote = useCallback(
    (slotId: string, note: string) => {
      const cur = me?.selections ?? []
      const trimmed = note.trim() ? note.trim().slice(0, 1000) : ''
      const next = cur.map((s) =>
        s.kind === 'program' && s.slotId === slotId ? { ...s, note: trimmed || null } : s,
      )
      setMe((m) => (m ? { ...m, selections: next } : m))
      queueSave(next, buffer)
    },
    [me, buffer, queueSave],
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

  async function persistWithUndo(
    next: MeResponse['selections'],
    previous: MeResponse['selections'],
    label: string
  ): Promise<boolean> {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setUndoSnapshot({ previous, label })
    undoTimerRef.current = window.setTimeout(() => setUndoSnapshot(null), 10000)
    setMe((m) => (m ? { ...m, selections: next } : m))
    try {
      await persist(next, buffer, availabilityStart, availabilityEnd)
      return true
    } catch {
      setMe((m) => (m ? { ...m, selections: previous } : m))
      setUndoSnapshot(null)
      if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
      return false
    }
  }

  function clippedDayBounds(dayYmd: string): { startMs: number; endMs: number } | null {
    if (!dayYmd || !manualDateRangeBounds) return null
    const dayStartMs = utcMillisAtZonedWallClock(tz, dayYmd, 0, 0)
    if (dayStartMs == null) return null
    const dayEndMs = exclusiveEndOfZonedCalendarDayMs(tz, dayYmd)
    const startMs = Math.max(dayStartMs, manualDateRangeBounds.rangeStartMs)
    const endMs = Math.min(dayEndMs, manualDateRangeBounds.rangeEndMs)
    return endMs > startMs ? { startMs, endMs } : null
  }

  function mergeOverlappingManualSelections(
    selections: MeResponse['selections'],
    candidateId: string
  ): { selections: MeResponse['selections']; merged: boolean } {
    const candidateSelection = selections.find((s) => s.id === candidateId && s.kind === 'manual')
    if (!candidateSelection) return { selections, merged: false }
    const cStart = Date.parse(candidateSelection.startsAt)
    const cEnd = Date.parse(candidateSelection.endsAt)
    const overlaps = selections.filter((s) => {
      if (s.kind !== 'manual' || s.id === candidateId) return false
      const sStart = Date.parse(s.startsAt)
      const sEnd = Date.parse(s.endsAt)
      return cStart < sEnd && sStart < cEnd
    })
    if (!overlaps.length) return { selections, merged: false }
    const mergedStart = Math.min(cStart, ...overlaps.map((s) => Date.parse(s.startsAt)))
    const mergedEnd = Math.max(cEnd, ...overlaps.map((s) => Date.parse(s.endsAt)))
    const overlapIds = new Set(overlaps.map((s) => s.id))
    return {
      merged: true,
      selections: selections
        .filter((s) => !overlapIds.has(s.id))
        .map((s) =>
          s.id === candidateId && s.kind === 'manual'
            ? { ...s, startsAt: new Date(mergedStart).toISOString(), endsAt: new Date(mergedEnd).toISOString() }
            : s
        ),
    }
  }

  async function addManualBlockFromMs(startMs: number, endMs: number, note: string | null, label: string) {
    if (endMs <= startMs) {
      setToast('Busy time end must be after start.')
      return false
    }
    const cur = me?.selections ?? []
    const candidateId = crypto.randomUUID()
    const provisional = [
      ...cur,
      {
        id: candidateId,
        kind: 'manual',
        slotId: null,
        startsAt: new Date(startMs).toISOString(),
        endsAt: new Date(endMs).toISOString(),
        note,
      },
    ]
    const { selections: next, merged } = mergeOverlappingManualSelections(provisional, candidateId)
    const ok = await persistWithUndo(next, cur, label)
    if (ok) setToast(merged ? `${label} Overlapping blocks were merged. Undo?` : `${label} Undo?`)
    return ok
  }

  function splitManualSelectionAroundRange(
    selections: MeResponse['selections'],
    selectionId: string,
    removeStartMs: number,
    removeEndMs: number
  ): MeResponse['selections'] {
    const next: MeResponse['selections'] = []
    for (const s of selections) {
      if (s.id !== selectionId || s.kind !== 'manual') {
        next.push(s)
        continue
      }
      const startMs = Date.parse(s.startsAt)
      const endMs = Date.parse(s.endsAt)
      if (removeEndMs <= startMs || removeStartMs >= endMs) {
        next.push(s)
        continue
      }
      const beforeEnd = Math.min(removeStartMs, endMs)
      const afterStart = Math.max(removeEndMs, startMs)
      if (beforeEnd > startMs) {
        next.push({ ...s, endsAt: new Date(beforeEnd).toISOString() })
      }
      if (afterStart < endMs) {
        next.push({
          ...s,
          id: beforeEnd > startMs ? crypto.randomUUID() : s.id,
          startsAt: new Date(afterStart).toISOString(),
        })
      }
    }
    return next
  }

  function selectionsOutsideRange(selections: MeResponse['selections'], rangeStartMs: number, rangeEndMs: number) {
    return selections.filter((s) => {
      const sStart = Date.parse(s.startsAt)
      const sEnd = Date.parse(s.endsAt)
      return !Number.isFinite(sStart) || !Number.isFinite(sEnd) || sStart < rangeStartMs || sEnd > rangeEndMs
    })
  }

  function trimSelectionsToRange(
    selections: MeResponse['selections'],
    rangeStartMs: number,
    rangeEndMs: number
  ): MeResponse['selections'] {
    return selections.flatMap((s) => {
      const startMs = Date.parse(s.startsAt)
      const endMs = Date.parse(s.endsAt)
      if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return []
      if (s.kind !== 'manual') return startMs >= rangeStartMs && endMs <= rangeEndMs ? [s] : []
      const clippedStart = Math.max(startMs, rangeStartMs)
      const clippedEnd = Math.min(endMs, rangeEndMs)
      if (clippedEnd <= clippedStart) return []
      return [{ ...s, startsAt: new Date(clippedStart).toISOString(), endsAt: new Date(clippedEnd).toISOString() }]
    })
  }

  async function blockDay(dayYmd: string) {
    const bounds = clippedDayBounds(dayYmd)
    if (!bounds) {
      setToast('That day is outside your saved date range.')
      return
    }
    const day = availabilityDays.find((d) => d.key === dayYmd)
    await addManualBlockFromMs(bounds.startMs, bounds.endMs, 'Unavailable: all day', `Blocked ${day?.label ?? dayYmd}.`)
  }

  async function blockSelectedDay() {
    await blockDay(selectedDayKey)
  }

  async function toggleHourBlock(row: AvailabilityHourRow) {
    const startMs = row.start.getTime()
    const endMs = row.end.getTime()
    if (!row.busy) {
      await addManualBlockFromMs(startMs, endMs, null, 'Blocked one hour.')
      return
    }
    if (!row.editableManualId) return
    const cur = me?.selections ?? []
    const next = splitManualSelectionAroundRange(cur, row.editableManualId, startMs, endMs)
    if (next.length === cur.length && next.every((s, i) => s === cur[i])) return
    if (await persistWithUndo(next, cur, 'Freed one hour.')) {
      setToast('Freed one hour. Undo?')
    }
  }

  async function undoLastSelectionChange() {
    if (!undoSnapshot) return
    const previous = undoSnapshot.previous
    setUndoSnapshot(null)
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current)
    setMe((m) => (m ? { ...m, selections: previous } : m))
    try {
      await persist(previous, buffer, availabilityStart, availabilityEnd)
      setToast('Undid last change.')
    } catch {
      /* persist already toasts */
    }
  }

  async function removeSelection(id: string) {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => s.id !== id)
    if (next.length === cur.length) return
    if (await persistWithUndo(next, cur, 'Removed busy time.')) {
      setToast('Removed busy time. Undo?')
    }
  }

  async function cancelReservation(reservationId: string) {
    const ok = await ask({
      title: 'Cancel reservation?',
      message: 'The time will become available again.',
      destructive: true,
      confirmLabel: 'Cancel reservation',
    })
    if (!ok) return
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
    const prevStart = availabilityStart
    const prevEnd = availabilityEnd
    const rangeStartMs = Date.parse(normalized.startIso)
    const rangeEndMs = Date.parse(normalized.endIso)
    if (!Number.isFinite(rangeStartMs) || !Number.isFinite(rangeEndMs) || rangeEndMs <= rangeStartMs) {
      setToast('Your date range is invalid.')
      return
    }
    let nextSelections = selectionsRef.current
    const outside = selectionsOutsideRange(nextSelections, rangeStartMs, rangeEndMs)
    if (outside.length) {
      const ok = await ask({
        title: 'Trim blocks outside range?',
        message: `${outside.length} saved block(s) fall outside that date range. Confirm to trim or remove those blocks and save the shorter range.`,
      })
      if (!ok) {
        setToast('Date range unchanged.')
        return
      }
      nextSelections = trimSelectionsToRange(nextSelections, rangeStartMs, rangeEndMs)
    }
    setAvailabilityStart(normalized.startLocal)
    setAvailabilityEnd(normalized.endLocal)
    try {
      await persist(nextSelections, buffer, normalized.startLocal, normalized.endLocal)
      setToast(outside.length ? 'Saved date range and trimmed outside blocks.' : 'Saved date range.')
    } catch {
      setAvailabilityStart(prevStart)
      setAvailabilityEnd(prevEnd)
    }
  }

  function closeManualModal() {
    setManualOpen(false)
    setEditingManualId(null)
    setMStart('')
    setMEnd('')
    setMTitle('')
  }

  function openManualFromOpenSlot(row: AvailabilityHourRow) {
    if (row.busy) return
    setEditingManualId(null)
    setMStart(formatUtcMsAsDatetimeLocalInZone(row.start.getTime(), tz))
    setMEnd(formatUtcMsAsDatetimeLocalInZone(row.end.getTime(), tz))
    setMTitle('')
    setMobileDayKey(zonedCalendarDateFromUtc(row.start.getTime(), tz))
    setManualOpen(true)
  }

  function beginManualEdit(selectionId: string) {
    const selection = (me?.selections ?? []).find((s) => s.id === selectionId && s.kind === 'manual')
    if (!selection) return
    setEditingManualId(selection.id)
    setMStart(formatUtcMsAsDatetimeLocalInZone(Date.parse(selection.startsAt), tz))
    setMEnd(formatUtcMsAsDatetimeLocalInZone(Date.parse(selection.endsAt), tz))
    setMTitle(selection.note ?? '')
    setManualOpen(true)
  }

  async function submitManualBlock() {
    if (!mStart || !mEnd) {
      setToast('Set both start and end for busy time.')
      return
    }
    const startMs = parseDatetimeLocalInZone(mStart, tz)
    const endMs = parseDatetimeLocalInZone(mEnd, tz)
    if (startMs == null || endMs == null) {
      setToast(`Could not read those times in the event timezone (${tz}).`)
      return
    }
    if (endMs <= startMs) {
      setToast('Busy time end must be after start.')
      return
    }
    if (manualDateRangeBounds) {
      if (
        startMs < manualDateRangeBounds.rangeStartMs ||
        endMs > manualDateRangeBounds.rangeEndMs
      ) {
        setToast('Busy time must stay within your saved date range.')
        return
      }
    }
    const cur = me?.selections ?? []
    const startsAt = new Date(startMs).toISOString()
    const endsAt = new Date(endMs).toISOString()
    const note = mTitle.trim() ? mTitle.trim().slice(0, 1000) : null
    const isEditing = Boolean(editingManualId)
    const candidateId = editingManualId ?? crypto.randomUUID()
    const provisional = isEditing
      ? cur.map((s) =>
          s.id === editingManualId && s.kind === 'manual'
            ? { ...s, startsAt, endsAt, note }
            : s
        )
      : [
          ...cur,
          {
            id: candidateId,
            kind: 'manual',
            slotId: null,
            startsAt,
            endsAt,
            note,
          },
        ]
    const { selections: next, merged } = mergeOverlappingManualSelections(provisional, candidateId)
    closeManualModal()
    try {
      await persist(next, buffer, availabilityStart, availabilityEnd)
      setToast(
        merged
          ? 'Updated busy time. Overlapping blocks were merged automatically.'
          : isEditing
            ? 'Updated busy time.'
            : 'Added busy time.'
      )
    } catch {
      /* persist already toasts and re-syncs /me */
    }
  }

  function applyManualPreset(presetKey: ManualPresetKey) {
    const preset = mealPresetOptions.find((p) => p.key === presetKey)
    if (!preset) {
      setToast('That preset is not in this event schedule.')
      return
    }
    const dayYmd =
      splitLocalDateTime(mStart || '').date ||
      splitLocalDateTime(availabilityStart).date ||
      selectedDayKey
    if (!dayYmd) {
      setToast('Pick a day first.')
      return
    }
    const startMs = utcMillisAtZonedWallClock(tz, dayYmd, preset.startHour, preset.startMinute)
    if (startMs == null) {
      setToast('Could not place that preset in the event timezone.')
      return
    }
    const wrapsNextDay =
      preset.endHour < preset.startHour ||
      (preset.endHour === preset.startHour && preset.endMinute <= preset.startMinute)
    const endYmd = wrapsNextDay
      ? zonedCalendarDateFromUtc(exclusiveEndOfZonedCalendarDayMs(tz, dayYmd), tz)
      : dayYmd
    const endMs = utcMillisAtZonedWallClock(tz, endYmd, preset.endHour, preset.endMinute)
    if (endMs == null) {
      setToast('Could not place that preset end in the event timezone.')
      return
    }
    setMTitle(`Unavailable: ${preset.key}`)
    setMStart(formatUtcMsAsDatetimeLocalInZone(startMs, tz))
    setMEnd(formatUtcMsAsDatetimeLocalInZone(endMs, tz))
    setToast(`${preset.label} ready for ${dayYmd}. Tap Save to block it once.`)
  }

  async function addDailyPresetAcrossAvailability(presetKey: ManualPresetKey) {
    const preset = mealPresetOptions.find((p) => p.key === presetKey)
    if (!preset) {
      setToast('That preset is not in this event schedule.')
      return
    }
    if (!availabilityStart || !availabilityEnd) {
      setToast('Set and save your date range first.')
      return
    }
    const normalized = normalizeAvailabilityBounds(availabilityStart, availabilityEnd)
    if (!normalized) {
      setToast('Your date range is invalid.')
      return
    }
    const rangeStartMs = Date.parse(normalized.startIso)
    const rangeEndMs = Date.parse(normalized.endIso)
    if (!Number.isFinite(rangeStartMs) || !Number.isFinite(rangeEndMs) || rangeEndMs <= rangeStartMs) {
      setToast('Your date range is invalid.')
      return
    }

    const current = me?.selections ?? []
    const dedupe = new Set(current.map((s) => `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`))
    const next = [...current]
    const wrapsNextDay =
      preset.endHour < preset.startHour ||
      (preset.endHour === preset.startHour && preset.endMinute <= preset.startMinute)

    let dayYmd = zonedCalendarDateFromUtc(rangeStartMs, tz)
    const lastInclusiveYmd = zonedCalendarDateFromUtc(rangeEndMs - 1, tz)

    while (dayYmd.localeCompare(lastInclusiveYmd) <= 0) {
      const blockStartMs = utcMillisAtZonedWallClock(tz, dayYmd, preset.startHour, preset.startMinute)
      if (blockStartMs == null) break
      const endYmd = wrapsNextDay
        ? zonedCalendarDateFromUtc(exclusiveEndOfZonedCalendarDayMs(tz, dayYmd), tz)
        : dayYmd
      const blockEndMs = utcMillisAtZonedWallClock(tz, endYmd, preset.endHour, preset.endMinute)
      if (blockEndMs == null) break
      if (blockEndMs <= rangeStartMs || blockStartMs >= rangeEndMs) {
        const nextStart = exclusiveEndOfZonedCalendarDayMs(tz, dayYmd)
        dayYmd = zonedCalendarDateFromUtc(nextStart, tz)
        continue
      }
      const clippedStartMs = Math.max(blockStartMs, rangeStartMs)
      const clippedEndMs = Math.min(blockEndMs, rangeEndMs)
      if (clippedEndMs <= clippedStartMs) {
        const nextStart = exclusiveEndOfZonedCalendarDayMs(tz, dayYmd)
        dayYmd = zonedCalendarDateFromUtc(nextStart, tz)
        continue
      }
      const startsAt = new Date(clippedStartMs).toISOString()
      const endsAt = new Date(clippedEndMs).toISOString()
      const note = `Unavailable: ${preset.key}`
      const key = `manual|${startsAt}|${endsAt}|${note}`
      if (dedupe.has(key)) {
        const nextStart = exclusiveEndOfZonedCalendarDayMs(tz, dayYmd)
        dayYmd = zonedCalendarDateFromUtc(nextStart, tz)
        continue
      }
      dedupe.add(key)
      next.push({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt,
        endsAt,
        note,
      })
      const nextStart = exclusiveEndOfZonedCalendarDayMs(tz, dayYmd)
      dayYmd = zonedCalendarDateFromUtc(nextStart, tz)
    }

    if (next.length === current.length) {
      setToast(`${preset.label} blocks already exist for this range.`)
      return
    }
    if (await persistWithUndo(next, current, `Added ${preset.key} to every event day.`)) {
      closeManualModal()
      setToast(`${preset.label} blocked on every event day. You can edit or delete individual blocks.`)
    }
  }

  async function clearMealPresetsAcrossAvailability() {
    const cur = me?.selections ?? []
    const next = cur.filter(
      (s) => !(s.kind === 'manual' && /^Unavailable: (breakfast|break|lunch|dinner|sleep)$/i.test(s.note ?? ''))
    )
    if (next.length === cur.length) {
      setToast('No presets to clear.')
      return
    }
    if (await persistWithUndo(next, cur, 'Cleared presets.')) {
      setToast('Cleared presets. Undo?')
    }
  }

  async function clearUnavailableForSelectedDay() {
    const cur = me?.selections ?? []
    const next = cur.filter((s) => !(s.kind === 'manual' && localDateKey(s.startsAt) === selectedDayKey))
    if (next.length === cur.length) {
      setToast('No busy times found for that day.')
      return
    }
    if (await persistWithUndo(next, cur, `Cleared busy times for ${selectedDayKey}.`)) {
      setToast(`Cleared busy times for ${selectedDayKey}. Undo?`)
    }
  }

  async function duplicateYesterdayToSelectedDay() {
    const cur = me?.selections ?? []
    const keys = availabilityDays.map((d) => d.key).sort()
    const idx = keys.indexOf(selectedDayKey)
    if (idx <= 0) {
      setToast('No previous day in your saved range to copy from.')
      return
    }
    const prevKey = keys[idx - 1]!
    const source = cur.filter((s) => s.kind === 'manual' && localDateKey(s.startsAt) === prevKey)
    if (!source.length) {
      setToast('No busy times found on the previous day to duplicate.')
      return
    }
    const prevStartMs = utcMillisAtZonedWallClock(tz, prevKey, 0, 0)
    const selStartMs = utcMillisAtZonedWallClock(tz, selectedDayKey, 0, 0)
    if (prevStartMs == null || selStartMs == null) {
      setToast('Could not align days in the event timezone.')
      return
    }
    const delta = selStartMs - prevStartMs
    const dedupe = new Set(cur.map((s) => `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`))
    const shifted = source
      .map((s) => ({
        id: crypto.randomUUID(),
        kind: 'manual',
        slotId: null,
        startsAt: new Date(Date.parse(s.startsAt) + delta).toISOString(),
        endsAt: new Date(Date.parse(s.endsAt) + delta).toISOString(),
        note: s.note ?? null,
      }))
      .filter((s) => {
        const key = `${s.kind}|${s.startsAt}|${s.endsAt}|${s.note ?? ''}`
        if (dedupe.has(key)) return false
        dedupe.add(key)
        return true
      })
    if (!shifted.length) {
      setToast('Those busy times are already on this day.')
      return
    }
    const next = [...cur, ...shifted]
    if (await persistWithUndo(next, cur, 'Duplicated yesterday busy times.')) {
      setToast(`Copied ${shifted.length} busy time(s) to ${selectedDayKey}. Undo?`)
    }
  }

  async function copyShare() {
    if (!me) {
      setToast('Sign in to create a share link.')
      return
    }
    let token: string
    let shareUrl: string
    try {
      const res = await dancecardFetch<{ token: string; url?: string }>(slug, '/share', { method: 'POST' })
      token = res.token.trim()
      const path = `/dancecard/${encodeURIComponent(slug)}/s/${encodeURIComponent(token)}`
      const canon = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '').trim()
      shareUrl = canon
        ? `${canon}${path}`
        : res.url?.trim()
          ? res.url.trim()
          : `${window.location.origin.replace(/\/+$/, '')}${path}`
    } catch (e) {
      setToast(formatDancecardApiMessage(e))
      return
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setToast(`Copied share link. Code: ${token}`)
      } else {
        setToast(`Share link: ${shareUrl}`)
      }
    } catch {
      setToast(`Share link ready (copy manually): ${shareUrl}`)
    }
    setLastShareToken(token)
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
  }

  function exportDancecardCalendar(target: 'ical' | 'google') {
    if (!me) return
    const n = countDancecardIcsEvents(me.selections ?? [], reservations)
    if (n === 0) {
      setToast('Add busy blocks or reservations to export your availability.')
      return
    }
    const body = buildDancecardIcs({
      calendarName: `${displayEventTitle} — availability`,
      attendeeDisplayName: me.account.displayName,
      selections: me.selections ?? [],
      reservations,
      programRemindBeforeMinutes: me.prefs.icsRemindBeforeMinutes ?? 15,
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
        if (typeof window !== 'undefined') {
          try {
            window.sessionStorage.removeItem(`eck_dc_mutual_${slug}`)
          } catch {
            /* ignore */
          }
        }
      } catch (e) {
        setMutualData(null)
        setToast(formatDancecardApiMessage(e))
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

  useEffect(() => {
    if (typeof window === 'undefined' || !me) return
    const compareUser = new URLSearchParams(window.location.search).get('compare')?.trim().replace(/^@/, '')
    if (!compareUser) return
    const normalized = compareUser.toLowerCase()
    setTab('mutual')
    setMutualCompareUsername(normalized)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(`eck_dc_compare_user_${slug}`, normalized)
    }
    void refreshMutual({ mode: 'username' })
  }, [me, slug, refreshMutual])

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
    const lines = [`Dancecard reservation`, `Host: ${host}`, `You: ${you}`, `Time: ${range} (${tz})`]
    const note = reserveMutualNote.trim()
    if (note) lines.push(`Note: ${note}`)
    const text = lines.join('\n')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setToast('Copied summary — paste into Discord, Signal, or a text.')
      } else {
        setToast(text)
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
    tz,
  ])

  const openMutualReserveInGoogleCalendar = useCallback(() => {
    const host = mutualData?.host.displayName ?? 'Host'
    const you = me?.account.displayName ?? 'You'
    const s = new Date(reserveMutualStart)
    const e = new Date(reserveMutualEnd)
    const calTitle = `Dancecard (${host})`
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
          "Green here is the host's free time only. Use an account that isn't the host, then tap Compare (username) or Load under Advanced — green is when you're both free and you can reserve."
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
      setToast('Saved. View it in Reservations.')
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

  // After sign-in, mutual share payload must reload so `viewerYou` + green blocks get click handlers.
  useEffect(() => {
    if (tab !== 'mutual' || !me || !mutualDataRef.current) return
    if (mutualCompareUsername.trim()) {
      void refreshMutual()
      return
    }
    if (!mutualTokenRef.current.trim()) return
    void refreshMutual()
  }, [me?.account.id, tab, refreshMutual, me, mutualCompareUsername])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const applyHash = () => {
      const h = window.location.hash.toLowerCase()
      if (h === '#map' || h.startsWith('#map-')) {
        const locationId = h.startsWith('#map-') ? decodeURIComponent(h.slice(5)) : null
        const path = locationId
          ? `/dancecard/${slug}/map?locationId=${encodeURIComponent(locationId)}`
          : `/dancecard/${slug}/map`
        router.replace(path)
        return
      }
      if (h === '#policies') {
        router.replace(`/dancecard/${slug}/policies`)
        return
      }
      if (h === '#program') setTab('program')
      else if (h === '#profile' && me) setTab('profile')
      else if (h === '#compare' || h === '#mutual') setTab('mutual')
      else if (h === '#reservations') setTab('reservations')
      else if (h === '#iso' && eventModules?.iso_board) setTab('iso')
      else if ((h === '#groups' || h.startsWith('#groups')) && eventModules?.attendee_groups) {
        setTab('attendee_groups')
        const raw = h.slice(1)
        const qIdx = raw.indexOf('?')
        if (qIdx >= 0) {
          const params = new URLSearchParams(raw.slice(qIdx + 1))
          const invite = params.get('invite')
          if (invite) setGroupsInviteToken(invite)
        }
        const pathPart = qIdx >= 0 ? raw.slice(0, qIdx) : raw
        if (pathPart.startsWith('groups/')) {
          const gid = pathPart.slice('groups/'.length).split('/')[0]
          if (gid) setGroupsDeepGroupId(gid)
        }
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [router, slug, me, eventModules?.iso_board, eventModules?.attendee_groups])

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
    try {
      await persist(merged, buffer, availabilityStart, availabilityEnd)
      if (nextName) {
        setToast(`Applied staff schedule for ${nextName}.`)
      } else {
        setToast('Removed staff schedule autofill.')
      }
    } catch {
      void checkSession()
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
        const trimmedComp = compCode.trim()
        const res = await dancecardFetch<{
          registration?: { categoryName?: string }
        }>(slug, '/register', {
          method: 'POST',
          body: JSON.stringify({
            username,
            password,
            displayName,
            ...(regCode ? { registrationAccessCode: regCode } : {}),
            ...(trimmedComp ? { compCode: trimmedComp } : {}),
          }),
        })
        // Return to sign-in mode after registration to make completion unambiguous.
        await dancecardFetch(slug, '/logout', { method: 'POST' })
        setAuthMode('login')
        setPassword('')
        setPasswordConfirm('')
        setDisplayName('')
        setCompCode('')
        const ticket = res.registration?.categoryName?.trim()
        setAuthNotice({
          kind: 'success',
          text: ticket
            ? `Account created as ${ticket}. Please sign in.`
            : 'Account created. Please sign in.',
        })
        scrollToAppTop()
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
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(`dc-land-program-after-auth:${slug}`, '1')
        }
      }
      setPassword('')
      setPasswordConfirm('')
      await checkSession()
      scrollToAppTop()
    } catch (e) {
      setAuthNotice({ kind: 'error', text: e instanceof DancecardApiError ? e.body : 'Auth failed' })
    }
  }

  async function logout() {
    await dancecardFetch(slug, '/logout', { method: 'POST' })
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(regCodeKey)
      window.sessionStorage.removeItem(`eck_dc_compare_user_${slug}`)
      window.sessionStorage.removeItem(`eck_dc_mutual_${slug}`)
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

  function openRename() {
    setRenameValue(me?.account.displayName ?? '')
    setRenameOpen(true)
  }

  async function submitRename() {
    const next = renameValue.trim()
    if (!next) return
    try {
      await dancecardFetch(slug, '/me', {
        method: 'PATCH',
        body: JSON.stringify({ displayName: next }),
      })
      setRenameOpen(false)
      await refreshMe()
      setToast('Display name updated.')
    } catch {
      setToast('Rename failed.')
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '1') switchTab('program', { scroll: true })
      if (e.key === '2') switchTab('dancecard', { scroll: true })
      if (e.key === '3') switchTab('profile', { scroll: true })
      if (e.key === '4') switchTab('mutual', { scroll: true })
      if (e.key === '5') switchTab('reservations', { scroll: true })
      if (e.key === '6' && eventModules?.iso_board) switchTab('iso', { scroll: true })
      if (e.key === '7' && eventModules?.attendee_groups) switchTab('attendee_groups', { scroll: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [switchTab, eventModules?.iso_board, eventModules?.attendee_groups])

  function copyTabLink() {
    if (typeof window === 'undefined') return
    const hash =
      tab === 'program'
        ? '#program'
        : tab === 'profile'
          ? '#profile'
          : tab === 'mutual'
            ? '#compare'
            : tab === 'reservations'
              ? '#reservations'
              : tab === 'iso'
                ? '#iso'
                : tab === 'attendee_groups'
                  ? '#groups'
                  : ''
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}${hash}`
    void navigator.clipboard?.writeText(url).then(
      () => setToast('Tab link copied.'),
      () => setToast(url),
    )
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

  const togglePersonFollow = useCallback(
    async (personId: string, follow: boolean) => {
      try {
        if (follow) {
          await dancecardFetch(slug, '/follows', {
            method: 'POST',
            body: JSON.stringify({ personId }),
          })
          setFollowedPersonIds((prev) => {
            const next = new Set(prev)
            next.add(personId)
            return next
          })
        } else {
          await dancecardFetch(slug, `/follows?personId=${encodeURIComponent(personId)}`, {
            method: 'DELETE',
          })
          setFollowedPersonIds((prev) => {
            const next = new Set(prev)
            next.delete(personId)
            return next
          })
        }
      } catch (e) {
        setToast(formatDancecardApiMessage(e))
      }
    },
    [slug]
  )

  const saveAttendeeProfile = useCallback(
    async (patch: {
      displayName?: string
      profile?: AttendeeProfileStored
      allowCompareByUsername?: boolean
      showInCompareDirectory?: boolean
      hideBusyDetailsInCompare?: boolean
      icsRemindBeforeMinutes?: number
      badgeTagline?: string | null
    }) => {
      const res = await dancecardFetch<{
        account?: { displayName: string }
        registrant?: { id: string; badgeTagline: string | null }
        prefs?: {
          profile?: AttendeeProfileStored
          publicProfile?: AttendeePublicProfile
          allowCompareByUsername?: boolean
          showInCompareDirectory?: boolean
          hideBusyDetailsInCompare?: boolean
          icsRemindBeforeMinutes?: number
        }
      }>(slug, '/me', {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      setMe((m) => {
        if (!m) return m
        return {
          ...m,
          account: res.account ? { ...m.account, displayName: res.account.displayName } : m.account,
          prefs: {
            ...m.prefs,
            ...(res.prefs?.profile !== undefined ? { profile: res.prefs.profile } : {}),
            ...(res.prefs?.allowCompareByUsername !== undefined
              ? { allowCompareByUsername: res.prefs.allowCompareByUsername }
              : {}),
            ...(res.prefs?.showInCompareDirectory !== undefined
              ? { showInCompareDirectory: res.prefs.showInCompareDirectory }
              : {}),
            ...(res.prefs?.hideBusyDetailsInCompare !== undefined
              ? { hideBusyDetailsInCompare: res.prefs.hideBusyDetailsInCompare }
              : {}),
            ...(res.prefs?.icsRemindBeforeMinutes !== undefined
              ? { icsRemindBeforeMinutes: res.prefs.icsRemindBeforeMinutes }
              : {}),
          },
          registrant: res.registrant ?? m.registrant,
          publicProfile: res.prefs?.publicProfile ?? m.publicProfile,
        }
      })
      if (patch.allowCompareByUsername !== undefined) {
        setToast(
          patch.allowCompareByUsername
            ? 'Compare by username is on.'
            : 'Compare by username is off. Share links still work.'
        )
      } else {
        setToast('Profile saved.')
      }
    },
    [slug]
  )

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
        {renderTopBar()}
        <div className="relative min-h-screen overflow-hidden bg-dc-surface px-4 py-20 text-dc-text">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.14),transparent_32%),linear-gradient(180deg,var(--dc-surface)_0%,var(--dc-surface-muted)_100%)]" />
          <LoadingPhase phase="gate" />
        </div>
      </>
    )
  }

  if (!entryGateUnlocked) {
    return (
      <>
        {renderTopBar()}
        <div className="relative min-h-screen overflow-hidden bg-dc-surface px-4 py-20 text-dc-text">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.14),transparent_32%),linear-gradient(180deg,var(--dc-surface)_0%,var(--dc-surface-muted)_100%)]" />
          <div className="relative mx-auto max-w-lg">
            <GlassPanel className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-dc-accent/80">Availability access</p>
              <h1 className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">Enter event password</h1>
              <p className="mt-3 text-sm leading-6 text-dc-muted">
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
                  className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-4 py-3 text-sm text-dc-text placeholder:text-dc-subtle"
                  value={entryGateInput}
                  onChange={(e) => {
                    setEntryGateInput(e.target.value)
                    setEntryGateErr(null)
                  }}
                  placeholder="Event access password"
                />
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)]"
                >
                  Unlock availability
                </button>
              </form>
              {entryGateErr ? (
                <div className="mt-3">
                  <GateTrustPanel message={entryGateErr} onRetry={() => void unlockEntryGate()} />
                </div>
              ) : null}
            </GlassPanel>
          </div>
        </div>
      </>
    )
  }

  const scheduleStaleBanner =
    scheduleStaleAt && schedule ? (
      <div className="mx-auto max-w-5xl px-4 pt-2">
        <p className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Offline copy from {new Date(scheduleStaleAt).toLocaleString()} — reconnect to refresh.
        </p>
      </div>
    ) : null

  if (!schedule && loadErr) {
    return (
      <>
        {renderTopBar()}
        <div className="mx-auto max-w-lg px-4 py-12 text-dc-text">
        <div className="rounded-xl border border-red-300 bg-dc-elevated p-6 text-center">
          <h1 className="text-lg font-semibold text-red-800">
            {loadErrStatus === 404
              ? 'Event not found'
              : !loadErrStatus || loadErrStatus >= 500
                ? 'Could not reach the server'
                : 'Could not load schedule'}
          </h1>
          <p className="mt-2 text-sm text-dc-muted">{loadErr}</p>
          <button
            type="button"
            className="mt-4 rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground"
            onClick={() => void loadSchedule()}
          >
            Try again
          </button>
        </div>
      </div>
      </>
    )
  }

  if (!schedule || !authChecked) {
    return (
      <>
        {renderTopBar()}
        <div className="relative min-h-screen overflow-hidden bg-dc-surface text-dc-text">
          <DancecardAttendeeShellSkeleton />
        </div>
      </>
    )
  }

  if (!me) {
    if (!schedule.meta) {
      return (
        <>
          {renderTopBar()}
          <div className="relative min-h-screen bg-dc-surface px-4 py-16 text-dc-text">
            <p className="mx-auto max-w-lg text-center text-sm text-dc-muted">Loading event details…</p>
          </div>
        </>
      )
    }
    return (
      <>
        {renderTopBar({ luxury: true })}
        <PublicDancecardLanding
          eventSlug={slug}
          meta={schedule.meta}
          productTitle={displayProductTitle}
          eventTitle={displayEventTitle}
          subtitle={displaySubtitle}
          programSlots={schedule.slots}
          onCreateAccount={() => {
            setAuthMode('register')
            setPasswordConfirm('')
            setShowPassword(false)
            setAuthNotice(null)
          }}
          signInPanel={
            <PublicDancecardSignInPanel
              compact
              authMode={authMode}
              setAuthMode={setAuthMode}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              passwordConfirm={passwordConfirm}
              setPasswordConfirm={setPasswordConfirm}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              displayName={displayName}
              setDisplayName={setDisplayName}
              compCode={compCode}
              setCompCode={setCompCode}
              authNotice={authNotice}
              setAuthNotice={setAuthNotice}
              onSubmit={() => void submitAuth()}
            />
          }
        />
      </>
    )
  }

  const attendeeShellReady = Boolean(schedule && authChecked && me)

  if (attendeeShellReady && showAttendeeVestibule) {
    return (
      <>
        {renderTopBar()}
        <div className="relative min-h-screen bg-dc-surface px-4 py-12 text-dc-text">
          <VestibuleLoader
            variant="attendee-shuffle"
            onComplete={() => {
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(`dc-vestibule-attendee:${eventSlug.toLowerCase()}`, '1')
              }
              setShowAttendeeVestibule(false)
            }}
          />
        </div>
      </>
    )
  }

  if (useMinimalLayout) {
    return (
      <>
        {confirmDialog}
        {renameOpen ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-dc-surface/80 p-4 backdrop-blur-md">
            <GlassPanel className="w-full max-w-md p-6">
              <h3 className="font-serif text-xl text-dc-text">Display name</h3>
              <input
                className="mt-3 w-full rounded-xl border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
              />
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="rounded-full border border-dc-border px-4 py-2 text-sm text-dc-muted" onClick={() => setRenameOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground" onClick={() => void submitRename()}>
                  Save
                </button>
              </div>
            </GlassPanel>
          </div>
        ) : null}
        {renderTopBar()}
        <div
          ref={appTopRef}
          className={cn(
            'relative min-h-screen overflow-hidden bg-dc-surface text-dc-text',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'pb-[calc(7.25rem+env(safe-area-inset-bottom))] lg:pb-10'
              : 'pb-[calc(3.85rem+env(safe-area-inset-bottom))] lg:pb-10'
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(198,167,94,0.08),transparent_24%),linear-gradient(180deg,var(--dc-surface)_0%,var(--dc-surface-muted)_58%,var(--dc-surface)_100%)]" />
          <div className="relative z-[1] mx-auto max-w-5xl space-y-2 px-2.5 py-2 sm:space-y-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-6">
            <AttendeeWeekendGuide eventSlug={slug} variant="organizer-classic" />
            <AttendeeAnnouncements eventSlug={slug} className="mt-2" variant="feed" />
            <GlassPanel className="hidden p-2.5 lg:block">
              <AttendeeSectionTabs
                options={visibleTabOptions}
                active={tab}
                onSelect={(t) => switchTab(t, { scroll: true })}
                onCopyLink={copyTabLink}
              />
            </GlassPanel>

            {tab === 'dancecard' ? (
              <>
            <GlassPanel className="space-y-2.5 p-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-dc-subtle">Your schedule</p>
                <h1 className="mt-0.5 font-serif text-lg leading-snug text-dc-text sm:text-2xl">
                  {displayEventTitle}
                </h1>
                <p className="mt-1 text-[11px] leading-snug text-dc-muted">
                  Block busy time, set buffer, and share your link.{' '}
                  <span className="text-dc-subtle">· {tz}</span>
                </p>
                <button
                  type="button"
                  className="mt-2 touch-manipulation text-left text-[11px] font-semibold text-dc-accent underline decoration-dc-accent-border underline-offset-2 transition hover:text-dc-accent-hover"
                  onClick={() => {
                    switchTab('mutual', { scroll: true })
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#compare`)
                    }
                  }}
                >
                  Open Compare — someone else's free/busy strips
                </button>
              </div>
              {showOnboarding ? (
                <div className="flex items-start justify-between gap-2 rounded-lg border border-dc-accent-border bg-dc-accent-muted px-2 py-1.5">
                  <p className="text-[11px] leading-snug text-dc-text/95">
                    <span className="font-semibold text-dc-accent">Tip:</span> dates → busy blocks → share.
                  </p>
                  <button
                    type="button"
                    className="shrink-0 rounded-full border border-dc-accent-border px-2 py-0.5 text-[10px] text-dc-accent"
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
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">Start</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-2 py-2 text-xs text-dc-text outline-none transition focus:border-dc-accent sm:text-sm"
                    value={splitLocalDateTime(availabilityStart).date}
                    onChange={(e) => setAvailabilityStart(`${e.target.value}T00:00`)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-dc-subtle">End</label>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-lg border border-dc-border bg-dc-elevated px-2 py-2 text-xs text-dc-text outline-none transition focus:border-dc-accent sm:text-sm"
                    value={splitLocalDateTime(availabilityEnd).date}
                    onChange={(e) => setAvailabilityEnd(`${e.target.value}T00:00`)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 border-t border-dc-border/50 pt-2">
                <button
                  type="button"
                  className="rounded-lg border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1.5 text-xs font-semibold text-dc-accent transition hover:bg-dc-accent-muted/80"
                  onClick={() => void saveAvailabilityRange()}
                >
                  Save dates
                </button>
                <span className="w-full pl-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-dc-subtle sm:w-auto">
                  Buffer
                </span>
                {[0, 15, 30, 45, 60].map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    className={cx(
                      'rounded-full border px-2 py-1 text-[11px] font-medium transition',
                      buffer === minutes
                        ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground'
                        : 'border-dc-border bg-dc-elevated text-dc-text hover:border-dc-border-strong'
                    )}
                    onClick={() => applyBuffer(minutes)}
                  >
                    {minutes === 0 ? 'None' : `${minutes}m`}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-dc-subtle">
                Public card & compare-by-username:{' '}
                <button
                  type="button"
                  className="font-semibold text-dc-accent underline underline-offset-2"
                  onClick={() => switchTab('profile', { scroll: true })}
                >
                  Profile tab
                </button>
              </p>
            </GlassPanel>

            <GlassPanel className="p-2.5">
              <p className="mb-2 text-[10px] leading-snug text-dc-subtle">{SHARE_LINK_PRIVACY_BLURB}</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-xl border border-dc-accent-border bg-dc-accent-muted px-3 py-2 text-xs font-semibold text-dc-accent transition hover:bg-dc-accent-muted/80"
                  onClick={() => {
                    switchTab('mutual', { scroll: true })
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#compare`)
                    }
                  }}
                >
                  Compare
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-3 py-2 text-xs font-semibold text-dc-accent-foreground"
                  onClick={() => void copyShare()}
                >
                  Share link
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-dc-border bg-dc-elevated-muted px-3 py-2 text-xs text-dc-text"
                  onClick={openBlankManualModal}
                >
                  Add busy time
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-dc-border bg-dc-elevated-muted px-3 py-2 text-xs text-dc-text"
                  onClick={() => exportDancecardCalendar('ical')}
                >
                  Apple / iCal (.ics)
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-900"
                  onClick={() => exportDancecardCalendar('google')}
                >
                  Google Calendar
                </button>
              </div>
              {lastShareToken ? (
                <p className="mt-2 text-[10px] leading-snug text-dc-subtle">
                  Share code: <span className="font-mono text-dc-text">{lastShareToken}</span>. Paste the code or full link
                  into Compare under Advanced.
                </p>
              ) : null}
            </GlassPanel>

            {blockedTimesPanel(true)}

            <GlassPanel className="p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dc-subtle">Scene Reservations</p>
              <div className="mt-1.5 space-y-1.5">
                {upcomingHostClaims.length ? (
                  upcomingHostClaims.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-dc-border bg-dc-elevated-muted px-2 py-1.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-dc-text">{r.guest.displayName}</p>
                        <p className="text-[10px] text-dc-muted">{formatRange(r.startsAt, r.endsAt, tz)}</p>
                      </div>
                      {r.note ? <span className="max-w-full truncate text-[10px] text-dc-muted sm:max-w-[45%]">{r.note}</span> : null}
                      <button
                        type="button"
                        className="shrink-0 rounded-full border border-red-300 bg-red-100 px-2 py-1 text-[10px] font-medium text-red-800 hover:bg-red-100"
                        onClick={() => void cancelReservation(r.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-dc-subtle">No scene reservations yet.</p>
                )}
              </div>
            </GlassPanel>

            <GlassPanel className="p-2.5 md:hidden">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-dc-subtle">Day schedule</p>
                {availabilityDisplayToggle}
              </div>
              {availabilityDays.length ? (
                <div
                  className="mt-2 border-b border-dc-border/50 pb-2 md:hidden"
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
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-tight text-dc-text" aria-live="polite">
                    {mobileSchedulePanel.label}
                  </p>
                  <button
                    type="button"
                    className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1 text-[11px] font-semibold text-dc-accent"
                    onClick={() => void blockSelectedDay()}
                  >
                    Block whole day
                  </button>
                </div>
              ) : null}
              <div
                key={mobileDayKey || 'none'}
                className="mt-1.5 max-h-[min(58vh,calc(100dvh-11.5rem))] space-y-1 overflow-y-auto pr-0.5 sm:max-h-[min(58vh,calc(100dvh-12rem))]"
              >
                {mobileSchedulePanel.rows.length === 0 ? (
                  <p className="py-6 text-center text-xs leading-relaxed text-dc-subtle">
                    {availabilityDays.length
                      ? availabilityDisplayMode === 'free'
                        ? 'No free hours in your saved date range for this day.'
                        : 'No hours in your saved date range for this day.'
                      : 'Set start and end dates above to see hours here.'}
                  </p>
                ) : (
                  mobileSchedulePanel.rows.map((row, idx) => {
                    const slotCls = cx(
                      'grid w-full min-h-touch grid-cols-[98px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                      row.busy
                        ? 'border-red-300 bg-red-100 text-red-800'
                        : 'border-emerald-300 bg-emerald-100 text-emerald-800 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-100'
                    )
                    const inner = (
                      <>
                        <span className="font-semibold text-dc-text">{formatTime(row.start.toISOString(), tz)}</span>
                        <span className="truncate">{row.title}</span>
                      </>
                    )
                    return row.busy ? (
                      row.editableManualId ? (
                        <button
                          key={`${row.start.toISOString()}-${idx}`}
                          type="button"
                          className={slotCls}
                          aria-label={`Mark free ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                          onClick={() => void toggleHourBlock(row)}
                        >
                          {inner}
                        </button>
                      ) : (
                        <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                          {inner}
                        </div>
                      )
                    ) : (
                      <button
                        key={`${row.start.toISOString()}-${idx}`}
                        type="button"
                        className={slotCls}
                        aria-label={`Mark busy ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                        onClick={() => void toggleHourBlock(row)}
                      >
                        {inner}
                      </button>
                    )
                  })
                )}
              </div>
              <p className="mt-2 border-t border-dc-border/50 pt-2 text-[10px] leading-snug text-dc-subtle">
                Tap <span className="text-emerald-700">green</span> hours to mark busy; tap editable red hours to free them.
                Times are for the highlighted day.
              </p>
            </GlassPanel>

            <GlassPanel className="hidden p-3 md:block">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.25em] text-dc-muted">Calendar by day</p>
                {availabilityDisplayToggle}
              </div>
              {desktopDayGroups.length ? (
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {desktopDayGroups.map((day) => (
                    <div key={day.key} className="rounded-xl border border-dc-border bg-dc-elevated-muted p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-dc-text">{day.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-dc-muted">
                            {day.busyCount} busy · {day.openCount} open
                          </p>
                          <button
                            type="button"
                            className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-2 py-1 text-[10px] font-semibold text-dc-accent"
                            onClick={() => void blockDay(day.key)}
                          >
                            Block day
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
                        {day.rows.length ? day.rows.map((row, idx) => {
                          const slotCls = cx(
                            'grid w-full min-h-10 grid-cols-[84px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition motion-reduce:transition-none',
                            row.busy
                              ? 'border-red-300 bg-red-100 text-red-800'
                              : 'border-emerald-300 bg-emerald-100 text-emerald-800 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-100'
                          )
                          const inner = (
                            <>
                              <span className="font-semibold text-dc-text">{formatTime(row.start.toISOString(), tz)}</span>
                              <span className="truncate">{row.title}</span>
                            </>
                          )
                          return row.busy ? (
                            row.editableManualId ? (
                              <button
                                key={`${day.key}-${row.start.toISOString()}-${idx}`}
                                type="button"
                                className={slotCls}
                                aria-label={`Mark free ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                onClick={() => void toggleHourBlock(row)}
                              >
                                {inner}
                              </button>
                            ) : (
                              <div key={`${day.key}-${row.start.toISOString()}-${idx}`} className={slotCls}>
                                {inner}
                              </div>
                            )
                          ) : (
                            <button
                              key={`${day.key}-${row.start.toISOString()}-${idx}`}
                              type="button"
                              className={slotCls}
                              aria-label={`Mark busy ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                              onClick={() => void toggleHourBlock(row)}
                            >
                              {inner}
                            </button>
                          )
                        }) : (
                          <p className="py-3 text-xs text-dc-subtle">
                            {availabilityDisplayMode === 'free' ? 'No free hours on this day.' : 'No hours in this day.'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-dc-muted">Set a date range to show times.</p>
              )}
            </GlassPanel>
            {eventModules?.shift_swaps && me?.account.isStaff ? (
              <StaffOpenShiftsPanel eventSlug={slug} timezone={tz} isStaff />
            ) : null}
            {eventModules?.shift_swaps ? (
              <ShiftSwapPanel eventSlug={slug} modules={eventModules} myShiftIds={[]} />
            ) : null}
            {eventModules?.vetting_applications ? (
              <VettingApplicationForm eventSlug={slug} modules={eventModules} />
            ) : null}
              </>
            ) : tab === 'program' && schedule ? (
              <>
              {scheduleStaleBanner}
              <ScheduleChangeNotifications eventSlug={slug} onUnreadCount={setScheduleChangeNotifyCount} />
              <SessionFeedbackPanel
                eventSlug={slug}
                enabled={Boolean(eventModules?.session_feedback)}
                slotLabels={Object.fromEntries(schedule.slots.map((s) => [s.id, s.title]))}
              />
              <IsoMarquee
                eventSlug={slug}
                enabled={Boolean(eventModules?.iso_board)}
                onOpenBoard={() => switchTab('iso', { scroll: true })}
                className="mb-1"
              />
              <DancecardProgramTabBody
                scheduleView={scheduleView}
                setScheduleView={setScheduleView}
                grouped={grouped}
                venueGroups={venueGroups}
                uniqueRoomsForGrid={uniqueRoomsForGrid}
                filteredSlots={filteredSlots}
                schedule={schedule}
                tz={tz}
                programSelected={programSelected}
                toggleProgram={toggleProgram}
                programSearch={programSearch}
                setProgramSearch={setProgramSearch}
                programDayFilter={programDayFilter}
                setProgramDayFilter={setProgramDayFilter}
                programDayKeys={programDayKeys}
                selectedProgramCount={selectedProgramCount}
                trackFilter={trackFilter}
                setTrackFilter={setTrackFilter}
                roomFilter={roomFilter}
                setRoomFilter={setRoomFilter}
                presenterFilter={presenterFilter}
                setPresenterFilter={setPresenterFilter}
                trackOptions={tracks}
                roomOptions={programRoomsAll}
                presenterOptions={presenterNames}
                programTagOptions={programTagOptions}
                programTagFilters={programTagFilters}
                onToggleProgramTag={toggleProgramTag}
                eventSlug={slug}
                programSelections={me?.selections ?? []}
                onUpdateProgramNote={updateProgramNote}
                followedPersonIds={followedPersonIds}
                programFollowingOnly={programFollowingOnly}
                setProgramFollowingOnly={setProgramFollowingOnly}
                onToggleFollow={togglePersonFollow}
              />
              </>
            ) : tab === 'program' ? (
              <GlassPanel className="p-3 sm:p-4">
                <p className="text-sm text-dc-muted">Loading program…</p>
              </GlassPanel>
            ) : tab === 'profile' && me ? (
              <GlassPanel className="p-3 sm:p-4">
                <AttendeeProfileTab
                  username={me.account.username}
                  displayName={me.account.displayName}
                  stored={me.prefs.profile ?? {}}
                  config={me.attendeeProfileConfig ?? DEFAULT_ATTENDEE_PROFILE_CONFIG}
                  allowCompareByUsername={Boolean(me.prefs.allowCompareByUsername)}
                  showInCompareDirectory={Boolean(me.prefs.showInCompareDirectory)}
                  hideBusyDetailsInCompare={Boolean(me.prefs.hideBusyDetailsInCompare)}
                  icsRemindBeforeMinutes={me.prefs.icsRemindBeforeMinutes ?? 15}
                  eventSlug={slug}
                  badgeTagline={me.registrant?.badgeTagline ?? null}
                  avatarPreviewUrl={me.publicProfile?.avatarUrl ?? null}
                  onSave={async (patch) => {
                    try {
                      await saveAttendeeProfile(patch)
                    } catch (e) {
                      setToast(formatDancecardApiMessage(e))
                    }
                  }}
                  onRenameClick={openRename}
                />
              </GlassPanel>
            ) : tab === 'mutual' ? (
              <GlassPanel className="space-y-2 p-3 sm:p-4">
                <CompareRequestsInbox
                  eventSlug={slug}
                  onCountChange={setCompareRequestCount}
                  onAccepted={(username) => {
                    setMutualCompareUsername(username)
                    void refreshMutual({ mode: 'username' })
                  }}
                />
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
                  windowStartMs={schedule?.meta ? Date.parse(schedule.meta.windowStartsAt) : undefined}
                  windowEndMs={schedule?.meta ? Date.parse(schedule.meta.windowEndsAt) : undefined}
                  selectedStartMs={mutualSelectedRangeMs.startMs}
                  selectedEndMs={mutualSelectedRangeMs.endMs}
                />
              </GlassPanel>
            ) : tab === 'iso' ? (
              <IsoBoardTab eventSlug={slug} signedIn={Boolean(me)} />
            ) : tab === 'attendee_groups' ? (
              <GlassPanel className="p-3 sm:p-4">
                <AttendeeGroupsTab
                  eventSlug={slug}
                  signedIn={Boolean(me)}
                  eventProfile={eventProfile ?? undefined}
                  initialGroupId={groupsDeepGroupId}
                  initialInviteToken={groupsInviteToken}
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
                'fixed left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[22px] border border-dc-border bg-dc-surface/95 px-4 py-3 text-sm text-dc-text shadow-[0_18px_55px_rgba(45,38,28,0.75)] backdrop-blur-xl lg:bottom-4',
                tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
                  ? 'bottom-[calc(7rem+env(safe-area-inset-bottom))]'
                  : 'bottom-[calc(4.35rem+env(safe-area-inset-bottom))]'
              )}
            >
              <span>{toast}</span>
              <button type="button" className="rounded-full border border-dc-border px-3 py-1 text-xs text-dc-muted" onClick={() => setToast(null)}>
                Dismiss
              </button>
            </div>
          ) : null}
        </div>

        <AttendeeBottomNav
          active={tab}
          onSelect={(t) => switchTab(t, { scroll: true })}
          badges={{
            program:
              scheduleChangeNotifyCount > 0
                ? scheduleChangeNotifyCount
                : selectedProgramCount > 0
                  ? selectedProgramCount
                  : undefined,
            mutual: compareRequestCount > 0 ? compareRequestCount : undefined,
            attendee_groups: attendeeGroupsBadge > 0 ? attendeeGroupsBadge : undefined,
          }}
          hiddenTabs={hiddenAttendeeTabs}
        />

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
            className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto overscroll-y-contain bg-dc-surface/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:py-8"
            role="presentation"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeManualModal()
            }}
          >
            <GlassPanel className="flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden motion-reduce:transition-none sm:animate-in">
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-dc-border bg-dc-elevated/98 px-5 pb-3 pt-5 backdrop-blur-sm sm:px-6 sm:pt-6">
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-dc-muted">Busy time</p>
                  <h3 className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">Block time on my schedule</h3>
                </div>
                <button
                  type="button"
                  className="shrink-0 touch-manipulation rounded-full border border-dc-border px-4 py-2.5 text-sm font-medium text-dc-muted"
                  onClick={closeManualModal}
                >
                  Close
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">Title</label>
                  <input
                    className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-4 py-3 text-dc-text"
                    value={mTitle}
                    maxLength={150}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Work, gym, commute..."
                  />
                </div>
                {availabilityDays.length ? (
                  <div className="mt-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.22em] text-dc-subtle">Pick day</p>
                    <HostMobileDayChipsRow
                      days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
                      activeKey={selectedDayKey}
                      onSelect={(key) => {
                        setMobileDayKey(key)
                        setMStart((prev) => mergeLocalDateTime(prev, { date: key }))
                        setMEnd((prev) => mergeLocalDateTime(prev, { date: key }))
                      }}
                    />
                    <button
                      type="button"
                      className="mt-2 rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-xs font-semibold text-dc-accent"
                      onClick={() => void blockSelectedDay()}
                    >
                      Block whole day ({selectedDayLabel})
                    </button>
                  </div>
                ) : null}
                <div className="mt-3">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-dc-subtle">Use once</p>
                <div className="flex flex-wrap gap-2">
                  {mealPresetOptions.map((preset) => (
                    <button
                      key={`once-${preset.key}`}
                      type="button"
                      className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                      onClick={() => applyManualPreset(preset.key)}
                    >
                      {mealPresetLabel(preset)}
                    </button>
                  ))}
                </div>
                <p className="mb-2 mt-3 text-xs uppercase tracking-[0.22em] text-dc-subtle">Apply every event day</p>
                <p className="mb-2 text-[11px] leading-snug text-dc-subtle">
                  Adds one block per day; edit or delete individual days afterward.
                </p>
                <div className="flex flex-wrap gap-2">
                  {mealPresetOptions.map((preset) => (
                    <button
                      key={`daily-${preset.key}`}
                      type="button"
                      className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-xs font-semibold text-dc-accent"
                      onClick={() => void addDailyPresetAcrossAvailability(preset.key)}
                    >
                      {preset.label}
                    </button>
                  ))}
                  {!mealPresetOptions.length ? (
                    <p className="text-xs text-dc-subtle">No presets.</p>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                    onClick={() => void clearMealPresetsAcrossAvailability()}
                  >
                    Clear presets
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                    onClick={() => void clearUnavailableForSelectedDay()}
                  >
                    Clear day ({selectedDayKey})
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                    onClick={() => void duplicateYesterdayToSelectedDay()}
                  >
                    Duplicate yesterday to {selectedDayKey}
                  </button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">Start</label>
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                      value={splitLocalDateTime(mStart).date}
                      min={manualDateRangeBounds?.dateMin}
                      max={manualDateRangeBounds?.dateMax}
                      onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                    />
                    <input
                      type="time"
                      step={900}
                      className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                      value={splitLocalDateTime(mStart).time}
                      onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                    />
                  </div>
                  <input
                    type="datetime-local"
                    className="hidden"
                    value={mStart}
                    min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                    max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                    onChange={(e) => setMStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">End</label>
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                      value={splitLocalDateTime(mEnd).date}
                      min={manualDateRangeBounds?.dateMin}
                      max={manualDateRangeBounds?.dateMax}
                      onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                    />
                    <input
                      type="time"
                      step={900}
                      className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                      value={splitLocalDateTime(mEnd).time}
                      onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                    />
                  </div>
                  <input
                    type="datetime-local"
                    className="hidden"
                    value={mEnd}
                    min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                    max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                    onChange={(e) => setMEnd(e.target.value)}
                  />
                </div>
              </div>
              {manualSelections.length ? (
                <div className="mt-4 rounded-2xl border border-dc-border bg-dc-elevated/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dc-muted/90">Already blocked</p>
                  <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                    {manualSelections.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 rounded-xl border border-dc-border bg-dc-elevated/85 px-2.5 py-2"
                    >
                      <button
                        type="button"
                        className="min-h-10 min-w-0 flex-1 text-left text-xs text-dc-text hover:text-dc-text"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        {formatRange(s.startsAt, s.endsAt, tz)} {s.note ? `· ${s.note}` : ''}
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1.5 text-xs font-semibold text-dc-accent hover:bg-dc-accent-muted/80"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-red-300 bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                        aria-label="Delete busy time"
                        title="Delete busy time"
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
                <p className="mt-3 text-xs text-dc-muted">
                  This will block about {manualDraftSummary.hours.toFixed(2)} hour(s) across {manualDraftSummary.days} day(s).
                </p>
              ) : null}
              </div>
              <div className="shrink-0 border-t border-dc-border bg-dc-elevated/98 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-6">
                <button
                  type="button"
                  className="touch-manipulation w-full rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground"
                  onClick={() => void submitManualBlock()}
                >
                  {editingManualId ? 'Save changes' : 'Save busy time'}
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
            switchTab('reservations', { scroll: true })
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
      {confirmDialog}
      {renameOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-dc-surface/80 p-4 backdrop-blur-md">
          <GlassPanel className="w-full max-w-md p-6">
            <h3 className="font-serif text-xl text-dc-text">Display name</h3>
            <input
              className="mt-3 w-full rounded-xl border border-dc-border bg-dc-surface-muted px-3 py-2 text-dc-text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-full border border-dc-border px-4 py-2 text-sm text-dc-muted" onClick={() => setRenameOpen(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground" onClick={() => void submitRename()}>
                Save
              </button>
            </div>
          </GlassPanel>
        </div>
      ) : null}
      {renderTopBar()}
      <div
        ref={appTopRef}
        className={cn(
          'relative min-h-screen overflow-hidden bg-dc-surface text-dc-text lg:pb-10',
          tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
            ? 'pb-[calc(7.25rem+env(safe-area-inset-bottom))]'
            : 'pb-[calc(3.85rem+env(safe-area-inset-bottom))]'
        )}
      >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.13),transparent_26%),radial-gradient(circle_at_88%_14%,rgba(198,167,94,0.08),transparent_24%),linear-gradient(180deg,var(--dc-surface)_0%,var(--dc-surface-muted)_55%,var(--dc-surface)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(198,167,94,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(198,167,94,0.045)_1px,transparent_1px)] bg-[size:92px_92px] opacity-10" />

      <div className="relative z-[1] mx-auto max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <GlassPanel className="overflow-hidden p-3 sm:p-4 lg:p-5">
          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-dc-accent/85 sm:text-xs sm:tracking-[0.38em]">
                    {displayProductTitle}
                  </p>
                  <h1 className="mt-2 font-serif text-xl leading-tight text-dc-text sm:mt-2 sm:text-3xl lg:text-[2.1rem]">
                    {displayEventTitle}
                  </h1>
                  <p className="mt-1 hidden max-w-3xl text-sm leading-6 text-dc-text/85 md:block">
                    Share your availability, compare free windows with someone else, and reserve time without exposing
                    the details of either person&apos;s calendar.
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-full border border-dc-border bg-white/[0.03] px-3 py-1.5 text-xs text-dc-accent-foreground transition hover:bg-dc-accent-muted"
                  onClick={() => void loadSchedule()}
                >
                  Refresh
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="rounded-xl border border-dc-border bg-dc-elevated/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-dc-muted/90">Today</p>
                  <div className="mt-2 font-serif text-lg text-dc-text sm:mt-2 sm:text-2xl">{todayLabel(tz)}</div>
                  <p className="mt-2 text-xs text-dc-muted/80 sm:text-sm">{tz}</p>
                </div>
                <div className="rounded-xl border border-dc-border bg-dc-elevated/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-dc-muted/90">Coming up next</p>
                  {nextAgendaItem ? (
                    nextAgendaItem.type === 'selection' ? (
                      <>
                        <div className="mt-2 text-base font-semibold text-dc-text sm:mt-2 sm:text-xl">
                          {staffManualBlockTitle(
                            nextAgendaItem.selection,
                            nextAgendaItem.selection.kind === 'program'
                              ? scrubEventBrand(nextAgendaItem.selection.programTitle, 'Scheduled block')
                              : 'Busy time'
                          )}
                        </div>
                        <p className="mt-1 text-sm text-dc-muted">
                          {findMatchingStaffShift(nextAgendaItem.selection)
                            ? 'Imported busy time'
                            : `${nextAgendaItem.selection.kind === 'program' && nextAgendaItem.selection.programRoom ? `${nextAgendaItem.selection.programRoom} · ` : ''}${formatRange(nextAgendaItem.selection.startsAt, nextAgendaItem.selection.endsAt, tz)}`}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mt-2 text-base font-semibold text-dc-text sm:mt-2 sm:text-xl">
                          Scene with {reservationPartnerName(nextAgendaItem.reservation)}
                        </div>
                        <p className="mt-1 text-sm text-dc-muted">
                          {formatRange(nextAgendaItem.reservation.startsAt, nextAgendaItem.reservation.endsAt, tz)}
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <div className="mt-2 text-base font-semibold text-dc-text sm:text-xl">Nothing scheduled yet.</div>
                      <p className="mt-1 text-sm text-dc-muted/80">Block busy time or make a reservation.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dc-border bg-dc-elevated/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-dc-muted/90">Signed in</p>
                  <h2 className="mt-1 truncate text-base font-semibold text-dc-text sm:text-xl">{me.account.displayName}</h2>
                  <p className="mt-0.5 truncate text-xs text-dc-muted sm:text-sm">@{me.account.username}</p>
                </div>
                <div className="shrink-0 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 sm:px-3 sm:text-xs">
                  Live
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className="rounded-full border border-dc-border bg-white/[0.03] px-3 py-1 text-xs text-dc-accent-foreground transition hover:bg-dc-accent-muted"
                  onClick={openRename}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="rounded-full border border-dc-border bg-white/[0.03] px-3 py-1 text-xs text-dc-accent-foreground transition hover:bg-dc-accent-muted"
                  onClick={openBlankManualModal}
                >
                  Add busy time
                </button>
                <button
                  type="button"
                  title={SHARE_LINK_PRIVACY_BLURB}
                  className="rounded-full border border-dc-border bg-white/[0.03] px-3 py-1 text-xs text-dc-accent-foreground transition hover:bg-dc-accent-muted"
                  onClick={() => void copyShare()}
                >
                  Copy share link
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-300 bg-red-100 px-3 py-1 text-xs text-red-800 transition hover:bg-red-200"
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
            <AttendeeWeekendGuide eventSlug={slug} variant="organizer-classic" />
            <AttendeeAnnouncements eventSlug={slug} className="mt-2" variant="feed" />
            <GlassPanel className="hidden p-2.5 lg:block">
              <AttendeeSectionTabs
                options={visibleTabOptions}
                active={tab}
                onSelect={(t) => switchTab(t, { scroll: true })}
              />
            </GlassPanel>

            {tab === 'program' && schedule ? (
              <>
                {scheduleStaleBanner}
                <ScheduleChangeNotifications eventSlug={slug} onUnreadCount={setScheduleChangeNotifyCount} />
                <SessionFeedbackPanel
                  eventSlug={slug}
                  enabled={Boolean(eventModules?.session_feedback)}
                  slotLabels={Object.fromEntries(schedule.slots.map((s) => [s.id, s.title]))}
                />
                <IsoMarquee
                  eventSlug={slug}
                  enabled={Boolean(eventModules?.iso_board)}
                  onOpenBoard={() => switchTab('iso', { scroll: true })}
                  className="mb-1"
                />
                <DancecardProgramTabBody
                  scheduleView={scheduleView}
                  setScheduleView={setScheduleView}
                  grouped={grouped}
                  venueGroups={venueGroups}
                  uniqueRoomsForGrid={uniqueRoomsForGrid}
                  filteredSlots={filteredSlots}
                  schedule={schedule}
                  tz={tz}
                  programSelected={programSelected}
                  toggleProgram={toggleProgram}
                  programSearch={programSearch}
                  setProgramSearch={setProgramSearch}
                  programDayFilter={programDayFilter}
                  setProgramDayFilter={setProgramDayFilter}
                  programDayKeys={programDayKeys}
                  selectedProgramCount={selectedProgramCount}
                  trackFilter={trackFilter}
                  setTrackFilter={setTrackFilter}
                  roomFilter={roomFilter}
                  setRoomFilter={setRoomFilter}
                  presenterFilter={presenterFilter}
                  setPresenterFilter={setPresenterFilter}
                  trackOptions={tracks}
                  roomOptions={programRoomsAll}
                  presenterOptions={presenterNames}
                  programTagOptions={programTagOptions}
                  programTagFilters={programTagFilters}
                  onToggleProgramTag={toggleProgramTag}
                  eventSlug={slug}
                  programSelections={me?.selections ?? []}
                  onUpdateProgramNote={updateProgramNote}
                  followedPersonIds={followedPersonIds}
                  programFollowingOnly={programFollowingOnly}
                  setProgramFollowingOnly={setProgramFollowingOnly}
                  onToggleFollow={togglePersonFollow}
                />
              </>
            ) : tab === 'program' ? (
              <GlassPanel className="p-5 text-sm text-dc-muted">Loading program…</GlassPanel>
            ) : null}

            {tab === 'dancecard' ? (
              <div className="space-y-4">
                <GlassPanel className="p-3 sm:p-4">
                  <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-dc-muted">Availability</p>
                        <h2 className="mt-1 font-serif text-2xl text-dc-text sm:text-[2rem]">Your schedule</h2>
                        <p className="mt-1.5 hidden text-sm leading-6 text-dc-muted sm:block">
                          Set your range, block busy time, and share your link.
                        </p>
                        <p className="mt-1 text-xs text-dc-muted">All times shown in {tz}.</p>
                      </div>
                      {showOnboarding ? (
                        <div className="rounded-xl border border-dc-accent-border bg-dc-accent-muted p-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs text-dc-text">1) Set range, 2) add busy times, 3) share link.</p>
                            <button
                              type="button"
                              className="rounded-full border border-dc-accent-border px-2.5 py-1 text-[11px] text-dc-accent"
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
                      <div className="rounded-xl border border-dc-border bg-dc-elevated/80 p-3">
                        <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted/90">Buffer</label>
                        <p className="mt-1 text-xs text-dc-muted/70">Add a small buffer so your busy range is realistic.</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[0, 15, 30, 45, 60].map((minutes) => (
                            <button
                              key={minutes}
                              type="button"
                              className={cx(
                                'rounded-full border px-3 py-1.5 text-sm transition',
                                buffer === minutes
                                  ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground'
                                  : 'border-dc-border bg-dc-elevated text-dc-text hover:border-dc-border-strong'
                              )}
                              onClick={() => applyBuffer(minutes)}
                            >
                              {minutes === 0 ? 'No buffer' : `${minutes} min`}
                            </button>
                          ))}
                        </div>
                      </div>
                      {me ? (
                        <div className="rounded-xl border border-dc-border bg-dc-elevated/80 p-3">
                          <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted/90">Compare by username</label>
                          <p className="mt-1 text-xs text-dc-muted/70">
                            When on, others signed into this event can use the Compare tab with your login{' '}
                            <span className="text-dc-muted">@{me.account.username}</span> instead of a share link.
                          </p>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={Boolean(me.prefs.allowCompareByUsername)}
                            className={cn(
                              'mt-2 min-h-[44px] w-full touch-manipulation rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:min-h-0 sm:w-auto sm:rounded-full sm:py-1.5 sm:text-xs',
                              me.prefs.allowCompareByUsername
                                ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
                                : 'border-dc-border bg-dc-elevated text-dc-muted'
                            )}
                            onClick={() => void setAllowCompareByUsername(!Boolean(me.prefs.allowCompareByUsername))}
                          >
                            {me.prefs.allowCompareByUsername ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      ) : null}
                      <div className="rounded-xl border border-dc-border bg-dc-elevated/80 p-3">
                        <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted/90">Date range</label>
                        <div className="mt-2 grid gap-2">
                          <input
                            type="date"
                            className="w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2.5 text-sm text-dc-text outline-none transition focus:border-dc-accent"
                            value={splitLocalDateTime(availabilityStart).date}
                            onChange={(e) => setAvailabilityStart(`${e.target.value}T00:00`)}
                          />
                          <input
                            type="date"
                            className="w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2.5 text-sm text-dc-text outline-none transition focus:border-dc-accent"
                            value={splitLocalDateTime(availabilityEnd).date}
                            onChange={(e) => setAvailabilityEnd(`${e.target.value}T00:00`)}
                          />
                          <button
                            type="button"
                            className="rounded-xl border border-dc-accent-border bg-dc-accent-muted px-3 py-2 text-sm font-semibold text-dc-accent transition hover:bg-dc-accent-muted/80"
                            onClick={() => void saveAvailabilityRange()}
                          >
                            Save date range
                          </button>
                        </div>
                      </div>
                      {!me?.account.isStaff ? (
                        <div className="rounded-xl border border-dc-border bg-dc-surface-muted p-3">
                          <label className="block text-xs uppercase tracking-[0.25em] text-dc-muted">
                            Staff only — unlock roster
                          </label>
                          <p className="mt-2 text-sm leading-6 text-dc-muted">
                            Enter your staff access code once.
                          </p>
                          <input
                            type="password"
                            autoComplete="off"
                            className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2.5 text-sm text-dc-text outline-none transition focus:border-dc-accent"
                            value={staffUnlockCode}
                            onChange={(e) => {
                              setStaffUnlockCode(e.target.value)
                              setStaffUnlockErr(null)
                            }}
                            placeholder="Staff access code"
                          />
                          {staffUnlockErr ? <p className="mt-2 text-sm text-red-700">{staffUnlockErr}</p> : null}
                          <button
                            type="button"
                            disabled={staffUnlockBusy || !staffUnlockCode.trim()}
                            className="mt-2.5 w-full rounded-xl border border-dc-accent-border bg-dc-accent-muted px-3 py-2.5 text-sm font-semibold text-dc-accent transition hover:bg-dc-accent-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => void unlockStaff()}
                          >
                            {staffUnlockBusy ? 'Unlocking…' : 'Unlock staff autofill'}
                          </button>
                        </div>
                      ) : false && staffPeople.length ? (
                        <div className="rounded-xl border border-dc-border bg-dc-surface-muted p-3">
                          <label
                            htmlFor="staff-schedule"
                            className="block text-xs uppercase tracking-[0.25em] text-dc-muted"
                          >
                            Staff and volunteer autofill
                          </label>
                          <p className="mt-2 text-sm leading-6 text-dc-muted">
                            Choose your official staff/volunteer name.
                          </p>
                          <select
                            id="staff-schedule"
                            value={selectedStaffName}
                            className="mt-2 w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2.5 text-sm text-dc-text outline-none transition focus:border-dc-accent"
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
                            <div className="mt-2.5 space-y-2 border-t border-dc-border pt-2.5">
                              <p className="text-xs uppercase tracking-[0.24em] text-dc-accent">
                                {selectedStaffEntry?.shifts.length ?? 0} shifts ready
                              </p>
                              <ul className="space-y-2">
                                {(selectedStaffEntry?.shifts ?? []).map((sh, i) => {
                                  const rc = roleColor(sh.role)
                                  return (
                                    <li key={`${sh.startsAt}-${i}`} className="flex flex-wrap items-center gap-2 text-xs text-dc-muted">
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
                                      <span className="text-dc-muted">{formatStaffShiftTitle(sh, tz)}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      <p className="max-w-prose text-[11px] leading-relaxed text-dc-subtle">{SHARE_LINK_PRIVACY_BLURB}</p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-2.5 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)]"
                          onClick={() => void copyShare()}
                        >
                          Share link
                        </button>
                        <button
                          type="button"
                          className="rounded-2xl border border-dc-border bg-dc-elevated-muted px-4 py-2.5 text-sm text-dc-text"
                          onClick={openBlankManualModal}
                        >
                          Add busy time
                        </button>
                      </div>
                      {lastShareToken ? (
                        <p className="rounded-xl border border-dc-border bg-dc-elevated-muted px-3 py-2 text-xs leading-relaxed text-dc-muted">
                          Share code: <span className="font-mono text-dc-text">{lastShareToken}</span>. Advanced Compare accepts
                          either this code or the full share link.
                        </p>
                      ) : null}
                      {blockedTimesPanel()}
                      <div className="rounded-xl border border-dc-border bg-dc-elevated/80 p-3">
                        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-dc-muted/90">Export calendar</label>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-dc-border bg-white/[0.06] px-3 py-2 text-xs font-medium text-dc-accent-foreground transition hover:bg-dc-accent-muted disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('ical')}
                          >
                            Apple / iCal
                          </button>
                          <button
                            type="button"
                            disabled={calendarExportCount === 0}
                            className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-xs font-medium text-sky-900 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-40"
                            onClick={() => exportDancecardCalendar('google')}
                          >
                            Google Calendar
                          </button>
                        </div>
                        {calendarExportCount === 0 ? (
                          <p className="mt-2 text-xs text-dc-subtle">Nothing to export yet.</p>
                        ) : (
                          <p className="mt-2 text-xs text-dc-subtle">{calendarExportCount} event(s) in this export.</p>
                        )}
                        <p className="mt-2.5 text-xs uppercase tracking-[0.16em] text-dc-subtle">Busy times only</p>
                        {countDancecardIcsEvents(me?.selections ?? [], []) === 0 ? (
                          <p className="mt-2 text-xs text-dc-subtle">Add busy times first.</p>
                        ) : (
                          <a
                            href={`/api/dancecard/${slug}/ics`}
                            download
                            className="mt-1.5 inline-flex rounded-xl border border-violet-400/35 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-50 transition hover:bg-violet-500/25"
                          >
                            Download busy times (.ics)
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <GlassPanel className="p-3 md:hidden">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.25em] text-dc-muted">Day schedule</p>
                          {availabilityDisplayToggle}
                        </div>
                        {availabilityDays.length ? (
                          <div
                            className="mt-2 border-b border-dc-border/50 pb-2 md:hidden"
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
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-semibold tracking-tight text-dc-text" aria-live="polite">
                              {mobileSchedulePanel.label}
                            </p>
                            <button
                              type="button"
                              className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1 text-[11px] font-semibold text-dc-accent"
                              onClick={() => void blockSelectedDay()}
                            >
                              Block whole day
                            </button>
                          </div>
                        ) : null}
                        <div
                          key={mobileDayKey || 'none'}
                          className="mt-2 max-h-[min(52vh,calc(100dvh-15rem))] space-y-1.5 overflow-y-auto pr-1"
                        >
                          {mobileSchedulePanel.rows.length === 0 ? (
                            <p className="py-6 text-center text-xs leading-relaxed text-dc-subtle">
                              {availabilityDays.length
                                ? availabilityDisplayMode === 'free'
                                  ? 'No free hours in your saved date range for this day.'
                                  : 'No hours in your saved date range for this day.'
                                : 'Set a date range to show your day schedule.'}
                            </p>
                          ) : (
                            mobileSchedulePanel.rows.map((row, idx) => {
                              const slotCls = cx(
                                'grid w-full min-h-touch grid-cols-[98px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                                row.busy
                                  ? 'border-red-300 bg-red-100 text-red-800'
                                  : 'border-emerald-300 bg-emerald-100 text-emerald-800 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-100'
                              )
                              const inner = (
                                <>
                                  <span className="font-semibold text-dc-text">{formatTime(row.start.toISOString(), tz)}</span>
                                  <span className="truncate">{row.title}</span>
                                </>
                              )
                              return row.busy ? (
                                row.editableManualId ? (
                                  <button
                                    key={`${row.start.toISOString()}-${idx}`}
                                    type="button"
                                    className={slotCls}
                                    aria-label={`Mark free ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                    onClick={() => void toggleHourBlock(row)}
                                  >
                                    {inner}
                                  </button>
                                ) : (
                                  <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                                    {inner}
                                  </div>
                                )
                              ) : (
                                <button
                                  key={`${row.start.toISOString()}-${idx}`}
                                  type="button"
                                  className={slotCls}
                                  aria-label={`Mark busy ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                  onClick={() => void toggleHourBlock(row)}
                                >
                                  {inner}
                                </button>
                              )
                            })
                          )}
                        </div>
                        <p className="mt-2 border-t border-dc-border/50 pt-2 text-[11px] leading-snug text-dc-subtle">
                          Tap <span className="text-emerald-700">green</span> hours to mark busy; tap editable red hours to free them.
                          Day chips are above.
                        </p>
                      </GlassPanel>
                      <GlassPanel className="p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs uppercase tracking-[0.25em] text-dc-muted">Hour-by-hour</p>
                          {availabilityDisplayToggle}
                        </div>
                        <p className="mt-1 hidden text-[11px] text-dc-subtle md:block">
                          Tap green rows to mark busy; tap editable red rows to free that hour.
                        </p>
                        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1 hidden md:block">
                          {visibleAvailabilityHourRows.length ? (
                            visibleAvailabilityHourRows.map((row, idx) => {
                              const slotCls = cx(
                                'flex w-full min-h-10 items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs transition motion-reduce:transition-none',
                                row.busy
                                  ? 'border-red-300 bg-red-100 text-red-800'
                                  : 'border-emerald-300 bg-emerald-100 text-emerald-800 active:scale-[0.99] motion-reduce:active:scale-100 hover:border-emerald-300/45 hover:bg-emerald-100'
                              )
                              const inner = (
                                <>
                                  <span>{toDatetimeLocalValue(row.start).replace('T', ' ')}</span>
                                  <span className="truncate pl-2">{row.title}</span>
                                </>
                              )
                              return row.busy ? (
                                row.editableManualId ? (
                                  <button
                                    key={`${row.start.toISOString()}-${idx}`}
                                    type="button"
                                    className={slotCls}
                                    aria-label={`Mark free ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                    onClick={() => void toggleHourBlock(row)}
                                  >
                                    {inner}
                                  </button>
                                ) : (
                                  <div key={`${row.start.toISOString()}-${idx}`} className={slotCls}>
                                    {inner}
                                  </div>
                                )
                              ) : (
                                <button
                                  key={`${row.start.toISOString()}-${idx}`}
                                  type="button"
                                  className={slotCls}
                                  aria-label={`Mark busy ${formatTime(row.start.toISOString(), tz)} to ${formatTime(row.end.toISOString(), tz)}`}
                                  onClick={() => void toggleHourBlock(row)}
                                >
                                  {inner}
                                </button>
                              )
                            })
                          ) : (
                            <p className="text-xs text-dc-muted">
                              {availabilityHourRows.length && availabilityDisplayMode === 'free'
                                ? 'No free hours in this range.'
                                : 'Set availability start and end to build hour blocks.'}
                            </p>
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
                        <GlassPanel className="p-5 text-sm text-dc-muted">No busy times yet.</GlassPanel>
                      )}
                    </div>
                  </div>
                </GlassPanel>
                {eventModules?.shift_swaps && me?.account.isStaff ? (
                  <StaffOpenShiftsPanel eventSlug={slug} timezone={tz} isStaff />
                ) : null}
                {eventModules?.shift_swaps ? (
                  <ShiftSwapPanel eventSlug={slug} modules={eventModules} myShiftIds={[]} />
                ) : null}
                {eventModules?.vetting_applications ? (
                  <VettingApplicationForm eventSlug={slug} modules={eventModules} />
                ) : null}
              </div>
            ) : null}

            {tab === 'profile' && me ? (
              <GlassPanel className="p-3 sm:p-5">
                <AttendeeProfileTab
                  username={me.account.username}
                  displayName={me.account.displayName}
                  stored={me.prefs.profile ?? {}}
                  config={me.attendeeProfileConfig ?? DEFAULT_ATTENDEE_PROFILE_CONFIG}
                  allowCompareByUsername={Boolean(me.prefs.allowCompareByUsername)}
                  showInCompareDirectory={Boolean(me.prefs.showInCompareDirectory)}
                  hideBusyDetailsInCompare={Boolean(me.prefs.hideBusyDetailsInCompare)}
                  icsRemindBeforeMinutes={me.prefs.icsRemindBeforeMinutes ?? 15}
                  eventSlug={slug}
                  badgeTagline={me.registrant?.badgeTagline ?? null}
                  avatarPreviewUrl={me.publicProfile?.avatarUrl ?? null}
                  onSave={async (patch) => {
                    try {
                      await saveAttendeeProfile(patch)
                    } catch (e) {
                      setToast(formatDancecardApiMessage(e))
                    }
                  }}
                  onRenameClick={openRename}
                />
              </GlassPanel>
            ) : null}

            {tab === 'mutual' ? (
              <div className="space-y-4">
                <CompareRequestsInbox
                  eventSlug={slug}
                  onAccepted={(username) => {
                    setMutualCompareUsername(username)
                    void refreshMutual({ mode: 'username' })
                  }}
                />
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
                    windowStartMs={schedule?.meta ? Date.parse(schedule.meta.windowStartsAt) : undefined}
                    windowEndMs={schedule?.meta ? Date.parse(schedule.meta.windowEndsAt) : undefined}
                    selectedStartMs={mutualSelectedRangeMs.startMs}
                    selectedEndMs={mutualSelectedRangeMs.endMs}
                  />
                </GlassPanel>
              </div>
            ) : null}

            {tab === 'reservations' ? <ReservationsPanel slug={slug} tz={tz} /> : null}
            {tab === 'iso' ? <IsoBoardTab eventSlug={slug} signedIn={Boolean(me)} /> : null}
            {tab === 'attendee_groups' ? (
              <AttendeeGroupsTab
                eventSlug={slug}
                signedIn={Boolean(me)}
                eventProfile={eventProfile ?? undefined}
                initialGroupId={groupsDeepGroupId}
                initialInviteToken={groupsInviteToken}
              />
            ) : null}
          </div>

          <aside className="hidden xl:block">
            <GlassPanel className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-dc-muted">About availability</p>
              <h2 className="mt-2 font-serif text-2xl text-dc-text">Private planning</h2>
              <p className="mt-4 text-sm leading-relaxed text-dc-muted">
                Compare only the windows that matter: busy time stays abstract, mutual free time is easy to reserve,
                and confirmed plans can be exported to your calendar.
              </p>
            </GlassPanel>
          </aside>
        </div>
      </div>

      {manualOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto overscroll-y-contain bg-dc-surface/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-opacity duration-200 motion-reduce:transition-none sm:items-center sm:py-8"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeManualModal()
          }}
        >
          <GlassPanel className="flex max-h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden motion-reduce:transition-none sm:animate-in">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-dc-border bg-dc-elevated/98 px-5 pb-3 pt-5 backdrop-blur-sm sm:px-6 sm:pt-6">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.3em] text-dc-muted">Busy time</p>
                <h3 className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">Block time on my schedule</h3>
              </div>
              <button
                type="button"
                className="shrink-0 touch-manipulation rounded-full border border-dc-border px-4 py-2.5 text-sm font-medium text-dc-muted"
                onClick={closeManualModal}
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <p className="text-sm text-dc-muted">Times use the event timezone ({tz}) and are stored as UTC.</p>
            <div className="mt-4">
              <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">Title</label>
              <input
                className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-4 py-3 text-dc-text"
                value={mTitle}
                maxLength={150}
                onChange={(e) => setMTitle(e.target.value)}
                placeholder="Gym, dinner, commute..."
              />
            </div>
            {availabilityDays.length ? (
              <div className="mt-3">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-dc-subtle">Pick day</p>
                <HostMobileDayChipsRow
                  days={availabilityDays.map((d) => ({ key: d.key, label: d.label }))}
                  activeKey={selectedDayKey}
                  onSelect={(key) => {
                    setMobileDayKey(key)
                    setMStart((prev) => mergeLocalDateTime(prev, { date: key }))
                    setMEnd((prev) => mergeLocalDateTime(prev, { date: key }))
                  }}
                />
                <button
                  type="button"
                  className="mt-2 rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-xs font-semibold text-dc-accent"
                  onClick={() => void blockSelectedDay()}
                >
                  Block whole day ({selectedDayLabel})
                </button>
              </div>
            ) : null}
            <div className="mt-3">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-dc-subtle">Use once</p>
              <div className="flex flex-wrap gap-2">
                {mealPresetOptions.map((preset) => (
                  <button
                    key={`once-alt-${preset.key}`}
                    type="button"
                    className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                    onClick={() => applyManualPreset(preset.key)}
                  >
                    {mealPresetLabel(preset)}
                  </button>
                ))}
              </div>
              <p className="mb-2 mt-3 text-xs uppercase tracking-[0.22em] text-dc-subtle">Apply every event day</p>
              <p className="mb-2 text-[11px] leading-snug text-dc-subtle">
                Adds one block per day; edit or delete individual days afterward.
              </p>
              <div className="flex flex-wrap gap-2">
                {mealPresetOptions.map((preset) => (
                  <button
                    key={`daily-alt-${preset.key}`}
                    type="button"
                    className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1.5 text-xs font-semibold text-dc-accent"
                    onClick={() => void addDailyPresetAcrossAvailability(preset.key)}
                  >
                    {preset.label}
                  </button>
                ))}
                {!mealPresetOptions.length ? (
                  <p className="text-xs text-dc-subtle">No presets.</p>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                  onClick={() => void clearMealPresetsAcrossAvailability()}
                >
                  Clear presets
                </button>
                <button
                  type="button"
                  className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                  onClick={() => void clearUnavailableForSelectedDay()}
                >
                  Clear day ({selectedDayKey})
                </button>
                <button
                  type="button"
                  className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-1.5 text-xs text-dc-text"
                  onClick={() => void duplicateYesterdayToSelectedDay()}
                >
                  Duplicate yesterday to {selectedDayKey}
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">Start</label>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                    value={splitLocalDateTime(mStart).date}
                    min={manualDateRangeBounds?.dateMin}
                    max={manualDateRangeBounds?.dateMax}
                    onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                  />
                  <input
                    type="time"
                    step={900}
                    className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                    value={splitLocalDateTime(mStart).time}
                    onChange={(e) => setMStart((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                  />
                </div>
                <input
                  type="datetime-local"
                  className="hidden"
                  value={mStart}
                  min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                  max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                  onChange={(e) => setMStart(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-dc-muted">End</label>
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                    value={splitLocalDateTime(mEnd).date}
                    min={manualDateRangeBounds?.dateMin}
                    max={manualDateRangeBounds?.dateMax}
                    onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { date: e.target.value }))}
                  />
                  <input
                    type="time"
                    step={900}
                    className="w-full rounded-2xl border border-dc-border bg-dc-elevated-muted px-3 py-3 text-sm text-dc-text"
                    value={splitLocalDateTime(mEnd).time}
                    onChange={(e) => setMEnd((prev) => mergeLocalDateTime(prev, { time: e.target.value }))}
                  />
                </div>
                <input
                  type="datetime-local"
                  className="hidden"
                  value={mEnd}
                  min={manualDateRangeBounds ? `${manualDateRangeBounds.dateMin}T00:00` : undefined}
                  max={manualDateRangeBounds ? `${manualDateRangeBounds.dateMax}T23:59` : undefined}
                  onChange={(e) => setMEnd(e.target.value)}
                />
              </div>
            </div>
            {manualSelections.length ? (
              <div className="mt-4 rounded-2xl border border-dc-border bg-dc-elevated/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-dc-muted/90">Already blocked</p>
                <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto pr-1">
                  {manualSelections.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 rounded-xl border border-dc-border bg-dc-elevated/85 px-2.5 py-2"
                    >
                      <button
                        type="button"
                        className="min-h-10 min-w-0 flex-1 text-left text-xs text-dc-text hover:text-dc-text"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        {formatRange(s.startsAt, s.endsAt, tz)} {s.note ? `· ${s.note}` : ''}
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-dc-accent-border bg-dc-accent-muted px-2.5 py-1.5 text-xs font-semibold text-dc-accent hover:bg-dc-accent-muted/80"
                        onClick={() => beginManualEdit(s.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="min-h-10 rounded-md border border-red-300 bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                        aria-label="Delete busy time"
                        title="Delete busy time"
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
              <p className="mt-3 text-xs text-dc-muted">
                This will block about {manualDraftSummary.hours.toFixed(2)} hour(s) across {manualDraftSummary.days} day(s).
              </p>
            ) : null}
            </div>
            <div className="shrink-0 border-t border-dc-border bg-dc-elevated/98 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm sm:px-6">
              <button
                type="button"
                className="touch-manipulation w-full rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)]"
                onClick={() => void submitManualBlock()}
              >
                {editingManualId ? 'Save changes' : 'Save busy time'}
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
          switchTab('reservations', { scroll: true })
        }}
        onSuccessStayOnCompare={() => {
          setReserveMutualOpen(false)
          setReserveMutualPreview(null)
          setReserveMutualBanner(null)
        }}
        stayAfterSuccessLabel="Stay on Compare"
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
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-dc-border/90 bg-dc-surface/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_32px_rgba(45,38,28,0.42)] backdrop-blur-xl lg:hidden"
        aria-label="Dancecard sections"
      >
        <div className="mx-auto flex max-w-7xl gap-0.5">
          {visibleTabOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              aria-current={tab === option.key ? 'page' : undefined}
              className={cx(
                'flex min-h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-0.5 py-1 text-center text-[11px] font-semibold leading-tight transition sm:text-xs',
                tab === option.key ? 'bg-dc-accent-muted text-dc-accent' : 'text-dc-muted hover:bg-dc-elevated-muted hover:text-dc-text'
              )}
              onClick={() => switchTab(option.key, { scroll: true })}
            >
              <span className="truncate">{ATTENDEE_TAB_SHORT_LABEL[option.key]}</span>
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {toast ? (
        <div
          className={cn(
            'fixed left-4 right-4 z-[100] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[22px] border border-dc-border bg-dc-surface/95 px-4 py-3 text-sm text-dc-text shadow-[0_18px_55px_rgba(45,38,28,0.75)] backdrop-blur-xl lg:bottom-4',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'bottom-[calc(7rem+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(4.35rem+env(safe-area-inset-bottom))]'
          )}
        >
          <span>{toast}</span>
          <button type="button" className="rounded-full border border-dc-border px-3 py-1 text-xs text-dc-muted" onClick={() => setToast(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {undoSnapshot ? (
        <div
          className={cn(
            'fixed left-4 right-4 z-[101] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-[18px] border border-dc-accent-border bg-dc-accent-muted px-4 py-2.5 text-sm text-dc-accent backdrop-blur-xl lg:bottom-20',
            tab === 'dancecard' && availabilityDays.length && mobileHostDayDocked
              ? 'bottom-[calc(8.5rem+env(safe-area-inset-bottom))]'
              : 'bottom-[calc(5.75rem+env(safe-area-inset-bottom))]'
          )}
        >
          <span>{undoSnapshot.label}</span>
          <button type="button" className="rounded-full border border-dc-accent-border px-3 py-1 text-xs" onClick={() => void undoLastSelectionChange()}>
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
        'rounded-2xl border border-dc-border bg-dc-elevated/95 shadow-[0_18px_54px_rgba(45,38,28,0.42),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-sm transition-[box-shadow,border-color] duration-200 motion-reduce:transition-none',
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
          : 'border-dc-accent-border bg-dc-accent-muted'

  return (
    <div className={cx('flex items-start justify-between gap-3 rounded-xl border p-3', toneClass)}>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold leading-5 text-dc-text">{title}</div>
        <div className="mt-1 text-xs text-dc-text/85 sm:text-sm">{meta}</div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

type DancecardProgramTabBodyProps = {
  scheduleView: ScheduleView
  setScheduleView: Dispatch<SetStateAction<ScheduleView>>
  grouped: { day: string; items: ProgramSlot[] }[]
  venueGroups: { room: string; items: ProgramSlot[] }[]
  uniqueRoomsForGrid: string[]
  filteredSlots: ProgramSlot[]
  schedule: { meta: ScheduleMeta | null; slots: ProgramSlot[] }
  tz: string
  programSelected: Set<string>
  toggleProgram: (slot: ProgramSlot) => void
  programSearch: string
  setProgramSearch: Dispatch<SetStateAction<string>>
  programDayFilter: string
  setProgramDayFilter: Dispatch<SetStateAction<string>>
  programDayKeys: string[]
  selectedProgramCount: number
  trackFilter: string
  setTrackFilter: Dispatch<SetStateAction<string>>
  roomFilter: string
  setRoomFilter: Dispatch<SetStateAction<string>>
  presenterFilter: string
  setPresenterFilter: Dispatch<SetStateAction<string>>
  trackOptions: string[]
  roomOptions: string[]
  presenterOptions: string[]
  programTagOptions: string[]
  programTagFilters: Set<string>
  onToggleProgramTag: (tag: string) => void
  eventSlug: string
  programSelections: MeResponse['selections']
  onUpdateProgramNote: (slotId: string, note: string) => void
  followedPersonIds: Set<string>
  programFollowingOnly: boolean
  setProgramFollowingOnly: Dispatch<SetStateAction<boolean>>
  onToggleFollow: (personId: string, follow: boolean) => void
}

function DancecardProgramTabBody({
  scheduleView,
  setScheduleView,
  grouped,
  venueGroups,
  uniqueRoomsForGrid,
  filteredSlots,
  schedule,
  tz,
  programSelected,
  toggleProgram,
  programSearch,
  setProgramSearch,
  programDayFilter,
  setProgramDayFilter,
  programDayKeys,
  selectedProgramCount,
  trackFilter,
  setTrackFilter,
  roomFilter,
  setRoomFilter,
  presenterFilter,
  setPresenterFilter,
  trackOptions,
  roomOptions,
  presenterOptions,
  programTagOptions,
  programTagFilters,
  onToggleProgramTag,
  eventSlug,
  programSelections,
  onUpdateProgramNote,
  followedPersonIds,
  programFollowingOnly,
  setProgramFollowingOnly,
  onToggleFollow,
}: DancecardProgramTabBodyProps) {
  const slots = schedule.slots
  const [detailSlot, setDetailSlot] = useState<ProgramSlot | null>(null)
  const publicSlots = slots as PublicProgramSlotDto[]
  return (
    <div className="space-y-4">
      <HappeningNowRibbon
        eventSlug={eventSlug}
        slots={publicSlots}
        timezone={tz}
        onSelectSlot={(id) => {
          const s = slots.find((x) => x.id === id)
          if (s) setDetailSlot(s)
        }}
      />
      <MyScheduleView
        slots={slots}
        selections={programSelections}
        selectedIds={programSelected}
        timezone={tz}
        onToggle={toggleProgram}
      />
      <SessionDetailSheet
        open={detailSlot != null}
        slot={detailSlot}
        eventSlug={eventSlug}
        timezone={tz}
        onClose={() => setDetailSlot(null)}
      />
      <GlassPanel className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-dc-muted">View</span>
          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={cx(
                  'rounded-full px-3 py-2 text-xs transition sm:px-4 sm:text-sm',
                  scheduleView === option.key
                    ? 'bg-white text-dc-accent-foreground'
                    : 'border border-dc-border bg-white/[0.03] text-dc-muted hover:bg-white/[0.07]'
                )}
                onClick={() => setScheduleView(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="rounded-full border border-dc-accent-border bg-dc-accent-muted px-3 py-1 text-[11px] font-medium text-dc-accent">
            My schedule: {selectedProgramCount}
          </span>
          <button
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-[11px] font-medium',
              programFollowingOnly
                ? 'border-dc-accent-border bg-dc-accent-muted text-dc-accent'
                : 'border-dc-border text-dc-muted'
            )}
            onClick={() => setProgramFollowingOnly((v) => !v)}
          >
            Following only
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-dc-border pt-4">
          <label className="text-[11px] text-dc-muted">
            Search
            <input
              className="mt-1 block min-w-[160px] rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
              value={programSearch}
              onChange={(e) => setProgramSearch(e.target.value)}
              placeholder="Title, tags, room…"
            />
          </label>
          <label className="text-[11px] text-dc-muted">
            Day
            <select
              className="mt-1 block rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
              value={programDayFilter}
              onChange={(e) => setProgramDayFilter(e.target.value)}
            >
              <option value="">All days</option>
              {programDayKeys.map((d) => (
                <option key={d} value={d}>
                  {schedule?.slots?.find((s) => zonedCalendarDateFromUtc(Date.parse(s.startsAt), tz) === d)
                    ? dayLabel(
                        schedule.slots.find((s) => zonedCalendarDateFromUtc(Date.parse(s.startsAt), tz) === d)!
                          .startsAt,
                        tz,
                      )
                    : d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-dc-muted">
            Track
            <select
              className="mt-1 block min-w-[120px] rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
            >
              <option value="">All tracks</option>
              {trackOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-dc-muted">
            Room
            <select
              className="mt-1 block min-w-[120px] rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="">All rooms</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[11px] text-dc-muted">
            Presenter
            <select
              className="mt-1 block min-w-[140px] rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
              value={presenterFilter}
              onChange={(e) => setPresenterFilter(e.target.value)}
            >
              <option value="">All</option>
              {presenterOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
        {programTagOptions.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dc-border pt-4">
            <span className="w-full text-[11px] text-dc-muted">Tags</span>
            {programTagOptions.map((tag) => {
              const active = programTagFilters.has(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  className={cx(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    active
                      ? 'border-dc-accent-border bg-dc-accent text-dc-accent-foreground'
                      : 'border-dc-border bg-white/[0.03] text-dc-muted hover:bg-white/[0.07]'
                  )}
                  onClick={() => onToggleProgramTag(tag)}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        ) : null}
        {grouped.length > 1 && scheduleView !== 'venue' && scheduleView !== 'grid' && scheduleView !== 'list' ? (
          <nav className="mt-5 flex flex-wrap gap-2">
            {grouped.map((g, idx) => (
              <a
                key={g.day}
                href={`#dc-day-${idx}`}
                className="rounded-full border border-dc-border bg-white/[0.03] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-dc-muted transition hover:bg-dc-accent-muted"
              >
                {shortDayLabel(g.day)}
              </a>
            ))}
          </nav>
        ) : null}
      </GlassPanel>

      {programSelections.some((s) => s.kind === 'program' && s.slotId) ? (
        <GlassPanel className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-dc-muted">Personal notes</p>
          <p className="mt-1 text-xs text-dc-subtle">Private to your account; saved with your dancecard.</p>
          <div className="mt-3 space-y-3">
            {programSelections
              .filter((s) => s.kind === 'program' && s.slotId)
              .map((sel) => {
                const slot = slots.find((x) => x.id === sel.slotId)
                return (
                  <label key={sel.id} className="block text-sm text-dc-text">
                    <span className="text-xs text-dc-muted">{slot?.title ?? 'Activity'}</span>
                    <textarea
                      className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface-muted px-2 py-1.5 text-sm text-dc-text"
                      rows={2}
                      value={sel.note ?? ''}
                      onChange={(e) => onUpdateProgramNote(String(sel.slotId), e.target.value)}
                    />
                  </label>
                )
              })}
          </div>
        </GlassPanel>
      ) : null}

      {scheduleView === 'venue' ? (
        <div className="space-y-5">
          {venueGroups.map((vg) => (
            <GlassPanel key={vg.room} className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-dc-muted">Venue</p>
                  <h3 className="mt-2 font-serif text-2xl text-dc-text">{vg.room}</h3>
                </div>
                <div className="rounded-full border border-dc-border bg-dc-elevated px-3 py-1 text-xs text-dc-muted">
                  Focused by venue
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-2">
                {vg.items.map((slot) => (
                  <ProgramSessionCard
                    key={slot.id}
                    eventSlug={eventSlug}
                    slot={slot}
                    tz={tz}
                    selected={programSelected.has(slot.id)}
                    onToggle={() => toggleProgram(slot)}
                    followedPersonIds={followedPersonIds}
                    onToggleFollow={onToggleFollow}
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
                    <th className="rounded-2xl bg-dc-elevated-muted p-3 text-dc-muted">Time</th>
                    {uniqueRoomsForGrid.map((room) => (
                      <th key={room} className="rounded-2xl bg-dc-elevated-muted p-3 text-dc-text">
                        {room}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupSlotsByStart(filteredSlots).map(([startIso, slotsAt]) => (
                    <tr key={startIso}>
                      <td className="min-w-[110px] rounded-2xl border border-dc-border bg-dc-surface-muted p-3 align-top">
                        <div className="text-[10px] uppercase tracking-[0.28em] text-dc-subtle">Time</div>
                        <div className="mt-1 text-base font-semibold text-dc-text">{formatTime(startIso, tz)}</div>
                      </td>
                      {uniqueRoomsForGrid.map((room) => {
                        const slotsInRoom = slotsAt.filter((s) => (programSlotDisplayRoom(s) || 'Other') === room)
                        return (
                          <td key={room} className="min-w-[180px] align-top">
                            {slotsInRoom.length ? (
                              <div className="flex flex-col gap-2">
                                {slotsInRoom.map((slot) => {
                                  const hasFollowedPresenter = (slot.presenters ?? []).some(
                                    (p) => p.personId && followedPersonIds.has(p.personId),
                                  )
                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      className={cx(
                                        "w-full rounded-[24px] border p-3 text-left transition",
                                        programSelected.has(slot.id)
                                          ? "border-dc-accent-border bg-dc-accent-muted shadow-[0_20px_45px_rgba(198,167,94,0.12)]"
                                          : hasFollowedPresenter
                                            ? "border-violet-400/50 bg-violet-500/10 hover:bg-violet-500/15"
                                            : "border-dc-border bg-dc-elevated-muted hover:bg-dc-elevated",
                                      )}
                                      onClick={() => toggleProgram(slot)}
                                    >
                                      <div className="text-sm font-semibold text-dc-text">{slot.title}</div>
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="rounded-[24px] border border-dc-border/50 bg-dc-elevated-muted p-3 text-dc-accent-foreground/70">
                                —
                              </div>
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
            <p className="text-sm text-amber-900">
              Grid view is built for wider screens. On your phone, use <strong>Timeline</strong> for the easiest
              browsing.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-dc-accent-foreground"
              onClick={() => setScheduleView('simple')}
            >
              Switch to timeline
            </button>
          </GlassPanel>
        </>
      ) : scheduleView === 'list' ? (
        <GlassPanel className="p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-dc-muted">All activities</p>
          <div className="mt-4">
            <VirtualProgramList
              slots={filteredSlots}
              timezone={tz}
              selectedIds={programSelected}
              onToggle={toggleProgram}
              onOpenDetail={setDetailSlot}
            />
          </div>
        </GlassPanel>
      ) : (
        grouped.map((g, dayIdx) => (
          <GlassPanel key={g.day} className="scroll-mt-24 p-3 sm:p-4">
            <section id={`dc-day-${dayIdx}`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-dc-muted">Day {dayIdx + 1}</p>
                  <h3 className="mt-1.5 font-serif text-2xl text-dc-text">{g.day}</h3>
                </div>
                <div className="rounded-full border border-dc-border bg-dc-elevated px-3 py-1 text-xs text-dc-muted">{tz}</div>
              </div>
              <div className="mt-4 space-y-3">
                {groupSlotsByStart(g.items).map(([startIso, slotsAt]) => {
                  const policies = programPoliciesForSlots(slotsAt)
                  const hasPolicy = policies.length > 0
                  return (
                    <div
                      key={startIso}
                      className="grid grid-cols-1 gap-3 md:grid-cols-[5.5rem_minmax(0,1fr)] md:items-stretch"
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
                          'flex min-h-[4.5rem] flex-col justify-center rounded-2xl border px-3 py-3 text-left shadow-sm transition hover:border-dc-accent-border hover:bg-dc-accent-muted/90 md:sticky md:top-24 md:self-start',
                          hasPolicy
                            ? 'border-amber-300/40 bg-amber-50/90'
                            : 'border-dc-accent-border/50 bg-dc-accent-muted/70'
                        )}
                        aria-label={`Jump to ${formatTime(startIso, tz)} activities`}
                      >
                        <div
                          className={cx(
                            'text-[9px] uppercase tracking-[0.24em]',
                            hasPolicy ? 'text-amber-900/80' : 'text-dc-accent/70'
                          )}
                        >
                          Start
                        </div>
                        <div className="mt-1 text-lg font-semibold text-dc-text">{formatTime(startIso, tz)}</div>
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
                          <div className="mt-1.5 text-[10px] text-dc-accent/70">Tap to jump</div>
                        )}
                      </button>
                      <div className="grid grid-cols-1 gap-2">
                        {slotsAt.map((slot) => (
                          <ProgramSessionCard
                            key={slot.id}
                            htmlId={`dc-slot-${slot.id}`}
                            eventSlug={eventSlug}
                            slot={slot}
                            tz={tz}
                            showTime={false}
                            selected={programSelected.has(slot.id)}
                            onToggle={() => toggleProgram(slot)}
                            followedPersonIds={followedPersonIds}
                            onToggleFollow={onToggleFollow}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </GlassPanel>
        ))
      )}

      {!slots.length ? (
        <GlassPanel className="border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-900">
          <p className="font-medium text-amber-900">No program is loaded for this event yet.</p>
          <p className="mt-2 text-amber-900/80">
            The schedule API returned an empty list for this event. Common causes: no rows in{' '}
            <code className="rounded bg-dc-surface-muted px-1">dancecard_program_slots</code>, production env pointed at a
            different project, or the live deploy is older than the latest Dancecard routes.
          </p>
        </GlassPanel>
      ) : !filteredSlots.length ? (
        <GlassPanel className="p-5 text-sm text-dc-muted">No activities match the current filters.</GlassPanel>
      ) : null}
    </div>
  )
}

function ReservationsPanel({ slug, tz }: { slug: string; tz: string }) {
  const { ask, dialog } = useConfirmDialog()
  const [rows, setRows] = useState<RescheduleReservationRow[]>([])
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [rescheduleRow, setRescheduleRow] = useState<RescheduleReservationRow | null>(null)
  const [panelErr, setPanelErr] = useState<string | null>(null)
  const [panelMsg, setPanelMsg] = useState<string | null>(null)

  const load = useCallback(async () => {
    const r = await dancecardFetch<{ reservations: typeof rows }>(slug, '/reservations')
    setRows(r.reservations)
  }, [slug])

  useEffect(() => {
    void load().catch(() => null)
  }, [load])

  function canReschedule(b: RescheduleReservationRow): boolean {
    const partnerId = b.role === 'host' ? b.guest.id : b.host.id
    return Boolean(partnerId && !partnerId.startsWith('guest:'))
  }

  async function cancelReservationRow(id: string) {
    const ok = await ask({
      title: 'Cancel reservation?',
      message: 'The time will become available again.',
      destructive: true,
      confirmLabel: 'Cancel',
    })
    if (!ok) return
    setPanelErr(null)
    setPanelMsg(null)
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
      {dialog}
      <RescheduleReservationModal
        open={Boolean(rescheduleRow)}
        slug={slug}
        tz={tz}
        row={rescheduleRow}
        onClose={() => setRescheduleRow(null)}
        onSent={() => {
          setPanelMsg('Reschedule request sent.')
          setPanelErr(null)
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-dc-muted">Scheduling</p>
          <h2 className="mt-1 font-serif text-2xl text-dc-text sm:text-3xl">Reservations</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-dc-border bg-dc-elevated-muted px-3 py-2 text-xs text-dc-text sm:px-4 sm:text-sm"
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>
      {panelErr ? <p className="mb-3 text-sm text-red-700">{panelErr}</p> : null}
      {panelMsg ? <p className="mb-3 text-sm text-emerald-700">{panelMsg}</p> : null}
      <div className="mt-4 space-y-3 text-sm sm:mt-5">
        {rows.length ? (
          rows.map((b) => (
            <div key={b.id} className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <SelectionCard
                  title={`Scene with ${b.role === 'host' ? b.guest.displayName : b.host.displayName}`}
                  meta={`${b.status.toUpperCase()} · ${formatRange(b.startsAt, b.endsAt, tz)}${b.note ? ` · ${b.note}` : ''}`}
                  tone={b.status === 'confirmed' ? 'emerald' : 'amber'}
                />
              </div>
              {b.status === 'confirmed' ? (
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  {canReschedule(b) ? (
                    <button
                      type="button"
                      className="rounded-full border border-amber-400/35 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-500/25"
                      onClick={() => {
                        setPanelMsg(null)
                        setRescheduleRow(b)
                      }}
                    >
                      Reschedule
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={cancelId === b.id}
                    className="rounded-full border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100 disabled:opacity-50"
                    onClick={() => void cancelReservationRow(b.id)}
                  >
                    {cancelId === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dc-border bg-dc-elevated-muted p-5 text-dc-muted">No reservations yet.</div>
        )}
      </div>
    </GlassPanel>
  )
}
