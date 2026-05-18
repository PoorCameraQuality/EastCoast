/** Crawl logged-in esys sc25 pages for structure (read-only). */
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const base = 'https://www.event-systems.com/esys/sc25/'
const user = process.argv[2] ?? 'Brax'
const pass = process.argv[3] ?? 'Airship1'
const outDir = join(process.cwd(), 'docs', 'esys-crawl-sc25')

mkdirSync(outDir, { recursive: true })

const jar = { cookies: new Map() }
function parseSetCookie(res) {
  const lines = res.headers.getSetCookie?.() ?? []
  if (!lines.length) {
    const single = res.headers.get('set-cookie')
    if (single) lines.push(single)
  }
  for (const line of lines) {
    const [pair] = line.split(';')
    const eq = pair.indexOf('=')
    if (eq > 0) jar.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1))
  }
}
const cookieHeader = () =>
  [...jar.cookies.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .join('; ')

async function fetchPage(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Cookie: cookieHeader(), ...(opts.headers ?? {}) },
    redirect: 'follow',
  })
  parseSetCookie(res)
  return { res, text: await res.text(), url: res.url }
}

// Login
await fetchPage(base)
const loginBody = new URLSearchParams({
  submittal: 'login',
  login: user,
  password: pass,
  Login: 'Login',
})
const { text: home } = await fetchPage(base, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: loginBody.toString(),
})

writeFileSync(join(outDir, '00-home.html'), home)

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractNav(html) {
  const nav = []
  for (const m of html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]*)</gi)) {
    const href = m[1].replace(/&amp;/g, '&')
    const label = m[2].replace(/\s+/g, ' ').trim()
    if (!label || href.startsWith('http') && !href.includes('event-systems')) continue
    if (href.includes('func=') || href.includes('logout') || href === '/esys/sc25/' || href.startsWith('?')) {
      nav.push({ href, label })
    }
  }
  return nav
}

const navLinks = extractNav(home)
const uniqueFuncs = new Map()
for (const n of navLinks) {
  const key = n.href.split('func=')[1]?.split('&')[0] ?? n.href
  if (!uniqueFuncs.has(key)) uniqueFuncs.set(key, n)
}

console.log('=== TOP NAV / FUNC LINKS ===')
for (const [k, v] of uniqueFuncs) {
  console.log(k.padEnd(20), v.label)
}

const funcsToVisit = [
  'news',
  'mail',
  'subes',
  'profiles',
  'info',
  'messages',
]

const extraUrls = [
  '?func=subes&tfunc=grid',
  '?func=subes&tfunc=browse',
  '?func=subes&tfunc=show',
  '?func=profiles&tfunc=browse&sfunc=Personal&qfunc=show',
  '?func=profiles&tfunc=browse&sfunc=Personal&qfunc=search',
]

const visited = new Set()
const report = []

for (const func of funcsToVisit) {
  const url = `${base}?func=${func}`
  if (visited.has(url)) continue
  visited.add(url)
  try {
    const { text, url: finalUrl } = await fetchPage(url)
    const fname = `func-${func}.html`
    writeFileSync(join(outDir, fname), text)
    const title = text.match(/<title>([^<]+)/i)?.[1] ?? ''
    const h1 = text.match(/<h1[^>]*>([^<]+)/i)?.[1] ?? ''
    const hasChore = /chore/i.test(text)
    const links = extractNav(text).slice(0, 15)
    report.push({ func, title, h1, hasChore, finalUrl, linkCount: links.length, sampleLinks: links })
    console.log('\n---', func, '---')
    console.log('title:', title)
    console.log('h1:', h1)
    console.log('chore mentions:', hasChore)
    console.log('sample links:', links.map((l) => `${l.label} → ${l.href}`).join(' | '))
  } catch (e) {
    console.log('ERR', func, e.message)
  }
}

for (const q of extraUrls) {
  const url = base + q
  if (visited.has(url)) continue
  visited.add(url)
  const { text } = await fetchPage(url)
  const safe = q.replace(/[^a-z0-9]+/gi, '-').slice(0, 60)
  writeFileSync(join(outDir, `extra-${safe}.html`), text)
  const title = text.match(/<title>([^<]+)/i)?.[1] ?? ''
  console.log('\nEXTRA', q, '→', title.replace(/&#39;/g, "'"))
}

writeFileSync(
  join(outDir, 'crawl-report.json'),
  JSON.stringify({ navLinks: [...uniqueFuncs.values()], report }, null, 2),
)
console.log('\nWrote', outDir)
