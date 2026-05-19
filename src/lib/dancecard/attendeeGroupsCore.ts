import { randomBytes } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
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

export async function loadAccountsBrief(
  admin: SupabaseClient,
  accountIds: string[],
): Promise<Map<string, { displayName: string; username: string }>> {
  const unique = Array.from(new Set(accountIds.filter(Boolean)))
  if (!unique.length) return new Map()
  const { data } = await admin.from('dancecard_accounts').select('id, display_name, username').in('id', unique)
  return new Map(
    (data ?? []).map((a) => [
      a.id as string,
      { displayName: (a.display_name as string) ?? 'Attendee', username: (a.username as string) ?? '' },
    ]),
  )
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
