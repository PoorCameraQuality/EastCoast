import { supabase, getSession, getUser } from './supabase'

export interface User {
  id: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  name?: string
}

// Check if user is logged in and has admin role
export async function isAdmin(): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { user, error } = await getUser()
    
    if (error || !user) {
      console.log('❌ AUTH: No user found or error:', error)
      return false
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ AUTH: Profile error:', profileError)
      return false
    }

    const isAdminUser = profile.role === 'admin'
    console.log('✅ AUTH: Admin check for', user.email, 'Role:', profile.role, 'IsAdmin:', isAdminUser)
    return isAdminUser
  } catch (error) {
    console.error('❌ AUTH: Error checking admin status:', error)
    return false
  }
}

// Get current user info
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null
  
  try {
    const { user, error } = await getUser()
    
    if (error || !user) {
      console.log('❌ AUTH: No user found or error:', error)
      return null
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.log('❌ AUTH: Profile error:', profileError)
      return null
    }

    const userData = {
      id: user.id,
      email: user.email || '',
      role: profile.role || 'user',
      name: profile.name
    }

    console.log('✅ AUTH: Current user:', userData.email, 'Role:', userData.role)
    return userData
  } catch (error) {
    console.error('❌ AUTH: Error getting current user:', error)
    return null
  }
}

// Check if user is logged in (any role)
export async function isAuthenticated(): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const { user, error } = await getUser()
    const isAuth = !error && !!user
    console.log('✅ AUTH: Authentication check:', isAuth, user?.email || 'no user')
    return isAuth
  } catch (error) {
    console.error('❌ AUTH: Error checking authentication:', error)
    return false
  }
}
