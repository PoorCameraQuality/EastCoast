import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertProgramSlotAudit(
  admin: SupabaseClient,
  input: {
    eventId: string
    slotId: string | null
    actorUserId: string | null
    action: string
    beforeJson?: Record<string, unknown> | null
    afterJson?: Record<string, unknown> | null
  },
): Promise<void> {
  const { error } = await admin.from('dancecard_program_slot_audit').insert({
    event_id: input.eventId,
    slot_id: input.slotId,
    actor_user_id: input.actorUserId,
    action: input.action,
    before_json: input.beforeJson ?? null,
    after_json: input.afterJson ?? null,
  })
  if (error && !String(error.message).includes('does not exist')) throw error
}
