#!/usr/bin/env node

/**
 * Canonical URL Fix Script
 * Tests and documents all canonical URL issues
 */

const https = require('https');

const baseUrl = 'https://www.eastcoastkinkevents.com';

// URLs with canonical tag issues from Google Search Console
const canonicalIssueUrls = [
  // Event URLs with trailing slash issues
  '/events/primal-arts-festival/',
  '/events/charmed/',
  '/events/neehu/',
  '/events/fetcamp/',
  '/events/naughty-knowledge/',
  
  // Base URLs
  '/',
  '/dungeons/',
  '/events/',
  
  // Event URLs with query parameters
  '/events/?category=Outdoor Events',
  '/events/?category=Events',
];

// Expected canonical URLs (should match the actual URLs)
const expectedCanonicals = {
  '/events/primal-arts-festival/': '/events/primal-arts-festival',
  '/events/charmed/': '/events/charmed',
  '/events/neehu/': '/events/neehu',
  '/events/fetcamp/': '/events/fetcamp',
  '/events/naughty-knowledge/': '/events/naughty-knowledge',
  '/': '/',
  '/dungeons/': '/dungeons',
  '/events/': '/events',
  '/events/?category=Outdoor Events': '/events?category=Outdoor Events',
  '/events/?category=Events': '/events?category=Events',
};

async function testCanonicalUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : baseUrl + url;
    
    const req = https.request(fullUrl, { method: 'GET' }, (res) => {
      let html = '';
      
      res.on('data', (chunk) => {
        html += chunk;
      });
      
      res.on('end', () => {
        // Extract canonical URL from HTML
        const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
        const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
        
        const result = {
          url: fullUrl,
          status: res.statusCode,
          canonicalUrl: canonicalUrl,
          hasCanonical: !!canonicalUrl,
          expectedCanonical: expectedCanonicals[url],
          isCorrect: canonicalUrl === (baseUrl + expectedCanonicals[url]),
          isAlternate: canonicalUrl && canonicalUrl !== fullUrl
        };
        resolve(result);
      });
    });
    
    req.on('error', (err) => {
      resolve({
        url: fullUrl,
        status: 'ERROR',
        canonicalUrl: null,
        hasCanonical: false,
        error: err.message,
        expectedCanonical: expectedCanonicals[url],
        isCorrect: false,
        isAlternate: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url: fullUrl,
        status: 'TIMEOUT',
        canonicalUrl: null,
        hasCanonical: false,
        error: 'Request timeout',
        expectedCanonical: expectedCanonicals[url],
        isCorrect: false,
        isAlternate: false
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Canonical URL Fixes...\n');
  
  const results = [];
  
  for (const url of canonicalIssueUrls) {
    console.log(`Testing: ${url}`);
    const result = await testCanonicalUrl(url);
    results.push(result);
    
    if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else if (result.isCorrect) {
      console.log(`✅ ${result.status} - Canonical: ${result.canonicalUrl}`);
    } else if (result.isAlternate) {
      console.log(`⚠️  ${result.status} - Alternate canonical: ${result.canonicalUrl} (should be: ${baseUrl}${result.expectedCanonical})`);
    } else if (!result.hasCanonical) {
      console.log(`❌ ${result.status} - No canonical tag found`);
    } else {
      console.log(`❌ ${result.status} - Wrong canonical: ${result.canonicalUrl} (should be: ${baseUrl}${result.expectedCanonical})`);
    }
    console.log('');
  }
  
  // Summary
  const correct = results.filter(r => r.isCorrect).length;
  const alternate = results.filter(r => r.isAlternate).length;
  const noCanonical = results.filter(r => !r.hasCanonical && r.status !== 'ERROR' && r.status !== 'TIMEOUT').length;
  const wrong = results.filter(r => r.hasCanonical && !r.isCorrect && !r.isAlternate).length;
  const errors = results.filter(r => r.status === 'ERROR' || r.status === 'TIMEOUT').length;
  
  console.log('📊 Test Results:');
  console.log(`✅ Correct canonicals: ${correct}`);
  console.log(`⚠️  Alternate canonicals: ${alternate}`);
  console.log(`❌ No canonical tags: ${noCanonical}`);
  console.log(`❌ Wrong canonicals: ${wrong}`);
  console.log(`❌ Errors: ${errors}`);
  
  if (alternate > 0) {
    console.log('\n⚠️  Alternate Canonical URLs (pages point to different URLs):');
    results.filter(r => r.isAlternate).forEach(r => {
      console.log(`  - ${r.url}`);
      console.log(`    Current: ${r.canonicalUrl}`);
      console.log(`    Expected: ${baseUrl}${r.expectedCanonical}`);
    });
  }
  
  if (noCanonical > 0) {
    console.log('\n❌ Pages Missing Canonical Tags:');
    results.filter(r => !r.hasCanonical && r.status !== 'ERROR' && r.status !== 'TIMEOUT').forEach(r => {
      console.log(`  - ${r.url}`);
    });
  }
  
  if (wrong > 0) {
    console.log('\n❌ Pages with Wrong Canonical URLs:');
    results.filter(r => r.hasCanonical && !r.isCorrect && !r.isAlternate).forEach(r => {
      console.log(`  - ${r.url}`);
      console.log(`    Current: ${r.canonicalUrl}`);
      console.log(`    Expected: ${baseUrl}${r.expectedCanonical}`);
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Deploy these canonical URL fixes');
  console.log('2. Wait 24-48 hours for Google to re-crawl');
  console.log('3. Check Google Search Console for canonical improvements');
  console.log('4. Monitor the "Alternate page with proper canonical tag" section');
  
  console.log('\n💡 Canonical URL Best Practices:');
  console.log('1. Use absolute URLs (https://www.eastcoastkinkevents.com/...)');
  console.log('2. Point to the preferred version of each page');
  console.log('3. Remove trailing slashes for consistency');
  console.log('4. Ensure canonical URLs match the actual page URLs');
  console.log('5. Use www subdomain consistently across all pages');
}

runTests().catch(console.error);
