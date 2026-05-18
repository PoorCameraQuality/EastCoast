import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables')
      return null
    }

    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey) as unknown as SupabaseClient
  }

  return supabaseClient
}

export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export async function getSession() {
  const client = getSupabaseClient()
  if (!client) {
    return { session: null, error: new Error('Supabase not configured') }
  }
  const { data, error } = await client.auth.getSession()
  return { session: data.session, error }
}

export async function getUser() {
  const client = getSupabaseClient()
  if (!client) {
    return { user: null, error: new Error('Supabase not configured') }
  }
  const { data, error } = await client.auth.getUser()
  return { user: data.user, error }
}
