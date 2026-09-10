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

const spe = await sb
  .from('events')
  .select(
    'slug,title,status,c2k_source_id,c2k_source_type,logo,short_description,long_description,venue,features,website,organizer_name,last_synced_at'
  )
  .eq('slug', 'southeastern-power-exchange-regional-contest')
  .maybeSingle()

console.log('=== SPE row ===')
console.log(JSON.stringify(spe.data, null, 2))
if (spe.error) console.error(spe.error)

const { data: events } = await sb
  .from('events')
  .select('slug,status,c2k_source_id,logo')
  .not('c2k_source_id', 'is', null)

const published = (events || []).filter((e) => e.status === 'published')
const draft = (events || []).filter((e) => e.status !== 'published')
const noLogo = published.filter((e) => !(e.logo || '').trim())

console.log('\n=== events c2k ===')
console.log({
  total: events?.length ?? 0,
  published: published.length,
  otherStatus: draft.length,
  otherStatuses: [...new Set(draft.map((e) => e.status))],
  noLogo: noLogo.length,
})

const { data: dungeons } = await sb
  .from('dungeon_venues')
  .select('slug,status,c2k_source_id')
  .not('c2k_source_id', 'is', null)
console.log('\n=== dungeons c2k ===')
console.log({
  total: dungeons?.length ?? 0,
  byStatus: Object.fromEntries(
    [...new Set((dungeons || []).map((d) => d.status))].map((s) => [
      s,
      (dungeons || []).filter((d) => d.status === s).length,
    ])
  ),
})

// vendors table column names vary — probe
for (const cols of [
  'slug,status,c2k_source_id',
  'slug,status,c2k_source_id,name',
  'slug,c2k_source_id',
]) {
  const { data, error } = await sb.from('vendors').select(cols).not('c2k_source_id', 'is', null).limit(5)
  if (!error) {
    const { data: all } = await sb.from('vendors').select(cols).not('c2k_source_id', 'is', null)
    console.log('\n=== vendors c2k ===', cols)
    console.log({ total: all?.length ?? 0, sample: (all || []).slice(0, 3) })
    if (all?.[0] && 'status' in all[0]) {
      console.log({
        byStatus: Object.fromEntries(
          [...new Set(all.map((v) => v.status))].map((s) => [s, all.filter((v) => v.status === s).length])
        ),
      })
    }
    break
  }
}

const shredSignals = [
  'judges:',
  '](http',
  '**',
  '### ',
  '[Register',
]
const body = `${spe.data?.long_description || ''}\n${spe.data?.short_description || ''}`
console.log('\n=== SPE shred signals in DB body ===')
for (const s of shredSignals) {
  console.log(s, body.includes(s))
}
console.log('body preview:', body.slice(0, 400))
