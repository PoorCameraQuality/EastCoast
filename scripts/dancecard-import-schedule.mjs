/**
 * Import program slots into Supabase for a dancecard event slug (idempotent upsert).
 *
 * Usage:
 *   node scripts/dancecard-import-schedule.mjs --slug paf26 --json ./path/to/slots.json
 *   node scripts/dancecard-import-schedule.mjs --slug paf26 ./path/to/schedule.xlsx
 *   node scripts/dancecard-import-schedule.mjs --slug paf26 --json ./data.json --dry-run
 *
 * Matching: each slot uses `id` (UUID) when present and already in DB; otherwise a stable key from
 * startsAt + endsAt + title + room (normalized). Re-importing unchanged rows updates nothing.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })
dotenv.config()

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

function normKey(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function pickCol(row, candidates) {
  const keys = Object.keys(row)
  const map = new Map(keys.map((k) => [normKey(k), k]))
  for (const c of candidates) {
    const hit = map.get(normKey(c))
    if (hit) return hit
  }
  return undefined
}

function toDate(v) {
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v
  if (typeof v === 'number' && Number.isFinite(v)) {
    const utc = (v - 25569) * 86400 * 1000
    const d = new Date(utc)
    return Number.isNaN(d.getTime()) ? null : d
  }
  if (typeof v === 'string') {
    const t = Date.parse(v)
    if (!Number.isNaN(t)) return new Date(t)
  }
  return null
}

function compositeKeyFromPayload(p) {
  const start = new Date(p.starts_at).toISOString()
  const end = new Date(p.ends_at).toISOString()
  return `${start}|${end}|${normKey(p.title)}|${normKey(p.room ?? '')}`
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} eventId
 * @param {Array<{ event_id: string; starts_at: string; ends_at: string; title: string; track: string | null; room: string | null; description: string | null; sort_order: number; source_id?: string }>} incoming
 * @param {{ dryRun: boolean }} opts
 */
async function upsertProgramSlots(supabase, eventId, incoming, opts) {
  const { data: existing, error: exErr } = await supabase
    .from('dancecard_program_slots')
    .select('id, starts_at, ends_at, title, track, room, description, sort_order')
    .eq('event_id', eventId)
  if (exErr) throw exErr
  const rows = existing ?? []

  const byId = new Map(rows.map((r) => [r.id, r]))
  const byComposite = new Map()
  for (const r of rows) {
    byComposite.set(compositeKeyFromPayload(r), r)
  }

  let inserted = 0
  let updated = 0
  let unchanged = 0

  for (const slot of incoming) {
    let match = null
    if (slot.source_id && byId.has(slot.source_id)) {
      match = byId.get(slot.source_id)
    }
    if (!match) {
      const ck = compositeKeyFromPayload(slot)
      match = byComposite.get(ck) ?? null
    }

    const payload = {
      event_id: eventId,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      title: slot.title,
      track: slot.track,
      room: slot.room,
      description: slot.description,
      sort_order: slot.sort_order,
    }

    if (!match) {
      if (opts.dryRun) {
        inserted++
        const fakeId = `dry-run-${inserted}`
        const row = { id: fakeId, ...payload }
        byId.set(fakeId, row)
        byComposite.set(compositeKeyFromPayload(row), row)
        continue
      }
      const { data: ins, error } = await supabase.from('dancecard_program_slots').insert(payload).select('id').single()
      if (error) throw error
      inserted++
      const row = { id: ins.id, ...payload }
      byId.set(ins.id, row)
      byComposite.set(compositeKeyFromPayload(row), row)
      continue
    }

    const same =
      match.starts_at === payload.starts_at &&
      match.ends_at === payload.ends_at &&
      match.title === payload.title &&
      (match.track ?? null) === (payload.track ?? null) &&
      (match.room ?? null) === (payload.room ?? null) &&
      (match.description ?? null) === (payload.description ?? null) &&
      Number(match.sort_order) === Number(payload.sort_order)

    if (same) {
      unchanged++
      continue
    }

    if (opts.dryRun) {
      updated++
      const merged = { ...match, ...payload }
      const oldCk = compositeKeyFromPayload(match)
      const newCk = compositeKeyFromPayload(merged)
      if (oldCk !== newCk) byComposite.delete(oldCk)
      byId.set(match.id, merged)
      byComposite.set(newCk, merged)
      continue
    }
    const { error } = await supabase.from('dancecard_program_slots').update(payload).eq('id', match.id).eq('event_id', eventId)
    if (error) throw error
    updated++
    const merged = { ...match, ...payload }
    const oldCk = compositeKeyFromPayload(match)
    const newCk = compositeKeyFromPayload(merged)
    if (oldCk !== newCk) byComposite.delete(oldCk)
    byId.set(match.id, merged)
    byComposite.set(newCk, merged)
  }

  return { inserted, updated, unchanged, totalIncoming: incoming.length }
}

