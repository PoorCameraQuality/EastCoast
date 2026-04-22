import { createClient, SupabaseClient, Session, PostgrestError } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null
let supabaseAdminClient: SupabaseClient | null = null

// Custom storage adapter for debugging and cookie sync
const customStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null
    const value = window.localStorage.getItem(key)
    console.log(`🔍 STORAGE: Getting ${key}:`, value ? 'Found' : 'Not found')
    return value
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    console.log(`🔍 STORAGE: Setting ${key}`)
    window.localStorage.setItem(key, value)
    
    // Also set a cookie for server-side access
    try {
      const cookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      document.cookie = `${cookieName}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`
      console.log(`🍪 STORAGE: Set cookie ${cookieName} for server sync`)
    } catch (error) {
      console.error('Error setting auth cookie:', error)
    }
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return
    console.log(`🔍 STORAGE: Removing ${key}`)
    window.localStorage.removeItem(key)
    
    // Also remove the cookie
    try {
      const cookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      console.log(`🍪 STORAGE: Removed cookie ${cookieName}`)
    } catch (error) {
      console.error('Error removing auth cookie:', error)
    }
  }
}

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
        storage: customStorage,
        storageKey: 'supabase.auth.token',
        // Ensure cookies are properly handled
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
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

    // Force every admin-side Supabase fetch to bypass Next.js's persistent Data
    // Cache. Without this, supabase-js's internal fetch() calls get memoized at
    // the fetch-cache layer and stale rows can be served across deploys even
    // after the underlying table has changed.
    const noStoreFetch: typeof fetch = (input, init) =>
      fetch(input as RequestInfo, { ...(init ?? {}), cache: 'no-store' })

    supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: noStoreFetch },
    })
  }

  return supabaseAdminClient
}

// Export the Supabase client directly for easier access
export const supabase = getSupabaseClient()

// Export getter functions for backward compatibility
export const supabaseClientGetter = {
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
export async function restoreSession(): Promise<{ session: Session | null, error: PostgrestError | Error | null }> {
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
    return { session: null, error: error as Error }
  }
}

// Helper function to sync session with cookies (for SSR compatibility)
export async function syncSessionWithCookies(): Promise<void> {
  if (typeof window === 'undefined') return
  
  const client = getSupabaseClient()
  if (!client) return
  
  try {
    // Check if we have a session in localStorage
    const storedSession = localStorage.getItem('supabase.auth.token')
    if (storedSession) {
      console.log('🔄 SUPABASE: Syncing session with cookies...')
      
      // Parse the stored session to get the token
      try {
        const sessionData = JSON.parse(storedSession)
        if (sessionData.access_token) {
          // Set the cookie manually for server-side access
          const cookieName = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`
          document.cookie = `${cookieName}=${encodeURIComponent(storedSession)}; path=/; max-age=31536000; SameSite=Lax`
          console.log(`🍪 SUPABASE: Set auth cookie ${cookieName} for server sync`)
        }
      } catch (parseError) {
        console.error('Error parsing stored session:', parseError)
      }
      
      // This will trigger the auth state change and update cookies
      await client.auth.getSession()
    }
  } catch (error) {
    console.error('Error syncing session with cookies:', error)
  }
}

// Helper function to force session refresh and cookie sync
export async function forceSessionRefresh(): Promise<void> {
  if (typeof window === 'undefined') return
  
  const client = getSupabaseClient()
  if (!client) return
  
  try {
    console.log('🔄 SUPABASE: Force refreshing session...')
    
    // Get current session
    const { data: { session }, error } = await client.auth.getSession()
    
    if (session && !error) {
      // Force a token refresh
      const { data: { session: refreshedSession }, error: refreshError } = await client.auth.refreshSession()
      
      if (refreshedSession && !refreshError) {
        console.log('✅ SUPABASE: Session refreshed successfully')
        // The custom storage adapter will automatically sync the cookie
      } else {
        console.error('❌ SUPABASE: Failed to refresh session:', refreshError)
      }
    }
  } catch (error) {
    console.error('Error force refreshing session:', error)
  }
}
