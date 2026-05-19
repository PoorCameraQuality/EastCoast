import type { SupabaseClient } from '@supabase/supabase-js'

export type CompareVisibility = 'off' | 'username' | 'link_only'

export function compareVisibilityAllowsUsername(v: CompareVisibility): boolean {
  return v === 'username'
}

/** Returns true if either party has blocked the other for compare lookups. */
export async function isCompareBlocked(
  admin: SupabaseClient,
  eventId: string,
  accountA: string,
  accountB: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('dancecard_compare_blocks')
    .select('blocker_account_id')
    .eq('event_id', eventId)
    .or(
      `and(blocker_account_id.eq.${accountA},blocked_account_id.eq.${accountB}),and(blocker_account_id.eq.${accountB},blocked_account_id.eq.${accountA})`
    )
    .limit(1)
  if (error) {
    const code = (error as { code?: string }).code
    if (code === '42P01') return false
    throw error
  }
  return (data?.length ?? 0) > 0
}

export async function listCompareBlocks(
  admin: SupabaseClient,
  eventId: string,
  blockerAccountId: string
): Promise<{ blockedAccountId: string; username: string; displayName: string }[]> {
  const { data: blocks, error } = await admin
    .from('dancecard_compare_blocks')
    .select('blocked_account_id')
    .eq('event_id', eventId)
    .eq('blocker_account_id', blockerAccountId)
  if (error) {
    const code = (error as { code?: string }).code
    if (code === '42P01') return []
    throw error
  }
  const ids = (blocks ?? []).map((b) => b.blocked_account_id as string)
  if (!ids.length) return []
  const { data: accounts, error: aErr } = await admin
    .from('dancecard_accounts')
    .select('id, username, display_name')
    .in('id', ids)
  if (aErr) throw aErr
  const byId = new Map((accounts ?? []).map((a) => [a.id as string, a]))
  return ids.map((id) => {
    const a = byId.get(id)
    return {
      blockedAccountId: id,
      username: (a?.username as string) ?? '',
      displayName: (a?.display_name as string) ?? '',
    }
  })
}
