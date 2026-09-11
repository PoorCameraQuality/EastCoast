import { NextResponse } from 'next/server'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { orgUpdateContactEmailSchema } from '@/lib/eckeOrgValidation'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

/**
 * Sets the org contact/recovery email (organizations.email + auth user email).
 * Use a real inbox so forgot-password works.
 */
export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.auth)
  if (limited) return limited

  const session = await requireOrgSession()
  if (!session) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = orgUpdateContactEmailSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const admin = getSupabaseAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Server unavailable' }, { status: 503 })
  }

  const { data: conflict } = await admin
    .from('organizations')
    .select('id')
    .eq('email', email)
    .neq('id', session.organization.id)
    .maybeSingle()
  if (conflict?.id) {
    return NextResponse.json({ error: 'That email is already used by another organization' }, { status: 409 })
  }

  const { error: authError } = await admin.auth.admin.updateUserById(session.user.id, {
    email,
    email_confirm: true,
  })
  if (authError) {
    console.error('ORG UPDATE EMAIL: auth update failed', authError.message)
    return NextResponse.json({ error: 'Could not update login email' }, { status: 500 })
  }

  const { error: orgError } = await admin
    .from('organizations')
    .update({ email })
    .eq('id', session.organization.id)
  if (orgError) {
    console.error('ORG UPDATE EMAIL: org update failed', orgError.message)
    return NextResponse.json({ error: 'Could not update organization email' }, { status: 500 })
  }

  await admin
    .from('vendors')
    .update({ contact_email: email, updated_at: new Date().toISOString() })
    .eq('organization_id', session.organization.id)

  return NextResponse.json({ ok: true, email, message: 'Recovery email updated' })
}
