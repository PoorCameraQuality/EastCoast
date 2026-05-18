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
 *
 * Phase 3: asserts public GET …/venue-map returns { maps: array }.
 * Phase 4: asserts POST …/staff-shifts/…/claim returns 401 without session (open-shift claim is session-gated).
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
      } else {
        const s0 = json.slots[0]
        if (!Array.isArray(s0?.tagNames)) {
          fail('schedule: each slot should include tagNames[] (apply DB migrations 009–010 and redeploy)')
        }
        if (!Array.isArray(s0?.presenters)) {
          fail('schedule: each slot should include presenters[] (apply DB migrations 011+ and redeploy)')
        }
      }
      console.log('OK GET schedule:', json.meta.eventTitle, 'slots=', json.slots.length)
    }
  }

  // --- Public venue map (Phase 3; empty maps[] when no rows / migrations) ---
  {
    const url = `${base}/api/dancecard/${enc}/venue-map`
    const res = await fetch(url)
    const { json, text } = await readJson(res)
    if (!res.ok) {
      fail(`GET venue-map ${res.status} ${text.slice(0, 200)}`)
    } else if (!json || !Array.isArray(json.maps)) {
      fail('venue-map: expected { maps: array }')
    } else {
      console.log('OK GET venue-map maps=', json.maps.length)
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

  // --- Subscribe ICS feed (no / bad token) ---
  {
    const res = await fetch(`${base}/api/dancecard/${enc}/feeds/ics`)
    if (res.status !== 401) fail(`GET feeds/ics without token expected 401 got ${res.status}`)
    else console.log('OK GET feeds/ics (no token) → 401')
  }
  {
    const res = await fetch(`${base}/api/dancecard/${enc}/feeds/ics?token=__smoke_bad_feed_token__`)
    const { json } = await readJson(res)
    if (res.status !== 404) fail(`GET feeds/ics bad token expected 404 got ${res.status}`)
    else if (!json?.error) fail('feeds 404: expected JSON { error }')
    else console.log('OK GET feeds/ics (invalid token) → 404')
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
    ['POST', `/api/dancecard/${enc}/staff-shifts/00000000-0000-4000-8000-000000000099/claim`, '{}'],
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

  // --- Organizer routes → 401 without session (skipped when local organizer dev bypass is on) ---
  const probe = await fetch(`${base}/api/organizer/dancecard/${enc}/event`, { method: 'GET', headers: { Accept: 'application/json' } })
  if (probe.status === 200) {
    console.warn(
      'WARN: organizer GET /event returned 200 without cookies — likely DANCECARD_ORGANIZER_DEV_BYPASS=1; skipping organizer 401 checks',
    )
  } else if (probe.status === 401) {
    const fakeBatch = '00000000-0000-4000-8000-000000000001'
    for (const [method, path, body] of [
      ['GET', `/api/organizer/dancecard/${enc}/event`, null],
      ['GET', `/api/organizer/dancecard/${enc}/locations`, null],
      ['GET', `/api/organizer/dancecard/${enc}/imports`, null],
      ['GET', `/api/organizer/dancecard/${enc}/imports/${fakeBatch}`, null],
      ['GET', `/api/organizer/dancecard/${enc}/readiness`, null],
      ['GET', `/api/organizer/dancecard/${enc}/tracks`, null],
      ['GET', `/api/organizer/dancecard/${enc}/tags`, null],
      ['GET', `/api/organizer/dancecard/${enc}/calendar-feeds`, null],
      ['GET', `/api/organizer/dancecard/${enc}/message-templates`, null],
      ['GET', `/api/organizer/dancecard/${enc}/message-campaigns`, null],
      ['GET', `/api/organizer/dancecard/${enc}/exports/sessions`, null],
      ['PATCH', `/api/organizer/dancecard/${enc}/program-slots/bulk`, '{"op":"publish","ids":[]}'],
      ['GET', `/api/organizer/dancecard/${enc}/staff-shifts`, null],
      ['POST', `/api/organizer/dancecard/${enc}/imports`, '{}'],
      ['PATCH', `/api/organizer/dancecard/${enc}/event`, '{}'],
    ]) {
      const res = await fetch(`${base}${path}`, {
        method,
        headers: body ? jsonHeaders : { Accept: 'application/json' },
        body: body ?? undefined,
      })
      if (res.status !== 401) {
        fail(`${method} organizer ${path} expected 401 without session, got ${res.status}`)
      } else {
        console.log(`OK ${method}`, path, '(organizer) → 401')
      }
    }
  } else {
    fail(`organizer probe GET /event expected 200 or 401, got ${probe.status}`)
  }

  // --- Phase 3: public events + product shell ---
  {
    const url = `${base}/api/dancecard/public-events`
    const res = await fetch(url)
    const { json, text } = await readJson(res)
    if (!res.ok) {
      fail(`GET public-events ${res.status} ${text.slice(0, 200)}`)
    } else if (!json?.events || !Array.isArray(json.events)) {
      fail('public-events: expected { events: array }')
    } else {
      console.log('OK GET public-events →', json.events.length, 'event(s)')
    }
  }

  {
    const res = await fetch(`${base}/dancecard`, { redirect: 'manual' })
    const html = await res.text()
    if (res.status !== 200) {
      fail(`GET /dancecard expected 200, got ${res.status}`)
    } else if (!html.includes('Dancecard') || !html.toLowerCase().includes('beta')) {
      fail('GET /dancecard: expected product landing copy (Dancecard + beta)')
    } else {
      console.log('OK GET /dancecard product landing → 200')
    }
  }

  {
    const res = await fetch(`${base}/products/dancecard`, { redirect: 'manual' })
    const loc = res.headers.get('location') || ''
    if (res.status !== 307 && res.status !== 308) {
      fail(`GET /products/dancecard expected redirect, got ${res.status}`)
    } else if (!loc.includes('/dancecard')) {
      fail(`GET /products/dancecard redirect location unexpected: ${loc}`)
    } else {
      console.log('OK GET /products/dancecard →', res.status, loc)
    }
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
        const html = await res.text()
        if (!ct.includes('text/html')) fail(`/dancecard/${slug}: expected html, got ${ct}`)
        else if (html.includes('aria-label="Footer"') || html.includes('Join Discord')) {
          fail(`/dancecard/${slug}: ECKE footer should be suppressed on attendee shell`)
        } else console.log('OK GET /dancecard page → 200 text/html (no ECKE footer)')
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
