/**
 * Authenticated Dancecard smoke checks.
 *
 * Creates two disposable accounts, exercises signed-in save/share/compare/preview/reserve/claim/logout
 * flows, and cleans up via Supabase service role when local env credentials are present.
 *
 * Usage:
 *   node scripts/dancecard-auth-smoke.mjs https://www.eastcoastkinkevents.com
 *
 * Env:
 *   DANCECARD_SMOKE_URL   Origin when no argv origin is provided
 *   DANCECARD_SMOKE_SLUG  Event slug, default paf26
 *   DANCECARD_REGISTRATION_CODE  Required only if the target event has a registration gate
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

config({ path: '.env.local' })
config()

const base = (
  process.argv[2] ||
  process.env.DANCECARD_SMOKE_URL ||
  'http://127.0.0.1:3000'
).replace(/\/$/, '')
const slug = (process.env.DANCECARD_SMOKE_SLUG || 'paf26').toLowerCase()
const enc = encodeURIComponent(slug)
const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
const prefix = `smoke_${runId}`
const password = `Smoke-${runId}-Pass!`
const registrationAccessCode = process.env.DANCECARD_REGISTRATION_CODE?.trim()

const jsonHeaders = { Accept: 'application/json', 'Content-Type': 'application/json' }

class CookieJar {
  constructor(label) {
    this.label = label
    this.cookies = new Map()
  }

  header() {
    return Array.from(this.cookies.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
  }

  updateFrom(res) {
    const raw = typeof res.headers.getSetCookie === 'function'
      ? res.headers.getSetCookie()
      : [res.headers.get('set-cookie')].filter(Boolean)
    for (const line of raw) {
      const first = String(line).split(';', 1)[0]
      const eq = first.indexOf('=')
      if (eq <= 0) continue
      const name = first.slice(0, eq).trim()
      const value = first.slice(eq + 1).trim()
      if (value) this.cookies.set(name, value)
      else this.cookies.delete(name)
    }
  }
}

const hostJar = new CookieJar('host')
const viewerJar = new CookieJar('viewer')
const createdAccountIds = []
const createdReservationIds = []
const failures = []
let shareToken = null

function iso(d) {
  return d.toISOString()
}

function addMinutes(d, minutes) {
  return new Date(d.getTime() + minutes * 60_000)
}

function windowBefore(end, fromEndMinutes, durationMinutes = 30) {
  const start = addMinutes(end, -fromEndMinutes)
  return { startsAt: iso(start), endsAt: iso(addMinutes(start, durationMinutes)) }
}

function softFail(message) {
  failures.push(message)
  console.error('FAIL:', message)
}

async function readJson(res) {
  const text = await res.text()
  try {
    return { json: JSON.parse(text), text }
  } catch {
    return { json: null, text }
  }
}

async function request(path, { method = 'GET', jar, body, expected = 200, label } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) Object.assign(headers, jsonHeaders)
  const cookie = jar?.header()
  if (cookie) headers.Cookie = cookie

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  jar?.updateFrom(res)
  const out = await readJson(res)
  if (res.status !== expected) {
    throw new Error(
      `${label || `${method} ${path}`} expected ${expected}, got ${res.status}: ${out.text.slice(0, 400)}`
    )
  }
  return out.json
}

async function registerUser(kind, jar) {
  const body = {
    username: `${prefix}_${kind}`,
    password,
    displayName: `Smoke ${kind} ${runId}`,
  }
  if (registrationAccessCode) body.registrationAccessCode = registrationAccessCode
  const json = await request(`/api/dancecard/${enc}/register`, {
    method: 'POST',
    jar,
    body,
    expected: 200,
    label: `register ${kind}`,
  })
  if (!json?.account?.id) throw new Error(`register ${kind}: missing account id`)
  createdAccountIds.push(json.account.id)
  console.log(`OK register ${kind}:`, json.account.username)
  return json.account
}

async function cleanup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.warn('WARN cleanup skipped: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing')
    return
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const usernames = [`${prefix}_host`, `${prefix}_viewer`]

  const { data: accounts, error: accountErr } = await supabase
    .from('dancecard_accounts')
    .select('id')
    .in('username', usernames)
  if (accountErr) {
    console.warn('WARN cleanup account lookup failed:', accountErr.message)
    return
  }
  const ids = Array.from(new Set([...(accounts ?? []).map((a) => a.id), ...createdAccountIds]))
  if (!ids.length) return

  await supabase.from('dancecard_reservations').delete().in('id', createdReservationIds)
  await supabase.from('dancecard_reservations').delete().in('host_account_id', ids)
  await supabase.from('dancecard_reservations').delete().in('guest_account_id', ids)
  await supabase.from('dancecard_reservations').delete().ilike('guest_name', `Smoke Public ${runId}%`)
  await supabase.from('dancecard_share_links').delete().in('account_id', ids)
  await supabase.from('dancecard_selections').delete().in('account_id', ids)
  await supabase.from('dancecard_sessions').delete().in('account_id', ids)
  await supabase.from('dancecard_prefs').delete().in('account_id', ids)
  await supabase.from('dancecard_accounts').delete().in('id', ids)
  console.log('OK cleanup removed smoke rows')
}

async function main() {
  console.log('Authenticated dancecard smoke base=', base, 'slug=', slug, 'run=', runId)

  try {
    const schedule = await request(`/api/dancecard/${enc}/schedule`, { label: 'schedule' })
    const eventStart = new Date(schedule?.meta?.windowStartsAt)
    const eventEnd = new Date(schedule?.meta?.windowEndsAt)
    if (!Number.isFinite(eventStart.getTime()) || !Number.isFinite(eventEnd.getTime()) || eventEnd <= eventStart) {
      throw new Error('schedule: invalid event window')
    }
    const firstSlot = Array.isArray(schedule.slots) ? schedule.slots[0] : null
    if (!firstSlot?.id || !firstSlot.startsAt || !firstSlot.endsAt) {
      throw new Error('schedule: expected at least one program slot for authenticated smoke')
    }
    console.log('OK schedule:', schedule.meta.eventTitle, 'slots=', schedule.slots.length)

    const reserveWindow = windowBefore(eventEnd, 240, 30)
    const claimWindow = windowBefore(eventEnd, 180, 30)
    const manualBusyStart = addMinutes(eventStart, 30)

    const host = await registerUser('host', hostJar)
    const viewer = await registerUser('viewer', viewerJar)

    await request(`/api/dancecard/${enc}/me`, { jar: hostJar, label: 'host me' })
    await request(`/api/dancecard/${enc}/me`, { jar: viewerJar, label: 'viewer me' })
    console.log('OK me for host/viewer')

    await request(`/api/dancecard/${enc}/dancecard`, {
      method: 'PUT',
      jar: hostJar,
      body: {
        bufferMinutes: 0,
        availabilityStartsAt: iso(eventStart),
        availabilityEndsAt: iso(eventEnd),
        selections: [
          {
            kind: 'program',
            slotId: firstSlot.id,
            startsAt: firstSlot.startsAt,
            endsAt: firstSlot.endsAt,
            note: 'Smoke selected program',
          },
          {
            kind: 'manual',
            startsAt: iso(manualBusyStart),
            endsAt: iso(addMinutes(manualBusyStart, 30)),
            note: 'Smoke manual unavailable',
          },
        ],
      },
      label: 'host save dancecard',
    })
    await request(`/api/dancecard/${enc}/dancecard`, {
      method: 'PUT',
      jar: hostJar,
      body: {
        bufferMinutes: 0,
        availabilityStartsAt: iso(addMinutes(eventStart, -4 * 60)),
        availabilityEndsAt: iso(addMinutes(eventEnd, 4 * 60)),
        selections: [
          {
            kind: 'program',
            slotId: firstSlot.id,
            startsAt: firstSlot.startsAt,
            endsAt: firstSlot.endsAt,
            note: 'Smoke selected program',
          },
          {
            kind: 'manual',
            startsAt: iso(manualBusyStart),
            endsAt: iso(addMinutes(manualBusyStart, 30)),
            note: 'Smoke manual unavailable',
          },
        ],
      },
      label: 'host save dancecard with boundary-expanded availability range',
    })
    await request(`/api/dancecard/${enc}/dancecard`, {
      method: 'PUT',
      jar: viewerJar,
      body: {
        bufferMinutes: 0,
        availabilityStartsAt: iso(eventStart),
        availabilityEndsAt: iso(eventEnd),
        selections: [],
      },
      label: 'viewer save dancecard',
    })
    const hostMeAfterSave = await request(`/api/dancecard/${enc}/me`, { jar: hostJar, label: 'host me after save' })
    if (hostMeAfterSave.selections?.length !== 2) throw new Error('host save: expected 2 selections')
    console.log('OK save dancecards + reload selections')

    const patch = await request(`/api/dancecard/${enc}/me`, {
      method: 'PATCH',
      jar: hostJar,
      body: { allowCompareByUsername: true, displayName: `Smoke Host ${runId} Renamed` },
      label: 'host profile patch',
    })
    if (patch?.prefs?.allowCompareByUsername !== true) {
      throw new Error('profile patch: allowCompareByUsername did not update')
    }
    console.log('OK profile patch + compare opt-in')

    const share = await request(`/api/dancecard/${enc}/share`, {
      method: 'POST',
      jar: hostJar,
      label: 'create share link',
    })
    shareToken = share?.token
    if (!shareToken || !share?.url?.includes(`/dancecard/${slug}/s/${shareToken}`)) {
      throw new Error(`share: invalid response ${JSON.stringify(share)}`)
    }
    if (base.includes('eastcoastkinkevents.com') && share.url.includes('vercel.app')) {
      softFail(`share: production URL used Vercel preview host: ${share.url}`)
    }
    console.log('OK create share link:', share.url)

    const sharePayload = await request(`/api/dancecard/${enc}/share/${encodeURIComponent(shareToken)}`, {
      jar: viewerJar,
      label: 'load share payload',
    })
    if (!sharePayload?.host?.displayName || !Array.isArray(sharePayload?.mutualFreeGaps)) {
      throw new Error('share payload: expected host and mutualFreeGaps')
    }
    console.log('OK load share payload gaps=', sharePayload.mutualFreeGaps.length)

    const compare = await request(`/api/dancecard/${enc}/compare/by-username`, {
      method: 'POST',
      jar: viewerJar,
      body: { username: host.username },
      label: 'compare by username',
    })
    if (!compare?.host?.displayName || !Array.isArray(compare?.mutualFreeGaps)) {
      throw new Error('compare by username: expected host and mutualFreeGaps')
    }
    console.log('OK compare by username gaps=', compare.mutualFreeGaps.length)

    const selfCompare = await request(`/api/dancecard/${enc}/compare/by-username`, {
      method: 'POST',
      jar: hostJar,
      body: { username: host.username },
      expected: 400,
      label: 'self compare by username',
    })
    if (!String(selfCompare?.error ?? '').includes('own username')) {
      throw new Error(`self compare: expected explicit self-compare error, got ${JSON.stringify(selfCompare)}`)
    }
    console.log('OK self compare by username → 400 explicit message')

    const preview = await request(`/api/dancecard/${enc}/preview`, {
      method: 'POST',
      jar: viewerJar,
      body: { hostUsername: host.username, ...reserveWindow, note: 'Smoke preview' },
      label: 'preview reservation',
    })
    if (preview?.ok !== true) throw new Error(`preview: expected ok true, got ${JSON.stringify(preview)}`)
    console.log('OK preview reservation')

    const reservation = await request(`/api/dancecard/${enc}/reserve`, {
      method: 'POST',
      jar: viewerJar,
      body: { hostUsername: host.username, ...reserveWindow, note: 'Smoke authenticated reservation' },
      label: 'reserve by username',
    })
    if (!reservation?.reservation?.id) throw new Error('reserve: missing reservation id')
    createdReservationIds.push(reservation.reservation.id)
    console.log('OK reserve by username:', reservation.reservation.id)

    const viewerReservations = await request(`/api/dancecard/${enc}/reservations`, {
      jar: viewerJar,
      label: 'viewer reservations',
    })
    if (!viewerReservations?.reservations?.some((r) => r.id === reservation.reservation.id)) {
      throw new Error('reservations: new reservation not returned for viewer')
    }
    console.log('OK reservations list')

    await request(`/api/dancecard/${enc}/reservations`, {
      method: 'PATCH',
      jar: viewerJar,
      body: { reservationId: reservation.reservation.id },
      label: 'cancel reservation',
    })
    console.log('OK cancel reservation')

    const claim = await request(`/api/dancecard/${enc}/claim`, {
      method: 'POST',
      body: {
        shareToken,
        startsAt: claimWindow.startsAt,
        durationMinutes: 30,
        guestName: `Smoke Public ${runId}`,
        description: 'Smoke public claim',
      },
      label: 'public claim',
    })
    if (!claim?.reservation?.id) throw new Error('claim: missing reservation id')
    createdReservationIds.push(claim.reservation.id)
    console.log('OK public claim:', claim.reservation.id)

    const icsRes = await fetch(`${base}/api/dancecard/${enc}/ics`, {
      headers: { Accept: 'text/calendar', Cookie: hostJar.header() },
    })
    const icsText = await icsRes.text()
    if (icsRes.status !== 200 || !icsText.includes('BEGIN:VCALENDAR')) {
      throw new Error(`ics expected calendar, got ${icsRes.status}: ${icsText.slice(0, 120)}`)
    }
    console.log('OK ICS export')

    const staffWrong = await request(`/api/dancecard/${enc}/staff/unlock`, {
      method: 'POST',
      jar: viewerJar,
      body: { code: '__smoke_wrong_staff_code__' },
      expected: 401,
      label: 'staff unlock wrong code',
    })
    if (!staffWrong?.error) throw new Error('staff unlock wrong code: expected error')
    console.log('OK staff unlock wrong code → 401')

    await request(`/api/dancecard/${enc}/logout`, {
      method: 'POST',
      jar: hostJar,
      body: {},
      label: 'host logout',
    })
    await request(`/api/dancecard/${enc}/me`, {
      jar: hostJar,
      expected: 401,
      label: 'host me after logout',
    })
    console.log('OK logout clears session')

    await request(`/api/dancecard/${enc}/login`, {
      method: 'POST',
      jar: hostJar,
      body: { username: host.username, password },
      label: 'host login after logout',
    })
    await request(`/api/dancecard/${enc}/me`, { jar: hostJar, label: 'host me after relogin' })
    console.log('OK login after logout')

    if (failures.length) {
      throw new Error(`${failures.length} authenticated smoke check(s) failed`)
    }
    console.log('\nAuthenticated dancecard smoke checks passed.')
  } finally {
    await cleanup()
  }
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
