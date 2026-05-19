/**
 * Seed a full Dancecard sandbox event for end-to-end organizer + attendee testing.
 *
 * Usage:
 *   node scripts/dancecard-seed-sandbox.mjs --reset
 *   node scripts/dancecard-seed-sandbox.mjs --reset --email you@example.com
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Optional: DATABASE_URL for --email organizer grant (or uses Supabase auth admin API)
 *
 * Slug: sandbox
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config()

const SLUG = 'sandbox'
const args = new Set(process.argv.slice(2))
const doReset = args.has('--reset')
const emailArg = process.argv.find((a) => a.includes('@'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })
const MAPS_BUCKET = process.env.DANCECARD_MAPS_BUCKET ?? 'dancecard-maps'

function iso(s) {
  return new Date(s).toISOString()
}

async function deleteEventBySlug(slug) {
  const { data } = await supabase.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
  if (!data?.id) return
  const { error } = await supabase.from('dancecard_events').delete().eq('id', data.id)
  if (error) throw error
  console.log('Removed existing event:', slug)
}

async function grantOrganizer(eventId, email) {
  const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!dbUrl) {
    console.warn('Skip organizer grant: set DATABASE_URL to grant', email)
    return
  }
  let pg
  try {
    pg = await import('pg')
  } catch {
    console.warn('Skip organizer grant: npm i -D pg')
    return
  }
  const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const { rows: users } = await client.query('select id, email from auth.users where lower(email) = lower($1)', [
      email,
    ])
    if (!users.length) {
      console.warn(`No auth user for ${email}. Sign up first, then re-run with --email.`)
      return
    }
    await client.query(
      `insert into dancecard_event_organizers (event_id, user_id, role)
       values ($1, $2, 'owner')
       on conflict (event_id, user_id) do update set role = excluded.role`,
      [eventId, users[0].id],
    )
    console.log('Organizer access granted to', users[0].email)
  } finally {
    await client.end()
  }
}

async function uploadMapImage(eventId) {
  const candidates = [
    path.join(root, 'public', 'dancecard', 'sandbox-floorplan.svg'),
    path.join(root, 'public', 'dancecard', 'sandbox-floorplan.png'),
    path.join(root, 'public', 'og-image.png'),
    path.join(root, 'public', 'favicon.svg'),
  ]
  const filePath = candidates.find((p) => fs.existsSync(p))
  if (!filePath) {
    console.warn('No sandbox floor plan asset; skip map image upload (add public/dancecard/sandbox-floorplan.svg)')
    return null
  }
  if (filePath.includes('og-image')) {
    console.warn('Using og-image.png as map fallback — prefer public/dancecard/sandbox-floorplan.svg for demos')
  }
  const buf = fs.readFileSync(filePath)
  const ext = path.extname(filePath) || '.png'
  const storagePath = `${eventId}/sandbox-floorplan${ext}`
  const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png'
  const { error } = await supabase.storage.from(MAPS_BUCKET).upload(storagePath, buf, {
    contentType,
    upsert: true,
  })
  if (error) {
    console.warn('Map upload failed:', error.message)
    return null
  }
  return storagePath
}

async function main() {
  if (!doReset) {
    const { data: existing } = await supabase.from('dancecard_events').select('id').eq('slug', SLUG).maybeSingle()
    if (existing?.id) {
      console.error('Sandbox event already exists. Re-run with --reset to rebuild, or delete slug "sandbox" in Supabase.')
      process.exit(1)
    }
  }
  if (doReset) await deleteEventBySlug(SLUG)

  const windowStart = iso('2026-06-12T07:00:00-04:00')
  const windowEnd = iso('2026-06-15T23:00:00-04:00')

  const { data: event, error: evErr } = await supabase
    .from('dancecard_events')
    .upsert(
      {
        slug: SLUG,
        product_title: 'East Coast Kink Events · Dancecard',
        event_title: 'Sandbox Con 2026',
        subtitle: 'A full sample weekend—browse the program, sign in, and try your dancecard.',
        timezone: 'America/New_York',
        window_starts_at: windowStart,
        window_ends_at: windowEnd,
        shared_by_label: 'East Coast Kink Events',
        shared_by_detail: null,
        status: 'published',
        staff_access_code: 'SANDBOX-STAFF',
        registration_access_code: null,
      },
      { onConflict: 'slug' },
    )
    .select('id')
    .single()
  if (evErr) throw evErr
  const eventId = event.id
  console.log('Event:', SLUG, eventId)

  await supabase.from('dancecard_event_entitlements').upsert({
    event_id: eventId,
    modules: {
      schedule_embed: true,
      map_embed: true,
      shift_swaps: true,
      vetting_applications: true,
      policy_public_summary: true,
      ecke_sign: true,
      iso_board: true,
      attendee_groups: true,
      session_feedback: true,
    },
  })

  const locations = [
    { name: 'Main Hall', short_name: 'Main', capacity: 120, sort_order: 0 },
    { name: 'Dungeon A', short_name: 'Dung A', capacity: 40, sort_order: 1 },
    { name: 'Dungeon B', short_name: 'Dung B', capacity: 40, sort_order: 2 },
    { name: 'Classroom 1', short_name: 'Cls 1', capacity: 30, sort_order: 3 },
    { name: 'Vendor Row', short_name: 'Vendors', capacity: 200, sort_order: 4 },
  ]
  const { data: locRows, error: locErr } = await supabase
    .from('dancecard_locations')
    .insert(locations.map((l) => ({ ...l, event_id: eventId })))
    .select('id, name')
  if (locErr) throw locErr
  const locByName = Object.fromEntries(locRows.map((r) => [r.name, r.id]))

  const tracks = ['Classes', 'Play', 'Social']
  const { error: trErr } = await supabase.from('dancecard_tracks').insert(
    tracks.map((name, i) => ({ event_id: eventId, name, color: '#2dd4bf', sort_order: i })),
  )
  if (trErr) throw trErr

  const { error: tagErr } = await supabase.from('dancecard_tags').insert(
    ['beginner-friendly', '18+', 'rope'].map((name) => ({
      event_id: eventId,
      name,
      scope: 'session',
    })),
  )
  if (tagErr) throw tagErr

  const people = [
    { scene_name: 'Alex Anchor', email: 'alex.anchor@example.com', role: 'presenter' },
    { scene_name: 'Blair Rigger', email: 'blair.rigger@example.com', role: 'presenter' },
    { scene_name: 'Casey Host', email: 'casey.host@example.com', role: 'staff' },
    { scene_name: 'Drew Volunteer', email: 'drew.volunteer@example.com', role: 'volunteer' },
    { scene_name: 'Emery DM', email: 'emery.dm@example.com', role: 'staff' },
    { scene_name: 'Finley Safety', email: 'finley.safety@example.com', role: 'staff' },
  ]
  const { data: personRows, error: pErr } = await supabase
    .from('dancecard_persons')
    .insert(
      people.map((p) => ({
        event_id: eventId,
        scene_name: p.scene_name,
        email: p.email,
        public_bio: `Demo ${p.role} for sandbox testing.`,
      })),
    )
    .select('id, scene_name')
  if (pErr) throw pErr

  for (const p of people) {
    const person = personRows.find((r) => r.scene_name === p.scene_name)
    if (!person) continue
    await supabase.from('dancecard_person_role_assignments').insert({
      person_id: person.id,
      role: p.role,
    })
  }

  const slots = [
    {
      title: 'Opening circle',
      track: 'Social',
      room: 'Main Hall',
      loc: 'Main Hall',
      start: '2026-06-12T10:00:00-04:00',
      end: '2026-06-12T11:00:00-04:00',
    },
    {
      title: 'Rope 101',
      track: 'Classes',
      room: 'Classroom 1',
      loc: 'Classroom 1',
      start: '2026-06-12T14:00:00-04:00',
      end: '2026-06-12T16:00:00-04:00',
    },
    {
      title: 'Dungeon orientation',
      track: 'Classes',
      room: 'Dungeon A',
      loc: 'Dungeon A',
      start: '2026-06-12T16:30:00-04:00',
      end: '2026-06-12T17:30:00-04:00',
    },
    {
      title: 'Friday play party',
      track: 'Play',
      room: 'Dungeon A',
      loc: 'Dungeon A',
      start: '2026-06-12T20:00:00-04:00',
      end: '2026-06-13T01:00:00-04:00',
    },
    {
      title: 'Consent clinic',
      track: 'Classes',
      room: 'Main Hall',
      loc: 'Main Hall',
      start: '2026-06-13T11:00:00-04:00',
      end: '2026-06-13T12:30:00-04:00',
    },
    {
      title: 'Vendor social',
      track: 'Social',
      room: 'Vendor Row',
      loc: 'Vendor Row',
      start: '2026-06-13T15:00:00-04:00',
      end: '2026-06-13T17:00:00-04:00',
    },
    {
      title: 'Advanced rope lab',
      track: 'Classes',
      room: 'Classroom 1',
      loc: 'Classroom 1',
      start: '2026-06-13T18:00:00-04:00',
      end: '2026-06-13T20:00:00-04:00',
    },
    {
      title: 'Saturday night play',
      track: 'Play',
      room: 'Dungeon B',
      loc: 'Dungeon B',
      start: '2026-06-13T21:00:00-04:00',
      end: '2026-06-14T02:00:00-04:00',
    },
    {
      title: 'Closing gratitude',
      track: 'Social',
      room: 'Main Hall',
      loc: 'Main Hall',
      start: '2026-06-15T11:00:00-04:00',
      end: '2026-06-15T12:00:00-04:00',
    },
  ]

  const { data: slotRows, error: slotErr } = await supabase
    .from('dancecard_program_slots')
    .insert(
      slots.map((s, i) => ({
        event_id: eventId,
        title: s.title,
        track: s.track,
        room: s.room,
        location_id: locByName[s.loc],
        starts_at: iso(s.start),
        ends_at: iso(s.end),
        description: `Demo session ${i + 1} for sandbox.`,
        sort_order: i,
      })),
    )
    .select('id, title, starts_at, ends_at')
  if (slotErr) throw slotErr

  const categories = [
    {
      name: 'Weekend pass',
      capacity: 200,
      role_kind: 'attendee',
      access_code: null,
      grants_staff_access: false,
    },
    {
      name: 'Staff',
      capacity: 30,
      role_kind: 'staff',
      access_code: 'SANDBOX-STAFF-REG',
      grants_staff_access: true,
    },
    {
      name: 'Volunteer',
      capacity: 50,
      role_kind: 'volunteer',
      access_code: 'SANDBOX-VOL-REG',
      grants_staff_access: true,
    },
    { name: 'Day pass', capacity: 80, role_kind: 'attendee', access_code: null, grants_staff_access: false },
    {
      name: 'Presenter',
      capacity: 40,
      role_kind: 'presenter',
      access_code: 'SANDBOX-PRESENTER',
      grants_staff_access: false,
    },
    {
      name: 'Photographer',
      capacity: 12,
      role_kind: 'photographer',
      access_code: 'SANDBOX-PHOTO',
      grants_staff_access: false,
    },
    {
      name: 'Vendor',
      capacity: 25,
      role_kind: 'vendor',
      access_code: 'SANDBOX-VENDOR',
      grants_staff_access: false,
    },
    {
      name: 'Comp guest',
      capacity: 15,
      role_kind: 'comp',
      access_code: 'SANDBOX-COMP',
      grants_staff_access: false,
    },
  ]
  const { data: catRows, error: catErr } = await supabase
    .from('dancecard_registration_categories')
    .insert(
      categories.map((c, i) => ({
        event_id: eventId,
        name: c.name,
        capacity: c.capacity,
        sort_order: i,
        role_kind: c.role_kind,
        access_code: c.access_code,
        grants_staff_access: c.grants_staff_access,
      })),
    )
    .select('id, name')
  if (catErr) throw catErr
  const catWeekend = catRows.find((c) => c.name === 'Weekend pass')?.id
  const catStaff = catRows.find((c) => c.name === 'Staff')?.id
  const catVol = catRows.find((c) => c.name === 'Volunteer')?.id

  const { data: form, error: formErr } = await supabase
    .from('dancecard_registration_forms')
    .upsert(
      {
        event_id: eventId,
        status: 'published',
        intro_text: 'Sandbox registration (demo only).',
        confirmation_text: 'Thanks for registering for the sandbox demo event.',
      },
      { onConflict: 'event_id' },
    )
    .select('id')
    .single()
  if (formErr) throw formErr

  const { data: qEmail, error: qErr } = await supabase
    .from('dancecard_registration_questions')
    .insert({
      form_id: form.id,
      type: 'email',
      label: 'Email',
      required: true,
      sort_order: 0,
    })
    .select('id')
    .single()
  if (qErr) throw qErr

  const registrantSeeds = []
  for (let i = 1; i <= 8; i++) {
    registrantSeeds.push({
      event_id: eventId,
      category_id: catWeekend,
      status: i <= 6 ? 'confirmed' : 'pending',
      scene_display_name: `Attendee ${i}`,
      email: `attendee${i}@sandbox.demo`,
      pronouns: i % 2 === 0 ? 'they/them' : 'she/her',
    })
  }
  for (let i = 1; i <= 2; i++) {
    registrantSeeds.push({
      event_id: eventId,
      category_id: catStaff,
      status: 'confirmed',
      scene_display_name: `Staff Reg ${i}`,
      email: `staff${i}@sandbox.demo`,
    })
  }
  for (let i = 1; i <= 3; i++) {
    registrantSeeds.push({
      event_id: eventId,
      category_id: catVol,
      status: i <= 2 ? 'confirmed' : 'waitlisted',
      scene_display_name: `Volunteer ${i}`,
      email: `volunteer${i}@sandbox.demo`,
    })
  }

  const { data: regRows, error: regErr } = await supabase
    .from('dancecard_registrants')
    .insert(registrantSeeds)
    .select('id')
  if (regErr) throw regErr

  if (regRows?.[0] && qEmail?.id) {
    await supabase.from('dancecard_registrant_answers').insert({
      registrant_id: regRows[0].id,
      question_id: qEmail.id,
      value_json: JSON.stringify('attendee1@sandbox.demo'),
    })
  }

  const shifts = [
    { person_name: 'Casey Host', role: 'registration desk', start: '2026-06-12T08:00:00-04:00', end: '2026-06-12T14:00:00-04:00', loc: 'Main Hall' },
    { person_name: 'Drew Volunteer', role: 'setup', start: '2026-06-12T07:00:00-04:00', end: '2026-06-12T10:00:00-04:00', loc: 'Vendor Row' },
    { person_name: 'Emery DM', role: 'dungeon monitor', start: '2026-06-12T20:00:00-04:00', end: '2026-06-13T01:00:00-04:00', loc: 'Dungeon A' },
    { person_name: 'Finley Safety', role: 'safety float', start: '2026-06-13T21:00:00-04:00', end: '2026-06-14T02:00:00-04:00', loc: 'Dungeon B' },
    { person_name: 'Drew Volunteer', role: 'tear-down', start: '2026-06-15T10:00:00-04:00', end: '2026-06-15T14:00:00-04:00', loc: 'Main Hall' },
  ]
  const { error: shiftErr } = await supabase.from('dancecard_staff_shifts').insert(
    shifts.map((s, i) => ({
      event_id: eventId,
      person_name: s.person_name,
      role: s.role,
      starts_at: iso(s.start),
      ends_at: iso(s.end),
      location_id: locByName[s.loc],
      sort_order: i,
      shift_status: i === 1 || i === 3 ? 'open' : 'assigned',
    })),
  )
  if (shiftErr) throw shiftErr

  await supabase.from('dancecard_event_dm_requirements').insert({
    event_id: eventId,
    location_id: locByName['Dungeon A'],
    starts_at: iso('2026-06-12T20:00:00-04:00'),
    ends_at: iso('2026-06-13T01:00:00-04:00'),
    min_lead: 1,
    min_float: 1,
  })

  await supabase.from('dancecard_policy_documents').insert({
    event_id: eventId,
    kind: 'coc',
    version: 1,
    title: 'Code of Conduct (Sandbox)',
    body_markdown: '## Sandbox demo\n\nBe excellent to each other. This is test copy only.',
    published_at: new Date().toISOString(),
  })

  await supabase.from('dancecard_message_templates').insert({
    event_id: eventId,
    name: 'Welcome email',
    subject: 'Welcome to Sandbox Con',
    body_text: 'Hi {{name}},\n\nThanks for registering. This is a demo template.',
  })

  let dmRoleId = null
  const { data: dmRole, error: trustedRoleErr } = await supabase
    .from('dancecard_trusted_roles')
    .insert({
      event_id: eventId,
      name: 'Dungeon monitor',
      apply_slug: 'dungeon-monitor',
      description: 'Play-space safety and coverage for dungeon hours.',
      status: 'published',
      intro_text:
        'Dungeon monitors keep play spaces safe. Tell us about your experience and availability for the weekend.',
      confirmation_text: 'Thanks — organizers will review your application and follow up if you are approved.',
      sort_order: 0,
    })
    .select('id')
    .single()
  if (trustedRoleErr) {
    if (!/dancecard_trusted_roles|42P01|does not exist/i.test(trustedRoleErr.message)) {
      throw trustedRoleErr
    }
    console.warn('Skip trusted roles seed: run dancecard_038_trusted_roles.sql')
  } else {
    dmRoleId = dmRole.id
    const { data: qRows, error: qInsErr } = await supabase
      .from('dancecard_trusted_role_questions')
      .insert([
        {
          role_id: dmRoleId,
          type: 'long_text',
          label: 'Why do you want to be a dungeon monitor?',
          required: true,
          sort_order: 0,
          options_json: [],
        },
        {
          role_id: dmRoleId,
          type: 'single_choice',
          label: 'Years of DM experience',
          required: true,
          sort_order: 1,
          options_json: ['First time', '1–2 years', '3+ years'],
        },
      ])
      .select('id, label')
    if (qInsErr) throw qInsErr

    await supabase.from('dancecard_trusted_roles').insert({
      event_id: eventId,
      name: 'Lead volunteer',
      apply_slug: 'lead-volunteer',
      description: 'Long or high-responsibility volunteer blocks.',
      status: 'published',
      intro_text: 'Lead volunteers help run registration, hospitality, and setup.',
      confirmation_text: 'Application received. We will be in touch.',
      sort_order: 1,
    })

    const answersByLabel = {}
    for (const q of qRows ?? []) {
      if (q.label.includes('Why')) answersByLabel[q.label] = 'I have staffed dungeons at three prior events.'
      if (q.label.includes('experience')) answersByLabel[q.label] = '1–2 years'
    }

    await supabase.from('dancecard_vetting_applications').insert([
      {
        event_id: eventId,
        trusted_role_id: dmRoleId,
        scene_display_name: 'Pending Applicant One',
        email: 'pending1@sandbox.demo',
        status: 'pending',
        payload: {
          trustedRoleId: dmRoleId,
          trustedRoleName: 'Dungeon monitor',
          answersByLabel,
        },
      },
      {
        event_id: eventId,
        scene_display_name: 'Pending Applicant Two',
        email: 'pending2@sandbox.demo',
        status: 'review',
        payload: { note: 'Legacy demo item without a role' },
      },
    ])
  }

  if (!dmRoleId) {
    await supabase.from('dancecard_vetting_applications').insert([
      {
        event_id: eventId,
        scene_display_name: 'Pending Applicant One',
        email: 'pending1@sandbox.demo',
        status: 'pending',
        payload: { note: 'Demo vetting queue item' },
      },
      {
        event_id: eventId,
        scene_display_name: 'Pending Applicant Two',
        email: 'pending2@sandbox.demo',
        status: 'review',
        payload: {},
      },
    ])
  }

  const mapPath = await uploadMapImage(eventId)
  if (mapPath) {
    const { data: mapRow, error: mapErr } = await supabase
      .from('dancecard_event_maps')
      .insert({
        event_id: eventId,
        title: 'Sandbox floor plan',
        image_path: mapPath,
        width_px: 1200,
        height_px: 630,
        sort_order: 0,
      })
      .select('id')
      .single()
    if (mapErr) throw mapErr

    const pinLocs = ['Main Hall', 'Dungeon A', 'Dungeon B', 'Classroom 1', 'Vendor Row']
    const pins = pinLocs.map((name, i) => ({
      map_id: mapRow.id,
      location_id: locByName[name],
      x: 0.15 + i * 0.17,
      y: 0.3 + (i % 2) * 0.2,
      label: name,
    }))
    const { error: pinErr } = await supabase.from('dancecard_map_pins').insert(pins)
    if (pinErr) throw pinErr
    console.log('Map +', pins.length, 'pins')
  }

  const catByName = Object.fromEntries(catRows.map((r) => [r.name, r.id]))
  const accountIds = {}
  const { seedSandboxFeatures, printSandboxDemoAccounts } = await import('./dancecard-seed-sandbox-features.mjs')
  const { seedSandboxProfiles, printSandboxProfileAccounts } = await import('./dancecard-seed-sandbox-profiles.mjs')
  await seedSandboxProfiles(supabase, {
    eventId,
    windowStart,
    windowEnd,
    catByName,
    slotRows,
    locByName,
    personRows,
    accountIds,
  })
  await seedSandboxFeatures(supabase, {
    eventId,
    windowStart,
    windowEnd,
    catByName,
    slotRows,
    locByName,
    personRows,
    accountIds,
  })

  if (emailArg) await grantOrganizer(eventId, emailArg)

  console.log('\nSandbox seed complete.')
  console.log('  Program slots:', slotRows.length)
  console.log('  Registrants:', regRows.length)
  console.log('  Staff shifts:', shifts.length)
  console.log('  Locations:', locRows.length)
  console.log('\nOpen:')
  console.log('  Organizer:', `http://localhost:3000/organizer/dancecard/${SLUG}`)
  console.log('  Public:   ', `http://localhost:3000/dancecard/${SLUG}`)
  console.log('  Map:      ', `http://localhost:3000/dancecard/${SLUG}/map`)
  if (!emailArg) {
    console.log('\nGrant yourself access:')
    console.log(`  node scripts/dancecard-add-organizer.mjs YOUR_EMAIL ${SLUG} owner`)
  }

  const base =
    process.env.DANCECARD_SMOKE_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  printSandboxProfileAccounts()
  printSandboxDemoAccounts(base)
}

main().catch((e) => {
  console.error(e?.message ?? e)
  if (e?.details) console.error(e.details)
  if (e?.hint) console.error(e.hint)
  process.exit(1)
})
