import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { hashApiKey, mintInboundRegistrantSecret } from '@/lib/dancecard/externalApiAuth'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const { data, error } = await ctx.admin
      .from('dancecard_registrant_inbound_secrets')
      .select('id, label, created_at')
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ configured: Boolean(data?.length), secrets: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const plain = mintInboundRegistrantSecret()
    const secret_hash = hashApiKey(plain)
    const { data, error } = await ctx.admin
      .from('dancecard_registrant_inbound_secrets')
      .upsert(
        {
          event_id: ctx.eventId,
          secret_hash,
          label: 'default',
        },
        { onConflict: 'event_id,label' },
      )
      .select('id, label, created_at')
      .single()
    if (error || !data) throw error ?? new Error('upsert failed')
    await insertDancecardAuditLog(ctx.admin, {
      actorUserId: ctx.userId,
      eventId: ctx.eventId,
      action: 'registrant_inbound_secret.mint',
      metadata: { id: (data as { id: string }).id },
    })
    return NextResponse.json({ secret: plain, record: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
