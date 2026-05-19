/**
 * Rich sandbox profiles: accounts, registrants, roster photos, portrait uploads.
 */
import bcrypt from 'bcryptjs'

const PROFILE_PHOTOS_BUCKET = process.env.DANCECARD_PROFILE_PHOTOS_BUCKET ?? 'dancecard-profile-photos'

function iso(s) {
  return new Date(s).toISOString()
}

function picsumUrl(seed) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/512/512`
}

function storageRef(objectPath) {
  return `storage:${objectPath}`
}

async function fetchImageBuffer(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`Failed to fetch image ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 500) throw new Error(`Image too small from ${url}`)
  return buf
}

async function uploadAccountPortrait(supabase, eventId, accountId, photoSeed) {
  const url = picsumUrl(photoSeed)
  let buf
  try {
    buf = await fetchImageBuffer(url)
  } catch (e) {
    console.warn('  Portrait fetch failed, skip upload:', photoSeed, e.message)
    return picsumUrl(photoSeed)
  }
  const objectPath = `${eventId}/profile-photos/${accountId}/avatar.jpg`
  const { error } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).upload(objectPath, buf, {
    contentType: 'image/jpeg',
    upsert: true,
  })
  if (error) {
    console.warn('  Portrait upload failed:', photoSeed, error.message)
    return picsumUrl(photoSeed)
  }
  return storageRef(objectPath)
}

/** Demo accounts with full attendee profiles (passwords: local testing only). */
const ACCOUNT_CAST = [
  {
    username: 'brax',
    password: 'SandboxBrax1!',
    displayName: 'Brax',
    email: 'brax@sandbox.demo',
    category: 'Staff',
    isStaff: true,
    photoSeed: 'sandbox-brax',
    pronouns: 'he/him',
    bio: 'Registration lead and compare demo account. Here to help you test staff tools, signups, and the full dancecard flow.',
    fetlife: 'brax_demo',
    discord: 'brax.sandbox',
    rosterMatch: 'Brax',
    rosterRoles: ['staff'],
    inDirectory: true,
    badgeTagline: 'Sandbox staff',
    registrantStatus: 'checked_in',
  },
  {
    username: 'sandboxfriend',
    password: 'SandboxCompare1!',
    displayName: 'Alex Demo',
    email: 'alex.demo@sandbox.demo',
    category: 'Weekend pass',
    photoSeed: 'sandbox-alex-demo',
    pronouns: 'they/them',
    bio: 'Weekend attendee exploring compare and reservations. Rope-curious, loves opening circle energy.',
    fetlife: 'alex_demo_sandbox',
    discord: 'alexdemo',
    inDirectory: true,
  },
  {
    username: 'caseydemo',
    password: 'SandboxCasey1!',
    displayName: 'Casey Compare',
    email: 'casey.compare@sandbox.demo',
    category: 'Weekend pass',
    photoSeed: 'sandbox-casey',
    pronouns: 'she/they',
    bio: 'Compare directory regular — happy to find mutual free time for classes and socials.',
    discord: 'caseycompare',
    inDirectory: true,
  },
  {
    username: 'riverdemo',
    password: 'SandboxRiver1!',
    displayName: 'River Compare',
    email: 'river.compare@sandbox.demo',
    category: 'Day pass',
    photoSeed: 'sandbox-river',
    pronouns: 'he/they',
    bio: 'Day-pass holder testing availability blocks and ICS reminders.',
    telegram: 'river_sandbox',
    inDirectory: true,
  },
  {
    username: 'blairrigger',
    password: 'SandboxBlair1!',
    displayName: 'Blair Rigger',
    email: 'blair.rigger@example.com',
    category: 'Presenter',
    photoSeed: 'sandbox-blair-rigger',
    pronouns: 'she/her',
    bio: 'Rope educator for 8+ years. Co-teaches intro and advanced labs; focus on nerve-aware tying and negotiation.',
    fetlife: 'blair_rigger_demo',
    rosterMatch: 'Blair Rigger',
    rosterRoles: ['presenter'],
    inDirectory: true,
    badgeTagline: 'Presenter · Rope',
  },
  {
    username: 'quinnpresenter',
    password: 'SandboxQuinn1!',
    displayName: 'Quinn Sage',
    email: 'quinn.sage@sandbox.demo',
    category: 'Presenter',
    photoSeed: 'sandbox-quinn-sage',
    pronouns: 'they/them',
    bio: 'Consent and communication facilitator. Ask me about the clinic or negotiation practice.',
    rosterMatch: 'Quinn Sage',
    rosterRoles: ['presenter'],
    inDirectory: true,
    badgeTagline: 'Presenter · Consent',
  },
  {
    username: 'morganlens',
    password: 'SandboxMorgan1!',
    displayName: 'Morgan Lens',
    email: 'morgan.lens@sandbox.demo',
    category: 'Photographer',
    photoSeed: 'sandbox-morgan-lens',
    pronouns: 'she/they',
    bio: 'Event photographer — respectful candids and portrait sessions by appointment. No play-space flash without DM approval.',
    fetlife: 'morgan_lens_photo',
    rosterMatch: 'Morgan Lens',
    rosterRoles: ['photographer'],
    inDirectory: true,
    badgeTagline: 'Official photographer',
  },
  {
    username: 'rileyvendor',
    password: 'SandboxRiley1!',
    displayName: 'Riley Knotworks',
    email: 'riley.knotworks@sandbox.demo',
    category: 'Vendor',
    photoSeed: 'sandbox-riley-vendor',
    pronouns: 'he/him',
    bio: 'Handmade rope and hardware at Vendor Row. Demo harness fittings Friday afternoon.',
    discord: 'riley.knotworks',
    rosterMatch: 'Riley Knotworks',
    rosterRoles: ['vendor'],
    inDirectory: false,
    badgeTagline: 'Vendor · Riley Knotworks',
  },
  {
    username: 'sagecomp',
    password: 'SandboxSage1!',
    displayName: 'Sage Guest',
    email: 'sage.guest@sandbox.demo',
    category: 'Comp guest',
    photoSeed: 'sandbox-sage-comp',
    pronouns: 'any',
    bio: 'Comped regional educator — thank you for hosting. Available for office hours Saturday.',
    rosterMatch: 'Sage Guest',
    rosterRoles: ['presenter'],
    inDirectory: true,
  },
  {
    username: 'jordanattendee',
    password: 'SandboxJordan1!',
    displayName: 'Jordan Lake',
    email: 'jordan.lake@sandbox.demo',
    category: 'Weekend pass',
    photoSeed: 'sandbox-jordan-lake',
    pronouns: 'she/her',
    bio: 'First sandbox weekend! Interested in dungeon orientation and vendor social.',
    fetlife: 'jordan_lake',
    inDirectory: true,
  },
  {
    username: 'drewvol',
    password: 'SandboxDrew1!',
    displayName: 'Drew Volunteer',
    email: 'drew.volunteer@example.com',
    category: 'Volunteer',
    isStaff: true,
    photoSeed: 'sandbox-drew-volunteer',
    pronouns: 'he/they',
    bio: 'Setup, vendor row, and tear-down volunteer. DM-in-training.',
    rosterMatch: 'Drew Volunteer',
    rosterRoles: ['volunteer', 'staff'],
    inDirectory: false,
  },
  {
    username: 'emerydm',
    password: 'SandboxEmery1!',
    displayName: 'Emery DM',
    email: 'emery.dm@example.com',
    category: 'Staff',
    isStaff: true,
    photoSeed: 'sandbox-emery-dm',
    pronouns: 'they/them',
    bio: 'Dungeon monitor lead for Friday play party block.',
    rosterMatch: 'Emery DM',
    rosterRoles: ['staff'],
    inDirectory: false,
  },
]

