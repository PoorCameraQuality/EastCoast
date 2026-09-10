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

const intended = JSON.parse(
  fs.readFileSync('C:/Users/shkin/Desktop/coast-to-coast-kink/tmp-ecke-slugs.json', 'utf8')
)

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function slugsFrom(table) {
  // try with c2k filter first
  let { data, error } = await sb.from(table).select('slug,c2k_source_id').not('c2k_source_id', 'is', null)
  if (error) {
    console.error(table, error.message)
    ;({ data, error } = await sb.from(table).select('slug'))
    if (error) throw error
  }
  return new Set((data || []).map((r) => r.slug))
}

const eventSlugs = await slugsFrom('events')
const vendorSlugs = await slugsFrom('vendors')
const dungeonSlugs = await slugsFrom('dungeon_venues')

function diff(label, intendedList, found) {
  const missing = intendedList.filter((s) => !found.has(s))
  const extra = [...found].filter((s) => !intendedList.includes(s) && !s.includes('pilot') && !s.includes('test'))
  console.log(`\n=== ${label} ===`)
  console.log({ intended: intendedList.length, found: found.size, missing: missing.length, missingSample: missing.slice(0, 15) })
  if (extra.length) console.log({ extraSample: extra.slice(0, 10) })
}

diff('events', intended.events, eventSlugs)
diff('dungeons', intended.dungeons, dungeonSlugs)
diff('vendors', intended.vendors, vendorSlugs)

// probe dungeon columns via one known slug
const { data: drow, error: derr } = await sb.from('dungeon_venues').select('*').eq('slug', 'launch-pilot-club').maybeSingle()
console.log('\n=== launch-pilot-club keys ===', derr?.message || Object.keys(drow || {}))
console.log(drow && { slug: drow.slug, c2k_source_id: drow.c2k_source_id, c2k_source_type: drow.c2k_source_type })
