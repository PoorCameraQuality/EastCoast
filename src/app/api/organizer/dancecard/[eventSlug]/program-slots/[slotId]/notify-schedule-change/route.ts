import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerNotifyScheduleChangeSchema } from '@/lib/dancecard/organizerSchemas'
import { insertProgramSlotAudit } from '@/lib/dancecard/programSlotAudit'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import {
  buildSlotSnapshots,
  computeScheduleChangeImpact,
  formatScheduleChangeMessage,
  type SlotScheduleSnapshot,
} from '@/lib/dancecard/scheduleChangeImpact'

export const dynamic = 'force-dynamic'

function snapshotToJson(s: SlotScheduleSnapshot): Record<string, unknown> {
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
  request: NextRequest,
  context: { params: { eventSlug: string; slotId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const slotId = context.params.slotId
    const body = organizerNotifyScheduleChangeSchema.parse(await request.json())

    const { data: slotRow, error: slotErr } = await admin
      .from('dancecard_program_slots')
      .select('id, title, starts_at, ends_at, room, location_id')
      .eq('id', slotId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (slotErr) throw slotErr
    if (!slotRow) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    }

    let before: SlotScheduleSnapshot
    let after: SlotScheduleSnapshot
    if (body.before && body.after) {
      before = body.before
      after = body.after
    } else {
      const { data: latestAudit } = await admin
        .from('dancecard_program_slot_audit')
        .select('before_json, after_json')
        .eq('slot_id', slotId)
        .eq('event_id', eventId)
        .eq('action', 'patch')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (latestAudit?.before_json && latestAudit?.after_json) {
        const built = await buildSlotSnapshots(
          admin,
          eventId,
          latestAudit.before_json as Record<string, unknown>,
          latestAudit.after_json as Record<string, unknown>,
        )
        before = built.before
        after = built.after
      } else {
        const built = await buildSlotSnapshots(
          admin,
          eventId,
          slotRow as Record<string, unknown>,
          slotRow as Record<string, unknown>,
        )
        before = built.before
        after = built.after
      }
    }

    const impact = await computeScheduleChangeImpact(admin, eventId, slotId, before, after, event.timezone)
    const allowed = new Set<string>()
    for (const h of impact.dancecardHolders) allowed.add(h.accountId)
    for (const p of impact.presenters) {
      if (p.accountId) allowed.add(p.accountId)
    }

    const accountIds = Array.from(new Set(body.accountIds))
    const invalid = accountIds.filter((id) => !allowed.has(id))
    if (invalid.length) {
      return NextResponse.json(
        { error: 'Some accounts are not eligible for this schedule change', invalidAccountIds: invalid },
        { status: 400 },
      )
    }
    if (!accountIds.length) {
      return NextResponse.json({ ok: true, notified: 0 })
    }

    const message =
      body.message?.trim() ||
      formatScheduleChangeMessage(
        {
          slotTitle: impact.slotTitle,
          before: impact.before,
          after: impact.after,
          summaryText: impact.summaryText,
        },
        event.timezone,
      )

    const notices = accountIds.map((accountId) => ({
      event_id: eventId,
      account_id: accountId,
      program_slot_id: slotId,
      old_snapshot: snapshotToJson(before),
      new_snapshot: snapshotToJson(after),
      conflict_summary: { message, kinds: ['dancecard_holder', 'presenter'] },
      status: 'unread' as const,
    }))

    const { error: insertErr } = await admin.from('dancecard_schedule_change_notifications').insert(notices)
    if (insertErr) throw insertErr

    await insertProgramSlotAudit(admin, {
      eventId,
      slotId,
      actorUserId: ctx.userId ?? null,
      action: 'schedule_change.notify',
      beforeJson: { accountIds, count: accountIds.length },
      afterJson: { message },
    })

    return NextResponse.json({ ok: true, notified: accountIds.length })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
