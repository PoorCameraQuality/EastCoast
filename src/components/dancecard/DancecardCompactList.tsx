'use client'

import { useMemo, useState } from 'react'
import { formatRange, formatTime } from '@/components/dancecard/time'
import { roleColor } from '@/lib/dancecard/roleColors'
import { locationColor } from '@/lib/dancecard/locationColors'
import type { StaffShift } from '@/lib/dancecard/staffSchedule'

type SelectionRow = {
  id: string
  kind: string
  slotId: string | null
  startsAt: string
  endsAt: string
  programTitle?: string | null
  programRoom?: string | null
  programTrack?: string | null
  note?: string | null
}

type ReservationRow = {
  id: string
  startsAt: string
  endsAt: string
  status: string
  role: string
  host: { displayName: string }
  guest: { displayName: string }
}

export type CompactAgendaRow =
  | { type: 'selection'; selection: SelectionRow }
  | { type: 'reservation'; reservation: ReservationRow }

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

function dayKey(iso: string, tz: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: tz,
  }).format(new Date(iso))
}

function scrubEventBrand(value: string | null | undefined, fallback = ''): string {
  const cleaned = (value ?? '')
    .replace(/Primal Arts Festival\s*2026/gi, 'Dancecard')
    .replace(/Primal Arts Festival/gi, 'Dancecard')
    .replace(/\bPAF\s*26\b/gi, 'Dancecard')
    .replace(/\bPAF26\b/gi, 'Dancecard')
    .replace(/\bPAF\b/gi, 'Dancecard')
    .replace(/\s{2,}/g, ' ')
    .trim()
  return cleaned || fallback
}

function reservationPartnerName(r: ReservationRow): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

