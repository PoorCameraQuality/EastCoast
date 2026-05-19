import { randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DEFAULT_ATTENDEE_PROFILE_CONFIG,
  parseAttendeeProfileConfig,
  parseProfileStored,
  type AttendeeProfileConfig,
} from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfileResolved } from '@/lib/dancecard/profilePhotoUrl'
import { isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'
import { assertHttpsUrl } from '@/lib/security/safeUrl'
import { groupTypeLabel, type AttendeeGroupTypeId } from '@/lib/dancecard/eventProfile'

export type AttendeeGroupRow = {
  id: string
  event_id: string
  created_by_account_id: string
  name: string
  description: string
  group_type: string
  visibility: string
  join_mode: string
  recruitment_status: string
  capacity_min: number | null
  capacity_max: number | null
  expectations_md: string
  external_discord_url: string | null
  external_sheet_url: string | null
  invite_token: string
  status: string
  curated_pin: boolean
  created_at: string
  updated_at: string
}

export function generateInviteToken(): string {
  return randomBytes(18).toString('base64url')
}

export function optionalHttpsUrl(raw: string | null | undefined): string | null {
  if (raw === undefined || raw === null || raw.trim() === '') return null
  return assertHttpsUrl(raw.trim())
}

export function isDiscoverableGroup(g: Pick<AttendeeGroupRow, 'status' | 'visibility' | 'recruitment_status'>) {
  if (g.status !== 'active') return false
  if (g.visibility !== 'public') return false
  return g.recruitment_status === 'seeking' || g.recruitment_status === 'open'
}

export async function countActiveMembers(admin: SupabaseClient, groupId: string): Promise<number> {
  const { count, error } = await admin
    .from('dancecard_attendee_group_members')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('status', 'active')
  if (error) {
    if ((error as { code?: string }).code === '42P01') return 0
    throw error
  }
  return count ?? 0
}

export async function getMembership(
  admin: SupabaseClient,
  groupId: string,
  accountId: string,
): Promise<{ role: string; status: string } | null> {
  const { data, error } = await admin
    .from('dancecard_attendee_group_members')
    .select('role, status')
    .eq('group_id', groupId)
    .eq('account_id', accountId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) {
    if ((error as { code?: string }).code === '42P01') return null
    throw error
  }
  if (!data) return null
  return { role: data.role as string, status: data.status as string }
}

export function isGroupAdmin(role: string | null | undefined) {
  return role === 'owner' || role === 'admin'
}

export function isGroupOwner(role: string | null | undefined) {
  return role === 'owner'
}

export type AccountBrief = {
  displayName: string
  username: string
  avatarUrl: string | null
}

export async function loadAccountsBrief(
  admin: SupabaseClient,
  accountIds: string[],
): Promise<Map<string, { displayName: string; username: string }>> {
  const withAvatars = await loadAccountsWithAvatars(admin, accountIds, DEFAULT_ATTENDEE_PROFILE_CONFIG)
  return new Map(
    Array.from(withAvatars.entries()).map(([id, a]) => [id, { displayName: a.displayName, username: a.username }]),
  )
}

export async function loadAccountsWithAvatars(
  admin: SupabaseClient,
  accountIds: string[],
  profileConfig: AttendeeProfileConfig = DEFAULT_ATTENDEE_PROFILE_CONFIG,
): Promise<Map<string, AccountBrief>> {
  const unique = Array.from(new Set(accountIds.filter(Boolean)))
  if (!unique.length) return new Map()

  const { data: accounts } = await admin.from('dancecard_accounts').select('id, display_name, username').in('id', unique)
  const prefsByAccount = new Map<string, unknown>()
  const { data: prefs, error: prefsErr } = await admin
    .from('dancecard_prefs')
    .select('account_id, profile_json')
    .in('account_id', unique)
  if (!prefsErr) {
    for (const row of prefs ?? []) {
      prefsByAccount.set(row.account_id as string, row.profile_json)
    }
  }

  const out = new Map<string, AccountBrief>()
  await Promise.all(
    (accounts ?? []).map(async (a) => {
      const id = a.id as string
      const stored = parseProfileStored(prefsByAccount.get(id))
      const profile = await buildPublicProfileResolved(admin, {
        displayName: (a.display_name as string) ?? 'Attendee',
        username: (a.username as string) ?? '',
        stored,
        config: profileConfig,
      })
      out.set(id, {
        displayName: profile.displayName,
        username: profile.loginName,
        avatarUrl: profile.avatarUrl ?? null,
      })
    }),
  )
  return out
}

export function mapSignupRows(
  accountIds: string[],
  accounts: Map<string, AccountBrief>,
): { accountId: string; displayName: string; username: string; avatarUrl: string | null }[] {
  return accountIds.map((accountId) => {
    const a = accounts.get(accountId)
    return {
      accountId,
      displayName: a?.displayName ?? 'Attendee',
      username: a?.username ?? '',
      avatarUrl: a?.avatarUrl ?? null,
    }
  })
}

export async function loadChoreSignupMap(
  admin: SupabaseClient,
  choreIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>()
  if (!choreIds.length) return map
  const { data, error } = await admin
    .from('dancecard_attendee_group_chore_signups')
    .select('chore_id, account_id')
    .in('chore_id', choreIds)
  if (error) {
    if (isMissingTable(error, 'dancecard_attendee_group_chore_signups')) return map
    throw error
  }
  for (const row of data ?? []) {
    const choreId = row.chore_id as string
    const list = map.get(choreId) ?? []
    list.push(row.account_id as string)
    map.set(choreId, list)
  }
  return map
}

export async function loadBringClaimMap(
  admin: SupabaseClient,
  itemIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>()
  if (!itemIds.length) return map
  const { data, error } = await admin
    .from('dancecard_attendee_group_bring_claims')
    .select('item_id, account_id')
    .in('item_id', itemIds)
  if (error) {
    if (isMissingTable(error, 'dancecard_attendee_group_bring_claims')) return map
    throw error
  }
  for (const row of data ?? []) {
    const itemId = row.item_id as string
    const list = map.get(itemId) ?? []
    list.push(row.account_id as string)
    map.set(itemId, list)
  }
  return map
}

export function readProfileConfigFromEvent(event: unknown): AttendeeProfileConfig {
  if (!event || typeof event !== 'object') return DEFAULT_ATTENDEE_PROFILE_CONFIG
  return parseAttendeeProfileConfig((event as { attendee_profile_config?: unknown }).attendee_profile_config)
}

export function mapPublicGroupListItem(
  g: AttendeeGroupRow,
  memberCount: number,
  owner: { displayName: string; username: string } | undefined,
  viewerAccountId: string | null,
) {
  const spotsLeft =
    g.capacity_max != null ? Math.max(0, g.capacity_max - memberCount) : null
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    groupType: g.group_type,
    groupTypeLabel: groupTypeLabel(g.group_type as AttendeeGroupTypeId),
    visibility: g.visibility,
    joinMode: g.join_mode,
    recruitmentStatus: g.recruitment_status,
    capacityMax: g.capacity_max,
    memberCount,
    spotsLeft,
    curatedPin: g.curated_pin,
    createdAt: g.created_at,
    ownerDisplayName: owner?.displayName ?? 'Attendee',
    ownerUsername: owner?.username ?? '',
    isMine: viewerAccountId === g.created_by_account_id,
  }
}

