// lib/supabaseClient.ts
'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      // During build time or if env vars are missing, return null instead of throwing
      if (typeof window === 'undefined') {
        console.warn('Supabase credentials not available during build');
        return null;
      }
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return supabaseClient;
};

// Export a getter function instead of calling it immediately
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;
