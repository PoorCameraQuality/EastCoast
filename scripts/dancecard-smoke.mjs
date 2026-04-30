/**
 * Dancecard API + page smoke checks (no auth cookies).
 *
 * Usage:
 *   npm run dancecard:smoke
 *     → DANCECARD_SMOKE_URL or http://127.0.0.1:3000 (needs `npm run dev` + DB)
 *   npm run dancecard:smoke:prod
 *     → https://www.eastcoastkinkevents.com
 *   node scripts/dancecard-smoke.mjs https://your-preview.vercel.app
 *
 * Env: DANCECARD_SMOKE_URL, DANCECARD_SMOKE_SLUG (default paf26)
 */
const base = (
  process.argv[2] ||
  process.env.DANCECARD_SMOKE_URL ||
  'http://127.0.0.1:3000'
).replace(/\/$/, '')
const slug = (process.env.DANCECARD_SMOKE_SLUG || 'paf26').toLowerCase()
const enc = encodeURIComponent(slug)

const jsonHeaders = { Accept: 'application/json', 'Content-Type': 'application/json' }

let failures = 0

function fail(msg) {
  console.error('FAIL:', msg)
  failures += 1
}

async function readJson(res) {
  const text = await res.text()
  try {
    return { json: JSON.parse(text), text }
  } catch {
    return { json: null, text }
  }
}

async function main() {
  console.log('Dancecard smoke base=', base, 'slug=', slug)

  // --- Published schedule (core) ---
  {
    const url = `${base}/api/dancecard/${enc}/schedule`
    const res = await fetch(url)
    const { json, text } = await readJson(res)
    if (!res.ok) {
      fail(`GET schedule ${res.status} ${text.slice(0, 200)}`)
    } else if (!json?.slots || !Array.isArray(json.slots)) {
      fail('schedule: expected { slots: array }')
    } else if (!json.meta?.eventTitle) {
      fail('schedule: expected meta.eventTitle')
    } else {
      if (json.slots.length === 0) {
        console.warn(
          'WARN: no program slots. Import: npm run dancecard:import -- --slug paf26 --json ./data/paf26-program-slots.json',
        )
      }
      console.log('OK GET schedule:', json.meta.eventTitle, 'slots=', json.slots.length)
    }
  }

  // --- Registration gate metadata ---
  {
    const res = await fetch(`${base}/api/dancecard/${enc}/gate`)
    const { json, text } = await readJson(res)
    if (!res.ok) fail(`GET gate ${res.status} ${text.slice(0, 120)}`)
    else if (typeof json?.requiresRegistrationCode !== 'boolean') {
      fail('gate: expected { requiresRegistrationCode: boolean }')
    } else {
      console.log('OK GET gate requiresRegistrationCode=', json.requiresRegistrationCode)
    }
  }

  // --- Share token lookup (invalid token → 404) ---
  {
    const res = await fetch(`${base}/api/dancecard/${enc}/share/__smoke_nonexistent_token__`)
    const { json } = await readJson(res)
    if (res.status !== 404) fail(`GET share/bad-token expected 404 got ${res.status}`)
    else if (!json?.error) fail('share 404: expected JSON { error }')
    else console.log('OK GET share (invalid token) → 404')
  }

  // --- Session-gated routes → 401 without cookie ---
  for (const [method, path, body] of [
    ['GET', `/api/dancecard/${enc}/me`, null],
    ['GET', `/api/dancecard/${enc}/reservations`, null],
    ['GET', `/api/dancecard/${enc}/staff`, null],
    ['GET', `/api/dancecard/${enc}/ics`, null],
    ['POST', `/api/dancecard/${enc}/preview`, '{}'],
    ['POST', `/api/dancecard/${enc}/compare/by-username`, '{"username":"nobody"}'],
    ['POST', `/api/dancecard/${enc}/share`, null],
  ]) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: body ? jsonHeaders : { Accept: 'application/json' },
      body: body ?? undefined,
    })
    if (res.status !== 401) {
      fail(`${method} ${path} expected 401 without session, got ${res.status}`)
    } else {
      console.log(`OK ${method}`, path, '→ 401')
    }
  }

  // --- verify-entry-code: wrong code path or skipped when no gate ---
  {
    const res = await fetch(`${base}/api/dancecard/${enc}/verify-entry-code`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ code: '__smoke_wrong_code__' }),
    })
    const { json } = await readJson(res)
    if (res.status === 200 && json?.skipped === true && json.ok === true) {
      console.log('OK POST verify-entry-code → skipped (no registration gate)')
    } else if (res.status === 401 && json?.error) {
      console.log('OK POST verify-entry-code → 401 (gate active)')
    } else {
      fail(`POST verify-entry-code unexpected ${res.status} ${JSON.stringify(json)}`)
    }
  }

  // --- Unknown event slug ---
  {
    const res = await fetch(`${base}/api/dancecard/__smoke_bad_slug__/schedule`)
    if (res.status !== 404) fail(`bad slug schedule expected 404 got ${res.status}`)
    else console.log('OK GET schedule unknown slug → 404')
  }

  // --- Dancecard HTML page (App Router) ---
  {
    const res = await fetch(`${base}/dancecard/${enc}`, { redirect: 'manual' })
    if (res.status !== 200 && res.status !== 307 && res.status !== 308) {
      fail(`GET /dancecard/${slug} unexpected status ${res.status}`)
    } else {
      const loc = res.headers.get('location')
      if (res.status === 200) {
        const ct = res.headers.get('content-type') || ''
        if (!ct.includes('text/html')) fail(`/dancecard/${slug}: expected html, got ${ct}`)
        else console.log('OK GET /dancecard page → 200 text/html')
      } else {
        console.log('OK GET /dancecard page →', res.status, loc ? `redirect ${loc}` : '')
      }
    }
  }

  if (failures) {
    console.error(`\n${failures} check(s) failed.`)
    process.exit(1)
  }
  console.log('\nAll dancecard smoke checks passed.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
