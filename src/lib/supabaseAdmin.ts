import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseAdminClient: SupabaseClient | null = null

/** Server-only Supabase client with service role. Do not import from client components. */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Missing Supabase admin environment variables')
      return null
    }

    const noStoreFetch: typeof fetch = (input, init) =>
      fetch(input as RequestInfo, { ...(init ?? {}), cache: 'no-store' })

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: noStoreFetch },
    })
  }

  return supabaseAdminClient
}
