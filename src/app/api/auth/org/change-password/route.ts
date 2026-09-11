import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { orgChangePasswordSchema } from '@/lib/eckeOrgValidation'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'

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

  const parsed = orgChangePasswordSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.issues }, { status: 400 })
  }

  const supabase = createSupabaseServerClientForOrganizer()
  const email = session.user.email || session.organization.email
  if (!email) {
    return NextResponse.json({ error: 'No email on this account' }, { status: 400 })
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword,
  })
  if (verifyError) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })
  if (updateError) {
    console.error('ORG CHANGE PASSWORD: updateUser failed', updateError.message)
    return NextResponse.json({ error: 'Could not update password' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Password updated' })
}
