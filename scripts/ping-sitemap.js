#!/usr/bin/env node

/**
 * Manual Sitemap Ping Script
 * 
 * Use this script to manually ping search engines after:
 * - Bulk database operations
 * - Direct SQL inserts
 * - Data imports
 * - Any time you bypass the normal API
 * 
 * Usage:
 *   node scripts/ping-sitemap.js
 *   npm run ping-sitemap (if you add it to package.json)
 */

const https = require('https')

const SITEMAP_PING_URL = 'https://eastcoastkinkevents.com/api/sitemap/ping'

async function pingSitemap() {
  console.log('🔔 Pinging sitemap to notify search engines...')
  
  try {
    const response = await fetch(SITEMAP_PING_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Manual-Ping-Script/1.0'
      },
      body: JSON.stringify({
        source: 'manual_script',
        contentType: 'bulk_operation',
        timestamp: new Date().toISOString()
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Sitemap ping successful!')
      console.log('📊 Response:', result)
      console.log('🕐 Timestamp:', result.timestamp)
    } else {
      console.error('❌ Sitemap ping failed!')
      console.error('📊 Error:', result)
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Network error pinging sitemap:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  pingSitemap()
}

module.exports = { pingSitemap }
