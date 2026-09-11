import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getLegacyKinkEducationBlogRedirect } from '@/lib/legacyKinkEducationToBlog'
import {
  ORG_SESSION_STARTED_COOKIE,
  isOrgManagedPath,
  isOrgSessionExpired,
  orgSessionCookieOptions,
  parseOrgSessionStartedAt,
} from '@/lib/eckeOrgSessionLimit'
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middlewareClient'

/** Keep Edge under Vercel middleware limits — never await Supabase on public pages. */
const AUTH_USER_TIMEOUT_MS = 2_500

function needsSupabaseAuth(pathname: string): boolean {
  return isOrgManagedPath(pathname) || pathname.startsWith('/admin')
}

function applyRobotsTag(response: NextResponse, pathname: string) {
  const noIndex =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/organizer') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login') ||
    pathname === '/events/create' ||
    pathname === '/events/my-events' ||
    /^\/events\/[^/]+\/(edit|manage|posts|media|settings)$/.test(pathname) ||
    pathname === '/vendors/login' ||
    pathname === '/vendors/my-shop' ||
    pathname.startsWith('/vendors/my-shop/') ||
    pathname === '/dungeons/my-place' ||
    pathname.startsWith('/dungeons/my-place/')

  response.headers.set(
    'X-Robots-Tag',
    noIndex
      ? 'noindex, nofollow'
      : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
  )
  return response
}

