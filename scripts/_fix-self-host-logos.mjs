import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = Object.fromEntries(
  fs
    .readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')]
    })
)

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const SELF =
  /^https?:\/\/(?:www\.)?eastcoastkinkevents\.com(\/images\/.+)$/i

async function rewriteTable(table, column) {
  const { data, error } = await sb.from(table).select(`id, slug, ${column}`).not(column, 'is', null)
  if (error) throw error
  let changed = 0
  const samples = []
  for (const row of data || []) {
    const raw = String(row[column] || '').trim()
    const m = raw.match(SELF)
    if (!m) continue
    const next = m[1]
    const { error: uerr } = await sb.from(table).update({ [column]: next }).eq('id', row.id)
    if (uerr) {
      console.error('fail', table, row.slug, uerr.message)
      continue
    }
    changed++
    if (samples.length < 5) samples.push({ slug: row.slug, from: raw, to: next })
  }
  return { table, column, scanned: data?.length ?? 0, changed, samples }
}

const results = []
results.push(await rewriteTable('events', 'logo'))

// Best-effort: other tables that may hold absolute self logos
for (const [table, column] of [
  ['dungeon_venues', 'logo'],
  ['vendors', 'logo'],
  ['vendors', 'logo_125_url'],
  ['vendors', 'logo125_url'],
]) {
  try {
    results.push(await rewriteTable(table, column))
  } catch (e) {
    results.push({ table, column, skipped: e.message || String(e) })
  }
}

console.log(JSON.stringify(results, null, 2))
