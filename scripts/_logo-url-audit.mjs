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

const slugs = [
  'summer-michigan-rope-conference-smirc',
  'goboundless',
  'maul',
  'dark-odyssey',
  'southeastern-power-exchange',
]

const { data: sample, error } = await sb.from('events').select('slug,logo,c2k_source_id').in('slug', slugs)
if (error) throw error
for (const r of sample || []) console.log(JSON.stringify(r))

const { data: all, error: e2 } = await sb
  .from('events')
  .select('slug,logo')
  .not('c2k_source_id', 'is', null)
if (e2) throw e2

let abs = 0
let rel = 0
let empty = 0
let other = 0
const absHosts = new Map()
for (const r of all || []) {
  const l = (r.logo || '').trim()
  if (!l) empty++
  else if (l.startsWith('http')) {
    abs++
    try {
      const h = new URL(l).hostname
      absHosts.set(h, (absHosts.get(h) || 0) + 1)
    } catch {
      absHosts.set('(bad)', (absHosts.get('(bad)') || 0) + 1)
    }
  } else if (l.startsWith('/')) rel++
  else other++
}
console.log({ total: all.length, abs, rel, empty, other, absHosts: Object.fromEntries(absHosts) })
