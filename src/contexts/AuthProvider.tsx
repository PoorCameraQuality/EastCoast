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
        // ignore "No rows" style errors if that's your schema; otherwise log
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

  useEffect(() => {
    let isMounted = true;

    // Initial session fetch — important to restore session on refresh
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('getSession error', error);
        }
        if (!isMounted) return;

        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
        await fetchIsAdmin(data?.session?.user ?? null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // IMPORTANT: handle INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
        // For INITIAL_SESSION, re-query session to ensure stable state.
        if (event === 'INITIAL_SESSION') {
          const { data } = await supabase.auth.getSession();
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          await fetchIsAdmin(data?.session?.user ?? null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setSession(session);
          setUser(session?.user ?? null);
          await fetchIsAdmin(session?.user ?? null);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        } else {
          // fallback: always re-check session
          const { data } = await supabase.auth.getSession();
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
          await fetchIsAdmin(data?.session?.user ?? null);
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
