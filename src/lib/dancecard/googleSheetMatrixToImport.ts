import { parseOrganizerRows, type ImportKind, type ImportParseResult } from '@/lib/dancecard/organizerImport'

/** First row is headers; following rows become objects keyed by normalized header names. */
export function sheetMatrixToRecords(values: string[][]): Record<string, unknown>[] {
  if (!values.length) return []
  const header = (values[0] ?? []).map((h) =>
    String(h ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_'),
  )
  const out: Record<string, unknown>[] = []
  for (let r = 1; r < values.length; r++) {
    const row = values[r] ?? []
    const obj: Record<string, unknown> = {}
    for (let c = 0; c < header.length; c++) {
      const key = header[c]
      if (!key) continue
      obj[key] = row[c] ?? ''
    }
    if (Object.keys(obj).length) out.push(obj)
  }
  return out
}

export function buildImportFromSheetMatrix(
  values: string[][],
  kind: ImportKind,
  filename = 'google-sheet',
): ImportParseResult {
  const records = sheetMatrixToRecords(values)
  const sheetName = values[0]?.join(',')?.slice(0, 120) || 'Sheet'
  return { ...parseOrganizerRows(kind, records, filename), sheetName }
}