async function getUserWithTimeout(
  supabase: ReturnType<typeof createMiddlewareSupabaseClient>['supabase'],
) {
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), AUTH_USER_TIMEOUT_MS)
      }),
    ])
    if (!result) return null
    return result.data.user ?? null
  } catch (error) {
    console.error('MIDDLEWARE: getUser failed:', error)
    return null
  }
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

  // Legacy CMS paths: always consolidate under /events (case-insensitive; backup to next.config).
  const pathLower = pathname.toLowerCase()
  if (pathLower === '/kinkeventcalendar' || pathLower.startsWith('/kinkeventcalendar/')) {
    const legacyEventRedirects: Record<string, string> = {
      'costal-carolina-fetish-fair': 'grand-strand-affair-2026',
      'coastal-carolina-fetish-fair': 'grand-strand-affair-2026',
      campcrucible2024: 'camp-crucible',
      summercamp: 'dark-odyssey-summer-camp',
      'dungeons-and-geekdoms': 'dungeons-geekdoms',
    }
    const dest = req.nextUrl.clone()
    if (pathLower === '/kinkeventcalendar') {
      dest.pathname = '/events'
    } else {
      const slug = pathLower.slice('/kinkeventcalendar/'.length)
      const canonicalSlug = legacyEventRedirects[slug] || slug
      dest.pathname = canonicalSlug ? `/events/${canonicalSlug}` : '/events'
    }
    return NextResponse.redirect(dest, 308)
  }

  // Legacy CMS: map known articles to /blog pillars; else /education/:slug (Supabase)
  if (pathLower === '/kinkeducationcenter' || pathLower.startsWith('/kinkeducationcenter/')) {
    const dest = req.nextUrl.clone()
    dest.searchParams.delete('format')
    if (pathLower === '/kinkeducationcenter' || pathLower === '/kinkeducationcenter/') {
      dest.pathname = '/education'
      return NextResponse.redirect(dest, 308)
    }
    const raw = pathLower
      .replace(/^\/kinkeducationcenter\/?/, '')
      .replace(/\/$/, '')
    if (!raw) {
      dest.pathname = '/education'
      return NextResponse.redirect(dest, 308)
    }
    const segments = raw.split('/').filter(Boolean)
    if (segments.length > 1) {
      dest.pathname = `/education/${segments.join('/')}`
      return NextResponse.redirect(dest, 308)
    }
    const slug = segments[0]
    const blogSlug = getLegacyKinkEducationBlogRedirect(slug)
    if (blogSlug) {
      dest.pathname = `/blog/${blogSlug}`
      return NextResponse.redirect(dest, 308)
    }
    dest.pathname = `/education/${slug}`
    return NextResponse.redirect(dest, 308)
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
  const isDancecardSharePath = /^\/dancecard\/[^/]+\/s\/[^/]+/.test(pathLower)
  if (!isDancecardSharePath && pathname !== lowerPath) {
    url.pathname = lowerPath
    return NextResponse.redirect(url, 308)
  }

  // Strip unwanted query parameters (keep functional filters + attribution for GA/ads).
  // Organizer/dancecard consoles use many internal params (tab, peopleTab, slot, guide, etc.).
  const isOrgEventTool =
    pathLower === '/events/create' ||
    pathLower === '/events/my-events' ||
    /^\/events\/[^/]+\/(edit|manage|posts|media|settings)$/.test(pathLower)

  const skipQueryStrip =
    pathLower.startsWith('/organizer') ||
    pathLower.startsWith('/dancecard') ||
    pathLower.startsWith('/auth') ||
    pathLower.startsWith('/dashboard') ||
    isOrgEventTool

  if (!skipQueryStrip) {
    const allowedParams = new Set([
      'page',
      'q',
      'tag',
      'view',
      'track',
      'day',
      'room',
      'created',
      'intent',
      'location',
    ])
    const marketingParams = new Set([
      'gclid',
      'gbraid',
      'wbraid',
      'fbclid',
      'msclkid',
      'twclid',
      'yclid',
      'mc_cid',
      'mc_eid',
      '_ga',
      '_gl',
    ])
    const isAllowedQueryKey = (key: string) =>
      allowedParams.has(key) ||
      key === 'format' ||
      key === 'category' ||
      key.startsWith('utm_') ||
      marketingParams.has(key)

    let paramsChanged = false
    const keysToDelete: string[] = []
    url.searchParams.forEach((_value, key) => {
      if (!isAllowedQueryKey(key)) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach((key) => {
      url.searchParams.delete(key)
      paramsChanged = true
    })
    if (paramsChanged) {
      return NextResponse.redirect(url, 308)
    }
  }

  const requestHeaders = new Headers(req.headers)
  if (pathname.startsWith('/auth')) {
    requestHeaders.set('x-ecke-bare-shell', '1')
  }

  // Public pages: no Supabase round-trip (was causing MIDDLEWARE_INVOCATION_TIMEOUT / 504).
  if (!needsSupabaseAuth(pathname)) {
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    return applyRobotsTag(response, pathname)
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (pathname.startsWith('/admin') || isOrgManagedPath(pathname)) {
      return NextResponse.redirect(
        new URL(pathname.startsWith('/admin') ? '/login' : '/auth/org/login', req.url),
      )
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } })
    return applyRobotsTag(response, pathname)
  }

  const { supabase, getResponse } = createMiddlewareSupabaseClient(req, requestHeaders)
  let activeUser = await getUserWithTimeout(supabase)

  if (activeUser) {
    const startedAt = parseOrgSessionStartedAt(req.cookies.get(ORG_SESSION_STARTED_COOKIE)?.value)
    if (!startedAt) {
      getResponse().cookies.set(ORG_SESSION_STARTED_COOKIE, String(Date.now()), orgSessionCookieOptions())
    } else if (isOrgSessionExpired(startedAt)) {
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise((resolve) => setTimeout(resolve, 1_000)),
        ])
      } catch (error) {
        console.error('MIDDLEWARE: signOut failed:', error)
      }
      activeUser = null
      getResponse().cookies.set(ORG_SESSION_STARTED_COOKIE, '', { ...orgSessionCookieOptions(0), maxAge: 0 })
    }
  }

  const response = applyRobotsTag(getResponse(), pathname)

  if (isOrgManagedPath(pathname) && !activeUser) {
    const redirectResponse = NextResponse.redirect(new URL('/auth/org/login', req.url))
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return redirectResponse
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/test-auth') {
    try {
      if (!activeUser) {
        const redirectResponse = NextResponse.redirect(new URL('/login', req.url))
        response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
        return redirectResponse
      }

      const profileQuery = supabase.from('profiles').select('id, role').eq('id', activeUser.id).single()
      const profileResult = await Promise.race([
        profileQuery,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), AUTH_USER_TIMEOUT_MS)),
      ])
      if (!profileResult) {
        const redirectResponse = NextResponse.redirect(new URL('/login', req.url))
        response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
        return redirectResponse
      }
      const { data: profile, error: profileError } = profileResult
      if (profileError || !profile || profile.role !== 'admin') {
        const redirectResponse = NextResponse.redirect(new URL('/unauthorized', req.url))
        response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
        return redirectResponse
      }
    } catch (error) {
      console.error('MIDDLEWARE: Error checking admin access:', error)
      const redirectResponse = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|sitemap.xml|robots.txt).*)'],
}
