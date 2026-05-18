import type { SupabaseClient } from '@supabase/supabase-js'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'

export type CloneDomains = {
  settings: boolean
  locations: boolean
  tracksTags: boolean
  program: boolean
  staffShifts: boolean
  dmRequirements: boolean
  messageTemplates: boolean
  policyDocuments: boolean
}

function shiftIso(iso: string | null | undefined, ms: number): string | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  return new Date(t + ms).toISOString()
}

async function rollbackNewEvent(admin: SupabaseClient, newEventId: string) {
  const { error } = await admin.from('dancecard_events').delete().eq('id', newEventId)
  if (error) console.error('[clone rollback]', error.message)
}

/**
 * Deep-clone a Dancecard event into a new slug with optional domain selection and time shift.
 * Deletes the new event row on failure (CASCADE cleans partial children).
 */
export async function cloneDancecardEvent(
  admin: SupabaseClient,
  opts: {
    sourceEventId: string
    newSlug: string
    newEventTitle: string
    productTitle?: string
    shiftMs: number
    domains: CloneDomains
    newOwnerUserId: string
    actorUserId: string
  },
): Promise<{ newEventId: string }> {
  const { sourceEventId, newSlug, newEventTitle, shiftMs, domains, newOwnerUserId, actorUserId } = opts

  const { data: srcEv, error: srcErr } = await admin.from('dancecard_events').select('*').eq('id', sourceEventId).single()
  if (srcErr || !srcEv) throw new Error('BAD_REQUEST: Source event not found')

  const s = srcEv as Record<string, unknown>
  const ws = shiftIso(s.window_starts_at as string, shiftMs)
  const we = shiftIso(s.window_ends_at as string, shiftMs)
  if (!ws || !we) throw new Error('BAD_REQUEST: Invalid source event window')

  const insertEvent: Record<string, unknown> = {
    slug: newSlug,
    product_title: (opts.productTitle as string | undefined) ?? (s.product_title as string),
    event_title: newEventTitle,
    subtitle: s.subtitle ?? null,
    timezone: s.timezone as string,
    window_starts_at: ws,
    window_ends_at: we,
    shared_by_label: s.shared_by_label as string,
    shared_by_detail: s.shared_by_detail ?? null,
    logo_url: s.logo_url ?? null,
    status: 'draft',
    staff_access_code: null,
    registration_access_code: null,
    badge_layout_json: s.badge_layout_json ?? {},
  }

  const { data: newEv, error: insEvErr } = await admin.from('dancecard_events').insert(insertEvent).select('id').single()
  if (insEvErr || !newEv) throw insEvErr ?? new Error('Could not create event')
  const newEventId = (newEv as { id: string }).id

  try {
    const { error: orgErr } = await admin.from('dancecard_event_organizers').insert({
      event_id: newEventId,
      user_id: newOwnerUserId,
      role: 'owner',
    })
    if (orgErr) throw orgErr

    const categoryMap = new Map<string, string>()

    if (domains.settings) {
      const { data: cats, error: cErr } = await admin
        .from('dancecard_registration_categories')
        .select('*')
        .eq('event_id', sourceEventId)
      if (cErr) throw cErr
      for (const c of cats ?? []) {
        const row = c as Record<string, unknown>
        const { id: _id, event_id: _e, ...rest } = row
        const { data: ins, error } = await admin
          .from('dancecard_registration_categories')
          .insert({ ...rest, event_id: newEventId })
          .select('id')
          .single()
        if (error || !ins) throw error ?? new Error('category insert')
        categoryMap.set(row.id as string, (ins as { id: string }).id)
      }

      const { data: form, error: fErr } = await admin
        .from('dancecard_registration_forms')
        .select('*')
        .eq('event_id', sourceEventId)
        .maybeSingle()
      if (fErr) throw fErr
      if (form) {
        const fr = form as Record<string, unknown>
        const { id: _fid, event_id: _fe, ...frest } = fr
        const { data: nf, error: nfErr } = await admin
          .from('dancecard_registration_forms')
          .insert({ ...frest, event_id: newEventId })
          .select('id')
          .single()
        if (nfErr || !nf) throw nfErr ?? new Error('form insert')
        const formId = (nf as { id: string }).id

        const { data: qs, error: qErr } = await admin
          .from('dancecard_registration_questions')
          .select('*')
          .eq('form_id', fr.id as string)
        if (qErr) throw qErr
        for (const q of qs ?? []) {
          const qr = q as Record<string, unknown>
          const { id: _qid, form_id: _qf, ...qrest } = qr
          const { error: qiErr } = await admin.from('dancecard_registration_questions').insert({ ...qrest, form_id: formId })
          if (qiErr) throw qiErr
        }
      }
    }

    const trackMap = new Map<string, string>()
    const tagMap = new Map<string, string>()
    if (domains.tracksTags) {
      const { data: tracks, error: tErr } = await admin.from('dancecard_tracks').select('*').eq('event_id', sourceEventId)
      if (tErr) throw tErr
      for (const t of tracks ?? []) {
        const tr = t as Record<string, unknown>
        const { id: oid, event_id: _e, ...rest } = tr
        const { data: ins, error } = await admin.from('dancecard_tracks').insert({ ...rest, event_id: newEventId }).select('id').single()
        if (error || !ins) throw error ?? new Error('track insert')
        trackMap.set(oid as string, (ins as { id: string }).id)
      }
      const { data: tags, error: tgErr } = await admin.from('dancecard_tags').select('*').eq('event_id', sourceEventId)
      if (tgErr) throw tgErr
      for (const tg of tags ?? []) {
        const row = tg as Record<string, unknown>
        const { id: oid, event_id: _e, ...rest } = row
        const { data: ins, error } = await admin.from('dancecard_tags').insert({ ...rest, event_id: newEventId }).select('id').single()
        if (error || !ins) throw error ?? new Error('tag insert')
        tagMap.set(oid as string, (ins as { id: string }).id)
      }
    }

    const locationMap = new Map<string, string>()
    const mapMap = new Map<string, string>()
    if (domains.locations) {
      const { data: locs, error: lErr } = await admin.from('dancecard_locations').select('*').eq('event_id', sourceEventId)
      if (lErr) throw lErr
      const list = (locs ?? []) as Record<string, unknown>[]
      let pending = [...list]
      while (pending.length) {
        const next: Record<string, unknown>[] = []
        let progressed = false
        for (const row of pending) {
          const pid = row.parent_id as string | null
          if (pid && !locationMap.has(pid)) {
            next.push(row)
            continue
          }
          const { id: oid, event_id: _e, parent_id, ...rest } = row
          const newParent = parent_id ? locationMap.get(parent_id as string) ?? null : null
          const { data: ins, error } = await admin
            .from('dancecard_locations')
            .insert({
              ...rest,
              event_id: newEventId,
              parent_id: newParent,
            })
            .select('id')
            .single()
          if (error || !ins) throw error ?? new Error('location insert')
          locationMap.set(oid as string, (ins as { id: string }).id)
          progressed = true
        }
        if (!progressed) throw new Error('BAD_REQUEST: Could not resolve location parent chain')
        pending = next
      }

      const { data: maps, error: mErr } = await admin.from('dancecard_event_maps').select('*').eq('event_id', sourceEventId)
      if (mErr) throw mErr
      for (const m of maps ?? []) {
        const mr = m as Record<string, unknown>
        const { id: oid, event_id: _e, ...rest } = mr
        const { data: ins, error } = await admin
          .from('dancecard_event_maps')
          .insert({ ...rest, event_id: newEventId })
          .select('id')
          .single()
        if (error || !ins) throw error ?? new Error('map insert')
        mapMap.set(oid as string, (ins as { id: string }).id)
      }

      const oldMapIds = Array.from(mapMap.keys())
      if (oldMapIds.length > 0) {
        const { data: pins, error: pErr } = await admin.from('dancecard_map_pins').select('*').in('map_id', oldMapIds)
        if (pErr) throw pErr
        for (const pin of (pins ?? []) as Record<string, unknown>[]) {
          const oldMapId = pin.map_id as string
          const newMapId = mapMap.get(oldMapId)
          const newLoc = locationMap.get(pin.location_id as string)
          if (!newMapId || !newLoc) continue
          const { id: _i, map_id: _m, location_id, ...prest } = pin
          const { error: piErr } = await admin.from('dancecard_map_pins').insert({
            ...prest,
            map_id: newMapId,
            location_id: newLoc,
          })
          if (piErr) throw piErr
        }
      }
    }

    const personMap = new Map<string, string>()
    let oldPersonIds: string[] = []
    if (domains.program) {
      const { data: people, error: pplErr } = await admin.from('dancecard_persons').select('*').eq('event_id', sourceEventId)
      if (pplErr) throw pplErr
      for (const p of people ?? []) {
        const pr = p as Record<string, unknown>
        const { id: oid, event_id: _e, ...rest } = pr
        const { data: ins, error } = await admin.from('dancecard_persons').insert({ ...rest, event_id: newEventId }).select('id').single()
        if (error || !ins) throw error ?? new Error('person insert')
        personMap.set(oid as string, (ins as { id: string }).id)
      }
      oldPersonIds = Array.from(personMap.keys())

      if (oldPersonIds.length > 0) {
        const { data: pra, error: praErr } = await admin
          .from('dancecard_person_role_assignments')
          .select('*')
          .in('person_id', oldPersonIds)
        if (praErr) throw praErr
        for (const a of pra ?? []) {
          const ar = a as Record<string, unknown>
          const newPid = personMap.get(ar.person_id as string)
          if (!newPid) continue
          const { id: _i, person_id, starts_at, ends_at, ...arest } = ar
          const { error: aiErr } = await admin.from('dancecard_person_role_assignments').insert({
            ...arest,
            person_id: newPid,
            starts_at: shiftIso(starts_at as string | null, shiftMs),
            ends_at: shiftIso(ends_at as string | null, shiftMs),
          })
          if (aiErr) throw aiErr
        }
      }

      if (oldPersonIds.length > 0 && tagMap.size > 0) {
        const { data: ptags, error: ptErr } = await admin.from('dancecard_person_tags').select('*').in('person_id', oldPersonIds)
        if (ptErr) throw ptErr
        for (const t of ptags ?? []) {
          const tr = t as Record<string, unknown>
          const newPid = personMap.get(tr.person_id as string)
          const newTid = tagMap.get(tr.tag_id as string)
          if (!newPid || !newTid) continue
          const { person_id: _p, tag_id: _tg, ...trest } = tr
          const { error: tiErr } = await admin.from('dancecard_person_tags').insert({
            ...trest,
            person_id: newPid,
            tag_id: newTid,
          })
          if (tiErr) throw tiErr
        }
      }

      const { data: slots, error: sErr } = await admin.from('dancecard_program_slots').select('*').eq('event_id', sourceEventId)
      if (sErr) throw sErr
      const slotMap = new Map<string, string>()
      for (const slot of slots ?? []) {
        const sl = slot as Record<string, unknown>
        const { id: oid, event_id: _e, starts_at, ends_at, track_id, location_id, ...srest } = sl
        const { data: ins, error } = await admin
          .from('dancecard_program_slots')
          .insert({
            ...srest,
            event_id: newEventId,
            starts_at: shiftIso(starts_at as string, shiftMs),
            ends_at: shiftIso(ends_at as string, shiftMs),
            track_id: track_id ? trackMap.get(track_id as string) ?? null : null,
            location_id: location_id ? locationMap.get(location_id as string) ?? null : null,
          })
          .select('id')
          .single()
        if (error || !ins) throw error ?? new Error('slot insert')
        slotMap.set(oid as string, (ins as { id: string }).id)
      }

      const oldSlotIds = Array.from(slotMap.keys())
      if (oldSlotIds.length > 0 && tagMap.size > 0) {
        const { data: stags, error: stErr } = await admin.from('dancecard_program_slot_tags').select('*').in('slot_id', oldSlotIds)
        if (stErr) throw stErr
        for (const st of stags ?? []) {
          const row = st as Record<string, unknown>
          const ns = slotMap.get(row.slot_id as string)
          const nt = tagMap.get(row.tag_id as string)
          if (!ns || !nt) continue
          const { slot_id: _s, tag_id: _t, ...rest } = row
          const { error: xErr } = await admin.from('dancecard_program_slot_tags').insert({
            ...rest,
            slot_id: ns,
            tag_id: nt,
          })
          if (xErr) throw xErr
        }
      }

      if (oldSlotIds.length > 0 && personMap.size > 0) {
        const { data: sppl, error: spErr } = await admin.from('dancecard_program_slot_persons').select('*').in('slot_id', oldSlotIds)
        if (spErr) throw spErr
        for (const sp of sppl ?? []) {
          const row = sp as Record<string, unknown>
          const ns = slotMap.get(row.slot_id as string)
          const np = personMap.get(row.person_id as string)
          if (!ns || !np) continue
          const { id: _i, slot_id: _s, person_id: _p, ...rest } = row
          const { error: xErr } = await admin.from('dancecard_program_slot_persons').insert({
            ...rest,
            slot_id: ns,
            person_id: np,
          })
          if (xErr) throw xErr
        }
      }
    }

    if (domains.staffShifts) {
      const { data: shifts, error: shErr } = await admin.from('dancecard_staff_shifts').select('*').eq('event_id', sourceEventId)
      if (shErr) throw shErr
      for (const sh of shifts ?? []) {
        const row = sh as Record<string, unknown>
        const {
          id: _i,
          event_id: _e,
          starts_at,
          ends_at,
          location_id,
          person_id,
          claimed_by_account_id: _c,
          ...rest
        } = row
        const { error } = await admin.from('dancecard_staff_shifts').insert({
          ...rest,
          event_id: newEventId,
          starts_at: shiftIso(starts_at as string, shiftMs),
          ends_at: shiftIso(ends_at as string, shiftMs),
          location_id: location_id ? locationMap.get(location_id as string) ?? null : null,
          person_id: person_id ? personMap.get(person_id as string) ?? null : null,
          claimed_by_account_id: null,
        })
        if (error) throw error
      }
    }

    if (domains.dmRequirements) {
      const { data: dms, error: dErr } = await admin.from('dancecard_event_dm_requirements').select('*').eq('event_id', sourceEventId)
      if (dErr) throw dErr
      for (const d of dms ?? []) {
        const row = d as Record<string, unknown>
        const { id: _i, event_id: _e, starts_at, ends_at, location_id, ...rest } = row
        const { error } = await admin.from('dancecard_event_dm_requirements').insert({
          ...rest,
          event_id: newEventId,
          starts_at: shiftIso(starts_at as string, shiftMs),
          ends_at: shiftIso(ends_at as string, shiftMs),
          location_id: location_id ? locationMap.get(location_id as string) ?? null : null,
        })
        if (error) throw error
      }
    }

    if (domains.messageTemplates) {
      const { data: mt, error: mtErr } = await admin.from('dancecard_message_templates').select('*').eq('event_id', sourceEventId)
      if (mtErr) throw mtErr
      for (const m of mt ?? []) {
        const row = m as Record<string, unknown>
        const { id: _i, event_id: _e, ...rest } = row
        const { error } = await admin.from('dancecard_message_templates').insert({ ...rest, event_id: newEventId })
        if (error) throw error
      }
    }

    if (domains.policyDocuments) {
      const { data: pol, error: polErr } = await admin.from('dancecard_policy_documents').select('*').eq('event_id', sourceEventId)
      if (polErr) throw polErr
      for (const p of pol ?? []) {
        const row = p as Record<string, unknown>
        const { id: _i, event_id: _e, ...rest } = row
        const { error } = await admin.from('dancecard_policy_documents').insert({ ...rest, event_id: newEventId })
        if (error) throw error
      }
    }

    await insertDancecardAuditLog(admin, {
      actorUserId,
      eventId: newEventId,
      action: 'event.clone',
      metadata: { sourceEventId, domains },
    })

    return { newEventId }
  } catch (e) {
    await rollbackNewEvent(admin, newEventId)
    throw e
  }
}
