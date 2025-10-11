#!/usr/bin/env node
/**
 * Interactive CLI tool for creating promotional news items
 * Usage: node scripts/create-promo-news.js
 * 
 * This script helps you easily add promotional content to the home page
 * by prompting for all required fields and generating SQL automatically.
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

// Helper to prompt for input
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

// Helper to prompt for multi-line input
function questionMultiLine(prompt) {
  return new Promise((resolve) => {
    console.log(prompt)
    console.log('(Press Ctrl+D or type "END" on a new line when finished)')
    
    let lines = []
    rl.on('line', (line) => {
      if (line.trim() === 'END') {
        resolve(lines.join('\n'))
      } else {
        lines.push(line)
      }
    })
    
    rl.on('close', () => {
      resolve(lines.join('\n'))
    })
  })
}

// Validate ISO date format
function isValidDate(dateString) {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

// Format date to PostgreSQL-friendly format
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toISOString()
}

// Generate SQL INSERT statement
function generateSQL(data) {
  const escapeSingleQuotes = (str) => str.replace(/'/g, "''")
  
  return `-- Generated promotional news insert
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

async function main() {
  console.log('\n==============================================')
  console.log('📢 Promotional News Creator')
  console.log('==============================================\n')
  
  try {
    // Collect data
    const data = {}
    
    data.title = await question('📝 Title (short, attention-grabbing): ')
    if (!data.title) {
      console.error('❌ Title is required!')
      process.exit(1)
    }
    
    console.log('\n📄 Description (paste your promotional content):')
    console.log('   You can paste multiple paragraphs.')
    console.log('   Type "END" on a new line when finished, or press Ctrl+D\n')
    
    const lines = []
    await new Promise((resolve) => {
      const lineReader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
      })
      
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
    
    if (!data.description) {
      console.error('❌ Description is required!')
      process.exit(1)
    }
    
    // Restart readline interface
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    const askQuestion = (prompt) => new Promise((resolve) => {
      rl2.question(prompt, resolve)
    })
    
    data.link_url = await askQuestion('\n🔗 Link URL (optional, press Enter to skip): ')
    
    if (data.link_url) {
      data.link_text = await askQuestion('🔘 Link button text (e.g., "Apply Now", "Learn More"): ')
    }
    
    data.image_url = await askQuestion('🖼️  Image URL (optional, press Enter to skip): ')
    
    // Date handling
    let validStartDate = false
    while (!validStartDate) {
      data.start_date = await askQuestion('\n📅 Start date (YYYY-MM-DD or ISO format): ')
      if (isValidDate(data.start_date)) {
        validStartDate = true
      } else {
        console.log('❌ Invalid date format. Please use YYYY-MM-DD (e.g., 2025-10-11)')
      }
    }
    
    let validEndDate = false
    while (!validEndDate) {
      data.end_date = await askQuestion('📅 End date (YYYY-MM-DD or ISO format): ')
      if (isValidDate(data.end_date)) {
        if (new Date(data.end_date) > new Date(data.start_date)) {
          validEndDate = true
        } else {
          console.log('❌ End date must be after start date')
        }
      } else {
        console.log('❌ Invalid date format. Please use YYYY-MM-DD (e.g., 2026-05-01)')
      }
    }
    
    data.priority = await askQuestion('\n⭐ Priority (1=low, 5=medium, 10=high) [default: 5]: ') || '5'
    data.priority = parseInt(data.priority)
    
    // Generate SQL
    const sql = generateSQL(data)
    
    console.log('\n==============================================')
    console.log('📄 Generated SQL:')
    console.log('==============================================\n')
    console.log(sql)
    console.log('\n==============================================\n')
    
    // Ask what to do with it
    const action = await askQuestion('What would you like to do?\n  1) Execute to Supabase now\n  2) Save to file\n  3) Both\n  4) Cancel\nChoice [1]: ') || '1'
    
    if (action === '1' || action === '3') {
      // Execute to Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Supabase credentials not found in .env.local')
        console.log('   Saving to file instead...')
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const insertData = {
          title: data.title,
          description: data.description,
          start_date: formatDate(data.start_date),
          end_date: formatDate(data.end_date),
          priority: data.priority
        }
        
        if (data.link_url) insertData.link_url = data.link_url
        if (data.link_text) insertData.link_text = data.link_text
        if (data.image_url) insertData.image_url = data.image_url
        
        const { data: result, error } = await supabase
          .from('promotional_news')
          .insert([insertData])
          .select()
        
        if (error) {
          console.error('❌ Error inserting to Supabase:', error.message)
        } else {
          console.log('✅ Successfully inserted to Supabase!')
          console.log('   ID:', result[0].id)
        }
      }
    }
    
    if (action === '2' || action === '3') {
      // Save to file
      const filename = `promo_${Date.now()}.sql`
      const filepath = path.join(__dirname, '..', 'database', filename)
      fs.writeFileSync(filepath, sql)
      console.log(`✅ SQL saved to: database/${filename}`)
    }
    
    if (action === '4') {
      console.log('❌ Cancelled')
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

