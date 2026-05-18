/**
 * Minimal ICS busy-block parser for organizer-only previews (Phase 7 MVP).
 * Supports DTSTART/DTEND in UTC (…Z) or all-day VALUE=DATE; folds unfolded lines.
 */
export type IcsBusyBlock = { start: string; end: string; summary?: string }

function parseIcsDate(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  if (/^\d{8}$/.test(v)) {
    const y = v.slice(0, 4)
    const mo = v.slice(4, 6)
    const d = v.slice(6, 8)
    return `${y}-${mo}-${d}T00:00:00.000Z`
  }
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/)
  if (!m) return null
  const [, y, mo, d, h, mi, s, z] = m
  if (z) return `${y}-${mo}-${d}T${h}:${mi}:${s}.000Z`
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000`
}

export function parseIcsBusyBlocks(icsText: string): IcsBusyBlock[] {
  const out: IcsBusyBlock[] = []
  const re = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(icsText)) !== null) {
    const block = m[1] ?? ''
    const unfolded = block.replace(/\r?\n[ \t]/g, '')
    const ds = unfolded.match(/DTSTART[^:]*:([^\r\n]+)/i)?.[1]?.trim()
    const de = unfolded.match(/DTEND[^:]*:([^\r\n]+)/i)?.[1]?.trim()
    const summary = unfolded.match(/SUMMARY[^:]*:([^\r\n]+)/i)?.[1]?.trim()
    if (!ds || !de) continue
    const start = parseIcsDate(ds)
    const end = parseIcsDate(de)
    if (start && end) out.push({ start, end, summary: summary || undefined })
  }
  return out
}