const ROSTER_ONLY = [
  {
    scene_name: 'Finley Safety',
    email: 'finley.safety@example.com',
    pronouns: 'she/her',
    role: 'staff',
    photoSeed: 'sandbox-finley-safety',
    bio: 'Safety float and incident response. Find me in gold staff lanyard.',
  },
  {
    scene_name: 'Casey Host',
    email: 'casey.host@example.com',
    pronouns: 'he/him',
    role: 'staff',
    photoSeed: 'sandbox-casey-host',
    bio: 'Registration desk lead — ask me about check-in and badges.',
  },
  {
    scene_name: 'Pixel Paparazzi',
    email: 'pixel@sandbox.demo',
    pronouns: 'they/them',
    role: 'photographer',
    photoSeed: 'sandbox-pixel-photo',
    bio: 'Second shooter for hallway candids (no dungeon coverage).',
  },
]

export async function seedSandboxProfiles(supabase, ctx) {
  const { eventId, windowStart, windowEnd, catByName, personRows, slotRows, accountIds } = ctx

  console.log('Seeding rich profiles and portraits…')

  for (const extra of ROSTER_ONLY) {
    const { data: existing } = await supabase
      .from('dancecard_persons')
      .select('id')
      .eq('event_id', eventId)
      .eq('scene_name', extra.scene_name)
      .maybeSingle()
    if (existing?.id) {
      await supabase
        .from('dancecard_persons')
        .update({
          pronouns: extra.pronouns,
          public_bio: extra.bio,
          photo_url: picsumUrl(extra.photoSeed),
        })
        .eq('id', existing.id)
      continue
    }
    const { data: ins, error } = await supabase
      .from('dancecard_persons')
      .insert({
        event_id: eventId,
        scene_name: extra.scene_name,
        email: extra.email,
        pronouns: extra.pronouns,
        public_bio: extra.bio,
        photo_url: picsumUrl(extra.photoSeed),
      })
      .select('id')
      .single()
    if (error) throw error
    personRows.push({ id: ins.id, scene_name: extra.scene_name })
    await supabase.from('dancecard_person_role_assignments').insert({ person_id: ins.id, role: extra.role })
  }

  const rosterBios = {
    'Alex Anchor':
      'Lead presenter for Rope 101 and advanced labs. Teaching since 2015; emphasis on sustainable suspension.',
    'Blair Rigger': 'Co-presenter and floor work specialist. Loves teaching beginners and nervous first-timers.',
    'Casey Host': 'Registration desk lead — badges, check-in, and lost-and-found.',
    'Drew Volunteer': 'Setup and tear-down crew; training for dungeon monitor coverage.',
    'Emery DM': 'Dungeon monitor for Friday play party — gold lanyard, radio on channel 2.',
    'Finley Safety': 'Safety float and incident response coordinator.',
  }
  for (const p of personRows) {
    const seed = String(p.scene_name).toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const patch = { photo_url: picsumUrl(`roster-${seed}`) }
    if (rosterBios[p.scene_name]) patch.public_bio = rosterBios[p.scene_name]
    await supabase.from('dancecard_persons').update(patch).eq('id', p.id)
  }

  const personByName = Object.fromEntries(personRows.map((p) => [p.scene_name, p.id]))

  for (const spec of ACCOUNT_CAST) {
    const categoryId = catByName[spec.category]
    if (!categoryId) {
      console.warn('  Skip profile (no category):', spec.username, spec.category)
      continue
    }

    const hash = await bcrypt.hash(spec.password, 10)
    const accountId = await upsertAccount(supabase, eventId, spec.username, spec.displayName, hash)
    accountIds[spec.username] = accountId

    if (spec.isStaff) {
      await supabase.from('dancecard_accounts').update({ is_staff: true }).eq('id', accountId)
    }

    const photoUrl = await uploadAccountPortrait(supabase, eventId, accountId, spec.photoSeed)
    const profileJson = {
      pronouns: spec.pronouns ?? null,
      bio: spec.bio ?? null,
      photoUrl,
      fetlife: spec.fetlife ?? null,
      discord: spec.discord ?? null,
      telegram: spec.telegram ?? null,
    }

    await supabase.from('dancecard_prefs').upsert(
      {
        account_id: accountId,
        buffer_minutes: 15,
        allow_compare_by_username: true,
        compare_visibility: 'username',
        show_in_compare_directory: spec.inDirectory ?? false,
        availability_starts_at: iso(windowStart),
        availability_ends_at: iso(windowEnd),
        profile_json: profileJson,
      },
      { onConflict: 'account_id' },
    )

    let personId = spec.rosterMatch ? personByName[spec.rosterMatch] : null
    if (!personId && spec.rosterMatch) {
      const { data: ins, error: pErr } = await supabase
        .from('dancecard_persons')
        .insert({
          event_id: eventId,
          scene_name: spec.rosterMatch,
          email: spec.email,
          pronouns: spec.pronouns,
          public_bio: spec.bio,
          photo_url: picsumUrl(spec.photoSeed),
        })
        .select('id')
        .single()
      if (pErr) throw pErr
      personId = ins.id
      personByName[spec.rosterMatch] = personId
      personRows.push({ id: personId, scene_name: spec.rosterMatch })
    }
    if (personId && spec.rosterRoles?.length) {
      for (const role of spec.rosterRoles) {
        const { data: has } = await supabase
          .from('dancecard_person_role_assignments')
          .select('person_id')
          .eq('person_id', personId)
          .eq('role', role)
          .maybeSingle()
        if (!has) {
          await supabase.from('dancecard_person_role_assignments').insert({ person_id: personId, role })
        }
      }
      await supabase
        .from('dancecard_persons')
        .update({
          pronouns: spec.pronouns,
          public_bio: spec.bio,
          photo_url: picsumUrl(spec.photoSeed),
        })
        .eq('id', personId)
    }

    await supabase.from('dancecard_registrants').delete().eq('event_id', eventId).eq('email', spec.email)
    const regPatch = {
      event_id: eventId,
      category_id: categoryId,
      status: spec.registrantStatus ?? 'confirmed',
      scene_display_name: spec.displayName,
      email: spec.email,
      pronouns: spec.pronouns ?? null,
      person_id: personId,
      external_source: 'dancecard_account',
      external_id: accountId,
      badge_tagline: spec.badgeTagline ?? null,
    }
    if (spec.registrantStatus === 'checked_in') {
      regPatch.checked_in_at = new Date().toISOString()
      regPatch.checked_in_timing = 'on_time'
    }
    const { error: regErr } = await supabase.from('dancecard_registrants').insert(regPatch)
    if (regErr) throw regErr
  }

  await seedProgramPresenterLinks(supabase, personByName, slotRows)

  const namedRegistrants = [
    { name: 'Harper Weekend', email: 'harper@sandbox.demo', category: 'Weekend pass', pronouns: 'she/they', photoSeed: 'reg-harper' },
    { name: 'Logan Day', email: 'logan@sandbox.demo', category: 'Day pass', pronouns: 'he/him', photoSeed: 'reg-logan' },
    { name: 'Reese Volunteer', email: 'reese.vol@sandbox.demo', category: 'Volunteer', pronouns: 'they/them', photoSeed: 'reg-reese-vol' },
  ]
  for (const r of namedRegistrants) {
    const catId = catByName[r.category]
    if (!catId) continue
    const { data: person, error: pErr } = await supabase
      .from('dancecard_persons')
      .insert({
        event_id: eventId,
        scene_name: r.name,
        email: r.email,
        pronouns: r.pronouns,
        public_bio: `Sandbox ${r.category} registrant (no dancecard login).`,
        photo_url: picsumUrl(r.photoSeed),
      })
      .select('id')
      .single()
    if (pErr && pErr.code !== '23505') throw pErr
    const personId = person?.id
    await supabase.from('dancecard_registrants').insert({
      event_id: eventId,
      category_id: catId,
      status: 'confirmed',
      scene_display_name: r.name,
      email: r.email,
      pronouns: r.pronouns,
      person_id: personId ?? null,
    })
  }

  console.log('  Profile accounts:', ACCOUNT_CAST.length, '| roster portraits:', personRows.length)
}

