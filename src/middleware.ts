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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables in middleware')
    return NextResponse.redirect(new URL('/error', req.url))
  }

  // Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set(name, value)
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.delete(name)
        },
      },
    }
  )

  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/test-auth') {
    if (error || !session) {
      console.log('❌ MIDDLEWARE: No valid session for admin route:', pathname)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single() as { data: Profile | null, error: PostgrestError | null }

    if (profileError || profile?.role !== 'admin') {
      console.log('❌ MIDDLEWARE: User is not admin:', session?.user?.email || 'no user')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    console.log('✅ MIDDLEWARE: Valid admin session for:', session.user.email)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