export function DancecardCompactList(props: {
  rows: CompactAgendaRow[]
  tz: string
  findMatchingStaffShift: (selection: SelectionRow) => StaffShift | null
  staffManualBlockTitle: (selection: SelectionRow, fallback: string) => string
  onRemoveSelection: (id: string) => void
  onNoteBlur: (selection: SelectionRow, note: string) => void
  onCancelReservation?: (id: string) => void | Promise<void>
}) {
  const { rows, tz, findMatchingStaffShift, staffManualBlockTitle, onRemoveSelection, onNoteBlur, onCancelReservation } =
    props
  const [openId, setOpenId] = useState<string | null>(null)

  const withDayBreaks = useMemo(() => {
    const out: { row: CompactAgendaRow; showDay: boolean; day: string }[] = []
    let prevDay = ''
    for (const row of rows) {
      const starts = row.type === 'selection' ? row.selection.startsAt : row.reservation.startsAt
      const day = dayKey(starts, tz)
      const showDay = day !== prevDay
      prevDay = day
      out.push({ row, showDay, day })
    }
    return out
  }, [rows, tz])

  function roleLabel(row: CompactAgendaRow): string | null {
    if (row.type === 'reservation') return 'Reservation'
    const s = row.selection
    if (s.kind === 'program') {
      const t = scrubEventBrand(s.programTrack, '').trim()
      return t || 'Class'
    }
    const shift = findMatchingStaffShift(s)
    if (shift) return shift.role
    return 'Busy'
  }

  function chipColorForRow(row: CompactAgendaRow): ReturnType<typeof roleColor> {
    if (row.type === 'reservation') return roleColor('Reservation')
    const s = row.selection
    if (s.kind === 'program') return roleColor(scrubEventBrand(s.programTrack, 'track'))
    const shift = findMatchingStaffShift(s)
    return roleColor(shift?.role ?? 'Busy')
  }

  function agendaToneForRow(row: CompactAgendaRow) {
    if (row.type === 'reservation') {
      return { rail: 'bg-emerald-200/75', surface: 'border-emerald-200/15 bg-emerald-950/10' }
    }
    const s = row.selection
    if (s.kind === 'program') return { rail: 'bg-dc-accent/80', surface: 'border-dc-accent-border/15 bg-dc-accent-muted/40' }
    if (findMatchingStaffShift(s)) return { rail: 'bg-blue-300/80', surface: 'border-blue-200/15 bg-blue-950/10' }
    if ((s.programTitle ?? s.note ?? '').toLowerCase().includes('sleep')) {
      return { rail: 'bg-dc-muted/70', surface: 'border-dc-border/30 bg-dc-elevated-muted' }
    }
    return { rail: 'bg-violet-300/80', surface: 'border-violet-200/15 bg-violet-950/10' }
  }

  return (
    <div className="space-y-2">
      {withDayBreaks.map(({ row, showDay, day }) => {
        if (row.type === 'reservation') {
          const r = row.reservation
          const rc = chipColorForRow(row)
          const agendaTone = agendaToneForRow(row)
          return (
            <div key={`r-${r.id}`}>
              {showDay ? (
                <div className="mb-2 mt-4 first:mt-0 font-serif text-lg text-white">{day}</div>
              ) : null}
              <div
                className={cx(
                  'relative overflow-hidden rounded-2xl border py-3 pl-5 pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:pl-6 sm:pr-4',
                  agendaTone.surface,
                  openId === r.id && 'ring-1 ring-emerald-400/30'
                )}
              >
                <span className={cx('absolute inset-y-3 left-3 w-1 rounded-full', agendaTone.rail)} aria-hidden />
                <button
                  type="button"
                  className="flex w-full flex-wrap items-center gap-2 text-left sm:gap-3"
                  onClick={() => setOpenId((id) => (id === r.id ? null : r.id))}
                >
                  <div className="min-w-[7rem] shrink-0 text-sm font-semibold text-emerald-50">
                    {formatTime(r.startsAt, tz)} – {formatTime(r.endsAt, tz)}
                  </div>
                  <span
                    className={cx(
                      'inline-flex max-w-[10rem] shrink-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:max-w-[12rem] sm:text-xs',
                      rc.bg,
                      rc.fg,
                      rc.ring
                    )}
                  >
                    Reservation
                  </span>
                  <div className="min-w-0 flex-1 text-sm font-semibold text-white">
                    Scene with {reservationPartnerName(r)}
                  </div>
                </button>
                {openId === r.id ? (
                  <div className="mt-2 space-y-3 border-t border-white/10 pt-2">
                    <p className="text-xs text-dc-muted/85">{formatRange(r.startsAt, r.endsAt, tz)}</p>
                    {onCancelReservation && r.status === 'confirmed' ? (
                      <button
                        type="button"
                        className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/25"
                        onClick={(e) => {
                          e.stopPropagation()
                          void onCancelReservation(r.id)
                        }}
                      >
                        Cancel reservation
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          )
        }

        const s = row.selection
        const title = staffManualBlockTitle(
          s,
          s.kind === 'program'
            ? scrubEventBrand(s.programTitle, 'Program activity')
            : s.kind === 'manual'
              ? 'Manual busy block'
              : s.kind
        )
        const metaFromStaff = Boolean(findMatchingStaffShift(s))
        const meta = metaFromStaff
          ? 'From staff & volunteer schedule'
          : `${s.kind === 'program' && s.programRoom ? `${s.programRoom} · ` : ''}${formatRange(s.startsAt, s.endsAt, tz)}`
        const label = roleLabel(row)
        const rc = chipColorForRow(row)
        const agendaTone = agendaToneForRow(row)
        const roomColor = locationColor(s.programRoom)
        const hasRoomTint = s.kind === 'program' && Boolean(s.programRoom)
        const hasNote = Boolean((s.note ?? '').trim())

        return (
          <div key={`s-${s.id}`}>
            {showDay ? (
              <div className="mb-2 mt-4 first:mt-0 font-serif text-lg text-white">{day}</div>
            ) : null}
            <div
              className={cx(
                'relative overflow-hidden rounded-2xl border py-3 pl-5 pr-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:pl-6 sm:pr-4',
                hasRoomTint ? `${roomColor.border} ${roomColor.surface}` : agendaTone.surface,
                openId === s.id && 'ring-1 ring-dc-accent-border'
              )}
            >
              <span className={cx('absolute inset-y-3 left-3 w-1 rounded-full', agendaTone.rail)} aria-hidden />
              <button
                type="button"
                className="flex w-full flex-wrap items-center gap-2 text-left sm:gap-3"
                onClick={() => setOpenId((id) => (id === s.id ? null : s.id))}
              >
                <div className="min-w-[7rem] shrink-0 text-sm font-semibold text-dc-accent">
                  {formatTime(s.startsAt, tz)} – {formatTime(s.endsAt, tz)}
                </div>
                {label ? (
                  <span
                    className={cx(
                      'inline-flex max-w-[10rem] shrink-0 truncate rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 sm:max-w-[12rem] sm:text-xs',
                      rc.bg,
                      rc.fg,
                      rc.ring
                    )}
                  >
                    {label}
                  </span>
                ) : null}
                <div className="min-w-0 flex-1 text-sm font-semibold text-white">{title}</div>
                {s.kind === 'program' && s.programRoom ? (
                  <span
                    className={cx(
                      'hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ring-1 sm:inline',
                      roomColor.bg,
                      roomColor.fg,
                      roomColor.ring
                    )}
                  >
                    {s.programRoom}
                  </span>
                ) : null}
                {hasNote ? (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" title="Has a note" aria-hidden />
                ) : null}
              </button>
              {openId === s.id ? (
                <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
                  <p className="text-xs text-dc-muted/85">{meta}</p>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-dc-muted/85">Personal note</label>
                  <textarea
                    className="min-h-[72px] w-full rounded-xl border border-dc-border bg-dc-elevated px-3 py-2 text-sm text-white placeholder:text-dc-subtle outline-none transition focus:border-dc-accent focus:ring-2 focus:ring-dc-accent-border/20"
                    defaultValue={s.note ?? ''}
                    placeholder="Only you see this note…"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => onNoteBlur(s, e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-full border border-rose-400/25 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100 hover:bg-rose-500/25"
                    onClick={() => onRemoveSelection(s.id)}
                  >
                    Remove from dancecard
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
