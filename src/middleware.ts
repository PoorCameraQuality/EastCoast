import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { PostgrestError } from '@supabase/supabase-js'

interface Profile {
  id: string;
  role: 'admin' | 'user' | 'moderator';
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ MIDDLEWARE: Missing Supabase environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return NextResponse.redirect(new URL('/error', req.url))
  }

  // Log request details for debugging
  console.log(`🔍 MIDDLEWARE: Processing ${req.method} ${pathname}`)
  console.log(`🔍 MIDDLEWARE: User-Agent: ${req.headers.get('user-agent')}`)
  console.log(`🔍 MIDDLEWARE: Host: ${req.headers.get('host')}`)
  console.log(`🔍 MIDDLEWARE: Environment: ${process.env.NODE_ENV}`)

  // Log all cookies for debugging
  const allCookies = req.cookies.getAll()
  console.log(`🔍 MIDDLEWARE: Found ${allCookies.length} cookies:`)
  allCookies.forEach(cookie => {
    console.log(`  - ${cookie.name}: ${cookie.value ? 'Present' : 'Empty'}`)
  })

  // Find Supabase auth cookie
  const supabaseAuthCookie = allCookies.find(cookie => 
    cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
  )
  
  if (supabaseAuthCookie) {
    console.log(`✅ MIDDLEWARE: Found Supabase auth cookie: ${supabaseAuthCookie.name}`)
    console.log(`🔍 MIDDLEWARE: Cookie value length: ${supabaseAuthCookie.value?.length || 0}`)
  } else {
    console.log(`❌ MIDDLEWARE: No Supabase auth cookie found`)
  }

  // Create response object for cookie handling
  const res = NextResponse.next()

  // Initialize Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name)
          console.log(`🔍 MIDDLEWARE: Getting cookie ${name}:`, cookie ? 'Found' : 'Not found')
          if (cookie) {
            console.log(`🔍 MIDDLEWARE: Cookie value length: ${cookie.value.length}`)
          }
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`🔍 MIDDLEWARE: Setting cookie ${name}`)
          console.log(`🔍 MIDDLEWARE: Cookie options:`, options)
          res.cookies.set(name, value, {
            ...options,
            // Ensure cookies work in Vercel's serverless environment
            httpOnly: options.httpOnly ?? true,
            secure: options.secure ?? process.env.NODE_ENV === 'production',
            sameSite: options.sameSite ?? 'lax',
            path: options.path ?? '/',
            // Add domain for production
            domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
          })
        },
        remove(name: string, options: CookieOptions) {
          console.log(`🔍 MIDDLEWARE: Removing cookie ${name}`)
          res.cookies.delete(name)
        },
      },
    }
  )

  try {
    // Get session with error handling
    console.log('🔍 MIDDLEWARE: Attempting to get session...')
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ MIDDLEWARE: Session error:', error.message)
      console.error('❌ MIDDLEWARE: Error details:', error)
      console.error('❌ MIDDLEWARE: Error name:', error.name)
      console.error('❌ MIDDLEWARE: Error status:', (error as any).status)
    } else if (session) {
      console.log('✅ MIDDLEWARE: Session found for user:', session.user.email)
      console.log('✅ MIDDLEWARE: Session expires at:', session.expires_at)
      console.log('✅ MIDDLEWARE: Session access token present:', !!session.access_token)
      console.log('✅ MIDDLEWARE: Session refresh token present:', !!session.refresh_token)
      console.log('✅ MIDDLEWARE: Session user ID:', session.user.id)
    } else {
      console.log('❌ MIDDLEWARE: No session found')
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin/test-auth') {
      console.log('🔒 MIDDLEWARE: Protecting admin route:', pathname)
      
      if (error || !session) {
        console.log('❌ MIDDLEWARE: No valid session for admin route, redirecting to login')
        console.log('❌ MIDDLEWARE: Error:', error?.message || 'No session')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Verify admin role
      console.log('🔍 MIDDLEWARE: Checking admin role for user:', session.user.email)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single() as { data: Profile | null, error: PostgrestError | null }

      if (profileError) {
        console.error('❌ MIDDLEWARE: Profile error:', profileError.message)
        console.error('❌ MIDDLEWARE: Profile error details:', profileError)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      if (!profile || profile.role !== 'admin') {
        console.log('❌ MIDDLEWARE: User is not admin:', session.user.email, 'Role:', profile?.role)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      console.log('✅ MIDDLEWARE: Valid admin session for:', session.user.email)
    }

    return res
  } catch (error) {
    console.error('❌ MIDDLEWARE: Unexpected error:', error)
    console.error('❌ MIDDLEWARE: Error stack:', (error as Error).stack)
    // In case of error, allow the request to continue but log it
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}

