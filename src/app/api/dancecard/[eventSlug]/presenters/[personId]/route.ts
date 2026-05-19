import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { slotVisibleToAttendee } from '@/lib/dancecard/programSlotPublication'

export const dynamic = 'force-dynamic'

function publicDisplayName(row: {
  scene_name?: string | null
  legal_name?: string | null
  show_legal_name_on_public?: boolean | null
}): string {
  const showLegal = Boolean(row.show_legal_name_on_public)
  const legal = (row.legal_name as string | null) ?? ''
  const scene = String(row.scene_name ?? '')
  return showLegal && legal.trim() ? legal.trim() : scene
}

async function loadLocationNames(
  admin: SupabaseClient,
  eventId: string,
  locationIds: string[],
): Promise<Record<string, string>> {
  if (!locationIds.length) return {}
  const { data, error } = await admin
    .from('dancecard_locations')
    .select('id, name')
    .in('id', locationIds)
    .eq('event_id', eventId)
  if (error) throw error
  const out: Record<string, string> = {}
  for (const loc of data ?? []) out[loc.id as string] = String(loc.name)
  return out
}

export async function GET(request: NextRequest, context: { params: { eventSlug: string; personId: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const personId = context.params.personId
    const { data: person, error: personErr } = await admin
      .from('dancecard_persons')
      .select(
        'id, scene_name, legal_name, pronouns, public_bio, photo_url, show_legal_name_on_public',
      )
      .eq('id', personId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (personErr) throw personErr
    if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const session = await resolveAccountFromSession(admin, request, slug)
    const isStaff = Boolean(session?.isStaff)

    const { data: assigns, error: assignErr } = await admin
      .from('dancecard_program_slot_persons')
      .select('slot_id, role, sort_order')
      .eq('person_id', personId)
      .eq('is_public_on_schedule', true)
      .order('sort_order', { ascending: true })
    if (assignErr) throw assignErr

    const slotIds = Array.from(new Set((assigns ?? []).map((a) => a.slot_id as string)))
    const roleBySlot = new Map((assigns ?? []).map((a) => [a.slot_id as string, String(a.role ?? '')]))

    let sessions: {
      id: string
      title: string
      startsAt: string
      endsAt: string
      role: string
      trackDisplay: string | null
      locationName: string | null
    }[] = []

    if (slotIds.length) {
      const { data: slots, error: slotsErr } = await admin
        .from('dancecard_program_slots')
        .select(
          'id, title, starts_at, ends_at, track, room, location_id, track_id, is_published, visibility, is_frozen',
        )
        .in('id', slotIds)
        .eq('event_id', event.id)
      if (slotsErr) throw slotsErr

      const trackIds = Array.from(
        new Set((slots ?? []).map((s) => s.track_id as string | null).filter(Boolean)),
      ) as string[]
      const trackNameById: Record<string, string> = {}
      if (trackIds.length) {
        const { data: tracks, error: trackErr } = await admin
          .from('dancecard_tracks')
          .select('id, name')
          .in('id', trackIds)
          .eq('event_id', event.id)
        if (trackErr) throw trackErr
        for (const t of tracks ?? []) trackNameById[t.id as string] = String(t.name)
      }

      const locationIds = Array.from(
        new Set((slots ?? []).map((s) => s.location_id as string | null).filter(Boolean)),
      ) as string[]
      const locNameById = await loadLocationNames(admin, event.id, locationIds)

      sessions = (slots ?? [])
        .filter((s) => s.starts_at != null && s.ends_at != null)
        .filter((s) =>
          slotVisibleToAttendee(
            {
              is_published: s.is_published !== undefined ? Boolean(s.is_published) : true,
              visibility: (s.visibility as string) || 'public',
              is_frozen: Boolean(s.is_frozen),
            },
            isStaff,
          ),
        )
        .map((s) => {
          const trackName = s.track_id ? trackNameById[s.track_id as string] ?? null : null
          const locId = (s.location_id as string | null) ?? null
          return {
            id: s.id as string,
            title: s.title as string,
            startsAt: s.starts_at as string,
            endsAt: s.ends_at as string,
            role: roleBySlot.get(s.id as string) ?? '',
            trackDisplay: trackName ?? ((s.track as string | null) ?? null),
            locationName: locId ? locNameById[locId] ?? null : ((s.room as string | null) ?? null),
          }
        })
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    }

    const hasPublicPresence = sessions.length > 0
    if (!hasPublicPresence) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      presenter: {
        personId,
        sceneName: publicDisplayName(person),
        pronouns: (person.pronouns as string | null) ?? null,
        publicBio: (person.public_bio as string | null) ?? null,
        photoUrl: (person.photo_url as string | null) ?? null,
        sessions,
      },
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-presenter-profile')
  }
}
