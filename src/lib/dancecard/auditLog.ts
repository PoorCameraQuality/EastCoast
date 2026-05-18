import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertDancecardAuditLog(
  admin: SupabaseClient,
  args: {
    actorUserId?: string | null
    actorApiKeyId?: string | null
    eventId?: string | null
    action: string
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  try {
    const { error } = await admin.from('dancecard_audit_log').insert({
      actor_user_id: args.actorUserId ?? null,
      actor_api_key_id: args.actorApiKeyId ?? null,
      event_id: args.eventId ?? null,
      action: args.action,
      metadata: args.metadata ?? {},
    })
    if (error) {
      console.error('[dancecard audit_log]', error.message)
    }
  } catch (e) {
    console.error('[dancecard audit_log]', e)
  }
}
