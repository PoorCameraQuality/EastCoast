import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { resolveOrgLoginEmail } from '@/lib/eckeOrgAuth'
import { orgRecoverSchema } from '@/lib/eckeOrgValidation'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { BASE_URL } from '@/lib/seo'

const GENERIC = 'If that account exists, reset instructions were sent to its email.'

export async function POST(request: Request) {
  const limited = await withRateLimit(request, rateLimiters.auth)
  if (limited) return limited

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ message: GENERIC })
  }

  const parsed = orgRecoverSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ message: GENERIC })
  }

  const email = await resolveOrgLoginEmail(parsed.data.identifier)
  if (!email) {
    return NextResponse.json({ message: GENERIC })
  }

  try {
    const supabase = createSupabaseServerClientForOrganizer()
    const origin = request.headers.get('origin') || BASE_URL
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin.replace(/\/$/, '')}/auth/org/login?mode=new-password`,
    })
    if (error) {
      console.error('ORG RECOVER: resetPasswordForEmail failed', error.message)
    }
  } catch (error) {
    console.error('ORG RECOVER: resetPasswordForEmail failed', error)
  }

  return NextResponse.json({ message: GENERIC })
}
