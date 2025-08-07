import { NextRequest, NextResponse } from 'next/server'
import { withRateLimit, rateLimiters } from '@/lib/rateLimit'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for authentication attempts
    const rateLimitResponse = await withRateLimit(request, rateLimiters.auth)
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    if (data.user) {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'admin') {
        return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: data.user.id,
            email: data.user.email,
            role: profile.role
          }
        })
      } else {
        // Sign out non-admin users
        await supabase.auth.signOut()
        return NextResponse.json(
          { success: false, message: 'Access denied. Admin privileges required.' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
