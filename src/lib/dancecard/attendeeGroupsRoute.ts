import type { NextRequest } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import {
  getDancecardAdmin,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'

export async function loadAttendeeGroupsContext(request: NextRequest, eventSlug: string) {
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)
  const event = await loadEventBySlug(admin, slug)
  if (!event) return null
  const modules = await getEventEntitlements(admin, event.id)
  assertModuleEnabled(modules, 'attendee_groups')
  const session = await resolveAccountFromSession(admin, request, slug)
  return { admin, slug, event, modules, session }
}

export async function loadGroupForEvent(
  admin: SupabaseClient,
  groupId: string,
  eventId: string,
) {
  const { data, error } = await admin
    .from('dancecard_attendee_groups')
    .select('*')
    .eq('id', groupId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (error) {
    if ((error as { code?: string }).code === '42P01') return { group: null, missingMigration: true }
    throw error
  }
  return { group: data, missingMigration: false }
}
