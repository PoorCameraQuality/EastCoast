/**
 * Validate all page titles are under 60 characters
 * Run with: node scripts/validate-titles.js
 */

const path = require('path')
const { testAllTitles, getTitleStats } = require(path.join(__dirname, '../src/lib/seo-helpers'))

async function validateTitles() {
  console.log("🔍 Validating all page titles...\n")

  try {
    const results = testAllTitles()
    const stats = getTitleStats(results)

    // Display overall statistics
    console.log("📊 TITLE VALIDATION RESULTS")
    console.log("=" .repeat(50))
    console.log(`Total pages: ${stats.total}`)
    console.log(`Valid titles (≤60 chars): ${stats.valid}`)
    console.log(`Invalid titles (>60 chars): ${stats.invalid}`)
    console.log(`Average length: ${stats.averageLength} characters`)
    console.log(`Longest title: ${stats.longestLength} characters`)
    console.log("")

    // Show invalid titles
    if (stats.invalid > 0) {
      console.log("❌ INVALID TITLES (need fixing):")
      console.log("-".repeat(50))
      
      const allInvalid = [
        ...results.events.filter(t => !t.valid),
        ...results.dungeons.filter(t => !t.valid),
        ...results.articles.filter(t => !t.valid)
      ]
      
      allInvalid.forEach(item => {
        console.log(`${item.slug}`)
        console.log(`  Length: ${item.length} chars`)
        console.log(`  Title: "${item.title}"`)
        console.log(`  Warning: ${item.warning}`)
        console.log("")
      })
    } else {
      console.log("✅ ALL TITLES ARE VALID!")
      console.log("All page titles are under 60 characters.")
    }

    // Show examples of optimized titles
    console.log("📝 SAMPLE OPTIMIZED TITLES:")
    console.log("-".repeat(50))
    
    const sampleEvents = results.events.slice(0, 3)
    const sampleDungeons = results.dungeons.slice(0, 3)
    
    sampleEvents.forEach(event => {
      console.log(`Event: ${event.name}`)
      console.log(`  Title: "${event.title}" (${event.length} chars)`)
      console.log("")
    })
    
    sampleDungeons.forEach(dungeon => {
      console.log(`Dungeon: ${dungeon.name}`)
      console.log(`  Title: "${dungeon.title}" (${dungeon.length} chars)`)
      console.log("")
    })

    // Summary
    if (stats.invalid === 0) {
      console.log("🎉 SUCCESS!")
      console.log("All titles are now optimized for Bing SEO.")
      console.log("Ready to deploy and submit via IndexNow!")
    } else {
      console.log("⚠️  ATTENTION REQUIRED!")
      console.log(`${stats.invalid} titles still need optimization.`)
      console.log("Review the invalid titles above and adjust the title generation logic.")
    }

  } catch (error) {
    console.error("💥 Error validating titles:", error.message)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  validateTitles()
}

module.exports = { validateTitles }
