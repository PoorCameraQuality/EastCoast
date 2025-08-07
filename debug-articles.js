const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const cleanLine = trimmed.replace(/^\uFEFF/, '')
        const [key, ...valueParts] = cleanLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=')
          process.env[key] = value
        }
      }
    })
  }
}

loadEnvFile()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
  console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugArticles() {
  console.log('🔍 Debugging Articles Database...\n')
  
  try {
    // Check all articles in database
    console.log('📋 All articles in database:')
    const { data: allArticles, error: allError } = await supabase
      .from('articles')
      .select('*')
    
    if (allError) {
      console.error('❌ Error fetching all articles:', allError)
      return
    }
    
    console.log(`Found ${allArticles?.length || 0} total articles:`)
    if (allArticles && allArticles.length > 0) {
      allArticles.forEach(article => {
        console.log(`  - ID: ${article.id}`)
        console.log(`    Title: ${article.title}`)
        console.log(`    Status: ${article.status}`)
        console.log(`    Featured: ${article.featured}`)
        console.log(`    Category: ${article.category}`)
        console.log(`    Created: ${article.created_at}`)
        console.log('')
      })
    } else {
      console.log('  No articles found in database')
    }
    
    // Check published articles only
    console.log('\n📋 Published articles only:')
    const { data: publishedArticles, error: publishedError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('id', { ascending: false })
    
    if (publishedError) {
      console.error('❌ Error fetching published articles:', publishedError)
      return
    }
    
    console.log(`Found ${publishedArticles?.length || 0} published articles:`)
    if (publishedArticles && publishedArticles.length > 0) {
      publishedArticles.forEach(article => {
        console.log(`  - ID: ${article.id}`)
        console.log(`    Title: ${article.title}`)
        console.log(`    Featured: ${article.featured}`)
        console.log(`    Category: ${article.category}`)
        console.log('')
      })
    } else {
      console.log('  No published articles found')
    }
    
    // Check submissions table for pending articles
    console.log('\n📋 Submissions table (pending articles):')
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('submission_type', 'article')
      .order('submitted_at', { ascending: false })
    
    if (submissionsError) {
      console.error('❌ Error fetching submissions:', submissionsError)
      return
    }
    
    console.log(`Found ${submissions?.length || 0} article submissions:`)
    if (submissions && submissions.length > 0) {
      submissions.forEach(submission => {
        console.log(`  - ID: ${submission.id}`)
        console.log(`    Title: ${submission.article_title}`)
        console.log(`    Status: ${submission.status}`)
        console.log(`    Submitted: ${submission.submitted_at}`)
        console.log('')
      })
    } else {
      console.log('  No article submissions found')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

debugArticles()
