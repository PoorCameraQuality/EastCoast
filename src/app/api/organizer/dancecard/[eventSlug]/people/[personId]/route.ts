import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPersonPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { replacePersonTagsForEvent } from '@/lib/dancecard/organizerPersonTags'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function mapPersonRow(r: Record<string, unknown>) {
  return {
    id: r.id as string,
    sceneName: r.scene_name as string,
    legalName: (r.legal_name as string | null) ?? null,
    pronouns: (r.pronouns as string | null) ?? null,
    email: (r.email as string | null) ?? null,
    phone: (r.phone as string | null) ?? null,
    publicBio: (r.public_bio as string | null) ?? null,
    internalNotes: (r.internal_notes as string | null) ?? null,
    photoUrl: (r.photo_url as string | null) ?? null,
    showLegalNameOnPublic: Boolean(r.show_legal_name_on_public),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

async function loadPersonTagIds(admin: SupabaseClient, personId: string): Promise<string[]> {
  const { data, error } = await admin.from('dancecard_person_tags').select('tag_id').eq('person_id', personId)
  if (error) throw error
  return (data ?? []).map((r) => r.tag_id as string)
}

type PersonProgramSlot = {
  id: string
  title: string
  startsAt: string | null
  endsAt: string | null
  role: string
  locationName: string | null
  trackDisplay: string | null
}

async function loadPersonProgramSlots(
  admin: SupabaseClient,
  eventId: string,
  personId: string,
): Promise<PersonProgramSlot[]> {
  const { data: assigns, error: assignErr } = await admin
    .from('dancecard_program_slot_persons')
    .select('slot_id, role, sort_order')
    .eq('person_id', personId)
    .order('sort_order', { ascending: true })
  if (assignErr) throw assignErr
  const slotIds = Array.from(new Set((assigns ?? []).map((a) => a.slot_id as string)))
  if (!slotIds.length) return []

  const roleBySlot = new Map((assigns ?? []).map((a) => [a.slot_id as string, String(a.role ?? '')]))

  const { data: slots, error: slotsErr } = await admin
    .from('dancecard_program_slots')
    .select('id, title, starts_at, ends_at, track, room, location_id, track_id')
    .in('id', slotIds)
    .eq('event_id', eventId)
  if (slotsErr) throw slotsErr

  const trackIds = Array.from(new Set((slots ?? []).map((s) => s.track_id as string | null).filter(Boolean))) as string[]
  const trackNameById: Record<string, string> = {}
  if (trackIds.length) {
    const { data: tracks, error: trackErr } = await admin
      .from('dancecard_tracks')
      .select('id, name')
      .in('id', trackIds)
      .eq('event_id', eventId)
    if (trackErr) throw trackErr
    for (const t of tracks ?? []) trackNameById[t.id as string] = String(t.name)
  }

  const locationIds = Array.from(
    new Set((slots ?? []).map((s) => s.location_id as string | null).filter(Boolean)),
  ) as string[]
  const locNameById: Record<string, string> = {}
  if (locationIds.length) {
    const { data: locs, error: locErr } = await admin
      .from('dancecard_locations')
      .select('id, name')
      .in('id', locationIds)
      .eq('event_id', eventId)
    if (locErr) throw locErr
    for (const loc of locs ?? []) locNameById[loc.id as string] = String(loc.name)
  }

  return (slots ?? [])
    .map((s) => {
      const locId = (s.location_id as string | null) ?? null
      const trackName = s.track_id ? trackNameById[s.track_id as string] ?? null : null
      return {
        id: s.id as string,
        title: s.title as string,
        startsAt: (s.starts_at as string | null) ?? null,
        endsAt: (s.ends_at as string | null) ?? null,
        role: roleBySlot.get(s.id as string) ?? '',
        locationName: locId ? locNameById[locId] ?? null : ((s.room as string | null) ?? null),
        trackDisplay: trackName ?? ((s.track as string | null) ?? null),
      }
    })
    .sort((a, b) => {
      const aStart = a.startsAt ?? ''
      const bStart = b.startsAt ?? ''
      return aStart.localeCompare(bStart)
    })
}

async function loadLinkedRegistrant(
  admin: SupabaseClient,
  eventId: string,
  personId: string,
): Promise<{ id: string; sceneDisplayName: string; status: string; categoryName: string | null } | null> {
  const { data: row, error } = await admin
    .from('dancecard_registrants')
    .select('id, scene_display_name, status, category_id')
    .eq('event_id', eventId)
    .eq('person_id', personId)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!row) return null

  let categoryName: string | null = null
  if (row.category_id) {
    const { data: cat } = await admin
      .from('dancecard_registration_categories')
      .select('name')
      .eq('id', row.category_id as string)
      .maybeSingle()
    categoryName = (cat?.name as string | null) ?? null
  }

  return {
    id: row.id as string,
    sceneDisplayName: String(row.scene_display_name ?? ''),
    status: String(row.status ?? ''),
    categoryName,
  }
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { data: row, error } = await admin
      .from('dancecard_persons')
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .eq('id', personId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const tagIds = await loadPersonTagIds(admin, personId)
    const [programSlots, registrant] = await Promise.all([
      loadPersonProgramSlots(admin, eventId, personId),
      loadLinkedRegistrant(admin, eventId, personId),
    ])
    return NextResponse.json({
      person: { ...mapPersonRow(row as Record<string, unknown>), tagIds },
      programSlots,
      registrant,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { data: existing, error: exErr } = await admin
      .from('dancecard_persons')
      .select('id')
      .eq('id', personId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (exErr) throw exErr
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = organizerPersonPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.sceneName !== undefined) patch.scene_name = body.sceneName.trim()
    if (body.legalName !== undefined) patch.legal_name = body.legalName
    if (body.pronouns !== undefined) patch.pronouns = body.pronouns
    if (body.email !== undefined) patch.email = body.email === '' ? null : body.email
    if (body.phone !== undefined) patch.phone = body.phone
    if (body.publicBio !== undefined) patch.public_bio = body.publicBio
    if (body.internalNotes !== undefined) patch.internal_notes = body.internalNotes
    if (body.photoUrl !== undefined) patch.photo_url = body.photoUrl
    if (body.showLegalNameOnPublic !== undefined) patch.show_legal_name_on_public = body.showLegalNameOnPublic

    const { data: row, error } = await admin
      .from('dancecard_persons')
      .update(patch)
      .eq('id', personId)
      .eq('event_id', eventId)
      .select(
        'id, scene_name, legal_name, pronouns, email, phone, public_bio, internal_notes, photo_url, show_legal_name_on_public, created_at, updated_at',
      )
      .single()
    if (error) throw error
    if (body.tagIds !== undefined) {
      await replacePersonTagsForEvent(admin, eventId, personId, body.tagIds)
    }
    const tagIds = await loadPersonTagIds(admin, personId)
    return NextResponse.json({ person: { ...mapPersonRow(row as Record<string, unknown>), tagIds } })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const personId = context.params.personId
    const { error } = await admin.from('dancecard_persons').delete().eq('id', personId).eq('event_id', eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
