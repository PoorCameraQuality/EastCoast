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
    console.log('🚀 AUTH CONTEXT: Initializing...')
    
    let mounted = true

    // Listen for auth state changes FIRST
    const authStateChange = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH CONTEXT: Auth state changed:', event, session?.user?.email)
        
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ AUTH CONTEXT: User signed in, refreshing auth...')
          await refreshAuth()
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AUTH CONTEXT: User signed out')
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AUTH CONTEXT: Token refreshed')
          await refreshAuth()
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 AUTH CONTEXT: Initial session detected')
          if (session?.user) {
            console.log('✅ AUTH CONTEXT: Initial session has user, refreshing auth...')
            await refreshAuth()
          } else {
            console.log('❌ AUTH CONTEXT: Initial session has no user')
            setUser(null)
            setIsAdmin(false)
            setLoading(false)
          }
        }
      }
    )

    // Then initialize auth
    const initializeAuth = async () => {
      try {
        // Wait a bit for the auth state change listener to be set up
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (!mounted || !supabase) return
        
        // Try to get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.log('❌ AUTH CONTEXT: Initial session error:', error)
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ AUTH CONTEXT: Initial session found, refreshing auth...')
          await refreshAuth()
        } else {
          console.log('❌ AUTH CONTEXT: No initial session found')
          setUser(null)
          setIsAdmin(false)
          setLoading(false)
        }
      } catch (error) {
        console.error('❌ AUTH CONTEXT: Initialization error:', error)
        setUser(null)
        setIsAdmin(false)
        setLoading(false)
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      authStateChange?.data?.subscription?.unsubscribe()
    }
  }, [])

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
