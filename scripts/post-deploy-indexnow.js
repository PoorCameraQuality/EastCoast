/**
 * Post-deployment IndexNow submission script
 * 
 * Run after deployment to notify search engines about:
 * - All state hub pages (always fresh)
 * - Recently updated events/dungeons/content
 * 
 * Usage:
 *   node scripts/post-deploy-indexnow.js
 *   node scripts/post-deploy-indexnow.js --content-only
 *   node scripts/post-deploy-indexnow.js --core-only
 */

const BASE_URL = "https://www.eastcoastkinkevents.com"

async function postDeployIndexNow() {
  const args = process.argv.slice(2)
  const contentOnly = args.includes('--content-only')
  const coreOnly = args.includes('--core-only')
  
  console.log("🚀 Post-deployment IndexNow submission...")
  console.log(`   Mode: ${contentOnly ? 'Content only' : coreOnly ? 'Core only' : 'Full submission'}\n`)

  try {
    // Build submission payload
    const payload = {
      indexNow: true,
      includeContent: !coreOnly
    }

    // Submit via our API
    const response = await fetch(`${BASE_URL}/api/sitemap/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const result = await response.json()

    if (response.ok && result.indexNow.success) {
      console.log("✅ IndexNow submission successful!")
      console.log(`   📊 Core URLs: ${result.indexNow.sitemap.submittedCount}`)
      
      if (result.indexNow.content) {
        console.log(`   📊 Content URLs: ${result.indexNow.content.submittedCount}`)
      }
      
      console.log(`   📊 Total submitted: ${result.indexNow.totalSubmitted}`)
      console.log(`   ⏰ Timestamp: ${result.timestamp}`)
      
      if (result.note) {
        console.log(`\n   ℹ️  ${result.note}`)
      }
      
      console.log("\n🎯 Next steps:")
      console.log("   • Monitor Bing Webmaster Tools → URL Submission")
      console.log("   • Check Google Search Console → Sitemaps")
      console.log("   • Verify indexing in 24-48 hours")
      
    } else {
      console.log("❌ IndexNow submission failed!")
      console.log(`   Status: ${response.status}`)
      console.log(`   Error: ${result.error || result.indexNow?.error || 'Unknown error'}`)
      process.exit(1)
    }

  } catch (error) {
    console.error("💥 Script error:", error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  postDeployIndexNow()
}

module.exports = { postDeployIndexNow }
