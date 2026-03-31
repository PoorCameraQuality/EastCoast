/**
 * Verifies discovery DB setup: tags seeded, event_tags readable, events table reachable.
 * Usage: from repo root, with .env.local containing NEXT_PUBLIC_SUPABASE_* keys:
 *   node scripts/verify-discovery-db.mjs
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
dotenv.config({ path: join(root, '.env.local') })
dotenv.config({ path: join(root, '.env') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function fail(msg) {
  console.error(`\n[FAIL] ${msg}`)
  process.exit(1)
}

function ok(msg) {
  console.log(`[OK]   ${msg}`)
}

async function main() {
  console.log('Discovery DB checks (anon key)\n')

  if (!url || !key) {
    fail(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your project keys.'
    )
  }

  const supabase = createClient(url, key)

  // tags: expect seed rows
  const { count: tagCount, error: tagErr } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })

  if (tagErr) fail(`tags table: ${tagErr.message}`)
  if (tagCount === null || tagCount === undefined) fail('tags: could not get count')
  ok(`tags: ${tagCount} row(s) (seed expects many)`)
  if (tagCount < 5) {
    console.warn('[WARN] tags count is low — re-run discovery_seed_tags.sql if this is unexpected.')
  }

  // event_tags: may be 0 until you link events
  const { count: etCount, error: etErr } = await supabase
    .from('event_tags')
    .select('*', { count: 'exact', head: true })

  if (etErr) fail(`event_tags table: ${etErr.message}`)
  ok(`event_tags: ${etCount ?? 0} row(s) (0 is normal until you link events to tags)`)

  // events: table exists and RLS allows count or empty
  const { count: evCount, error: evErr } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })

  if (evErr) fail(`events table: ${evErr.message}`)
  ok(`events: ${evCount ?? 0} row(s) visible to anon (depends on RLS/published rows)`)

  // venues
  const { count: vCount, error: vErr } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })

  if (vErr) fail(`venues table: ${vErr.message}`)
  ok(`venues: ${vCount ?? 0} row(s)`)

  // Sample tag slugs
  const { data: sample, error: sampleErr } = await supabase
    .from('tags')
    .select('slug')
    .limit(5)

  if (sampleErr) fail(`tags sample: ${sampleErr.message}`)
  ok(`sample tag slugs: ${(sample || []).map((r) => r.slug).join(', ') || '(none)'}`)

  console.log('\nAll checks passed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
