import type { SupabaseClient } from '@supabase/supabase-js'
import type { OrganizerHubEventRow } from '@/lib/dancecard/organizerAuth'

export type OrganizerHubEventWithStats = OrganizerHubEventRow & {
  programSlotCount: number
  publishedSlotCount: number
}

/** Batch program counts for hub event rows (one query). */
export async function enrichHubEventsWithProgramStats(
  admin: SupabaseClient,
  events: OrganizerHubEventRow[],
): Promise<OrganizerHubEventWithStats[]> {
  if (events.length === 0) return []

  const slugs = events.map((e) => e.slug)
  const { data: eventRows, error: evErr } = await admin
    .from('dancecard_events')
    .select('id, slug')
    .in('slug', slugs)
  if (evErr) throw evErr

  const idBySlug = new Map((eventRows ?? []).map((r) => [String(r.slug).toLowerCase(), r.id as string]))
  const eventIds = Array.from(idBySlug.values())
  if (eventIds.length === 0) {
    return events.map((e) => ({ ...e, programSlotCount: 0, publishedSlotCount: 0 }))
  }

  const { data: slots, error: slotErr } = await admin
    .from('dancecard_program_slots')
    .select('event_id, is_published')
    .in('event_id', eventIds)
  if (slotErr) throw slotErr

  const totalByEvent = new Map<string, number>()
  const publishedByEvent = new Map<string, number>()
  for (const s of slots ?? []) {
    const eid = s.event_id as string
    totalByEvent.set(eid, (totalByEvent.get(eid) ?? 0) + 1)
    if ((s as { is_published?: boolean }).is_published) {
      publishedByEvent.set(eid, (publishedByEvent.get(eid) ?? 0) + 1)
    }
  }

  return events.map((e) => {
    const eid = idBySlug.get(e.slug.toLowerCase())
    return {
      ...e,
      programSlotCount: eid ? (totalByEvent.get(eid) ?? 0) : 0,
      publishedSlotCount: eid ? (publishedByEvent.get(eid) ?? 0) : 0,
    }
  })
}
