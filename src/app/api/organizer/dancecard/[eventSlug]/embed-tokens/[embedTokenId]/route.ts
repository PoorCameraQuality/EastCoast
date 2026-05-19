import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; embedTokenId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const id = context.params.embedTokenId
    const { data: row, error } = await ctx.admin
      .from('dancecard_embed_tokens')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('event_id', ctx.eventId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
