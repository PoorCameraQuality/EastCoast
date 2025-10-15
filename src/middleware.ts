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

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Normalize URL: force www and lowercase paths
  const host = req.headers.get('host') || ''
  const lowerPath = pathname.toLowerCase()

  // Force www (backup to next.config.js redirect)
  if (host === 'eastcoastkinkevents.com') {
    url.host = 'www.eastcoastkinkevents.com'
    return NextResponse.redirect(url, 308)
  }

  // Force lowercase paths for consistency
  if (pathname !== lowerPath) {
    url.pathname = lowerPath
    return NextResponse.redirect(url, 308)
  }

  // Strip unwanted query parameters
  const allowedParams = new Set(['page', 'q'])
  let paramsChanged = false
  const keysToDelete: string[] = []
  url.searchParams.forEach((value, key) => {
    if (!allowedParams.has(key) && key !== 'format' && key !== 'category') {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => {
    url.searchParams.delete(key)
    paramsChanged = true
  })
  if (paramsChanged) {
    return NextResponse.redirect(url, 308)
  }

  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('⚠️ MIDDLEWARE: Missing Supabase environment variables - continuing without auth')
    return NextResponse.next()
  }

  // Set crawl-friendly headers for public pages
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/login')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1')
    return response
  }

  // Only protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/test-auth') {
    console.log('🔒 MIDDLEWARE: Protecting admin route:', pathname)
    
    try {
      // Create Supabase client
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            get(name: string) {
              return req.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              // Don't set cookies in middleware to avoid conflicts
            },
            remove(name: string, options: CookieOptions) {
              // Don't remove cookies in middleware to avoid conflicts
            },
          },
        }
      )

      // Get session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.log('❌ MIDDLEWARE: No valid session for admin route, redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        console.log('❌ MIDDLEWARE: User is not admin, redirecting to unauthorized')
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      console.log('✅ MIDDLEWARE: Valid admin session for:', session.user.email)
    } catch (error) {
      console.error('❌ MIDDLEWARE: Error checking admin access:', error)
      // On error, redirect to login to be safe
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|sitemap.xml|robots.txt).*)'],
}

