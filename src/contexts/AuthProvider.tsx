"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from '@supabase/supabase-js';

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

  // Initialize auth and listen for changes
  useEffect(() => {
    console.log('🚀 AUTH PROVIDER: Initializing...');
    
    if (!supabase) {
      console.error('❌ AUTH PROVIDER: Supabase client not available');
      setLoading(false);
      return;
    }
    
    let mounted = true;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
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

    return () => {
      mounted = false;
      subscription?.unsubscribe();
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