function jsonSlotsToPayloads(slots) {
  let i = 0
  return slots.map((s) => {
    const starts_at = new Date(s.startsAt).toISOString()
    const ends_at = new Date(s.endsAt).toISOString()
    const source_id =
      typeof s.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s.id)
        ? s.id
        : undefined
    return {
      event_id: '',
      starts_at,
      ends_at,
      title: s.title,
      track: s.track ?? null,
      room: s.room ?? null,
      description: s.description ?? null,
      sort_order: s.sortOrder ?? i++,
      source_id,
    }
  })
}

async function importJson(filePath, supabase, eventId, opts) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  const slots = raw.slots
  if (!Array.isArray(slots)) throw new Error('JSON must have { slots: [...] }')
  const incoming = jsonSlotsToPayloads(slots).map((r) => ({ ...r, event_id: eventId }))
  const summary = await upsertProgramSlots(supabase, eventId, incoming, opts)
  console.log(
    opts.dryRun ? '[dry-run] ' : '',
    `Program slots: would insert ${summary.inserted}, update ${summary.updated}, leave unchanged ${summary.unchanged} (incoming ${summary.totalIncoming})`,
    opts.dryRun ? '(no DB writes)' : '',
  )
}

async function importXlsx(filePath, supabase, eventId, opts) {
  const wb = XLSX.readFile(filePath, { cellDates: true, raw: false })
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes('grid')) ?? wb.SheetNames[0]
  if (!sheetName) throw new Error('Workbook has no sheets')
  const sheet = wb.Sheets[sheetName]
  if (!sheet) throw new Error(`Missing sheet ${sheetName}`)
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
  if (!rows.length) throw new Error('No rows in sheet')
  const first = rows[0]
  const sk = pickCol(first, ['starts_at', 'start', 'start time', 'begin', 'starts', 'from'])
  const ek = pickCol(first, ['ends_at', 'end', 'end time', 'finish', 'ends', 'to'])
  const tk = pickCol(first, ['title', 'session', 'class', 'name', 'event', 'description'])
  if (!sk || !ek || !tk) {
    throw new Error(`Could not detect columns. Found keys: ${Object.keys(first).join(', ')}`)
  }
  const trk = pickCol(first, ['track', 'track name', 'series'])
  const rm = pickCol(first, ['room', 'location', 'space', 'venue'])
  const desc = pickCol(first, ['description', 'details', 'summary'])

  const incoming = []
  let sortOrder = 0
  for (const row of rows) {
    const s = toDate(row[sk])
    const e = toDate(row[ek])
    const title = String(row[tk] ?? '').trim()
    if (!s || !e || !title) continue
    if (e <= s) continue
    incoming.push({
      event_id: eventId,
      starts_at: s.toISOString(),
      ends_at: e.toISOString(),
      title,
      track: trk ? String(row[trk] ?? '').trim() || null : null,
      room: rm ? String(row[rm] ?? '').trim() || null : null,
      description: desc ? String(row[desc] ?? '').trim() || null : null,
      sort_order: sortOrder++,
    })
  }
  if (!incoming.length) throw new Error('No valid slot rows parsed')
  const summary = await upsertProgramSlots(supabase, eventId, incoming, opts)
  console.log(
    opts.dryRun ? '[dry-run] ' : '',
    `Program slots from ${sheetName}: would insert ${summary.inserted}, update ${summary.updated}, leave unchanged ${summary.unchanged} (incoming ${summary.totalIncoming})`,
    opts.dryRun ? '(no DB writes)' : '',
  )
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  const args = process.argv.slice(2)
  let slug = 'paf26'
  let jsonPath = null
  let dryRun = false
  const rest = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--slug' && args[i + 1]) {
      slug = args[++i].toLowerCase()
    } else if (args[i] === '--json' && args[i + 1]) {
      jsonPath = args[++i]
    } else if (args[i] === '--dry-run') {
      dryRun = true
    } else {
      rest.push(args[i])
    }
  }
  const fileArg = rest.find((a) => a && !a.startsWith('--'))
  const supabase = createClient(url, key)
  const { data: ev, error: evErr } = await supabase.from('dancecard_events').select('id, status').eq('slug', slug).maybeSingle()
  if (evErr) throw evErr
  if (!ev) throw new Error(`Event slug not found: ${slug} (create event row first)`)
  if (ev.status !== 'published') {
    throw new Error(
      `Event "${slug}" has status "${ev.status}" but the public API only loads published events. ` +
        `In Supabase SQL: UPDATE dancecard_events SET status = 'published' WHERE slug = ${JSON.stringify(slug)};`,
    )
  }

  const opts = { dryRun }

  if (jsonPath) {
    await importJson(path.resolve(jsonPath), supabase, ev.id, opts)
    return
  }
  if (!fileArg) {
    console.error(
      'Usage: node scripts/dancecard-import-schedule.mjs --slug paf26 [--json file.json] [--dry-run] [file.xlsx]',
    )
    process.exit(1)
  }
  const fp = path.resolve(fileArg)
  if (!fs.existsSync(fp)) throw new Error(`File not found: ${fp}`)
  if (fp.endsWith('.json')) {
    await importJson(fp, supabase, ev.id, opts)
  } else {
    await importXlsx(fp, supabase, ev.id, opts)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
