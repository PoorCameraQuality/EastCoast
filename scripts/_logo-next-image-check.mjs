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
  .or('slug.ilike.%boundless%,slug.ilike.%smirc%,slug.ilike.%maul%,slug.ilike.%southeastern%')

for (const r of data || []) console.log(r.slug, '=>', r.logo)

const urls = (data || []).map((r) => r.logo).filter(Boolean)
for (const u of urls) {
  const opt = `https://www.eastcoastkinkevents.com/_next/image?url=${encodeURIComponent(u)}&w=640&q=75`
  const r = await fetch(opt)
  console.log('opt', r.status, u.slice(0, 80))
}
