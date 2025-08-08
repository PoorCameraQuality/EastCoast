import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

// Lazy initialization function for the main client
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase environment variables')
      return null
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  }

  return supabaseClient
}

// Lazy initialization function for the admin client
export const getSupabaseAdminClient = (): SupabaseClient | null => {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('Missing Supabase admin environment variables')
      return null
    }

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey)
  }

  return supabaseAdminClient
}

// Export getter functions instead of calling them immediately
export const supabase = {
  get value() {
    return getSupabaseClient()
  }
}

export const supabaseAdmin = {
  get value() {
    return getSupabaseAdminClient()
  }
}

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!getSupabaseClient()
}

// Helper function to get session with better error handling
export async function getSession() {
  const client = getSupabaseClient()
  if (!client) {
    console.error('Supabase not configured')
    return { session: null, error: new Error('Supabase not configured') }
  }
  
  try {
    const { data: { session }, error } = await client.auth.getSession()
    return { session, error }
  } catch (error) {
    console.error('Error getting session:', error)
    return { session: null, error }
  }
}

// Helper function to get user with better error handling
export async function getUser() {
  const client = getSupabaseClient()
  if (!client) {
    console.error('Supabase not configured')
    return { user: null, error: new Error('Supabase not configured') }
  }
  
  try {
    const { data: { user }, error } = await client.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error getting user:', error)
    return { user: null, error }
  }
}

// Helper function to restore session from storage
export async function restoreSession() {
  const client = getSupabaseClient()
  if (!client || typeof window === 'undefined') {
    return { session: null, error: new Error('Cannot restore session') }
  }
  
  try {
    // Try to get session from storage
    const storedSession = localStorage.getItem('supabase.auth.token')
    if (storedSession) {
      console.log('🔄 SUPABASE: Found stored session, attempting restoration...')
      const { data: { session }, error } = await client.auth.getSession()
      return { session, error }
    }
    return { session: null, error: null }
  } catch (error) {
    console.error('Error restoring session:', error)
    return { session: null, error }
  }
}
