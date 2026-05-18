import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: keys, error: kErr } = await ctx.admin
      .from('dancecard_api_keys')
      .select('id, last_used_at')
      .eq('event_id', ctx.eventId)
      .is('revoked_at', null)
    if (kErr) throw kErr
    let apiKeysUsedInWindow = 0
    for (const k of keys ?? []) {
      const lu = (k as { last_used_at?: string | null }).last_used_at
      if (lu && lu >= since) apiKeysUsedInWindow++
    }

    const { data: subs, error: sErr } = await ctx.admin.from('dancecard_webhook_subscriptions').select('id').eq('event_id', ctx.eventId)
    if (sErr) throw sErr
    const subIds = (subs ?? []).map((s) => s.id as string)
    let webhookDeliveries30d = 0
    if (subIds.length) {
      const { count, error: dErr } = await ctx.admin
        .from('dancecard_webhook_deliveries')
        .select('id', { count: 'exact', head: true })
        .in('subscription_id', subIds)
        .gte('created_at', since)
      if (dErr) throw dErr
      webhookDeliveries30d = count ?? 0
    }

    return NextResponse.json({
      windowDays: 30,
      since,
      activeApiKeys: (keys ?? []).length,
      apiKeysUsedInWindow,
      webhookDeliveries30d,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
