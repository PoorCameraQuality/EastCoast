import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  context: { params: { eventSlug: string; subscriptionId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const id = context.params.subscriptionId
    const { data: row, error: fErr } = await ctx.admin
      .from('dancecard_webhook_subscriptions')
      .select('id')
      .eq('id', id)
      .eq('event_id', ctx.eventId)
      .maybeSingle()
    if (fErr) throw fErr
    if (!row) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { error } = await ctx.admin
      .from('dancecard_webhook_subscriptions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('event_id', ctx.eventId)
    if (error) throw error
    await insertDancecardAuditLog(ctx.admin, {
      actorUserId: ctx.userId,
      eventId: ctx.eventId,
      action: 'webhook.revoke',
      metadata: { id },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
