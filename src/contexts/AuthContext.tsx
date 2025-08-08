'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const refreshAuth = async () => {
    try {
      console.log('🔄 AUTH CONTEXT: Refreshing authentication...')
      
      if (!supabase) {
        console.log('❌ AUTH CONTEXT: Supabase not configured')
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.log('❌ AUTH CONTEXT: Session error:', sessionError)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      if (!session?.user) {
        console.log('❌ AUTH CONTEXT: No session found')
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      console.log('✅ AUTH CONTEXT: Session found for:', session.user.email)

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError || !profile) {
        console.log('❌ AUTH CONTEXT: Profile error:', profileError)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: profile.role || 'user',
        name: profile.name
      }

      console.log('✅ AUTH CONTEXT: User authenticated:', userData.email, 'Role:', userData.role)
      
      setUser(userData)
      setIsAdmin(userData.role === 'admin')
      setLoading(false)

    } catch (error) {
      console.error('❌ AUTH CONTEXT: Error refreshing auth:', error)
      setUser(null)
      setIsAdmin(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only initialize once
    if (initialized) return

    console.log('🚀 AUTH CONTEXT: Initializing...')
    
    // Initial auth check
    refreshAuth().then(() => {
      setInitialized(true)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH CONTEXT: Auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          await refreshAuth()
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AUTH CONTEXT: User signed out')
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AUTH CONTEXT: Token refreshed')
          // Don't refresh auth on token refresh to avoid loops
        }
      }
    ) || { subscription: null }

    return () => {
      subscription?.unsubscribe()
    }
  }, [initialized])

  const value = {
    user,
    loading,
    isAdmin,
    refreshAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
