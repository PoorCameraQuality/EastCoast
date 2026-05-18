import * as XLSX from 'xlsx'
import { looksLikeStaffGridSheet, parseStaffGridWorkbook } from '@/lib/dancecard/staffGridScheduleImport'

export type ImportKind = 'program' | 'staff'

export type ProgramImportDraft = {
  kind: 'program'
  rowKey: string
  title: string
  track: string | null
  room: string | null
  description: string | null
  startsAt: string | null
  endsAt: string | null
  durationMinutes: number | null
  status: 'unplaced' | 'placed' | 'invalid'
  errors: string[]
  raw: Record<string, unknown>
}

export type StaffImportDraft = {
  kind: 'staff'
  rowKey: string
  personName: string
  role: string
  location: string | null
  startsAt: string | null
  endsAt: string | null
  durationMinutes: number | null
  status: 'unplaced' | 'placed' | 'invalid'
  errors: string[]
  raw: Record<string, unknown>
}

export type ImportDraftRow = ProgramImportDraft | StaffImportDraft

export type ImportParseResult = {
  kind: ImportKind
  filename: string
  sheetName: string
  detectedColumns: Record<string, string | null>
  rows: ImportDraftRow[]
  summary: {
    total: number
    valid: number
    invalid: number
    locations: string[]
    staffNames: string[]
  }
}

function normKey(s: string) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function pickCol(row: Record<string, unknown>, candidates: string[]) {
  const map = new Map(Object.keys(row).map((key) => [normKey(key), key]))
  for (const candidate of candidates) {
    const hit = map.get(normKey(candidate))
    if (hit) return hit
  }
  return null
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value === 'number' && Number.isFinite(value)) {
    const utc = (value - 25569) * 86400 * 1000
    const d = new Date(utc)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof value === 'string') {
    const t = Date.parse(value)
    if (!Number.isNaN(t)) return new Date(t)
  }
  return null
}

function clean(value: unknown) {
  return String(value ?? '').trim()
}

function durationMinutes(startsAt: string | null, endsAt: string | null) {
  if (!startsAt || !endsAt) return null
  const minutes = Math.round((Date.parse(endsAt) - Date.parse(startsAt)) / 60_000)
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null
}

function sheetRowsFromBuffer(buffer: ArrayBuffer, filename: string) {
  const workbook = XLSX.read(buffer, { cellDates: true, raw: false })
  const first = workbook.Sheets[workbook.SheetNames[0]!]
  const probe = first ? XLSX.utils.sheet_to_json<unknown[]>(first, { header: 1, defval: '' }) : []
  if (looksLikeStaffGridSheet(probe)) {
    return { filename, sheetName: workbook.SheetNames.join(', '), rows: [] as Record<string, unknown>[] }
  }
  const sheetName = workbook.SheetNames.find((name) => name.toLowerCase().includes('grid')) ?? workbook.SheetNames[0]
  if (!sheetName) throw new Error('Workbook has no sheets')
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) throw new Error(`Missing sheet ${sheetName}`)
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })
  return { filename, sheetName, rows }
}

function rowsFromJson(payload: unknown, filename: string, kind: ImportKind) {
  if (kind === 'staff' && payload && typeof payload === 'object' && Array.isArray((payload as { people?: unknown }).people)) {
    const rows: Record<string, unknown>[] = []
    for (const person of (payload as { people: Array<{ name?: unknown; shifts?: unknown }> }).people) {
      const personName = clean(person.name)
      const shifts = Array.isArray(person.shifts) ? person.shifts : []
      for (const shift of shifts as Record<string, unknown>[]) {
        rows.push({ personName, ...shift })
      }
    }
    return { filename, sheetName: 'JSON people', rows }
  }
  const rows = payload && typeof payload === 'object' && Array.isArray((payload as { slots?: unknown }).slots)
    ? (payload as { slots: Record<string, unknown>[] }).slots
    : Array.isArray(payload)
      ? (payload as Record<string, unknown>[])
      : []
  return { filename, sheetName: 'JSON', rows }
}

