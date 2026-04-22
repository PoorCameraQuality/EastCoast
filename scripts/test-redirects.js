#!/usr/bin/env node

/**
 * Redirect Testing Script
 * Tests all redirects to ensure they work properly
 */

const https = require('https');
const http = require('http');

const baseUrl = 'https://www.eastcoastkinkevents.com';
const testUrls = [
  // HTTP to HTTPS redirects
  'http://eastcoastkinkevents.com/',
  'http://www.eastcoastkinkevents.com/',
  
  // Non-www to www redirects
  'https://eastcoastkinkevents.com/',
  
  // Old kinkeventcalendar URLs
  '/kinkeventcalendar/primal-arts-festival/',
  '/kinkeventcalendar/charmed/',
  '/kinkeventcalendar/neehu/',
  '/kinkeventcalendar/fetcamp/',
  
  // Legacy kinkeducationcenter → /blog (see legacyKinkEducationToBlog.ts)
  '/kinkeducationcenter/consent101',
  '/kinkeducationcenter/ssc-vs-rack-kink-safety-frameworks',
  
  // Old dungeon URLs
  '/dungeons/ascendcommunity',
  
  // Old giving page
  '/giving-page-1-1',
  
  // Category query parameters
  '/?category=Outdoor+Events',
];

async function testRedirect(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : baseUrl + url;
    const protocol = fullUrl.startsWith('https') ? https : http;
    
    const req = protocol.request(fullUrl, { method: 'HEAD' }, (res) => {
      const result = {
        url: fullUrl,
        status: res.statusCode,
        location: res.headers.location,
        success: res.statusCode >= 300 && res.statusCode < 400 && res.headers.location
      };
      resolve(result);
    });
    
    req.on('error', (err) => {
      resolve({
        url: fullUrl,
        status: 'ERROR',
        location: null,
        success: false,
        error: err.message
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url: fullUrl,
        status: 'TIMEOUT',
        location: null,
        success: false,
        error: 'Request timeout'
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Redirects...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    const result = await testRedirect(url);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status} → ${result.location}`);
    } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else {
      console.log(`⚠️  ${result.status} (no redirect)`);
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('📊 Test Results:');
  console.log(`✅ Successful redirects: ${successful}`);
  console.log(`❌ Failed redirects: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url} (${r.status})`);
    });
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Deploy these changes to production');
  console.log('2. Wait 24-48 hours for Google to re-crawl');
  console.log('3. Check Google Search Console for improvements');
  console.log('4. Submit updated sitemap to Google');
}

runTests().catch(console.error);
