/**
 * Fix Dark Odyssey listing presentation after org merge.
 * Order: C2K categories → re-publish (organizer name) → ECKE presentation patches last.
 *
 * Usage: SSH_PASS=... node scripts/_fix-dark-odyssey-listings.mjs
 */
import { Client } from 'ssh2'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { pathToFileURL } from 'url'

const password = process.env.SSH_PASS || process.argv[2]
if (!password) {
  console.error('Set SSH_PASS')
  process.exit(1)
}

const env = Object.fromEntries(
  fs
    .readFileSync('C:/Users/shkin/Desktop/EastCoast/EastCoast-master/.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')]
    })
)

const mod = await import(
  pathToFileURL('C:/Users/shkin/Desktop/EastCoast/EastCoast-master/src/data/events.js').href
)
const staticBySlug = Object.fromEntries((mod.events || []).map((e) => [e.slug, e]))

const doSlugs = [
  'dark-odyssey-summer-camp',
  'dark-odyssey-winter-fire',
  'dark-odyssey-fusion',
  'dark-odyssey-surrender-2026',
  'dark-odyssey-camp-thornwood-2026',
]

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const conn = await new Promise((resolve, reject) => {
  const c = new Client()
  c.on('ready', () => resolve(c)).on('error', reject)
  c.connect({ host: '2.25.196.84', port: 22, username: 'root', password, readyTimeout: 180000 })
})

function exec(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      stream.on('data', (d) => (out += d))
      stream.stderr.on('data', (d) => (out += d))
      stream.on('close', (code) => resolve({ code, out }))
    })
  })
}

function sftpWrite(local, remote) {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err)
      sftp.fastPut(local, remote, (e) => (e ? reject(e) : resolve()))
    })
  })
}

const compose =
  'docker compose -f docker-compose.prod.yml -f docker-compose.prod.vps.yml --env-file .env.production'
const slugSql = doSlugs.map((s) => `'${s}'`).join(',')

console.log('=== C2K: force Convention category on DO anchors ===')
const { out: c2kOut } = await exec(
  `cd /opt/c2k && ${compose} exec -T postgres psql -U c2k -d c2k -c "UPDATE events SET category = 'Convention' WHERE id IN (SELECT anchor_event_id FROM conventions WHERE slug IN (${slugSql}) AND anchor_event_id IS NOT NULL); SELECT c.slug, o.display_name, e.category FROM conventions c JOIN organizations o ON o.id=c.organization_id LEFT JOIN events e ON e.id=c.anchor_event_id WHERE c.slug IN (${slugSql}) ORDER BY c.slug;"`
)
console.log(c2kOut)

const py = `#!/usr/bin/env python3
import json, os, subprocess, urllib.request, http.cookiejar
from pathlib import Path
env={}
for line in Path('/opt/c2k/.env.production').read_text(encoding='utf-8', errors='replace').splitlines():
    if not line or line.startswith('#') or '=' not in line: continue
    k,v=line.split('=',1); env[k]=v.strip().strip('"').strip("'")
email=env.get('BRAX_ADMIN_EMAIL') or 'brax@kink.social'
password=env['BRAX_ADMIN_PASSWORD']
base='https://kink.social'
compose=os.environ['C2K_COMPOSE']
cj=http.cookiejar.CookieJar()
opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

def req(method,url,data=None):
    body=None if data is None else json.dumps(data).encode()
    r=urllib.request.Request(url,data=body,method=method,headers={'Content-Type':'application/json','Origin':base,'Accept':'application/json'})
    try:
        with opener.open(r,timeout=180) as resp:
            raw=resp.read().decode('utf-8','replace')
            return resp.status, json.loads(raw) if raw else {}
    except Exception as e:
        raw=''
        if hasattr(e,'read'):
            try: raw=e.read().decode('utf-8','replace')
            except Exception: pass
        try: parsed=json.loads(raw) if raw else {'error':str(e)}
        except Exception: parsed={'error':str(e),'raw':raw[:400]}
        return getattr(e,'code',0), parsed

st,me=req('POST', f'{base}/api/auth/session', {'username':email,'password':password})
print('login', st, me.get('authenticated'))
if not me.get('authenticated'):
    raise SystemExit(1)
slugs=${JSON.stringify(doSlugs)}
inlist=','.join("'"+s+"'" for s in slugs)
q="SELECT id::text, slug FROM conventions WHERE slug IN (%s) ORDER BY slug" % inlist
cmd='cd /opt/c2k && '+compose+" exec -T postgres psql -U c2k -d c2k -At -F ',' -c "+json.dumps(q)
out=subprocess.check_output(['bash','-lc',cmd], text=True)
for line in out.splitlines():
    line=line.strip()
    if not line or ',' not in line: continue
    id_,slug=line.split(',',1)
    st2,body=req('POST', f'{base}/api/v1/ecke-publish/sync', {'sourceKind':'convention_event_anchor','sourceId':id_})
    ok = st2==200 and (body.get('ok') is True or (body.get('result') or {}).get('ok') is True or body.get('status') in ('published','stale'))
    print('SYNC', slug, 'http', st2, 'ok', ok, body.get('error') or (body.get('result') or {}).get('error') or '')
`

const localPy = 'C:/Users/shkin/Desktop/coast-to-coast-kink/tmp-do-repub.py'
fs.writeFileSync(localPy, py.replace(/\r\n/g, '\n'), 'utf8')
await sftpWrite(localPy, '/tmp/do-repub.py')
console.log('\n=== Re-publish (organizer → Dark Odyssey) ===')
const pub = await exec(`export C2K_COMPOSE=${JSON.stringify(compose)} && python3 /tmp/do-repub.py`)
console.log(pub.out)

console.log('\n=== ECKE presentation patches (after sync) ===')
for (const slug of doSlugs) {
  const s = staticBySlug[slug]
  const patch = {
    organizer_name: 'Dark Odyssey',
    category: 'Convention',
  }
  if (s?.excerpt) patch.short_description = String(s.excerpt).slice(0, 500)
  if (s?.venue) patch.venue = s.venue
  else if (slug === 'dark-odyssey-summer-camp') {
    patch.venue = 'Northern Maryland retreat (confirm on darkodyssey.com/summerfest)'
  } else if (slug === 'dark-odyssey-winter-fire') {
    patch.venue = 'Baltimore, MD area (confirm on darkodyssey.com/winterfire)'
  }
  if (s?.location?.city) patch.city = s.location.city
  if (s?.location?.state) patch.state = String(s.location.state).slice(0, 2).toUpperCase()
  if (s?.website) patch.website = s.website

  const { error } = await sb.from('events').update(patch).eq('slug', slug)
  console.log(slug, error ? error.message : 'ok')
}

const { data: verify2 } = await sb
  .from('events')
  .select('slug,category,organizer_name,city,state,venue,short_description,website')
  .in('slug', doSlugs)
  .order('slug')
console.log('\n=== verify ===')
for (const r of verify2 || []) {
  console.log({
    slug: r.slug,
    category: r.category,
    organizer: r.organizer_name,
    where: `${r.city}, ${r.state}`,
    venue: r.venue,
    short: (r.short_description || '').slice(0, 100),
    website: r.website,
  })
}

conn.end()
