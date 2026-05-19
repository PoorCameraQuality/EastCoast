import type { SupabaseClient } from '@supabase/supabase-js'

export type AccountNotificationKind =
  | 'schedule_change'
  | 'reservation'
  | 'reschedule'
  | 'swap'
  | 'announcement'
  | 'starting_soon'

export async function insertAccountNotification(
  admin: SupabaseClient,
  args: {
    eventId: string
    accountId: string
    kind: AccountNotificationKind
    payload: Record<string, unknown>
  },
): Promise<void> {
  const { error } = await admin.from('dancecard_account_notifications').insert({
    event_id: args.eventId,
    account_id: args.accountId,
    kind: args.kind,
    payload: args.payload,
    status: 'unread',
  })
  if (error && error.code !== '42P01') {
    console.error('[accountNotifications]', error.message)
  }
}
