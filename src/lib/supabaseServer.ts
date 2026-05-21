import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/** Server-side Supabase client (anon key). Use in Server Components and route handlers. */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return null
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
