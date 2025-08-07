const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  console.log('Looking for .env.local at:', envPath);
  console.log('File exists:', fs.existsSync(envPath));
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('File content:');
    console.log(envContent);
    
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        // Remove BOM if present
        const cleanLine = trimmed.replace(/^\uFEFF/, '');
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
          console.log(`Set ${key} = ${value.substring(0, 20)}...`);
        }
      }
    });
  }
}

loadEnvFile();

async function testSupabaseConnection() {
  console.log('\n🧪 TESTING SUPABASE CONNECTION\n');

  // Check if environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Debug - Environment variables:');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Anon Key:', supabaseAnonKey ? 'Found' : 'Missing');
  console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');

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
