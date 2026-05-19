/**
 * Seed a fixed sandbox dancecard account for Compare / Reserve demos.
 * Also creates a stable share link on your host account and a demo reservation
 * from the partner through that link.
 *
 * Usage:
 *   node scripts/dancecard-seed-sandbox-compare-demo.mjs
 *   node scripts/dancecard-seed-sandbox-compare-demo.mjs brax
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: DEMO_HOST_USERNAME (defaults to first arg, else auto-detect Brax / newest account)
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config()

const SLUG = 'sandbox'
const USERNAME = 'sandboxfriend'
const PASSWORD = 'SandboxCompare1!'
const DISPLAY_NAME = 'Alex Demo'
/** Stable token so host share URL is predictable after re-seed. */
const DEMO_SHARE_TOKEN = 'sndboxhost01'
const DEMO_RESERVE_NOTE = 'Demo: reserved via host share link'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

function iso(d) {
  return new Date(d).toISOString()
}

function addMinutes(d, minutes) {
  return new Date(d.getTime() + minutes * 60_000)
}

async function defaultCategoryId(eventId) {
  const { data: cats, error } = await supabase
    .from('dancecard_registration_categories')
    .select('id, name, sort_order')
    .eq('event_id', eventId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  if (!cats?.length) return null
  const weekend = cats.find((c) => String(c.name).toLowerCase().includes('weekend'))
  return weekend?.id ?? cats[0]?.id
}

async function resolveHostAccount(eventId) {
  const wanted =
    process.env.DEMO_HOST_USERNAME?.trim() ||
    process.argv[2]?.trim() ||
    ''
  if (wanted) {
    const { data, error } = await supabase
      .from('dancecard_accounts')
      .select('id, username, display_name')
      .eq('event_id', eventId)
      .ilike('username', wanted)
      .maybeSingle()
    if (error) throw error
    if (!data?.id) {
      throw new Error(
        `Host username "${wanted}" not found on sandbox. Sign up at /dancecard/sandbox, then re-run with that username.`,
      )
    }
    return data
  }

  const { data: accounts, error } = await supabase
    .from('dancecard_accounts')
    .select('id, username, display_name, created_at')
    .eq('event_id', eventId)
    .neq('username', USERNAME)
    .order('created_at', { ascending: false })
  if (error) throw error
  const brax = accounts?.find(
    (a) => /brax/i.test(String(a.username)) || /brax/i.test(String(a.display_name)),
  )
  const host = brax ?? accounts?.[0]
  if (!host?.id) {
    throw new Error(
      'No host account on sandbox (besides sandboxfriend). Create yours at /dancecard/sandbox, then re-run: node scripts/dancecard-seed-sandbox-compare-demo.mjs YOUR_USERNAME',
    )
  }
  return host
}

async function ensureHostPrefs(accountId, eventStart, eventEnd) {
  const { error: prefErr } = await supabase.from('dancecard_prefs').upsert(
    {
      account_id: accountId,
      buffer_minutes: 0,
      allow_compare_by_username: true,
      compare_visibility: 'username',
      availability_starts_at: iso(eventStart),
      availability_ends_at: iso(eventEnd),
    },
    { onConflict: 'account_id' },
  )
  if (prefErr) throw prefErr
  await supabase.from('dancecard_selections').delete().eq('account_id', accountId)
}

async function ensureShareLink(hostAccountId) {
  await supabase.from('dancecard_share_links').delete().eq('account_id', hostAccountId)
  const { error } = await supabase.from('dancecard_share_links').insert({
    account_id: hostAccountId,
    token: DEMO_SHARE_TOKEN,
  })
  if (error) throw error
}

async function ensureDemoReservation(eventId, hostId, guestId, startsAt, endsAt) {
  await supabase
    .from('dancecard_reservations')
    .delete()
    .eq('event_id', eventId)
    .eq('host_account_id', hostId)
    .eq('guest_account_id', guestId)
    .eq('note', DEMO_RESERVE_NOTE)

  const { error } = await supabase.from('dancecard_reservations').insert({
    event_id: eventId,
    host_account_id: hostId,
    guest_account_id: guestId,
    guest_name: null,
    starts_at: iso(startsAt),
    ends_at: iso(endsAt),
    status: 'confirmed',
    note: DEMO_RESERVE_NOTE,
  })
  if (error) throw error
}

async function ensureRegistrant(eventId, accountId, sceneName) {
  const { data: linked } = await supabase
    .from('dancecard_registrants')
    .select('id')
    .eq('event_id', eventId)
    .eq('external_source', 'dancecard_account')
    .eq('external_id', accountId)
    .neq('status', 'cancelled')
    .maybeSingle()
  if (linked?.id) return linked.id

  const categoryId = await defaultCategoryId(eventId)
  if (!categoryId) throw new Error('Event has no registration categories — run dancecard:seed-sandbox first')

  const { data: created, error } = await supabase
    .from('dancecard_registrants')
    .insert({
      event_id: eventId,
      category_id: categoryId,
      status: 'confirmed',
      scene_display_name: sceneName,
      external_source: 'dancecard_account',
      external_id: accountId,
    })
    .select('id')
    .single()
  if (error) throw error
  return created.id
}

async function main() {
  const { data: event, error: eErr } = await supabase
    .from('dancecard_events')
    .select('id, event_title, window_starts_at, window_ends_at')
    .eq('slug', SLUG)
    .maybeSingle()
  if (eErr) throw eErr
  if (!event?.id) {
    console.error(`Event slug "${SLUG}" not found. Run: npm run dancecard:seed-sandbox`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const { data: existing } = await supabase
    .from('dancecard_accounts')
    .select('id')
    .eq('event_id', event.id)
    .eq('username', USERNAME)
    .maybeSingle()

  let accountId = existing?.id
  if (accountId) {
    const { error: upErr } = await supabase
      .from('dancecard_accounts')
      .update({ display_name: DISPLAY_NAME, password_hash: passwordHash })
      .eq('id', accountId)
    if (upErr) throw upErr
    console.log('Updated existing account:', USERNAME)
  } else {
    const { data: account, error: insErr } = await supabase
      .from('dancecard_accounts')
      .insert({
        event_id: event.id,
        username: USERNAME,
        password_hash: passwordHash,
        display_name: DISPLAY_NAME,
      })
      .select('id')
      .single()
    if (insErr) throw insErr
    accountId = account.id
    console.log('Created account:', USERNAME)
  }

  await ensureRegistrant(event.id, accountId, DISPLAY_NAME)

  const eventStart = new Date(event.window_starts_at)
  const eventEnd = new Date(event.window_ends_at)

  const { error: prefErr } = await supabase.from('dancecard_prefs').upsert(
    {
      account_id: accountId,
      buffer_minutes: 0,
      allow_compare_by_username: true,
      compare_visibility: 'username',
      availability_starts_at: iso(eventStart),
      availability_ends_at: iso(eventEnd),
    },
    { onConflict: 'account_id' },
  )
  if (prefErr) throw prefErr

  await supabase.from('dancecard_selections').delete().eq('account_id', accountId)

  const { data: slot } = await supabase
    .from('dancecard_program_slots')
    .select('id, starts_at, ends_at, title')
    .eq('event_id', event.id)
    .eq('is_published', true)
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const selections = []
  if (slot?.id) {
    selections.push({
      account_id: accountId,
      kind: 'program',
      slot_id: slot.id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      note: `Demo: ${slot.title ?? 'program'}`,
    })
  }

  const busyStart = addMinutes(eventStart, 90)
  selections.push({
    account_id: accountId,
    kind: 'manual',
    slot_id: null,
    starts_at: iso(busyStart),
    ends_at: iso(addMinutes(busyStart, 60)),
    note: 'Demo: busy block',
  })

  const { error: selErr } = await supabase.from('dancecard_selections').insert(selections)
  if (selErr) throw selErr

  const host = await resolveHostAccount(event.id)
  await ensureHostPrefs(host.id, eventStart, eventEnd)
  await ensureShareLink(host.id)

  const reserveStart = addMinutes(eventStart, 180)
  const reserveEnd = addMinutes(reserveStart, 60)
  await ensureDemoReservation(event.id, host.id, accountId, reserveStart, reserveEnd)

  const base =
    process.env.DANCECARD_SMOKE_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'

  console.log('')
  console.log('=== Sandbox compare demo partner ===')
  console.log('Event:', event.event_title, `(${SLUG})`)
  console.log('Attendee URL:', `${base}/dancecard/${SLUG}`)
  console.log('')
  console.log('Partner account (use in Compare tab while signed in as yourself):')
  console.log('  Username:  ', USERNAME)
  console.log('  Password:  ', PASSWORD)
  console.log('  Display:   ', DISPLAY_NAME)
  console.log('  Compare:   enabled (allow_compare_by_username)')
  console.log('')
  const sharePath = `/dancecard/${SLUG}/s/${DEMO_SHARE_TOKEN}`
  const shareUrl = `${base}${sharePath}`

  console.log('Host account (your link owner):')
  console.log('  Username:  ', host.username)
  console.log('  Display:   ', host.display_name)
  console.log('  Share URL: ', shareUrl)
  console.log('  Token:     ', DEMO_SHARE_TOKEN)
  console.log('')
  console.log('Demo reservation (partner → you):')
  console.log('  Guest:     ', USERNAME, `(${DISPLAY_NAME})`)
  console.log('  When:      ', reserveStart.toISOString(), '→', reserveEnd.toISOString())
  console.log('  Note:      ', DEMO_RESERVE_NOTE)
  console.log('')
  console.log('How to test:')
  console.log('  1. Sign in as YOU on /dancecard/sandbox (required for Share link button)')
  console.log('  2. Reservations tab — see Alex’s booking, or open share URL while signed in as partner')
  console.log('  3. Compare tab → username', USERNAME, 'or paste share URL under Advanced')
  console.log('')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
