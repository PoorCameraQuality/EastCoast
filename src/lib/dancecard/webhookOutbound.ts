import { createHmac } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function dispatchDancecardWebhooks(
  admin: SupabaseClient,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const { data: subs, error } = await admin
    .from('dancecard_webhook_subscriptions')
    .select('id, url, secret, event_types')
    .eq('event_id', eventId)
    .is('revoked_at', null)
  if (error || !subs?.length) return

  const body = JSON.stringify({ event: eventType, payload, sentAt: new Date().toISOString() })
  for (const s of subs) {
    const row = s as { id: string; url: string; secret: string; event_types: string[] }
    if (!row.event_types?.includes(eventType)) continue
    const sig = createHmac('sha256', row.secret).update(body).digest('hex')
    try {
      const res = await fetch(row.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dancecard-Signature': sig,
          'X-Dancecard-Event': eventType,
        },
        body,
      })
      const nowIso = new Date().toISOString()
      const ok = res.ok
      await admin.from('dancecard_webhook_deliveries').insert({
        subscription_id: row.id,
        event_type: eventType,
        payload_json: { event: eventType, payload },
        status: ok ? 'delivered' : 'failed',
        attempt_count: 1,
        last_error: ok ? null : `HTTP ${res.status}`,
        delivered_at: ok ? nowIso : null,
        next_retry_at: ok ? null : new Date(Date.now() + 90_000).toISOString(),
      })
    } catch (e) {
      await admin.from('dancecard_webhook_deliveries').insert({
        subscription_id: row.id,
        event_type: eventType,
        payload_json: { event: eventType, payload, error: String(e) },
        status: 'failed',
        attempt_count: 1,
        last_error: e instanceof Error ? e.message : 'fetch error',
        next_retry_at: new Date(Date.now() + 90_000).toISOString(),
      })
    }
  }
}
