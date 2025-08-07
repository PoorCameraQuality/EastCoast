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

async function debugArticles() {
  console.log('🔍 DEBUGGING ARTICLES IN DATABASE\n');

  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Check submissions
    console.log('📝 Checking submissions...');
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.log('❌ Error fetching submissions:', submissionsError);
    } else {
      console.log(`✅ Found ${submissions.length} submissions:`);
      submissions.forEach(sub => {
        console.log(`  - ${sub.article_title} (${sub.status})`);
      });
    }

    // Check articles
    console.log('\n📚 Checking articles...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .order('id', { ascending: false });

    if (articlesError) {
      console.log('❌ Error fetching articles:', articlesError);
    } else {
      console.log(`✅ Found ${articles.length} articles:`);
      articles.forEach(article => {
        console.log(`  - ${article.title} (${article.status})`);
        console.log(`    Slug: ${article.slug}`);
        console.log(`    Category: ${article.category}`);
        console.log(`    Author: ${article.author_name}`);
      });
    }

    // Check published articles specifically
    console.log('\n📖 Checking published articles...');
    const { data: publishedArticles, error: publishedError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published');

    if (publishedError) {
      console.log('❌ Error fetching published articles:', publishedError);
    } else {
      console.log(`✅ Found ${publishedArticles.length} published articles:`);
      publishedArticles.forEach(article => {
        console.log(`  - ${article.title}`);
        console.log(`    Slug: ${article.slug}`);
        console.log(`    Category: ${article.category}`);
      });
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugArticles();
