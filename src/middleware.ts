import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Skip middleware for login page to avoid redirect loops
  if (request.nextUrl.pathname === '/login') {
    return res
  }
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Middleware: Checking admin access for', request.nextUrl.pathname)
    
    if (!user) {
      console.log('Middleware: No user found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log('Middleware: Profile error:', profileError)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (!profile || profile.role !== 'admin') {
      console.log('Middleware: User not admin, redirecting to unauthorized')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    console.log('Middleware: Admin access granted for user:', user.email, 'role:', profile.role)
  }

  return res
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
