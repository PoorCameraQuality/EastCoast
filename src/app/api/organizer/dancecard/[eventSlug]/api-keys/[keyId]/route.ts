import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerOwnerOrAdmin, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  context: { params: { eventSlug: string; keyId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const { data: row, error } = await ctx.admin
      .from('dancecard_api_keys')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', context.params.keyId)
      .eq('event_id', ctx.eventId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await insertDancecardAuditLog(ctx.admin, {
      actorUserId: ctx.userId,
      eventId: ctx.eventId,
      action: 'api_key.revoke',
      metadata: { id: context.params.keyId },
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