async function upsertAccount(supabase, eventId, username, displayName, passwordHash) {
  const { data: existing } = await supabase
    .from('dancecard_accounts')
    .select('id')
    .eq('event_id', eventId)
    .eq('username', username)
    .maybeSingle()
  if (existing?.id) {
    await supabase
      .from('dancecard_accounts')
      .update({ display_name: displayName, password_hash: passwordHash })
      .eq('id', existing.id)
    return existing.id
  }
  const { data, error } = await supabase
    .from('dancecard_accounts')
    .insert({
      event_id: eventId,
      username,
      password_hash: passwordHash,
      display_name: displayName,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

async function seedProgramPresenterLinks(supabase, personByName, slotRows) {
  const links = [
    { slot: 'Rope 101', person: 'Alex Anchor', role: 'lead_presenter' },
    { slot: 'Rope 101', person: 'Blair Rigger', role: 'co_presenter' },
    { slot: 'Advanced rope lab', person: 'Alex Anchor', role: 'lead_presenter' },
    { slot: 'Advanced rope lab', person: 'Blair Rigger', role: 'co_presenter' },
    { slot: 'Consent clinic', person: 'Quinn Sage', role: 'lead_presenter' },
    { slot: 'Dungeon orientation', person: 'Emery DM', role: 'lead_presenter' },
    { slot: 'Vendor social', person: 'Riley Knotworks', role: 'lead_presenter' },
  ]
  for (const link of links) {
    const slot = slotRows.find((s) => s.title === link.slot)
    const personId = personByName[link.person]
    if (!slot?.id || !personId) continue
    const { data: exists } = await supabase
      .from('dancecard_program_slot_persons')
      .select('slot_id')
      .eq('slot_id', slot.id)
      .eq('person_id', personId)
      .maybeSingle()
    if (exists) continue
    await supabase.from('dancecard_program_slot_persons').insert({
      slot_id: slot.id,
      person_id: personId,
      role: link.role,
    })
  }
}

export function printSandboxProfileAccounts() {
  console.log('\n=== Profile demo logins (local only) ===')
  for (const a of ACCOUNT_CAST) {
    console.log(`  ${a.username} / ${a.password} — ${a.category} · ${a.displayName}`)
  }
  console.log('  Comp codes: SANDBOX-STAFF-REG, SANDBOX-VOL-REG, SANDBOX-PRESENTER, SANDBOX-PHOTO, SANDBOX-VENDOR, SANDBOX-COMP')
}
