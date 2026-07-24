import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseServerClient: SupabaseClient | null = null

function isTransientUpstreamError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes('upstream connect error') ||
    m.includes('connection timeout') ||
    m.includes('disconnect/reset') ||
    m.includes('fetch failed') ||
    m.includes('econnreset') ||
    m.includes('etimedout') ||
    m.includes('socket hang up')
  )
}

/** Fetch wrapper: bypass Next.js Data Cache + one retry on transient upstream errors. */
const serverFetch: typeof fetch = async (input, init) => {
  const run = () => fetch(input as RequestInfo, { ...(init ?? {}), cache: 'no-store' })
  try {
    return await run()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (!isTransientUpstreamError(msg)) throw err
    console.warn('[supabaseServer] transient fetch error, retrying once:', msg)
    await new Promise((r) => setTimeout(r, 250))
    return run()
  }
}

/** Server-side Supabase client (anon key). Use in Server Components and route handlers. */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (supabaseServerClient) return supabaseServerClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return null
  }

  supabaseServerClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: serverFetch },
  })

  return supabaseServerClient
}
