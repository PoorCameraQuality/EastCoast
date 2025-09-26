#!/usr/bin/env node

/**
 * Soft 404 URL Fix Script
 * Tests and documents all soft 404 URLs that need redirects
 */

const https = require('https');

const baseUrl = 'https://www.eastcoastkinkevents.com';

// All the soft 404 URLs from Google Search Console
const soft404Urls = [
  // Dungeon URLs with mismatched slugs
  '/dungeons/the-baltimore-playhouse',
  '/dungeons/the-baltimore-playhouse/',
  '/dungeons/theowlsnest',
  '/dungeons/theowlsnest/',
  '/dungeons/honeypotdungeon',
  '/dungeons/honeypotdungeon/',
  '/dungeons/ohiosmart',
  '/dungeons/sarasotadarktemple',
  '/dungeons/sarasotadarktemple/',
  '/dungeons/theaphroditegroup',
  '/dungeons/theaphroditegroup/',
  '/dungeons/thecrubible',
  '/dungeons/thecrubible/',
  '/dungeons/thewoodshed',
  '/dungeons/thewoodshed/',
  
  // Event URLs from old kinkeventcalendar
  '/kinkeventcalendar/tethered-together',
  '/kinkeventcalendar/summercamp',
  '/kinkeventcalendar/dungeons-and-geekdoms',
  
  // Event URLs with trailing slash issues
  '/events/kinkycon-summer-co-op/',
  '/events/dungeons-and-geekdoms/',
  '/events/costal-carolina-fetish-fair',
  '/events/costal-carolina-fetish-fair/',
];

// Expected redirect destinations
const expectedRedirects = {
  '/dungeons/the-baltimore-playhouse': '/dungeons/baltimore-playhouse',
  '/dungeons/the-baltimore-playhouse/': '/dungeons/baltimore-playhouse',
  '/dungeons/theowlsnest': '/dungeons/the-nest-philadelphia-poconos',
  '/dungeons/theowlsnest/': '/dungeons/the-nest-philadelphia-poconos',
  '/dungeons/honeypotdungeon': '/dungeons/the-honey-pot-arundel-county',
  '/dungeons/honeypotdungeon/': '/dungeons/the-honey-pot-arundel-county',
  '/dungeons/ohiosmart': '/dungeons/ohiosmart-dungeon-cleveland',
  '/dungeons/sarasotadarktemple': '/dungeons/sarasota-dark-temple',
  '/dungeons/sarasotadarktemple/': '/dungeons/sarasota-dark-temple',
  '/dungeons/theaphroditegroup': '/dungeons/the-aphrodite-group',
  '/dungeons/theaphroditegroup/': '/dungeons/the-aphrodite-group',
  '/dungeons/thecrubible': '/dungeons/the-crucible-washington-dc',
  '/dungeons/thecrubible/': '/dungeons/the-crucible-washington-dc',
  '/dungeons/thewoodshed': '/dungeons/the-woodshed-orlando-florida',
  '/dungeons/thewoodshed/': '/dungeons/the-woodshed-orlando-florida',
  '/kinkeventcalendar/tethered-together': '/events/tethered-together',
  '/kinkeventcalendar/summercamp': '/events/dark-odyssey-summer-camp',
  '/kinkeventcalendar/dungeons-and-geekdoms': '/events/dungeons-geekdoms',
  '/events/kinkycon-summer-co-op/': '/events/kinkycon-summer-co-op',
  '/events/dungeons-and-geekdoms/': '/events/dungeons-geekdoms',
  '/events/costal-carolina-fetish-fair': '/events/coastal-carolina-fetish-fair',
  '/events/costal-carolina-fetish-fair/': '/events/coastal-carolina-fetish-fair',
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
        expectedRedirect: expectedRedirects[url],
        isSoft404: res.statusCode === 200 && !res.headers.location
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
        expectedRedirect: expectedRedirects[url],
        isSoft404: false
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
        expectedRedirect: expectedRedirects[url],
        isSoft404: false
      });
    });
    
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Soft 404 URL Fixes...\n');
  
  const results = [];
  
  for (const url of soft404Urls) {
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
    } else if (result.isSoft404) {
      console.log(`❌ Soft 404: ${result.status} (no redirect, page exists but content is minimal)`);
    } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
      console.log(`❌ ${result.status}: ${result.error}`);
    } else {
      console.log(`❌ ${result.status} (no redirect)`);
    }
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const soft404s = results.filter(r => r.isSoft404).length;
  const failed = results.filter(r => !r.success && !r.isSoft404).length;
  const correctRedirects = results.filter(r => {
    if (!r.success || !r.location) return false;
    return r.location.includes(r.expectedRedirect);
  }).length;
  
  console.log('📊 Test Results:');
  console.log(`✅ Successful redirects: ${successful}`);
  console.log(`🎯 Correct redirects: ${correctRedirects}`);
  console.log(`❌ Soft 404s: ${soft404s}`);
  console.log(`❌ Failed redirects: ${failed}`);
  
  if (soft404s > 0) {
    console.log('\n❌ Soft 404 URLs (pages exist but have minimal content):');
    results.filter(r => r.isSoft404).forEach(r => {
      console.log(`  - ${r.url} (${r.status})`);
    });
  }
  
  if (failed > 0) {
    console.log('\n❌ Failed URLs:');
    results.filter(r => !r.success && !r.isSoft404).forEach(r => {
      console.log(`  - ${r.url} (${r.status})`);
    });
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Deploy these redirect changes');
  console.log('2. Wait 24-48 hours for Google to re-crawl');
  console.log('3. Check Google Search Console for soft 404 improvements');
  console.log('4. Monitor the "Soft 404" section');
  
  console.log('\n🔧 Additional Redirects Needed:');
  const needsRedirects = results.filter(r => !r.success && r.status !== 'ERROR' && r.status !== 'TIMEOUT' && !r.isSoft404);
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
  
  console.log('\n💡 Soft 404 Prevention Tips:');
  console.log('1. Ensure all pages have substantial, unique content');
  console.log('2. Add proper meta descriptions and titles');
  console.log('3. Include structured data for better understanding');
  console.log('4. Regular content audits to identify thin pages');
}

runTests().catch(console.error);
