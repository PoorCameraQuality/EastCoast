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

async function debugArticleSlugs() {
  console.log('🔍 DEBUGGING ARTICLE SLUGS\n');

  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Check all articles
    console.log('📚 Checking all articles...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: false });

    if (articlesError) {
      console.log('❌ Error fetching articles:', articlesError);
    } else {
      console.log(`✅ Found ${articles.length} articles:`);
      articles.forEach(article => {
        console.log(`  📄 ${article.title}`);
        console.log(`     Slug: ${article.slug}`);
        console.log(`     Status: ${article.status}`);
        console.log(`     Author: ${article.author_name}`);
        console.log(`     URL: http://localhost:3001/education/${article.slug}`);
        console.log('');
      });
    }

    // Test specific article lookup
    console.log('🔍 Testing article lookup by slug...');
    if (articles && articles.length > 0) {
      const testSlug = articles[0].slug;
      console.log(`Testing slug: ${testSlug}`);
      
      const { data: testArticle, error: testError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', testSlug)
        .eq('status', 'published')
        .single();

      if (testError) {
        console.log('❌ Error fetching test article:', testError);
      } else {
        console.log('✅ Test article found:', testArticle.title);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

debugArticleSlugs();
