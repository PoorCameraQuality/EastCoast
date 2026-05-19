/** Build RFC 5545 .ics for a personal dancecard (program + manual + reservations). */

export type IcsSelection = {
  id: string
  kind: string
  startsAt: string
  endsAt: string
  programTitle?: string | null
  programRoom?: string | null
  note?: string | null
}

export type IcsReservation = {
  id: string
  startsAt: string
  endsAt: string
  note: string | null
  role: string
  host: { displayName: string }
  guest: { displayName: string }
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

function formatUtcForIcs(iso: string): string | null {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return null
  return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function reservationPartnerName(r: IcsReservation): string {
  return r.role === 'host' ? r.guest.displayName : r.host.displayName
}

type IcEvent = {
  uid: string
  start: string
  end: string
  summary: string
  description: string | null
  /** Program selections only — emit VALARM when remindBeforeMinutes > 0 */
  remindBeforeMinutes?: number
}

/** RFC 5545 duration for VALARM TRIGGER (e.g. 15 → "-PT15M"). */
export function icsValarmTriggerMinutes(minutes: number): string | null {
  const m = Math.floor(minutes)
  if (m <= 0 || m > 24 * 60) return null
  return `-PT${m}M`
}

function appendValarm(lines: string[], remindBeforeMinutes: number) {
  const trigger = icsValarmTriggerMinutes(remindBeforeMinutes)
  if (!trigger) return
  lines.push('BEGIN:VALARM')
  lines.push('ACTION:DISPLAY')
  lines.push('DESCRIPTION:Session reminder')
  lines.push(`TRIGGER:${trigger}`)
  lines.push('END:VALARM')
}

export function countDancecardIcsEvents(selections: IcsSelection[], reservations: IcsReservation[]): number {
  let n = 0
  for (const s of selections) {
    if (s.kind !== 'program' && s.kind !== 'manual') continue
    if (Date.parse(s.endsAt) <= Date.parse(s.startsAt)) continue
    if (!formatUtcForIcs(s.startsAt) || !formatUtcForIcs(s.endsAt)) continue
    n++
  }
  for (const r of reservations) {
    if (Date.parse(r.endsAt) <= Date.parse(r.startsAt)) continue
    if (!formatUtcForIcs(r.startsAt) || !formatUtcForIcs(r.endsAt)) continue
    n++
  }
  return n
}

function collectEvents(
  selections: IcsSelection[],
  reservations: IcsReservation[],
  attendeeName: string,
  programRemindBeforeMinutes: number
): IcEvent[] {
  const out: IcEvent[] = []

  for (const s of selections) {
    const ds = formatUtcForIcs(s.startsAt)
    const de = formatUtcForIcs(s.endsAt)
    if (!ds || !de) continue
    if (Date.parse(s.endsAt) <= Date.parse(s.startsAt)) continue

    if (s.kind === 'program') {
      const title = (s.programTitle ?? 'Program activity').trim() || 'Program activity'
      const room = (s.programRoom ?? '').trim()
      const note = (s.note ?? '').trim()
      const desc = [room ? `Room: ${room}` : null, note ? `Note: ${note}` : null, `Event: ${attendeeName}`]
        .filter(Boolean)
        .join('\n')
      out.push({
        uid: `${s.id}@dancecard.eastcoastkinkevents`,
        start: ds,
        end: de,
        summary: title,
        description: desc,
        remindBeforeMinutes: programRemindBeforeMinutes > 0 ? programRemindBeforeMinutes : undefined,
      })
    } else if (s.kind === 'manual') {
      const note = (s.note ?? '').trim()
      out.push({
        uid: `${s.id}@dancecard.eastcoastkinkevents`,
        start: ds,
        end: de,
        summary: 'Busy (dancecard)',
        description: [note ? `Note: ${note}` : null, `Manual busy block`, attendeeName].filter(Boolean).join('\n'),
      })
    }
  }

  for (const r of reservations) {
    const ds = formatUtcForIcs(r.startsAt)
    const de = formatUtcForIcs(r.endsAt)
    if (!ds || !de) continue
    if (Date.parse(r.endsAt) <= Date.parse(r.startsAt)) continue
    const partner = reservationPartnerName(r)
    const note = (r.note ?? '').trim()
    const desc = [note ? `Note: ${note}` : null, attendeeName].filter(Boolean).join('\n')
    out.push({
      uid: `${r.id}@dancecard.eastcoastkinkevents`,
      start: ds,
      end: de,
      summary: `Scene with ${partner}`,
      description: desc,
    })
  }

  out.sort((a, b) => a.start.localeCompare(b.start))
  return out
}

export function buildDancecardIcs(args: {
  calendarName: string
  attendeeDisplayName: string
  selections: IcsSelection[]
  reservations: IcsReservation[]
  /** Minutes before program selections for VALARM; 0 = none */
  programRemindBeforeMinutes?: number
}): string {
  const remind = args.programRemindBeforeMinutes ?? 0
  const events = collectEvents(args.selections, args.reservations, args.attendeeDisplayName, remind)
  const stamp = formatUtcForIcs(new Date().toISOString()) ?? '19700101T000000Z'

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//East Coast Kink Events//Dancecard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(args.calendarName)}`,
  ]

  for (const ev of events) {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${ev.uid}`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART:${ev.start}`)
    lines.push(`DTEND:${ev.end}`)
    lines.push(`SUMMARY:${escapeIcsText(ev.summary.slice(0, 200))}`)
    if (ev.description) lines.push(`DESCRIPTION:${escapeIcsText(ev.description.slice(0, 2000))}`)
    if (ev.remindBeforeMinutes) appendValarm(lines, ev.remindBeforeMinutes)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/** Selections only (no reservations) — used by GET /api/dancecard/.../ics */
export function buildDancecardSelectionsOnlyIcs(args: {
  calendarName: string
  attendeeDisplayName: string
  selections: IcsSelection[]
  programRemindBeforeMinutes?: number
}): string {
  const emptyReservations: IcsReservation[] = []
  return buildDancecardIcs({
    calendarName: args.calendarName,
    attendeeDisplayName: args.attendeeDisplayName,
    selections: args.selections,
    reservations: emptyReservations,
    programRemindBeforeMinutes: args.programRemindBeforeMinutes,
  })
}

/** Published program slots for subscribe-style ICS (no PII; same visibility rules as public schedule API). */
export type PublishedProgramIcsSlot = {
  id: string
  startsAt: string
  endsAt: string
  title: string
  trackDisplay: string | null
  room: string | null
  description: string | null
}

export function buildDancecardPublishedProgramIcs(args: {
  calendarName: string
  eventLabel: string
  slots: PublishedProgramIcsSlot[]
}): string {
  const stamp = formatUtcForIcs(new Date().toISOString()) ?? '19700101T000000Z'
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//East Coast Kink Events//Dancecard//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(args.calendarName)}`,
  ]

  const sorted = [...args.slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  for (const s of sorted) {
    const ds = formatUtcForIcs(s.startsAt)
    const de = formatUtcForIcs(s.endsAt)
    if (!ds || !de) continue
    if (Date.parse(s.endsAt) <= Date.parse(s.startsAt)) continue
    const room = (s.room ?? '').trim()
    const track = (s.trackDisplay ?? '').trim()
    const descBits = [
      track ? `Track: ${track}` : null,
      room ? `Room: ${room}` : null,
      s.description?.trim() ? s.description.trim().slice(0, 1500) : null,
      `Event: ${args.eventLabel}`,
    ].filter(Boolean)
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${s.id}@dancecard-program.eastcoastkinkevents`)
    lines.push(`DTSTAMP:${stamp}`)
    lines.push(`DTSTART:${ds}`)
    lines.push(`DTEND:${de}`)
    lines.push(`SUMMARY:${escapeIcsText((s.title || 'Session').slice(0, 200))}`)
    if (descBits.length) lines.push(`DESCRIPTION:${escapeIcsText(descBits.join('\n').slice(0, 2000))}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcsFile(filename: string, icsBody: string) {
  const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function googleCalendarImportHintUrl(): string {
  return 'https://support.google.com/calendar/answer/37118'
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Format instant as Google Calendar `dates` param segment (`YYYYMMDDTHHmmssZ`, UTC). */
function formatGoogleCalendarUtcSegment(d: Date): string | null {
  const t = d.getTime()
  if (!Number.isFinite(t)) return null
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  )
}

/**
 * Opens Google Calendar prefilled “create event” (timed, UTC). Use after the user picks local times in datetime fields.
 * Returns null if the range is invalid.
 */
export function googleCalendarCreateEventUrl(args: {
  title: string
  details: string
  start: Date
  end: Date
}): string | null {
  const t0 = args.start.getTime()
  const t1 = args.end.getTime()
  if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 <= t0) return null
  const a = formatGoogleCalendarUtcSegment(args.start)
  const b = formatGoogleCalendarUtcSegment(args.end)
  if (!a || !b) return null
  const dates = `${a}/${b}`
  const u = new URL('https://calendar.google.com/calendar/render')
  u.searchParams.set('action', 'TEMPLATE')
  u.searchParams.set('text', args.title)
  u.searchParams.set('dates', dates)
  u.searchParams.set('details', args.details)
  return u.toString()
}
