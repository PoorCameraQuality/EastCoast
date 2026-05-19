/**
 * Extra sandbox demo data: attendee accounts, ISO, compare, feedback, safety, etc.
 * Called from dancecard-seed-sandbox.mjs after core event seed.
 */
const DEMO_SHARE_TOKEN = 'sndboxhost01'

function iso(s) {
  return new Date(s).toISOString()
}

function addMinutes(d, minutes) {
  return new Date(d.getTime() + minutes * 60_000)
}

function isMissingTableError(err) {
  const e = err
  return e?.code === '42P01' || /does not exist/i.test(String(e?.message ?? ''))
}

async function seedOrWarn(label, fn) {
  try {
    await fn()
  } catch (e) {
    if (isMissingTableError(e)) {
      console.warn(`  ${label} skipped (apply migrations 040–053):`, e.message ?? e)
      return
    }
    throw e
  }
}

export async function seedSandboxFeatures(supabase, ctx) {
  const { eventId, windowStart, windowEnd, catByName, slotRows, locByName, personRows, accountIds } = ctx

  await supabase
    .from('dancecard_events')
    .update({
      attendee_profile_config: {
        photo: true,
        bio: true,
        pronouns: true,
        fetlife: true,
        discord: true,
        telegram: true,
        emailOnCard: true,
        bioMaxLength: 280,
        bioPrompt: 'Tell people what you are into this weekend.',
      },
      feedback_config: { enabled: true },
    })
    .eq('id', eventId)

  await supabase.from('dancecard_event_entitlements').upsert({
    event_id: eventId,
    modules: {
      schedule_embed: true,
      map_embed: true,
      shift_swaps: true,
      vetting_applications: true,
      policy_public_summary: true,
      ecke_sign: true,
      rabbitsign_sync: false,
      iso_board: true,
      session_feedback: true,
    },
  })

  const ropeSlot = slotRows.find((s) => s.title === 'Rope 101')
  if (ropeSlot?.id) {
    await supabase.from('dancecard_program_slots').update({ photo_policy: 'restricted' }).eq('id', ropeSlot.id)
  }

  await seedBraxExtras(supabase, {
    eventId,
    windowStart,
    windowEnd,
    accountIds,
  })
  await seedIsoBoard(supabase, eventId, accountIds, slotRows)
  await seedOrWarn('Compare extras', () => seedCompareExtras(supabase, eventId, accountIds, windowStart, windowEnd))
  await seedOrWarn('Session feedback', () => seedSessionFeedback(supabase, eventId, accountIds, slotRows))
  await seedOrWarn('Safety & swaps', () => seedSafetyAndSwaps(supabase, eventId, locByName, accountIds))
  await seedScheduleNotifications(supabase, eventId, accountIds.brax, slotRows)

  return accountIds
}

async function seedBraxExtras(supabase, ctx) {
  const { eventId, windowStart, accountIds } = ctx
  const braxId = accountIds.brax
  if (!braxId) {
    console.warn('  Skip Brax share/reservation demo: brax account missing from profile seed')
    return
  }

  await supabase.from('dancecard_share_links').delete().eq('account_id', braxId)
  await supabase.from('dancecard_share_links').insert({ account_id: braxId, token: DEMO_SHARE_TOKEN })

  const guestId = accountIds.sandboxfriend
  if (guestId) {
    const start = addMinutes(new Date(windowStart), 180)
    const end = addMinutes(start, 60)
    await supabase.from('dancecard_reservations').delete().eq('event_id', eventId).eq('host_account_id', braxId)
    await supabase.from('dancecard_reservations').insert({
      event_id: eventId,
      host_account_id: braxId,
      guest_account_id: guestId,
      starts_at: iso(start),
      ends_at: iso(end),
      status: 'confirmed',
      note: 'Demo: reserved via host share link',
    })
  }
}

