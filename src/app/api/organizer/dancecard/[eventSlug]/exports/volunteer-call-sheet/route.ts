import { NextResponse } from 'next/server'
import {
  assertOrganizerCanExport,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { csvEscape } from '@/lib/dancecard/organizerExportCsv'
import { mapStaffShiftRow } from '@/lib/dancecard/organizerStaffShiftDto'
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
    const { data: rows, error } = await admin
      .from('dancecard_staff_shifts')
      .select(
        'id, person_name, person_id, role, location_id, starts_at, ends_at, sort_order, shift_status, claimed_by_account_id, organizer_notes_staff_only, dropped_at',
      )
      .eq('event_id', eventId)
      .order('starts_at', { ascending: true })
    if (error) throw error
    const locIds = Array.from(
      new Set((rows ?? []).map((r) => r.location_id as string | null).filter(Boolean)),
    ) as string[]
    const locName: Record<string, string> = {}
    if (locIds.length) {
      const { data: locs } = await admin.from('dancecard_locations').select('id,name').in('id', locIds)
      for (const l of locs ?? []) locName[l.id as string] = String(l.name)
    }
    const header = [
      'id',
      'personName',
      'role',
      'locationName',
      'startsAt',
      'endsAt',
      'shiftStatus',
      'organizerNotesStaffOnly',
    ]
    const lines = [header.join(',')]
    for (const r of rows ?? []) {
      const dto = mapStaffShiftRow(r as Record<string, unknown>)
      const loc = dto.locationId ? locName[dto.locationId] ?? '' : ''
      lines.push(
        [
          csvEscape(dto.id),
          csvEscape(dto.personName),
          csvEscape(dto.role),
          csvEscape(loc),
          csvEscape(dto.startsAt),
          csvEscape(dto.endsAt),
          csvEscape(dto.shiftStatus),
          csvEscape(dto.organizerNotesStaffOnly ?? ''),
        ].join(','),
      )
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="volunteer-call-sheet-${context.params.eventSlug}.csv"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
