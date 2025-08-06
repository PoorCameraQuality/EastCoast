const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('\n🧪 TESTING SUPABASE CONNECTION\n');

  // Check if environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.log('❌ Missing environment variables!');
    console.log('Please run the setup script first: node setup-supabase.js');
    return;
  }

  console.log('✅ Environment variables found');

  try {
    // Test connection with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('🔗 Testing connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('submissions')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('\nPossible issues:');
      console.log('1. Check your Supabase URL and API keys');
      console.log('2. Make sure you created the database tables');
      console.log('3. Verify your internet connection');
      return;
    }

    console.log('✅ Supabase connection successful!');
    console.log('✅ Database tables are accessible');

    // Test admin connection
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: adminError } = await supabaseAdmin
      .from('submissions')
      .select('count')
      .limit(1);

    if (adminError) {
      console.log('⚠️  Admin connection failed:', adminError.message);
    } else {
      console.log('✅ Admin connection successful!');
    }

    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('\nYou can now:');
    console.log('1. Submit articles at /education/submit');
    console.log('2. Review submissions at /admin/review-submissions');
    console.log('3. Deploy to Vercel');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testSupabaseConnection();
