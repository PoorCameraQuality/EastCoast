"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// Custom User interface for better type safety
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
    try {
      console.log('🔄 AUTH PROVIDER: Refreshing authentication...');
      
      if (!supabase.value) {
        console.log('❌ AUTH PROVIDER: Supabase not configured');
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.value.auth.getSession();
      
      if (sessionError) {
        console.log('❌ AUTH PROVIDER: Session error:', sessionError);
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

      console.log('✅ AUTH PROVIDER: Session found for:', session.user.email);

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase.value
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.log('❌ AUTH PROVIDER: Profile error:', profileError);
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

      console.log('✅ AUTH PROVIDER: User authenticated:', userData.email, 'Role:', userData.role);
      
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      setLoading(false);

    } catch (error) {
      console.error('❌ AUTH PROVIDER: Error refreshing auth:', error);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  // Initial hydration from Supabase local storage
  useEffect(() => {
    console.log('🚀 AUTH PROVIDER: Initializing...');
    
    let mounted = true;

    // Listen for auth state changes FIRST
    const authStateChange = supabase.value?.auth.onAuthStateChange(
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

    // Then initialize auth
    const initializeAuth = async () => {
      try {
        // Wait a bit for the auth state change listener to be set up
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!mounted || !supabase.value) return;
        
        // Try to get initial session
        const { data: { session }, error } = await supabase.value.auth.getSession();
        
        if (error) {
          console.log('❌ AUTH PROVIDER: Initial session error:', error);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ AUTH PROVIDER: Initial session found, refreshing auth...');
          await refreshAuth();
        } else {
          console.log('❌ AUTH PROVIDER: No initial session found');
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ AUTH PROVIDER: Initialization error:', error);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      authStateChange?.data?.subscription?.unsubscribe();
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
