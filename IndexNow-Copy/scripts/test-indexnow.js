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

  // Test 4: Test IndexNow ping (updated for new API)
  console.log("\n4. Testing IndexNow ping...")
  try {
    const response = await fetch(`${BASE_URL}/api/sitemap/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ indexNow: true, includeContent: true })
    })
    
    const result = await response.json()
    
    if (response.ok && result.indexNow.success) {
      console.log(`   ✅ IndexNow ping successful`)
      console.log(`   📊 Core URLs: ${result.indexNow.sitemap.submittedCount}`)
      console.log(`   📊 Content URLs: ${result.indexNow.content?.submittedCount || 0}`)
      console.log(`   📊 Total: ${result.indexNow.totalSubmitted} URLs submitted`)
      if (result.note) {
        console.log(`   ℹ️  ${result.note}`)
      }
    } else {
      console.log(`   ❌ IndexNow ping failed: ${result.error || result.indexNow?.error}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing IndexNow ping: ${error.message}`)
  }

  // Test 5: Test status endpoint
  console.log("\n5. Testing status endpoint...")
  try {
    const response = await fetch(`${BASE_URL}/api/indexnow/status`)
    const result = await response.json()
    
    if (response.ok) {
      console.log(`   ✅ Status endpoint accessible`)
      console.log(`   📊 Key file: ${result.health.keyFileAccessible ? '✅' : '❌'}`)
      console.log(`   📊 Status: ${result.health.status}`)
      console.log(`   📊 API configured: ${result.health.apiConfigured ? '✅' : '❌'}`)
    } else {
      console.log(`   ❌ Status endpoint failed: ${result.error}`)
    }
  } catch (error) {
    console.log(`   ❌ Error testing status: ${error.message}`)
  }

  console.log("\n🎉 IndexNow testing complete!")
}

// Run the test
testIndexNow().catch(console.error)