async function seedIsoBoard(supabase, eventId, accountIds, slotRows) {
  const hostId = accountIds.brax ?? accountIds.sandboxfriend
  const otherId = accountIds.caseydemo ?? accountIds.riverdemo
  if (!hostId) return

  await supabase.from('dancecard_iso_posts').delete().eq('event_id', eventId)

  const { data: post, error } = await supabase
    .from('dancecard_iso_posts')
    .insert({
      event_id: eventId,
      account_id: hostId,
      title: 'Rope practice partner — Friday afternoon',
      body: 'Looking for someone for gentle rope practice before the party. Beginner-friendly.',
      tags: ['rope', 'practice'],
      visibility: 'public',
      contact_reveal: 'on_interest',
      contact_link: 'https://fetlife.com/example',
      status: 'active',
      curated_pin: true,
    })
    .select('id')
    .single()
  if (error) {
    console.warn('ISO seed skipped:', error.message)
    return
  }

  if (otherId) {
    await supabase.from('dancecard_iso_interests').insert({
      iso_post_id: post.id,
      from_account_id: otherId,
      status: 'pending',
    })
    await supabase.from('dancecard_iso_comments').insert({
      iso_post_id: post.id,
      account_id: otherId,
      body: 'Interested — I took Rope 101 earlier. Happy to connect!',
    })
  }

  await supabase.from('dancecard_iso_posts').insert({
    event_id: eventId,
    account_id: otherId ?? hostId,
    title: 'Dungeon monitor shadow shift',
    body: 'Offering to shadow a DM during Friday play party if staff needs coverage.',
    tags: ['volunteer', 'dungeon'],
    visibility: 'public',
    status: 'active',
  })

  const slot = slotRows[0]
  if (slot?.id) {
    await supabase.from('dancecard_iso_posts').insert({
      event_id: eventId,
      account_id: hostId,
      title: `Meetup after ${slot.title}`,
      body: 'Anyone want to debrief after opening circle?',
      tags: ['social'],
      visibility: 'public',
      status: 'active',
    })
  }
}

async function seedCompareExtras(supabase, eventId, accountIds, windowStart, windowEnd) {
  const brax = accountIds.brax
  const friend = accountIds.sandboxfriend
  const casey = accountIds.caseydemo
  if (!brax || !friend) return

  await supabase.from('dancecard_compare_requests').delete().eq('event_id', eventId)
  await supabase.from('dancecard_compare_requests').insert({
    event_id: eventId,
    from_account_id: friend,
    to_account_id: brax,
    status: 'pending',
    message: 'Would love to compare schedules for a rope date!',
  })

  if (casey) {
    await supabase.from('dancecard_compare_requests').insert({
      event_id: eventId,
      from_account_id: casey,
      to_account_id: brax,
      status: 'accepted',
      message: 'Compare accepted demo',
      responded_at: new Date().toISOString(),
    })
  }
}

async function seedSessionFeedback(supabase, eventId, accountIds, slotRows) {
  const acc = accountIds.sandboxfriend ?? accountIds.brax
  const slot = slotRows.find((s) => s.title === 'Opening circle') ?? slotRows[0]
  if (!acc || !slot?.id) return

  await supabase.from('dancecard_session_feedback').upsert({
    event_id: eventId,
    account_id: acc,
    program_slot_id: slot.id,
    rating: 5,
    comment: 'Great welcome — set the tone for the weekend.',
  })
}

