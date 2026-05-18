import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'
import { mintWebhookSecret } from '@/lib/dancecard/externalApiAuth'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  url: z.string().url().max(2000),
  eventTypes: z.array(z.string().min(1).max(120)).min(1).max(30),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const { data, error } = await ctx.admin
      .from('dancecard_webhook_subscriptions')
      .select('id, url, event_types, created_at, revoked_at')
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ webhooks: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const body = postSchema.parse(await request.json())
    const secret = mintWebhookSecret()
    const { data, error } = await ctx.admin
      .from('dancecard_webhook_subscriptions')
      .insert({
        event_id: ctx.eventId,
        url: body.url,
        secret,
        event_types: body.eventTypes,
        created_by_user_id: ctx.userId,
      })
      .select('id, url, event_types, created_at')
      .single()
    if (error || !data) throw error ?? new Error('insert failed')
    await insertDancecardAuditLog(ctx.admin, {
      actorUserId: ctx.userId,
      eventId: ctx.eventId,
      action: 'webhook.subscribe',
      metadata: { id: (data as { id: string }).id },
    })
    return NextResponse.json({ subscription: data, signingSecret: secret })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
