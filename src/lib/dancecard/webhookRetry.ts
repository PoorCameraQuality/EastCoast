import { createHmac } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

const MAX_ATTEMPTS = 5

/**
 * Retries failed webhook deliveries where next_retry_at has passed (call from cron).
 */
export async function processDancecardWebhookRetries(admin: SupabaseClient): Promise<{ retried: number }> {
  const now = new Date().toISOString()
  const { data: rows, error } = await admin
    .from('dancecard_webhook_deliveries')
    .select('id, subscription_id, event_type, payload_json, attempt_count')
    .eq('status', 'failed')
    .not('next_retry_at', 'is', null)
    .lte('next_retry_at', now)
    .lt('attempt_count', MAX_ATTEMPTS)
    .limit(25)
  if (error) {
    if (/next_retry_at|column .* does not exist/i.test(error.message)) {
      return { retried: 0 }
    }
    throw error
  }
  if (!rows?.length) return { retried: 0 }

  const subIds = Array.from(new Set(rows.map((r) => r.subscription_id as string)))
  const { data: subs, error: sErr } = await admin
    .from('dancecard_webhook_subscriptions')
    .select('id, url, secret, revoked_at')
    .in('id', subIds)
  if (sErr) throw sErr
  const subById = new Map((subs ?? []).map((s) => [s.id as string, s as { url: string; secret: string; revoked_at: string | null }]))

  let retried = 0
  for (const row of rows) {
    const r = row as {
      id: string
      subscription_id: string
      event_type: string
      payload_json: { event?: string; payload?: Record<string, unknown> }
      attempt_count: number
    }
    const sub = subById.get(r.subscription_id)
    if (!sub || sub.revoked_at) {
      await admin.from('dancecard_webhook_deliveries').update({ next_retry_at: null }).eq('id', r.id)
      continue
    }
    const eventType = r.event_type
    const payload = r.payload_json?.payload ?? {}
    const body = JSON.stringify({
      event: r.payload_json?.event ?? eventType,
      payload,
      sentAt: new Date().toISOString(),
    })
    const sig = createHmac('sha256', sub.secret).update(body).digest('hex')
    try {
      const res = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dancecard-Signature': sig,
          'X-Dancecard-Event': eventType,
        },
        body,
      })
      const ok = res.ok
      const nextAttempt = (r.attempt_count ?? 1) + 1
      await admin
        .from('dancecard_webhook_deliveries')
        .update({
          status: ok ? 'delivered' : 'failed',
          attempt_count: nextAttempt,
          last_error: ok ? null : `HTTP ${res.status} (retry)`,
          delivered_at: ok ? new Date().toISOString() : null,
          next_retry_at: ok ? null : new Date(Date.now() + 120_000 * nextAttempt).toISOString(),
        })
        .eq('id', r.id)
      retried++
    } catch (e) {
      const nextAttempt = (r.attempt_count ?? 1) + 1
      await admin
        .from('dancecard_webhook_deliveries')
        .update({
          attempt_count: nextAttempt,
          last_error: e instanceof Error ? e.message : 'fetch error (retry)',
          next_retry_at:
            nextAttempt >= MAX_ATTEMPTS ? null : new Date(Date.now() + 120_000 * nextAttempt).toISOString(),
        })
        .eq('id', r.id)
      retried++
    }
  }
  return { retried }
}
