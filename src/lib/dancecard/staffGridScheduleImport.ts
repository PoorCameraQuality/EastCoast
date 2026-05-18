import * as XLSX from 'xlsx'
import type { ImportParseResult, StaffImportDraft } from '@/lib/dancecard/organizerImport'

const SKIP_CELL = /^(break|lunch|dinner|breakfast|staff breakfast|staff fire|mixer|\*+)$/i

const WEEKDAYS: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

function clean(s: unknown) {
  return String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Detect PAF-style staff grid: day row + half-hour columns + role rows with names in cells. */
export function looksLikeStaffGridSheet(rows: unknown[][]): boolean {
  if (rows.length < 4) return false
  const r0 = rows[0]?.map(clean).join(' ').toLowerCase() ?? ''
  const r1 = rows[1]?.map(clean).join(' ').toLowerCase() ?? ''
  const hasDay = /monday|tuesday|wednesday|thursday|friday|saturday|sunday/.test(r0)
  const hasBlocks = r1.includes('half hour') || /\d{1,2}:\d{2}\s*(am|pm)/i.test(r1)
  const hasRoleCol = rows.slice(2, 8).some((row) => clean(row?.[0]).length > 2)
  return hasDay && hasBlocks && hasRoleCol
}

function parseClockToken(token: string): { h: number; m: number } | null {
  const m = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i)
  if (!m) return null
  let h = Number(m[1])
  const min = Number(m[2] ?? '0')
  const pm = m[3].toLowerCase() === 'pm'
  if (h === 12) h = pm ? 12 : 0
  else if (pm) h += 12
  return { h, m: min }
}

function parseTimeRangeLabel(label: string): { start: { h: number; m: number }; end: { h: number; m: number } } | null {
  const parts = label
    .replace(/\u2013|\u2014/g, '-')
    .split(/\s{2,}|\s*-\s*/)
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) {
    const single = parseClockToken(label)
    if (!single) return null
    const endM = single.m + 30
    return {
      start: single,
      end: { h: single.h + Math.floor(endM / 60), m: endM % 60 },
    }
  }
  const start = parseClockToken(parts[0]!)
  const end = parseClockToken(parts[parts.length - 1]!)
  if (!start || !end) return null
  return { start, end }
}

function weekdayFromSheetName(name: string): number | null {
  const lower = name.toLowerCase()
  for (const [day, idx] of Object.entries(WEEKDAYS)) {
    if (lower.includes(day)) return idx
  }
  return null
}

function dateForWeekdayInWindow(weekday: number, windowStart: Date, windowEnd: Date): Date | null {
  const cur = new Date(windowStart)
  cur.setHours(0, 0, 0, 0)
  const end = new Date(windowEnd)
  end.setHours(23, 59, 59, 999)
  while (cur <= end) {
    if (cur.getDay() === weekday) return new Date(cur)
    cur.setDate(cur.getDate() + 1)
  }
  return null
}

function combineDateAndTime(base: Date, time: { h: number; m: number }): Date {
  const d = new Date(base)
  d.setHours(time.h, time.m, 0, 0)
  return d
}

function splitNames(cell: string): string[] {
  return cell
    .split(/[\n,;|/]+/)
    .map((s) => s.trim())
    .filter((s) => s && !SKIP_CELL.test(s))
}

export function parseStaffGridWorkbook(
  buffer: ArrayBuffer,
  filename: string,
  opts?: { windowStartsAt?: string; windowEndsAt?: string },
): ImportParseResult | null {
  const workbook = XLSX.read(buffer, { cellDates: true, raw: false })
  const windowStart = opts?.windowStartsAt ? new Date(opts.windowStartsAt) : null
  const windowEnd = opts?.windowEndsAt ? new Date(opts.windowEndsAt) : null
  const anchor =
    windowStart && !Number.isNaN(windowStart.getTime()) ? windowStart : new Date()

  const allRows: StaffImportDraft[] = []
  const sheetNames: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })
    if (!looksLikeStaffGridSheet(matrix)) continue

    sheetNames.push(sheetName)
    const weekday = weekdayFromSheetName(sheetName)
    const dayDate =
      weekday != null && windowStart && windowEnd && !Number.isNaN(windowEnd.getTime())
        ? dateForWeekdayInWindow(weekday, windowStart, windowEnd)
        : new Date(anchor)

    if (!dayDate) continue

    let timeRowIdx = 1
    for (let i = 0; i < Math.min(5, matrix.length); i++) {
      const line = matrix[i]?.map(clean).join(' ').toLowerCase() ?? ''
      if (line.includes('half hour') || /\d{1,2}:\d{2}\s*(am|pm)/i.test(line)) {
        timeRowIdx = i
        break
      }
    }

    const timeRow = matrix[timeRowIdx] ?? []
    const colTimes: Array<{ start: Date; end: Date } | null> = []
    for (let c = 1; c < timeRow.length; c++) {
      const label = clean(timeRow[c])
      if (!label || !/\d{1,2}:\d{2}/i.test(label)) {
        colTimes[c] = null
        continue
      }
      const range = parseTimeRangeLabel(label)
      if (!range) {
        colTimes[c] = null
        continue
      }
      const startsAt = combineDateAndTime(dayDate, range.start)
      const endsAt = combineDateAndTime(dayDate, range.end)
      if (endsAt <= startsAt) endsAt.setMinutes(endsAt.getMinutes() + 30)
      colTimes[c] = { start: startsAt, end: endsAt }
    }

    let currentRole = ''
    for (let r = timeRowIdx + 1; r < matrix.length; r++) {
      const row = matrix[r] ?? []
      const roleCell = clean(row[0])
      if (roleCell) currentRole = roleCell

      if (!currentRole || /^half hour/i.test(currentRole)) continue

      for (let c = 1; c < row.length; c++) {
        const slot = colTimes[c]
        if (!slot) continue
        const cell = clean(row[c])
        if (!cell || SKIP_CELL.test(cell)) continue

        for (const personName of splitNames(cell)) {
          const startsAt = slot.start.toISOString()
          const endsAt = slot.end.toISOString()
          const errors: string[] = []
          if (!personName) errors.push('Missing staff name')
          allRows.push({
            kind: 'staff',
            rowKey: `staff-grid-${sheetName}-${r}-${c}-${personName}`,
            personName,
            role: currentRole,
            location: null,
            startsAt,
            endsAt,
            durationMinutes: Math.round((slot.end.getTime() - slot.start.getTime()) / 60_000),
            status: errors.length ? 'invalid' : 'placed',
            errors,
            raw: { sheet: sheetName, role: currentRole, cell },
          })
        }
      }
    }
  }

  if (!allRows.length) return null

  const locations = new Set<string>()
  const staffNames = new Set<string>()
  for (const row of allRows) {
    if (row.personName) staffNames.add(row.personName)
  }

  return {
    kind: 'staff',
    filename,
    sheetName: sheetNames.join(', ') || 'Grid',
    detectedColumns: {
      format: 'staff_grid',
      sheets: sheetNames.join(', '),
    } as Record<string, string | null>,
    rows: allRows,
    summary: {
      total: allRows.length,
      valid: allRows.filter((r) => !r.errors.length).length,
      invalid: allRows.filter((r) => r.errors.length).length,
      locations: Array.from(locations).sort(),
      staffNames: Array.from(staffNames).sort(),
    },
  }
}
