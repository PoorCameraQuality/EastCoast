"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, restoreSession } from "@/lib/supabase";
import type { Session, PostgrestError } from '@supabase/supabase-js';

interface Profile {
  id: string;
  role: 'admin' | 'user' | 'moderator';
  name?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  name?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAuth = async () => {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshing) {
      console.log('🔄 AUTH PROVIDER: Already refreshing, skipping...');
      return;
    }
    
    setIsRefreshing(true);
    try {
      console.log('🔄 AUTH PROVIDER: Refreshing authentication...');
      
      if (!supabase) {
        console.log('❌ AUTH PROVIDER: Supabase not configured');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Attempt to restore session from storage first
      const { session: restoredSession, error: restoreError } = await restoreSession();
      if (restoreError || !restoredSession) {
        console.log('❌ AUTH PROVIDER: Failed to restore session:', restoreError);
        // Fallback to getSession
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          console.log('❌ AUTH PROVIDER: No session found:', sessionError);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          setIsRefreshing(false);
          return;
        }
      } else {
        console.log('✅ AUTH PROVIDER: Session restored from storage');
      }

      const session = restoredSession || (await supabase.auth.getSession()).data.session;
      if (!session?.user) {
        console.log('❌ AUTH PROVIDER: No user in session');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      console.log('✅ AUTH PROVIDER: Session found for:', session.user.email);

      // Get user profile with role
      console.log('🔍 AUTH PROVIDER: Looking for profile with user ID:', session.user.id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name')
        .eq('id', session.user.id);

      if (profileError) {
        console.log('❌ AUTH PROVIDER: Profile error:', profileError);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Handle multiple profiles or no profile
      let profile = null;
      if (profiles && profiles.length > 0) {
        // If multiple profiles exist, use the first one (shouldn't happen but just in case)
        profile = profiles[0];
        console.log('✅ AUTH PROVIDER: Found profile:', profile);
      } else {
        console.log('❌ AUTH PROVIDER: No profile found for user:', session.user.id);
        console.log('🔍 AUTH PROVIDER: Available profiles:', profiles);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: profile.role || 'user',
        name: profile.name
      };

      console.log('✅ AUTH PROVIDER: User authenticated:', userData.email, 'Role:', userData.role);
      
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      setLoading(false);

    } catch (error) {
      console.error('❌ AUTH PROVIDER: Error refreshing auth:', error);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial hydration from Supabase local storage
  useEffect(() => {
    console.log('🚀 AUTH PROVIDER: Initializing...');
    
    let mounted = true;

    // Listen for auth state changes
    const authStateChange = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH PROVIDER: Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ AUTH PROVIDER: User signed in, refreshing auth...');
          await refreshAuth();
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 AUTH PROVIDER: User signed out');
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 AUTH PROVIDER: Token refreshed');
          await refreshAuth();
        } else if (event === 'INITIAL_SESSION') {
          console.log('🔄 AUTH PROVIDER: Initial session detected');
          if (session?.user) {
            console.log('✅ AUTH PROVIDER: Initial session has user, refreshing auth...');
            await refreshAuth();
          } else {
            console.log('❌ AUTH PROVIDER: Initial session has no user');
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
          }
        }
      }
    );

    // Initialize auth - let the auth state listener handle it
    const initializeAuth = async () => {
      try {
        // Wait for auth state listener to be set up
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!mounted || !supabase) return;

        // Only call refreshAuth if no auth state change has been triggered yet
        if (loading) {
          console.log('🔄 AUTH PROVIDER: Initial auth check...');
          await refreshAuth();
        }
      } catch (error) {
        console.error('❌ AUTH PROVIDER: Initialization error:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    initializeAuth();

    // Periodic session check (every 5 minutes)
    const interval = setInterval(async () => {
      if (mounted && supabase) {
        console.log('🔄 AUTH PROVIDER: Periodic session check');
        await refreshAuth();
      }
    }, 5 * 60 * 1000);

    return () => {
      mounted = false;
      authStateChange?.data?.subscription?.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
