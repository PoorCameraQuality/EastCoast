#!/usr/bin/env node
/**
 * Extract promotional content from a webpage URL
 * Usage: node scripts/create-promo-from-url.js <url> <type>
 * 
 * Example:
 *   node scripts/create-promo-from-url.js https://example.com/vendor "vendor application"
 * 
 * This script fetches a webpage, extracts meta tags and content,
 * then prompts for dates/priority to generate promotional news SQL.
 */

import readline from 'readline'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

function isValidDate(dateString) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toISOString()
}

function generateSQL(data) {
  const escapeSingleQuotes = (str) => str.replace(/'/g, "''")
  
  return `-- Generated from URL: ${data.source_url}
-- Type: ${data.type}
-- Created: ${new Date().toISOString()}

INSERT INTO promotional_news (
  title,
  description,
  ${data.link_url ? 'link_url,' : ''}
  ${data.link_text ? 'link_text,' : ''}
  ${data.image_url ? 'image_url,' : ''}
  start_date,
  end_date,
  priority
) VALUES (
  '${escapeSingleQuotes(data.title)}',
  '${escapeSingleQuotes(data.description)}',
  ${data.link_url ? `'${escapeSingleQuotes(data.link_url)}',` : ''}
  ${data.link_text ? `'${escapeSingleQuotes(data.link_text)}',` : ''}
  ${data.image_url ? `'${escapeSingleQuotes(data.image_url)}',` : ''}
  '${formatDate(data.start_date)}',
  '${formatDate(data.end_date)}',
  ${data.priority}
);`
}

async function fetchPageMetadata(url) {
  console.log(`🔍 Fetching metadata from: ${url}`)
  
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract meta tags using regex (basic extraction)
    const metadata = {
      title: '',
      description: '',
      image: ''
    }
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch) metadata.title = titleMatch[1].trim()
    
    // Extract og:title or meta title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    if (ogTitleMatch) metadata.title = ogTitleMatch[1].trim()
    
    // Extract description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    if (descMatch) metadata.description = descMatch[1].trim()
    
    // Extract og:description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    if (ogDescMatch) metadata.description = ogDescMatch[1].trim()
    
    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    if (ogImageMatch) metadata.image = ogImageMatch[1].trim()
    
    return metadata
    
  } catch (error) {
    console.error('❌ Error fetching URL:', error.message)
    return null
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('Usage: node scripts/create-promo-from-url.js <url> [type]')
    console.log('\nExample:')
    console.log('  node scripts/create-promo-from-url.js https://primalartsfest.com/vendor "vendor application"')
    process.exit(1)
  }
  
  const url = args[0]
  const type = args[1] || 'announcement'
  
  console.log('\n==============================================')
  console.log('🌐 URL-to-Promotional News Extractor')
  console.log('==============================================\n')
  
  try {
    // Fetch metadata
    const metadata = await fetchPageMetadata(url)
    
    if (!metadata) {
      console.error('❌ Could not fetch metadata from URL')
      process.exit(1)
    }
    
    console.log('\n✅ Extracted metadata:')
    console.log(`   Title: ${metadata.title || '(none found)'}`)
    console.log(`   Description: ${metadata.description ? metadata.description.substring(0, 100) + '...' : '(none found)'}`)
    console.log(`   Image: ${metadata.image || '(none found)'}`)
    console.log('')
    
    // Prepare data
    const data = {
      source_url: url,
      type: type,
      link_url: url
    }
    
    // Prompt for edits
    const useTitle = await question(`📝 Use extracted title? (y/n) [y]: `) || 'y'
    if (useTitle.toLowerCase() === 'y') {
      data.title = metadata.title
    } else {
      data.title = await question('📝 Enter title: ')
    }
    
    const useDesc = await question(`📄 Use extracted description? (y/n) [y]: `) || 'y'
    if (useDesc.toLowerCase() === 'y') {
      data.description = metadata.description
    } else {
      console.log('📄 Enter description (type END on new line when done):')
      const lines = []
      const lineReader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      })
      
      await new Promise((resolve) => {
        lineReader.on('line', (line) => {
          if (line.trim() === 'END') {
            lineReader.close()
            resolve()
          } else {
            lines.push(line)
          }
        })
        lineReader.on('close', resolve)
      })
      
      data.description = lines.join('\n').trim()
    }
    
    // Restart interface for remaining questions
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const ask = (prompt) => new Promise((resolve) => rl2.question(prompt, resolve))
    
    // Link text based on type
    const suggestedLinkText = type.toLowerCase().includes('application') ? 'Apply Now' :
                              type.toLowerCase().includes('registration') ? 'Register Now' :
                              type.toLowerCase().includes('ticket') ? 'Get Tickets' :
                              'Learn More'
    
    data.link_text = await ask(`\n🔘 Link button text [${suggestedLinkText}]: `) || suggestedLinkText
    
    // Image
    if (metadata.image) {
      const useImage = await ask(`🖼️  Use extracted image? (y/n) [y]: `) || 'y'
      if (useImage.toLowerCase() === 'y') {
        data.image_url = metadata.image
      }
    } else {
      data.image_url = await ask('🖼️  Image URL (optional): ')
    }
    
    // Dates
    let validStartDate = false
    while (!validStartDate) {
      data.start_date = await ask('\n📅 Start date (YYYY-MM-DD): ')
      if (isValidDate(data.start_date)) {
        validStartDate = true
      } else {
        console.log('❌ Invalid date format')
      }
    }
    
    let validEndDate = false
    while (!validEndDate) {
      data.end_date = await ask('📅 End date (YYYY-MM-DD): ')
      if (isValidDate(data.end_date)) {
        if (new Date(data.end_date) > new Date(data.start_date)) {
          validEndDate = true
        } else {
          console.log('❌ End date must be after start date')
        }
      } else {
        console.log('❌ Invalid date format')
      }
    }
    
    data.priority = await ask('\n⭐ Priority (1-10) [7]: ') || '7'
    data.priority = parseInt(data.priority)
    
    // Generate SQL
    const sql = generateSQL(data)
    
    console.log('\n==============================================')
    console.log('📄 Generated SQL:')
    console.log('==============================================\n')
    console.log(sql)
    console.log('\n==============================================\n')
    
    // Save or execute
    const action = await ask('Action?\n  1) Execute to Supabase\n  2) Save to file\n  3) Both\n  4) Cancel\n[1]: ') || '1'
    
    if (action === '1' || action === '3') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Supabase credentials not found')
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const insertData = {
          title: data.title,
          description: data.description,
          link_url: data.link_url,
          link_text: data.link_text,
          start_date: formatDate(data.start_date),
          end_date: formatDate(data.end_date),
          priority: data.priority
        }
        
        if (data.image_url) insertData.image_url = data.image_url
        
        const { data: result, error } = await supabase
          .from('promotional_news')
          .insert([insertData])
          .select()
        
        if (error) {
          console.error('❌ Error:', error.message)
        } else {
          console.log('✅ Inserted! ID:', result[0].id)
        }
      }
    }
    
    if (action === '2' || action === '3') {
      const filename = `promo_from_url_${Date.now()}.sql`
      const filepath = path.join(__dirname, '..', 'database', filename)
      fs.writeFileSync(filepath, sql)
      console.log(`✅ Saved: database/${filename}`)
    }
    
    rl2.close()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main().then(() => {
  console.log('\n✨ Done!\n')
  process.exit(0)
})