export function mapGroupDetail(
  g: AttendeeGroupRow,
  memberCount: number,
  membership: { role: string } | null,
  owner: { displayName: string; username: string } | undefined,
  options: { includeInviteToken?: boolean; includePrivateUrls?: boolean },
) {
  const isMember = membership != null
  const isAdmin = isGroupAdmin(membership?.role)
  const spotsLeft =
    g.capacity_max != null ? Math.max(0, g.capacity_max - memberCount) : null
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    groupType: g.group_type,
    groupTypeLabel: groupTypeLabel(g.group_type as AttendeeGroupTypeId),
    visibility: g.visibility,
    joinMode: g.join_mode,
    recruitmentStatus: g.recruitment_status,
    capacityMin: g.capacity_min,
    capacityMax: g.capacity_max,
    memberCount,
    spotsLeft,
    expectationsMd: isMember || g.join_mode === 'apply' ? g.expectations_md : '',
    externalDiscordUrl:
      isMember && options.includePrivateUrls && g.external_discord_url
        ? optionalHttpsUrl(g.external_discord_url)
        : null,
    externalSheetUrl:
      isMember && options.includePrivateUrls && g.external_sheet_url
        ? optionalHttpsUrl(g.external_sheet_url)
        : null,
    status: g.status,
    curatedPin: g.curated_pin,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
    ownerDisplayName: owner?.displayName ?? 'Attendee',
    ownerUsername: owner?.username ?? '',
    myRole: membership?.role ?? null,
    isMember,
    isAdmin,
    ...(isAdmin && options.includeInviteToken ? { inviteToken: g.invite_token } : {}),
  }
}

export async function syncRecruitmentFull(admin: SupabaseClient, groupId: string, capacityMax: number | null) {
  if (capacityMax == null) return
  const count = await countActiveMembers(admin, groupId)
  if (count >= capacityMax) {
    await admin
      .from('dancecard_attendee_groups')
      .update({ recruitment_status: 'full', updated_at: new Date().toISOString() })
      .eq('id', groupId)
      .neq('recruitment_status', 'closed')
  }
}

export async function addMember(
  admin: SupabaseClient,
  groupId: string,
  accountId: string,
  role: 'owner' | 'admin' | 'member',
) {
  const { error } = await admin.from('dancecard_attendee_group_members').insert({
    group_id: groupId,
    account_id: accountId,
    role,
    status: 'active',
  })
  if (error) throw error
}

export const ATTENDEE_GROUP_DISCLAIMER =
  'User-organized attendee groups are not endorsed by event staff. Meet safely in public first. Do not share passwords or payment info here.'