export function parseOrganizerRows(kind: ImportKind, rows: Record<string, unknown>[], filename = 'manual'): ImportParseResult {
  const first = rows[0] ?? {}
  const startsKey = pickCol(first, ['startsAt', 'starts_at', 'start', 'start time', 'begin', 'from'])
  const endsKey = pickCol(first, ['endsAt', 'ends_at', 'end', 'end time', 'finish', 'to'])
  const titleKey = pickCol(first, kind === 'program' ? ['title', 'session', 'class', 'name', 'event'] : ['personName', 'person name', 'person', 'staff', 'name'])
  const roleKey = pickCol(first, ['role', 'shift', 'assignment'])
  const trackKey = pickCol(first, ['track', 'track name', 'series', 'type'])
  const roomKey = pickCol(first, ['room', 'location', 'space', 'venue'])
  const descKey = pickCol(first, ['description', 'details', 'summary', 'notes'])

  const parsed = rows.map((row, index): ImportDraftRow => {
    const starts = startsKey ? toDate(row[startsKey]) : null
    const ends = endsKey ? toDate(row[endsKey]) : null
    const startsAt = starts ? starts.toISOString() : null
    const endsAt = ends ? ends.toISOString() : null
    const errors: string[] = []
    if (!startsAt) errors.push('Missing or invalid start time')
    if (!endsAt) errors.push('Missing or invalid end time')
    if (startsAt && endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) errors.push('End must be after start')

    if (kind === 'program') {
      const title = titleKey ? clean(row[titleKey]) : ''
      if (!title) errors.push('Missing title')
      return {
        kind,
        rowKey: `program-${index}`,
        title,
        track: trackKey ? clean(row[trackKey]) || null : null,
        room: roomKey ? clean(row[roomKey]) || null : null,
        description: descKey ? clean(row[descKey]) || null : null,
        startsAt,
        endsAt,
        durationMinutes: durationMinutes(startsAt, endsAt),
        status: errors.length ? 'invalid' : startsAt && endsAt ? 'placed' : 'unplaced',
        errors,
        raw: row,
      }
    }

    const personName = titleKey ? clean(row[titleKey]) : ''
    const role = roleKey ? clean(row[roleKey]) : ''
    if (!personName) errors.push('Missing staff name')
    if (!role) errors.push('Missing role')
    return {
      kind,
      rowKey: `staff-${index}`,
      personName,
      role,
      location: roomKey ? clean(row[roomKey]) || null : null,
      startsAt,
      endsAt,
      durationMinutes: durationMinutes(startsAt, endsAt),
      status: errors.length ? 'invalid' : startsAt && endsAt ? 'placed' : 'unplaced',
      errors,
      raw: row,
    }
  })

  const locations = new Set<string>()
  const staffNames = new Set<string>()
  for (const row of parsed) {
    if (row.kind === 'program' && row.room) locations.add(row.room)
    if (row.kind === 'staff') {
      if (row.location) locations.add(row.location)
      if (row.personName) staffNames.add(row.personName)
    }
  }

  return {
    kind,
    filename,
    sheetName: 'Rows',
    detectedColumns: {
      startsAt: startsKey,
      endsAt: endsKey,
      titleOrPerson: titleKey,
      role: roleKey,
      track: trackKey,
      room: roomKey,
      description: descKey,
    },
    rows: parsed,
    summary: {
      total: parsed.length,
      valid: parsed.filter((row) => !row.errors.length).length,
      invalid: parsed.filter((row) => row.errors.length).length,
      locations: Array.from(locations).sort(),
      staffNames: Array.from(staffNames).sort(),
    },
  }
}

export async function parseOrganizerImport(input: {
  kind: ImportKind
  filename: string
  buffer?: ArrayBuffer
  json?: unknown
  windowStartsAt?: string
  windowEndsAt?: string
}): Promise<ImportParseResult> {
  if (input.buffer) {
    const grid =
      input.kind === 'staff' || /\.xlsx?$/i.test(input.filename)
        ? parseStaffGridWorkbook(input.buffer, input.filename, {
            windowStartsAt: input.windowStartsAt,
            windowEndsAt: input.windowEndsAt,
          })
        : null
    if (grid && grid.rows.length > 0) {
      return grid
    }
  }
  const source = input.buffer ? sheetRowsFromBuffer(input.buffer, input.filename) : rowsFromJson(input.json, input.filename, input.kind)
  const flat = parseOrganizerRows(input.kind, source.rows, source.filename)
  if (input.buffer && input.kind === 'program' && flat.summary.invalid > flat.summary.total * 0.5) {
    const retry = parseStaffGridWorkbook(input.buffer, input.filename, {
      windowStartsAt: input.windowStartsAt,
      windowEndsAt: input.windowEndsAt,
    })
    if (retry && retry.rows.length > 0) return retry
  }
  return { ...flat, sheetName: source.sheetName }
}
