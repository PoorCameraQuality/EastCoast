import { NextResponse } from 'next/server'
import {
  assertOrganizerCanExport,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { csvEscape } from '@/lib/dancecard/organizerExportCsv'
import { fetchOrganizerProgramSlotsForEvent } from '@/lib/dancecard/organizerProgramSlotsData'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExport(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slots = await fetchOrganizerProgramSlotsForEvent(admin, eventId)
    const slotIds = slots.map((s) => s.id)
    const presentersBySlot: Record<string, string> = {}
    if (slotIds.length) {
      const { data: assigns } = await admin
        .from('dancecard_program_slot_persons')
        .select('slot_id, person_id, role')
        .in('slot_id', slotIds)
      const pids = Array.from(new Set((assigns ?? []).map((a) => a.person_id as string)))
      const nameById: Record<string, string> = {}
      if (pids.length) {
        const { data: people } = await admin
          .from('dancecard_persons')
          .select('id, scene_name')
          .in('id', pids)
          .eq('event_id', eventId)
        for (const p of people ?? []) nameById[p.id as string] = String(p.scene_name ?? '')
      }
      for (const a of assigns ?? []) {
        const sid = a.slot_id as string
        const nm = nameById[a.person_id as string] ?? ''
        const bit = `${nm} (${String(a.role ?? '')})`
        presentersBySlot[sid] = presentersBySlot[sid] ? `${presentersBySlot[sid]}; ${bit}` : bit
      }
    }

    const header = [
      'id',
      'startsAt',
      'endsAt',
      'title',
      'trackDisplay',
      'room',
      'locationName',
      'visibility',
      'isPublished',
      'isFrozen',
      'photoPolicy',
      'tagNames',
      'presentersAllRoles',
    ]
    const lines = [header.join(',')]
    for (const s of slots) {
      const tagStr = Array.isArray(s.tagNames) ? s.tagNames.join('; ') : ''
      lines.push(
        [
          csvEscape(String(s.id)),
          csvEscape(String(s.startsAt ?? '')),
          csvEscape(String(s.endsAt ?? '')),
          csvEscape(String(s.title ?? '')),
          csvEscape(String(s.trackName ?? s.track ?? '')),
          csvEscape(String(s.room ?? '')),
          csvEscape(String(s.locationName ?? '')),
          csvEscape(String(s.visibility ?? '')),
          csvEscape(s.isPublished ? 'true' : 'false'),
          csvEscape(s.isFrozen ? 'true' : 'false'),
          csvEscape(String(s.photoPolicy ?? '')),
          csvEscape(tagStr),
          csvEscape(presentersBySlot[s.id] ?? ''),
        ].join(','),
      )
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sessions-${context.params.eventSlug}.csv"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
