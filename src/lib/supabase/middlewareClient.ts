import { createServerClient } from '@supabase/ssr/dist/module/createServerClient'
import type { CookieOptions } from '@supabase/ssr/dist/module/types'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge-safe Supabase client for middleware only.
 * Import createServerClient from the dedicated module (not the @supabase/ssr
 * barrel) so createBrowserClient / browser supabase-js is not pulled into Edge.
 */
export function createMiddlewareSupabaseClient(
  req: NextRequest,
  requestHeaders: Headers,
) {
  let response = NextResponse.next({ request: { headers: requestHeaders } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: requestHeaders } })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
  return {
    supabase,
    getResponse: () => response,
  }
}
