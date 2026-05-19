import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import {
  buildSlotSnapshots,
  formatScheduleChangeMessage,
  formatScheduleChangeSummary,
  scheduleFieldsChanged,
} from '@/lib/dancecard/scheduleChangeImpact'

export const dynamic = 'force-dynamic'

type ImportRow = {
  id: string
  kind: 'program' | 'staff'
  action: string
  draft_status: string
  source_ref_id: string | null
  title: string | null
  person_name: string | null
  role: string | null
  track: string | null
  room: string | null
  location_id: string | null
  starts_at: string | null
  ends_at: string | null
  description: string | null
  sort_order: number
}

function snapshotToJson(s: {
  title: string
  startsAt: string | null
  endsAt: string | null
  room: string | null
  locationId: string | null
  locationName: string | null
}): Record<string, unknown> {
  return {
    title: s.title,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    room: s.room,
    locationId: s.locationId,
    locationName: s.locationName,
  }
}

export async function POST(
  _request: NextRequest,
  context: { params: { eventSlug: string; batchId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, userId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    const timezone = event?.timezone ?? 'America/New_York'
    const { data: batch, error: batchErr } = await admin
      .from('dancecard_import_batches')
      .select('id, kind, status')
      .eq('id', context.params.batchId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (batchErr) throw batchErr
    if (!batch) return NextResponse.json({ error: 'Import batch not found' }, { status: 404 })
    if (batch.status === 'published') return NextResponse.json({ error: 'Batch already published' }, { status: 400 })

    const { data: rowsRaw, error: rowsErr } = await admin
      .from('dancecard_import_rows')
      .select('*')
      .eq('batch_id', context.params.batchId)
      .eq('event_id', eventId)
      .neq('action', 'ignore')
      .neq('draft_status', 'invalid')
      .order('sort_order', { ascending: true })
    if (rowsErr) throw rowsErr
    const rows = (rowsRaw ?? []) as ImportRow[]

    let added = 0
    let updated = 0
    let skipped = 0
    let notified = 0

    for (const row of rows) {
      if (!row.starts_at || !row.ends_at) {
        skipped++
        continue
      }
      if (row.kind === 'program') {
        if (!row.title) {
          skipped++
          continue
        }
        const payload = {
          event_id: eventId,
          starts_at: new Date(row.starts_at).toISOString(),
          ends_at: new Date(row.ends_at).toISOString(),
          title: row.title,
          track: row.track,
          room: row.room,
          location_id: row.location_id,
          description: row.description,
          sort_order: row.sort_order,
        }
        if (row.action === 'update' && row.source_ref_id) {
          const { data: oldSlot } = await admin
            .from('dancecard_program_slots')
            .select('id, title, track, room, location_id, starts_at, ends_at')
            .eq('id', row.source_ref_id)
            .eq('event_id', eventId)
            .maybeSingle()
          const { error } = await admin.from('dancecard_program_slots').update(payload).eq('id', row.source_ref_id).eq('event_id', eventId)
          if (error) throw error
          updated++
          const { data: selections } = await admin
            .from('dancecard_selections')
            .select('account_id')
            .eq('slot_id', row.source_ref_id)
          if (selections?.length && oldSlot) {
            const afterRow = { ...oldSlot, ...payload, title: row.title }
            const { before, after } = await buildSlotSnapshots(
              admin,
              eventId,
              oldSlot as Record<string, unknown>,
              afterRow as Record<string, unknown>,
            )
            if (scheduleFieldsChanged(before, after)) {
              const summaryText = formatScheduleChangeSummary(before, after, timezone)
              const message = formatScheduleChangeMessage(
                { slotTitle: row.title ?? before.title, before, after, summaryText },
                timezone,
              )
              const notices = selections.map((selection) => ({
                event_id: eventId,
                account_id: selection.account_id,
                program_slot_id: row.source_ref_id,
                old_snapshot: snapshotToJson(before),
                new_snapshot: snapshotToJson(after),
                conflict_summary: { message, kinds: ['dancecard_holder'] },
              }))
              const { error: noticeErr } = await admin.from('dancecard_schedule_change_notifications').insert(notices)
              if (noticeErr) throw noticeErr
              notified += notices.length
            }
          }
        } else {
          const { error } = await admin.from('dancecard_program_slots').insert(payload)
          if (error) throw error
          added++
        }
      } else {
        if (!row.person_name || !row.role) {
          skipped++
          continue
        }
        const payload = {
          event_id: eventId,
          person_name: row.person_name,
          role: row.role,
          starts_at: new Date(row.starts_at).toISOString(),
          ends_at: new Date(row.ends_at).toISOString(),
          location_id: row.location_id,
          sort_order: row.sort_order,
        }
        if (row.action === 'update' && row.source_ref_id) {
          const { error } = await admin.from('dancecard_staff_shifts').update(payload).eq('id', row.source_ref_id).eq('event_id', eventId)
          if (error) throw error
          updated++
        } else {
          const { error } = await admin.from('dancecard_staff_shifts').insert(payload)
          if (error) throw error
          added++
        }
      }
    }

    const summary = { added, updated, skipped, notified }
    const now = new Date().toISOString()
    const { error: batchUpdateErr } = await admin
      .from('dancecard_import_batches')
      .update({ status: 'published', published_at: now, updated_at: now, summary })
      .eq('id', context.params.batchId)
      .eq('event_id', eventId)
    if (batchUpdateErr) throw batchUpdateErr

    await admin.from('dancecard_schedule_audit_log').insert({
      event_id: eventId,
      batch_id: context.params.batchId,
      organizer_user_id: userId,
      action: 'publish_import_batch',
      summary,
    })

    return NextResponse.json({ ok: true, summary })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
