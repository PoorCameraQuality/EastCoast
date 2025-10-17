/**
 * Quick test of title optimization
 * Run with: node scripts/test-title-fix.js
 */

// Simple title generation functions (copied from seo-helpers logic)
function generateEventTitle(event) {
  const MAX_TITLE_LENGTH = 60
  const BRAND_SHORT = "ECKE"
  
  const year = event.date?.start ? new Date(event.date.start).getFullYear() : ''
  const eventName = event.name
  
  // Try different title formats based on length
  let title = `${eventName} ${year} | ${BRAND_SHORT}`
  
  // If too long, remove year
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${eventName} | ${BRAND_SHORT}`
  }
  
  // If still too long, truncate event name
  if (title.length > MAX_TITLE_LENGTH) {
    const brandLength = BRAND_SHORT.length + 3 // +3 for " | "
    const availableForEvent = MAX_TITLE_LENGTH - brandLength
    title = `${eventName.substring(0, availableForEvent - 3)}... | ${BRAND_SHORT}`
  }
  
  return title
}

function generateDungeonTitle(dungeon) {
  const MAX_TITLE_LENGTH = 60
  const BRAND_SHORT = "ECKE"
  
  const location = `${dungeon.location.city}, ${dungeon.location.state}`
  let title = `${dungeon.name} - ${location} | ${BRAND_SHORT}`
  
  // If too long, remove location
  if (title.length > MAX_TITLE_LENGTH) {
    title = `${dungeon.name} | ${BRAND_SHORT}`
  }
  
  // If still too long, truncate dungeon name
  if (title.length > MAX_TITLE_LENGTH) {
    const brandLength = BRAND_SHORT.length + 3 // +3 for " | "
    const availableForDungeon = MAX_TITLE_LENGTH - brandLength
    title = `${dungeon.name.substring(0, availableForDungeon - 3)}... | ${BRAND_SHORT}`
  }
  
  return title
}

// Test with some sample events and dungeons
function testTitleOptimization() {
  console.log("🧪 Testing Title Optimization...\n")

  // Sample events (from the CSV data)
  const sampleEvents = [
    {
      name: "Mid-Atlantic Leather Weekend 2026",
      date: { start: "2026-01-16" },
      slug: "mid-atlantic-leather-weekend-2026"
    },
    {
      name: "Naughty Noel",
      date: { start: "2025-12-03" },
      slug: "naughty-noel"
    },
    {
      name: "Coastal Carolina Fetish Fair",
      date: { start: "2025-06-15" },
      slug: "coastal-carolina-fetish-fair"
    }
  ]

  // Sample dungeons
  const sampleDungeons = [
    {
      name: "Baltimore Playhouse",
      location: { city: "Baltimore", state: "MD" },
      slug: "baltimore-playhouse"
    },
    {
      name: "The Crucible",
      location: { city: "Washington DC", state: "DC" },
      slug: "the-crucible-washington-dc"
    }
  ]

  console.log("📝 EVENT TITLES:")
  console.log("-".repeat(60))
  sampleEvents.forEach(event => {
    const title = generateEventTitle(event)
    const isValid = title.length <= 60
    const status = isValid ? "✅" : "❌"
    console.log(`${status} ${event.name}`)
    console.log(`   Title: "${title}"`)
    console.log(`   Length: ${title.length}/60 characters`)
    console.log("")
  })

  console.log("🏰 DUNGEON TITLES:")
  console.log("-".repeat(60))
  sampleDungeons.forEach(dungeon => {
    const title = generateDungeonTitle(dungeon)
    const isValid = title.length <= 60
    const status = isValid ? "✅" : "❌"
    console.log(`${status} ${dungeon.name}`)
    console.log(`   Title: "${title}"`)
    console.log(`   Length: ${title.length}/60 characters`)
    console.log("")
  })

  // Summary
  const allTitles = [
    ...sampleEvents.map(e => ({ name: e.name, title: generateEventTitle(e) })),
    ...sampleDungeons.map(d => ({ name: d.name, title: generateDungeonTitle(d) }))
  ]

  const validTitles = allTitles.filter(t => t.title.length <= 60).length
  const totalTitles = allTitles.length

  console.log("📊 SUMMARY:")
  console.log(`Valid titles: ${validTitles}/${totalTitles}`)
  
  if (validTitles === totalTitles) {
    console.log("🎉 All sample titles are optimized!")
    console.log("Ready to deploy and fix Bing warnings!")
  } else {
    console.log("⚠️ Some titles still need work.")
  }
}

// Run the test
testTitleOptimization()
