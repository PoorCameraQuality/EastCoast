#!/usr/bin/env node

/**
 * 404 URL Fix Script
 * Tests and documents all 404 URLs that need redirects
 */

const https = require('https');

const baseUrl = 'https://www.eastcoastkinkevents.com';

// All the 404 URLs from Google Search Console
const problematicUrls = [
  // kinkeducationcenter URLs
  '/kinkeducationcenter/bdsm-10-submission-types',
  '/kinkeducationcenter/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
  '/kinkeducationcenter/hottest-bdsm-events-of-summer-2024',
  '/kinkeducationcenter/are-bdsm-dungeons-legal',
  '/kinkeducationcenter',
  '/kinkeducationcenter/is-bdsm-legal',
  '/kinkeducationcenter/bdsm-breast-torture',
  '/kinkeducationcenter/the-origin-of-bdsm',
  '/kinkeducationcenter/the-hottest-kink-events-for-winter-2024-2025',
  '/kinkeducationcenter/bdsmstoplightsystem',
  '/kinkeducationcenter/consent101',
  
  // kinkeventcalendar URLs
  '/kinkeventcalendar',
  '/kinkeventcalendar?category=Indoor+Kink+Events',
  
  // HTTP versions
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/the-origin-of-bdsm',
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/is-bdsm-legal',
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
  
  // Non-www versions
  'https://eastcoastkinkevents.com/education/aftercare-essentials-supporting-partner-after-play',
  'https://eastcoastkinkevents.com/education/ssc-vs-rack-kink-safety-frameworks',
  'https://eastcoastkinkevents.com/education/negotiation-101-building-consent-bdsm-relationships',
  'https://eastcoastkinkevents.com/education/6eb29727-42dc-4d07-8713-488ecd8276b8/',
];

// Expected redirect destinations
const expectedRedirects = {
  '/kinkeducationcenter/bdsm-10-submission-types': '/education/bdsm-10-submission-types',
  '/kinkeducationcenter/the-subtle-or-not-so-subtle-art-of-mental-bdsm': '/education/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
  '/kinkeducationcenter/hottest-bdsm-events-of-summer-2024': '/education/hottest-bdsm-events-of-summer-2024',
  '/kinkeducationcenter/are-bdsm-dungeons-legal': '/education/are-bdsm-dungeons-legal',
  '/kinkeducationcenter': '/education',
  '/kinkeducationcenter/is-bdsm-legal': '/education/is-bdsm-legal',
  '/kinkeducationcenter/bdsm-breast-torture': '/education/bdsm-breast-torture',
  '/kinkeducationcenter/the-origin-of-bdsm': '/education/the-origin-of-bdsm',
  '/kinkeducationcenter/the-hottest-kink-events-for-winter-2024-2025': '/education/the-hottest-kink-events-for-winter-2024-2025',
  '/kinkeducationcenter/bdsmstoplightsystem': '/education/bdsm-stoplight-system',
  '/kinkeducationcenter/consent101': '/education/consent-101',
  '/kinkeventcalendar': '/events',
  '/kinkeventcalendar?category=Indoor+Kink+Events': '/events?category=Indoor+Kink+Events',
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/the-origin-of-bdsm': '/education/the-origin-of-bdsm',
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/is-bdsm-legal': '/education/is-bdsm-legal',
  'http://www.eastcoastkinkevents.com/kinkeducationcenter/the-subtle-or-not-so-subtle-art-of-mental-bdsm': '/education/the-subtle-or-not-so-subtle-art-of-mental-bdsm',
  'https://eastcoastkinkevents.com/education/aftercare-essentials-supporting-partner-after-play': '/education/aftercare-essentials-supporting-partner-after-play',
  'https://eastcoastkinkevents.com/education/ssc-vs-rack-kink-safety-frameworks': '/education/ssc-vs-rack-kink-safety-frameworks',
  'https://eastcoastkinkevents.com/education/negotiation-101-building-consent-bdsm-relationships': '/education/negotiation-101-building-consent-bdsm-relationships',
  'https://eastcoastkinkevents.com/education/6eb29727-42dc-4d07-8713-488ecd8276b8/': '/education/ssc-vs-rack-kink-safety-frameworks',
};

async function testUrl(url) {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('http') ? url : baseUrl + url;
    
    const req = https.request(fullUrl, { method: 'HEAD' }, (res) => {
      const result = {
        url: fullUrl,
        status: res.statusCode,
        location: res.headers.location,
        success: res.statusCode >= 300 && res.statusCode < 400 && res.headers.location,
        expectedRedirect: expectedRedirects[url]
      };
      resolve(result);
    });
    
    req.on('error', (err) => {
      resolve({
        url: fullUrl,
        status: 'ERROR',
        location: null,
        success: false,
        error: err.message,
        expectedRedirect: expectedRedirects[url]
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        url: fullUrl,
        status: 'TIMEOUT',
        location: null,
        success: false,
        error: 'Request timeout',
        expectedRedirect: expectedRedirects[url]
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing 404 URL Fixes...\n');
  
  const results = [];
  
  for (const url of problematicUrls) {
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    results.push(result);
    
    if (result.success) {
      const isCorrectRedirect = result.location && result.location.includes(result.expectedRedirect);
      if (isCorrectRedirect) {
        console.log(`✅ ${result.status} → ${result.location}`);
      } else {
        console.log(`⚠️  ${result.status} → ${result.location} (expected: ${result.expectedRedirect})`);
      }
    } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else {
      console.log(`❌ ${result.status} (no redirect)`);
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const correctRedirects = results.filter(r => {
    if (!r.success || !r.location) return false;
    return r.location.includes(r.expectedRedirect);
  }).length;
  
  console.log('📊 Test Results:');
  console.log(`✅ Successful redirects: ${successful}`);
  console.log(`🎯 Correct redirects: ${correctRedirects}`);
  console.log(`❌ Failed redirects: ${failed}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.url} (${r.status})`);
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Deploy these redirect changes');
  console.log('2. Wait 24-48 hours for Google to re-crawl');
  console.log('3. Check Google Search Console for 404 improvements');
  console.log('4. Monitor the "Not found (404)" section');
  
  console.log('\n🔧 Additional Redirects Needed:');
  const needsRedirects = results.filter(r => !r.success && r.status !== 'ERROR' && r.status !== 'TIMEOUT');
  if (needsRedirects.length > 0) {
    console.log('Add these to next.config.js redirects:');
    needsRedirects.forEach(r => {
      console.log(`  {
    source: '${r.url.replace(baseUrl, '')}',
    destination: '${r.expectedRedirect}',
    permanent: true,
  },`);
    });
  }
}

runTests().catch(console.error);
