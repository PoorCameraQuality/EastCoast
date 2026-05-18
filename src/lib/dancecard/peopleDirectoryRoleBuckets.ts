import type { SupabaseClient } from '@supabase/supabase-js'

export type PeopleRoleBucket = 'presenter' | 'staff' | 'photographer' | 'registered' | 'attendee'

const PRESENTER_ROLES = new Set(['lead_presenter', 'co_presenter'])
const STAFF_SLOT_ROLES = new Set(['staff', 'volunteer', 'dm', 'moderator'])

function addBucket(map: Map<string, Set<PeopleRoleBucket>>, personId: string, bucket: PeopleRoleBucket) {
  let set = map.get(personId)
  if (!set) {
    set = new Set()
    map.set(personId, set)
  }
  set.add(bucket)
}

/** Derive directory filter buckets per person for an event (read-only). */
export async function loadPeopleRoleBuckets(
  admin: SupabaseClient,
  eventId: string,
  people: { id: string; sceneName: string; email: string | null }[],
): Promise<Record<string, PeopleRoleBucket[]>> {
  const map = new Map<string, Set<PeopleRoleBucket>>()

  const { data: slots } = await admin.from('dancecard_program_slots').select('id').eq('event_id', eventId)
  const slotIds = (slots ?? []).map((s) => s.id as string)

  if (slotIds.length) {
    const { data: assigns } = await admin
      .from('dancecard_program_slot_persons')
      .select('person_id, role')
      .in('slot_id', slotIds)
    for (const a of assigns ?? []) {
      const pid = a.person_id as string
      const role = String(a.role ?? '')
      if (PRESENTER_ROLES.has(role)) addBucket(map, pid, 'presenter')
      else if (role === 'photographer') addBucket(map, pid, 'photographer')
      else if (STAFF_SLOT_ROLES.has(role)) addBucket(map, pid, 'staff')
    }
  }

  const { data: staffRows } = await admin
    .from('dancecard_staff_shifts')
    .select('person_id, person_name, role')
    .eq('event_id', eventId)
  const sceneNameToId = new Map<string, string>()
  for (const p of people) {
    sceneNameToId.set(p.sceneName.trim().toLowerCase(), p.id)
  }
  for (const s of staffRows ?? []) {
    const pid = (s.person_id as string | null) ?? null
    if (pid) addBucket(map, pid, 'staff')
    else {
      const nm = String(s.person_name ?? '').trim().toLowerCase()
      const matchedId = sceneNameToId.get(nm)
      if (matchedId) addBucket(map, matchedId, 'staff')
    }
  }

  const { data: regRows } = await admin
    .from('dancecard_registrants')
    .select('person_id, email')
    .eq('event_id', eventId)
  const emailToPersonId = new Map<string, string>()
  for (const p of people) {
    if (p.email) emailToPersonId.set(p.email.trim().toLowerCase(), p.id)
  }
  for (const r of regRows ?? []) {
    const pid = (r.person_id as string | null) ?? null
    if (pid) {
      addBucket(map, pid, 'registered')
    } else {
      const em = (r.email as string | null)?.trim().toLowerCase()
      if (em && emailToPersonId.has(em)) addBucket(map, emailToPersonId.get(em)!, 'registered')
    }
  }

  for (const p of people) {
    const buckets = map.get(p.id) ?? new Set<PeopleRoleBucket>()
    if (buckets.has('registered') && !buckets.has('presenter') && !buckets.has('staff') && !buckets.has('photographer')) {
      buckets.add('attendee')
    }
  }

  const out: Record<string, PeopleRoleBucket[]> = {}
  for (const id of Array.from(map.keys())) {
    out[id] = Array.from(map.get(id)!)
  }
  return out
}
