import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClientForOrganizer } from '@/lib/dancecard/organizerAuth'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  const limited = await withRateLimit(request, rateLimiters.auth)
  if (limited) return limited

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClientForOrganizer()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      user: data.user
        ? { id: data.user.id, email: data.user.email }
        : null,
    })
  } catch (error) {
    console.error('Login route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
