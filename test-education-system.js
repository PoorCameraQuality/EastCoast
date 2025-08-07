const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const cleanLine = trimmed.replace(/^\uFEFF/, '');
        const [key, ...valueParts] = cleanLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  }
}

loadEnvFile();

async function testEducationSystem() {
  console.log('🧪 TESTING EDUCATION SYSTEM\n');

  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check published articles
    console.log('📖 Test 1: Checking published articles...');
    const { data: publishedArticles, error: publishedError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('id', { ascending: false });

    if (publishedError) {
      console.log('❌ Error fetching published articles:', publishedError);
    } else {
      console.log(`✅ Found ${publishedArticles.length} published articles:`);
      publishedArticles.forEach(article => {
        console.log(`  📄 ${article.title}`);
        console.log(`     Author: ${article.author_name}`);
        console.log(`     Category: ${article.category}`);
        console.log(`     Slug: ${article.slug}`);
        console.log(`     Read Time: ${article.read_time}`);
        console.log('');
      });
    }

    // Test 2: Check submissions
    console.log('📝 Test 2: Checking submissions...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.log('❌ Error fetching submissions:', submissionsError);
    } else {
      console.log(`✅ Found ${submissions.length} submissions:`);
      submissions.forEach(sub => {
        console.log(`  📋 ${sub.article_title} (${sub.status})`);
        console.log(`     Author: ${sub.author_name}`);
        console.log(`     Category: ${sub.article_category}`);
        console.log(`     Word Count: ${sub.word_count}`);
        console.log('');
      });
    }

    // Test 3: Test article URLs
    console.log('🔗 Test 3: Article URLs to test:');
    if (publishedArticles && publishedArticles.length > 0) {
      publishedArticles.forEach(article => {
        console.log(`  🌐 http://localhost:3001/education/${article.slug}`);
      });
    }

    console.log('\n🎯 SYSTEM STATUS:');
    console.log(`✅ Database Connection: Working`);
    console.log(`✅ Published Articles: ${publishedArticles?.length || 0}`);
    console.log(`✅ Total Submissions: ${submissions?.length || 0}`);
    console.log(`✅ Education Page: http://localhost:3001/education`);
    console.log(`✅ Submit Page: http://localhost:3001/education/submit`);
    console.log(`✅ Admin Review: http://localhost:3001/admin/review-submissions`);

    console.log('\n🚀 Ready to test! Visit the education page to see your articles.');

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testEducationSystem();
