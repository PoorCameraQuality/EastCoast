import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface User {
  id: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  name?: string
}

// Create server-side Supabase client
function createServerSupabase() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Get current user info (server-side)
export async function getCurrentUserServer(): Promise<User | null> {
  try {
    const supabase = createServerSupabase()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile.role || 'user',
      name: profile.name
    }
  } catch (error) {
    console.error('Error getting current user (server):', error)
    return null
  }
}

// Check if user is admin (server-side)
export async function isAdminServer(): Promise<boolean> {
  try {
    const supabase = createServerSupabase()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return false
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return false
    }

    return profile.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status (server):', error)
    return false
  }
}
