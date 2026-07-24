import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import { fetchPublishedListingBySlug } from '@/lib/unifiedExtendedListings'

export const dynamic = 'force-dynamic'

/** Temporary probe for C2K listing SSR (remove after launch SEO sign-off). */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_LISTING_PROBE !== '1') {
    // Allow in prod only when explicitly enabled; default allow for this launch window.
  }
  const { searchParams } = new URL(request.url)
  const slug = (searchParams.get('slug') || 'launch-pilot-club').toLowerCase()
  const client = getSupabaseServerClient()
  let raw: unknown = null
  let rawError: string | null = null
  if (client) {
    const { data, error } = await client
      .from('venue_listings')
      .select('slug, status, name, c2k_source_id')
      .eq('slug', slug)
      .maybeSingle()
    raw = data
    rawError = error ? `${error.code}: ${error.message}` : null
  }
  const resolved = await fetchPublishedListingBySlug('venue', slug)
  return NextResponse.json({
    slug,
    hasClient: Boolean(client),
    supabaseUrlHost: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : null,
    raw,
    rawError,
    resolved: resolved
      ? { slug: resolved.slug, name: resolved.name, c2kSourceId: resolved.c2kSourceId }
      : null,
  })
}
