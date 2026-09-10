import { NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { orgRecoverSchema } from '@/lib/eckeOrgValidation'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { BASE_URL } from '@/lib/seo'

const GENERIC = 'If that email is registered, you will receive reset instructions.'

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

  const email = parsed.data.email.trim().toLowerCase()
  try {
    const supabase = createSupabaseServerClientForOrganizer()
    const origin = request.headers.get('origin') || BASE_URL
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin.replace(/\/$/, '')}/auth/org/login`,
    })
  } catch (error) {
    console.error('ORG RECOVER: resetPasswordForEmail failed', error)
  }

  return NextResponse.json({ message: GENERIC })
}
