import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  name?: string
}

// Check if user is logged in and has admin role
export async function isAdmin(): Promise<boolean> {
  try {
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
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get current user info
export async function getCurrentUser(): Promise<User | null> {
  try {
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
    console.error('Error getting current user:', error)
    return null
  }
}

// Check if user is logged in (any role)
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return !error && !!user
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
}