async function seedSafetyAndSwaps(supabase, eventId, locByName, accountIds) {
  const dungeonLoc = locByName['Dungeon A']
  await supabase.from('dancecard_safety_incidents').delete().eq('event_id', eventId)
  await supabase.from('dancecard_safety_incidents').insert({
    event_id: eventId,
    location_id: dungeonLoc ?? null,
    location_label: 'Dungeon A',
    summary: 'Demo incident — resolved noise complaint during play party.',
    safety_notes: 'Spoke with parties; volume lowered. Closed same night.',
    status: 'closed',
  })

  const braxId = accountIds.brax
  const drewId = accountIds.drewvol
  const emeryId = accountIds.emerydm
  if (!braxId) return

  const { data: shifts } = await supabase
    .from('dancecard_staff_shifts')
    .select('id, role, starts_at, person_name, shift_status')
    .eq('event_id', eventId)
    .order('starts_at', { ascending: true })
  if ((shifts?.length ?? 0) < 4) return

  const byRole = (role) => shifts.find((s) => s.role === role) ?? shifts[0]
  const regDesk = shifts[0]
  const setupOpen = shifts.find((s) => s.shift_status === 'open') ?? shifts[1]
  const dmShift = byRole('dungeon monitor')
  const tearDown = shifts[shifts.length - 1]

  await supabase
    .from('dancecard_staff_shifts')
    .update({
      shift_status: 'assigned',
      claimed_by_account_id: braxId,
      person_name: 'Brax',
    })
    .eq('id', regDesk.id)

  if (drewId && setupOpen?.id !== regDesk.id) {
    await supabase
      .from('dancecard_staff_shifts')
      .update({
        shift_status: 'assigned',
        claimed_by_account_id: drewId,
        person_name: 'Drew Volunteer',
      })
      .eq('id', setupOpen.id)
  }

  if (emeryId && dmShift?.id) {
    await supabase
      .from('dancecard_staff_shifts')
      .update({
        shift_status: 'assigned',
        claimed_by_account_id: emeryId,
        person_name: 'Emery DM',
      })
      .eq('id', dmShift.id)
  }

  const openShift = shifts.find((s) => s.shift_status === 'open' && s.id !== setupOpen?.id) ?? shifts[3]

  await supabase.from('dancecard_shift_swap_requests').delete().eq('event_id', eventId)
  const swapRows = [
    {
      event_id: eventId,
      from_shift_id: regDesk.id,
      to_shift_id: openShift?.id ?? tearDown.id,
      requester_account_id: braxId,
      status: 'pending',
      note: 'Demo pending swap — Brax needs coverage for registration desk (Fri AM).',
    },
  ]
  if (emeryId && dmShift?.id && tearDown?.id && dmShift.id !== tearDown.id) {
    swapRows.push({
      event_id: eventId,
      from_shift_id: dmShift.id,
      to_shift_id: tearDown.id,
      requester_account_id: emeryId,
      status: 'approved',
      note: 'Demo approved swap — DM block traded for tear-down (already processed).',
    })
  }
  await supabase.from('dancecard_shift_swap_requests').insert(swapRows)
  console.log('  Shift swaps:', swapRows.length, '(pending + approved demos)')
}

async function seedScheduleNotifications(supabase, eventId, accountId, slotRows) {
  if (!accountId) return
  const slot = slotRows.find((s) => s.title === 'Rope 101') ?? slotRows[1]
  if (!slot?.id) return

  await supabase.from('dancecard_schedule_change_notifications').delete().eq('account_id', accountId)
  await supabase.from('dancecard_schedule_change_notifications').insert({
    event_id: eventId,
    account_id: accountId,
    program_slot_id: slot.id,
    status: 'unread',
    old_snapshot: { title: slot.title, starts_at: slot.starts_at },
    new_snapshot: { title: slot.title, message: 'Start time moved by 30 minutes (demo).' },
    conflict_summary: {},
  })
}

export function printSandboxDemoAccounts(baseUrl) {
  console.log('\n=== Quick demo links ===')
  console.log('  Staff unlock code (attendee): SANDBOX-STAFF')
  console.log('  Share URL (sign in as brax first):', `${baseUrl}/dancecard/sandbox/s/${DEMO_SHARE_TOKEN}`)
  console.log('  Shift swaps: organizer → People → Shift swaps | attendee staff → Availability tab')
  console.log('    (sign in as brax / drewvol / emerydm — brax has a pending swap request)')
}
