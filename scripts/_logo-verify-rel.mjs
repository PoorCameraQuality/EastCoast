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
const { data } = await sb
  .from('events')
  .select('slug,logo')
  .eq('slug', 'summer-michigan-rope-conference-smirc')
  .maybeSingle()
console.log(data)

const { data: all } = await sb.from('events').select('logo').not('c2k_source_id', 'is', null)
let abs = 0
let rel = 0
let empty = 0
for (const r of all || []) {
  const l = (r.logo || '').trim()
  if (!l) empty++
  else if (l.startsWith('http')) abs++
  else if (l.startsWith('/')) rel++
}
console.log({ abs, rel, empty, total: all.length })
