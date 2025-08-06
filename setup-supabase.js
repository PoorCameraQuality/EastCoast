const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSupabase() {
  console.log('\n🚀 EAST COAST KINK EVENTS - SUPABASE SETUP\n');
  console.log('This script will help you set up Supabase for your project.\n');

  // Step 1: Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);

  if (envExists) {
    console.log('⚠️  .env.local file already exists!');
    const overwrite = await question('Do you want to overwrite it? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled. Your existing .env.local file was preserved.');
      rl.close();
      return;
    }
  }

  console.log('\n📋 STEP 1: SUPABASE PROJECT SETUP');
  console.log('1. Go to https://supabase.com');
  console.log('2. Sign up/Sign in with GitHub');
  console.log('3. Create a new project');
  console.log('4. Wait for setup to complete (2-3 minutes)');
  console.log('5. Go to Settings → API to get your credentials\n');

  // Get Supabase credentials
  const supabaseUrl = await question('Enter your Supabase Project URL (e.g., https://your-project.supabase.co): ');
  const supabaseAnonKey = await question('Enter your Supabase anon key (starts with eyJ...): ');
  const supabaseServiceKey = await question('Enter your Supabase service role key (starts with eyJ...): ');

  // Validate inputs
  if (!supabaseUrl.includes('supabase.co') || !supabaseAnonKey.startsWith('eyJ') || !supabaseServiceKey.startsWith('eyJ')) {
    console.log('\n❌ Invalid credentials detected! Please check your Supabase API keys.');
    console.log('Make sure you copied the correct values from Settings → API in your Supabase dashboard.');
    rl.close();
    return;
  }

  // Create .env.local file
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Email Configuration (optional - for notifications)
# RESEND_API_KEY=your-resend-api-key-here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ .env.local file created successfully!');

  // Step 2: Database setup instructions
  console.log('\n📋 STEP 2: DATABASE SETUP');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Click "SQL Editor" in the left sidebar');
  console.log('3. Click "New query"');
  console.log('4. Copy and paste the SQL code below:\n');

  const sqlCode = `-- Create submissions table
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_credentials TEXT,
  author_bio TEXT NOT NULL,
  article_title TEXT NOT NULL,
  article_excerpt TEXT NOT NULL,
  article_content TEXT NOT NULL,
  article_category TEXT NOT NULL,
  article_tags TEXT,
  contact_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  word_count INTEGER NOT NULL
);

-- Create articles table (for approved submissions)
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES submissions(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_credentials TEXT,
  author_bio TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[],
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'published',
  read_time TEXT,
  featured BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security (RLS)
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policies (basic - you can adjust later)
CREATE POLICY "Allow all operations on submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on articles" ON articles FOR ALL USING (true);`;

  console.log(sqlCode);
  console.log('\n5. Click "Run" to execute the SQL');
  console.log('6. Go to "Table Editor" to verify tables were created\n');

  const dbReady = await question('Have you created the database tables? (y/n): ');
  if (dbReady.toLowerCase() !== 'y') {
    console.log('\n⚠️  Please create the database tables first, then run this script again.');
    rl.close();
    return;
  }

  // Step 3: Test the setup
  console.log('\n📋 STEP 3: TESTING THE SETUP');
  console.log('1. Your dev server should be running (npm run dev)');
  console.log('2. Go to http://localhost:3000/education/submit');
  console.log('3. Submit a test article');
  console.log('4. Check the console for any errors');
  console.log('5. Go to http://localhost:3000/admin/review-submissions to see the submission\n');

  const testReady = await question('Ready to test the submission system? (y/n): ');
  if (testReady.toLowerCase() !== 'y') {
    console.log('\n✅ Setup complete! You can test the system later.');
    rl.close();
    return;
  }

  // Step 4: Vercel deployment instructions
  console.log('\n📋 STEP 4: DEPLOYMENT TO VERCEL');
  console.log('1. Go to https://vercel.com');
  console.log('2. Sign in with GitHub');
  console.log('3. Click "New Project"');
  console.log('4. Import your repository: PoorCameraQuality/EastCoast');
  console.log('5. Add these environment variables in Vercel:');
  console.log(`   - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey}`);
  console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey}`);
  console.log('6. Click "Deploy"\n');

  console.log('🎉 SETUP COMPLETE!');
  console.log('\nYour project is now ready with:');
  console.log('✅ Supabase database configured');
  console.log('✅ Environment variables set');
  console.log('✅ Database tables created');
  console.log('✅ Local development ready');
  console.log('✅ Deployment instructions provided');
  console.log('\nNext steps:');
  console.log('1. Test the submission system locally');
  console.log('2. Deploy to Vercel');
  console.log('3. Set up admin authentication (optional)');
  console.log('4. Add email notifications (optional)\n');

  rl.close();
}

// Run the setup
setupSupabase().catch(console.error);
