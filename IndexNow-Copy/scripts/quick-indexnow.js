/**
 * Quick IndexNow submission for specific URLs
 * 
 * Usage:
 *   node scripts/quick-indexnow.js "https://www.eastcoastkinkevents.com/events/new-event"
 *   node scripts/quick-indexnow.js --batch "url1,url2,url3"
 */

const BASE_URL = "https://www.eastcoastkinkevents.com"

async function quickIndexNow() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log("Usage:")
    console.log("  node scripts/quick-indexnow.js <single-url>")
    console.log("  node scripts/quick-indexnow.js --batch <url1,url2,url3>")
    console.log("\nExamples:")
    console.log("  node scripts/quick-indexnow.js \"https://www.eastcoastkinkevents.com/events/naughty-noel\"")
    console.log("  node scripts/quick-indexnow.js --batch \"https://www.eastcoastkinkevents.com/events/event1,https://www.eastcoastkinkevents.com/events/event2\"")
    process.exit(1)
  }

  let urls = []
  
  if (args[0] === '--batch') {
    const urlString = args[1]
    if (!urlString) {
      console.log("❌ Error: --batch requires comma-separated URLs")
      process.exit(1)
    }
    urls = urlString.split(',').map(url => url.trim())
  } else {
    urls = [args[0]]
  }

  console.log(`🚀 Quick IndexNow submission for ${urls.length} URL(s)...\n`)

  try {
    const response = await fetch(`${BASE_URL}/api/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlList: urls })
    })

    const result = await response.json()

    if (response.ok && result.status === 200) {
      console.log("✅ IndexNow submission successful!")
      console.log(`   📊 URLs submitted: ${result.submittedCount}`)
      console.log(`   📊 URLs skipped: ${result.skippedCount || 0}`)
      console.log(`   📊 Status: ${result.status} ${result.statusText}`)
      
      if (result.urls && result.urls.length > 0) {
        console.log("\n   📝 Submitted URLs:")
        result.urls.forEach(url => console.log(`      • ${url}`))
      }
      
    } else {
      console.log("❌ IndexNow submission failed!")
      console.log(`   Status: ${result.status || response.status}`)
      console.log(`   Error: ${result.error || result.statusText || 'Unknown error'}`)
      process.exit(1)
    }

  } catch (error) {
    console.error("💥 Script error:", error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  quickIndexNow()
}

module.exports = { quickIndexNow }
