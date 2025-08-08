// Test script for debugging authentication issues
const { createClient } = require('@supabase/supabase-js');

// Check environment variables
console.log('🔍 TEST: Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ TEST: Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    }
  }
);

async function testAuth() {
  console.log('🔍 TEST: Testing authentication...');
  
  try {
    // Test session retrieval
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ TEST: Session error:', error.message);
    } else if (session) {
      console.log('✅ TEST: Session found for user:', session.user.email);
      console.log('✅ TEST: Session expires at:', session.expires_at);
      
      // Test profile retrieval
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('❌ TEST: Profile error:', profileError.message);
      } else {
        console.log('✅ TEST: Profile found:', profile);
      }
    } else {
      console.log('❌ TEST: No session found');
    }
  } catch (error) {
    console.error('❌ TEST: Unexpected error:', error);
  }
}

testAuth();
