const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_PAGES = [
  '/',
  '/events/',
  '/dungeons/',
  '/education/',
  '/contact/',
  '/about/',
  '/calendar/',
  '/guidelines/',
  '/privacy/',
  '/terms/',
  '/admin/review-submissions/',
  '/education/submit/'
];

// Test individual event and dungeon pages
const TEST_DYNAMIC_PAGES = [
  '/events/frolicon/',
  '/events/dark-odyssey/',
  '/dungeons/baltimore-playhouse/',
  '/dungeons/woodshed/'
];

// Test API endpoints (with trailing slashes)
const TEST_APIS = [
  '/api/contact/',
  '/api/education/submit/',
  '/api/admin/submissions/1/approve/',
  '/api/admin/submissions/1/reject/'
];

function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: url,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Website-Test-Script'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testPage(url, expectedStatus = 200) {
  try {
    const response = await makeRequest(url);
    const success = response.statusCode === expectedStatus;
    console.log(`${success ? '✅' : '❌'} ${url} - Status: ${response.statusCode} ${success ? '' : `(expected ${expectedStatus})`}`);
    return success;
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
    return false;
  }
}

async function testAPI(url, method = 'GET', data = null, expectedStatus = 200) {
  try {
    const response = await makeRequest(url, method, data);
    const success = response.statusCode === expectedStatus;
    console.log(`${success ? '✅' : '❌'} ${method} ${url} - Status: ${response.statusCode} ${success ? '' : `(expected ${expectedStatus})`}`);
    return success;
  } catch (error) {
    console.log(`❌ ${method} ${url} - Error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Comprehensive Website Test\n');
  
  let totalTests = 0;
  let passedTests = 0;

  // Test main pages
  console.log('📄 Testing Main Pages:');
  for (const page of TEST_PAGES) {
    const success = await testPage(page);
    totalTests++;
    if (success) passedTests++;
  }

  // Test dynamic pages
  console.log('\n🔗 Testing Dynamic Pages:');
  for (const page of TEST_DYNAMIC_PAGES) {
    const success = await testPage(page);
    totalTests++;
    if (success) passedTests++;
  }

  // Test API endpoints (should return 405 Method Not Allowed for GET requests)
  console.log('\n🔌 Testing API Endpoints:');
  for (const api of TEST_APIS) {
    const success = await testPage(api, 405); // API endpoints should return 405 for GET
    totalTests++;
    if (success) passedTests++;
  }

  // Test POST to contact API
  console.log('\n📝 Testing Contact Form API:');
  const contactData = JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    contactType: 'General Feedback',
    message: 'This is a test message'
  });
  const contactSuccess = await testAPI('/api/contact/', 'POST', contactData, 200);
  totalTests++;
  if (contactSuccess) passedTests++;

  // Test POST to education submit API
  console.log('\n📚 Testing Education Submit API:');
  const articleData = JSON.stringify({
    authorName: 'Test Author',
    authorEmail: 'author@example.com',
    authorBio: 'Test author bio',
    articleTitle: 'Test Article',
    articleExcerpt: 'This is a test article excerpt for testing purposes.',
    articleContent: 'This is a test article content with enough words to meet the minimum requirement. '.repeat(50),
    articleCategory: 'Safety',
    articleTags: 'test, safety',
    authorCredentials: 'Test Credentials',
    agreeToTerms: true
  });
  const articleSuccess = await testAPI('/api/education/submit/', 'POST', articleData, 200);
  totalTests++;
  if (articleSuccess) passedTests++;

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Website is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run the tests
runTests().catch(console.error);
