import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseServerClient: SupabaseClient | null = null

/**
 * Server-side Supabase client (anon key).
 * Do NOT force cache: 'no-store' here — that throws during Next.js static
 * generation ("Dynamic server usage: no-store fetch") for SSG pages that
 * call getUnifiedEvents / educationArticles at build time.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseServerClient) return supabaseServerClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return null
  }

  supabaseServerClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return supabaseServerClient
}
