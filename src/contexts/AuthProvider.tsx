"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
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
  const [isHydrated, setIsHydrated] = useState(false);
  const hasInitializedRef = useRef(false);

  const refreshAuth = async () => {
    if (!supabase) return;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AUTH PROVIDER: Session error:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        console.log('❌ AUTH PROVIDER: No session found');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('❌ AUTH PROVIDER: Profile fetch error:', profileError);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!profile) {
        console.log('❌ AUTH PROVIDER: No profile found');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        role: profile.role || 'user',
        name: profile.name
      };

      console.log('✅ AUTH PROVIDER: User authenticated:', userData.email, userData.role);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      setLoading(false);
    } catch (error) {
      console.error('❌ AUTH PROVIDER: Refresh auth error:', error);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  // Hydration effect - runs only on client
  useEffect(() => {
    console.log('🚀 AUTH PROVIDER: Client hydration...');
    setIsHydrated(true);
  }, []);

  // Initial hydration from Supabase local storage
  useEffect(() => {
    // Don't run auth logic until hydrated
    if (!isHydrated) return;
    
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
          hasInitializedRef.current = true;
        }
      }
    );

    // Initialize auth - only if not already handled by auth state listener
    const initializeAuth = async () => {
      try {
        // Wait for auth state listener to be set up
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!mounted || !supabase) return;

        // Only call refreshAuth if no auth state change has been triggered yet
        if (!hasInitializedRef.current) {
          console.log('🔄 AUTH PROVIDER: Initial auth check...');
          await refreshAuth();
          hasInitializedRef.current = true;
        }
      } catch (error) {
        console.error('❌ AUTH PROVIDER: Initialization error:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        hasInitializedRef.current = true;
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
  }, [isHydrated]);

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
