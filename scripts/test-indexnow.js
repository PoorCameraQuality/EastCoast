/**
 * Test script for IndexNow functionality
 * Run with: node scripts/test-indexnow.js
 */

const BASE_URL = "https://www.eastcoastkinkevents.com"

async function testIndexNow() {
  console.log("🧪 Testing IndexNow functionality...\n")

  // Test 1: Check if key file is accessible
  console.log("1. Testing key file accessibility...")
  try {
    const keyResponse = await fetch(`${BASE_URL}/0050cb815778482eafc98bbf0849daad.txt`)
    if (keyResponse.ok) {
      const keyContent = await keyResponse.text()
      console.log(`   ✅ Key file accessible: ${keyContent.trim()}`)
    } else {
      console.log(`   ❌ Key file not accessible: ${keyResponse.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Error accessing key file: ${error.message}`)
  }

  // Test 2: Test single URL submission
  console.log("\n2. Testing single URL submission...")
  try {
    const testUrl = `${BASE_URL}/events`
    const response = await fetch(`${BASE_URL}/api/indexnow?url=${encodeURIComponent(testUrl)}`)
    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Single URL submitted successfully: ${result.submittedCount} URLs`)
    } else {
      console.log(`   ❌ Single URL submission failed: ${result.error || result.statusText}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing single URL: ${error.message}`)
  }

  // Test 3: Test bulk URL submission
  console.log("\n3. Testing bulk URL submission...")
  try {
    const testUrls = [
      `${BASE_URL}/`,
      `${BASE_URL}/events`,
      `${BASE_URL}/dungeons`,
      `${BASE_URL}/education`,
      `${BASE_URL}/states/new-york`
    ]
    
    const response = await fetch(`${BASE_URL}/api/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlList: testUrls })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Bulk URLs submitted successfully: ${result.submittedCount} URLs`)
      console.log(`   📊 Status: ${result.status} ${result.statusText}`)
    } else {
      console.log(`   ❌ Bulk URL submission failed: ${result.error || result.statusText}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing bulk URLs: ${error.message}`)
  }

  // Test 4: Test sitemap ping
  console.log("\n4. Testing sitemap ping...")
  try {
    const response = await fetch(`${BASE_URL}/api/sitemap/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchEngines: true, indexNow: true })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Sitemap ping successful`)
      console.log(`   📊 Google: ${result.sitemapPings.google?.success ? '✅' : '❌'} (${result.sitemapPings.google?.status})`)
      console.log(`   📊 Bing: ${result.sitemapPings.bing?.success ? '✅' : '❌'} (${result.sitemapPings.bing?.status})`)
      console.log(`   📊 IndexNow: ${result.indexNow.totalSubmitted || 0} URLs submitted`)
    } else {
      console.log(`   ❌ Sitemap ping failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing sitemap ping: ${error.message}`)
  }

  console.log("\n🎉 IndexNow testing complete!")
}

// Run the test
testIndexNow().catch(console.error)
