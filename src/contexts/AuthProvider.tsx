// context/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Fetch profile to determine admin flag
  const fetchIsAdmin = async (u: User | null) => {
    if (!u) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', u.id)
        .single();

      if (error && (error as any).code !== 'PGRST116') {
        console.warn('Error fetching profile for admin check:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.role === 'admin');
    } catch (err) {
      console.error('fetchIsAdmin error', err);
      setIsAdmin(false);
    }
  };

  // Self-healing check: if session is null but loading is false, restore it
  useEffect(() => {
    if (!loading && !session && initialized) {
      console.log('🔄 AUTH: Self-healing - session is null but loading is false, restoring...');
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.warn('Self-healing getSession error:', error);
          return;
        }
        if (data?.session) {
          console.log('✅ AUTH: Self-healing restored session');
          setSession(data.session);
          setUser(data.session.user);
          fetchIsAdmin(data.session.user);
        }
      });
    }
  }, [loading, session, initialized]);

  useEffect(() => {
    let isMounted = true;

    // Initial session fetch — important to restore session on refresh
    const initializeAuth = async () => {
      try {
        console.log('🚀 AUTH: Initializing authentication...');
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('getSession error', error);
        }
        if (!isMounted) return;

        console.log('📊 AUTH: Initial session:', data?.session ? 'Found' : 'None');
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        if (data?.session?.user) {
          await fetchIsAdmin(data.session.user);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
          console.log('✅ AUTH: Initialization complete');
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AUTH: Event received:', event, session ? 'with session' : 'no session');
        
        if (event === 'INITIAL_SESSION') {
          // For INITIAL_SESSION, re-query session to ensure stable state
          const { data } = await supabase.auth.getSession();
          if (!isMounted) return;
          
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          if (data?.session?.user) {
            await fetchIsAdmin(data.session.user);
          }
          setLoading(false);
          setInitialized(true);
          console.log('✅ AUTH: INITIAL_SESSION processed');
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchIsAdmin(session.user);
          }
          console.log('✅ AUTH: User signed in/updated');
        } else if (event === 'SIGNED_OUT') {
          if (!isMounted) return;
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          console.log('✅ AUTH: User signed out');
        } else {
          // fallback: always re-check session for other events
          const { data } = await supabase.auth.getSession();
          if (!isMounted) return;
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          if (data?.session?.user) {
            await fetchIsAdmin(data.session.user);
          }
          console.log('🔄 AUTH: Fallback session check completed');
        }
      }
    );

    return () => {
      isMounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  const value: AuthContextType = {
    user,
    session,
    isAdmin,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
