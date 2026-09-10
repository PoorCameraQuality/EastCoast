import { cookies } from 'next/headers'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { normalizeUsername } from '@/lib/authUtils'
import {
  ORG_SESSION_STARTED_COOKIE,
  isOrgSessionExpired,
  orgSessionCookieOptions,
  parseOrgSessionStartedAt,
} from '@/lib/eckeOrgSessionLimit'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export function stampOrgSessionStart() {
  try {
    cookies().set(ORG_SESSION_STARTED_COOKIE, String(Date.now()), orgSessionCookieOptions())
  } catch (error) {
    console.error('ORG AUTH: could not stamp session start', error)
  }
}

export function clearOrgSessionStart() {
  try {
    cookies().set(ORG_SESSION_STARTED_COOKIE, '', { ...orgSessionCookieOptions(0), maxAge: 0 })
  } catch (error) {
    console.error('ORG AUTH: could not clear session start', error)
  }
}

async function enforceOrgSessionLimit(
  supabase: ReturnType<typeof createSupabaseServerClientForOrganizer>,
): Promise<boolean> {
  const startedAt = parseOrgSessionStartedAt(cookies().get(ORG_SESSION_STARTED_COOKIE)?.value)
  if (!startedAt) return true
  if (!isOrgSessionExpired(startedAt)) return true
  await supabase.auth.signOut()
  clearOrgSessionStart()
  return false
}

export type OwnedOrganization = {
  id: string
  name: string
  slug: string
  username: string | null
  email: string
}

export async function getOwnedOrganization(userId: string): Promise<OwnedOrganization | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data, error } = await admin
    .from('organizations')
    .select('id, name, slug, username, email')
    .eq('owner_user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data as OwnedOrganization
}

export async function resolveOrgLoginEmail(identifier: string): Promise<string | null> {
  const trimmed = identifier.trim()
  if (!trimmed) return null
  if (trimmed.includes('@')) return trimmed.toLowerCase()

  const username = normalizeUsername(trimmed)
  const admin = getSupabaseAdminClient()
  if (!admin) return null

  const { data: org } = await admin.from('organizations').select('email').eq('username', username).maybeSingle()
  if (org?.email) return String(org.email).toLowerCase()

  const { data: cred } = await admin
    .from('org_credentials')
    .select('email, organization_id')
    .eq('username', username)
    .eq('active', true)
    .maybeSingle()
  if (cred?.email) return String(cred.email).toLowerCase()
  if (cred?.organization_id) {
    const { data: linked } = await admin
      .from('organizations')
      .select('email')
      .eq('id', cred.organization_id)
      .maybeSingle()
    if (linked?.email) return String(linked.email).toLowerCase()
  }
  return null
}

export async function requireOrgSession() {
  const supabase = createSupabaseServerClientForOrganizer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const withinLimit = await enforceOrgSessionLimit(supabase)
  if (!withinLimit) return null
  const organization = await getOwnedOrganization(user.id)
  if (!organization) return null
  return { user, organization }
}
