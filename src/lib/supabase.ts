import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log environment variable status (without exposing keys)
console.log('Supabase configuration:', {
  hasUrl: !!supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey
})

// Only create Supabase client if environment variables are set
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
  : null

// For server-side operations (with service role key)
// Only create admin client if service key is available
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!supabase
}

// Helper function to get session with better error handling
export async function getSession() {
  if (!supabase) {
    console.error('Supabase not configured')
    return { session: null, error: new Error('Supabase not configured') }
  }
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  } catch (error) {
    console.error('Error getting session:', error)
    return { session: null, error }
  }
}

// Helper function to get user with better error handling
export async function getUser() {
  if (!supabase) {
    console.error('Supabase not configured')
    return { user: null, error: new Error('Supabase not configured') }
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (error) {
    console.error('Error getting user:', error)
    return { user: null, error }
  }
}

// Helper function to restore session from storage
export async function restoreSession() {
  if (!supabase || typeof window === 'undefined') {
    return { session: null, error: new Error('Cannot restore session') }
  }
  
  try {
    // Try to get session from storage
    const storedSession = localStorage.getItem('supabase.auth.token')
    if (storedSession) {
      console.log('🔄 SUPABASE: Found stored session, attempting restoration...')
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    }
    return { session: null, error: null }
  } catch (error) {
    console.error('Error restoring session:', error)
    return { session: null, error }
  }
}
