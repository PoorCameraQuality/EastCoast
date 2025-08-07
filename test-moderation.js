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
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testModerationLogging() {
  console.log('🧪 Testing Moderation Logging...\n')
  
  try {
    // 1. Check current articles
    console.log('📋 Current published articles:')
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
    
    if (articlesError) {
      console.error('❌ Error fetching articles:', articlesError)
      return
    }
    
    console.log(`Found ${articles?.length || 0} published articles`)
    if (articles && articles.length > 0) {
      articles.forEach(article => {
        console.log(`  - ${article.title} (ID: ${article.id})`)
      })
    }
    
    // 2. Check current moderation logs
    console.log('\n📋 Current moderation logs:')
    const { data: logs, error: logsError } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (logsError) {
      console.error('❌ Error fetching moderation logs:', logsError)
      return
    }
    
    console.log(`Found ${logs?.length || 0} moderation logs`)
    if (logs && logs.length > 0) {
      logs.forEach(log => {
        console.log(`  - ${log.action.toUpperCase()}: ${log.article_title} (${new Date(log.timestamp).toLocaleString()})`)
      })
    }
    
    // 3. Test creating a moderation log entry
    if (articles && articles.length > 0) {
      const testArticle = articles[0]
      console.log(`\n🧪 Testing moderation log creation for: ${testArticle.title}`)
      
      const { data: newLog, error: createError } = await supabase
        .from('moderation_logs')
        .insert([{
          action: 'test',
          article_title: testArticle.title,
          article_id: testArticle.id,
          admin_name: 'Test Admin',
          notes: 'Test moderation log entry'
        }])
        .select()
      
      if (createError) {
        console.error('❌ Error creating test log:', createError)
      } else {
        console.log('✅ Test moderation log created successfully')
        console.log(`  - Action: ${newLog[0].action}`)
        console.log(`  - Article: ${newLog[0].article_title}`)
        console.log(`  - Admin: ${newLog[0].admin_name}`)
        console.log(`  - Notes: ${newLog[0].notes}`)
        
        // Clean up test log
        const { error: deleteError } = await supabase
          .from('moderation_logs')
          .delete()
          .eq('id', newLog[0].id)
        
        if (deleteError) {
          console.error('⚠️  Warning: Could not clean up test log:', deleteError)
        } else {
          console.log('✅ Test log cleaned up successfully')
        }
      }
    }
    
    console.log('\n✅ Moderation logging test completed!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testModerationLogging()
