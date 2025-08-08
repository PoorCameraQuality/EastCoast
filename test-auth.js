// Simple authentication test script
// Run this in the browser console to test auth functionality

console.log('🧪 Testing Authentication System...');

// Test 1: Check if AuthProvider is loaded
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Test 2: Check localStorage functionality
  console.log('🔍 Testing localStorage...');
  try {
    const testKey = 'test-storage';
    localStorage.setItem(testKey, 'test');
    const value = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    if (value === 'test') {
      console.log('✅ localStorage is working');
    } else {
      console.log('❌ localStorage test failed');
    }
  } catch (error) {
    console.log('❌ localStorage error:', error);
  }

  // Test 3: Check Supabase session storage
  console.log('🔍 Checking Supabase session storage...');
  const session = localStorage.getItem('supabase.auth.token');
  if (session) {
    console.log('✅ Supabase session found in localStorage');
    try {
      const sessionData = JSON.parse(session);
      console.log('📊 Session data:', {
        access_token: sessionData.access_token ? 'Present' : 'Missing',
        refresh_token: sessionData.refresh_token ? 'Present' : 'Missing',
        expires_at: sessionData.expires_at ? new Date(sessionData.expires_at * 1000).toLocaleString() : 'Missing'
      });
    } catch (e) {
      console.log('❌ Failed to parse session data');
    }
  } else {
    console.log('❌ No Supabase session found in localStorage');
  }

  // Test 4: Check for auth context
  setTimeout(() => {
    console.log('🔍 Checking auth context...');
    
    const originalLog = console.log;
    let authLogs = [];
    
    console.log = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('AUTH')) {
        authLogs.push(args.join(' '));
      }
      originalLog.apply(console, args);
    };
    
    setTimeout(() => {
      console.log = originalLog;
      console.log('📊 Auth Logs Found:', authLogs.length);
      authLogs.forEach(log => console.log('  ', log));
      
      if (authLogs.length > 0) {
        console.log('✅ Authentication system is active');
      } else {
        console.log('❌ No auth logs found - check AuthProvider');
      }
    }, 2000);
  }, 1000);
} else {
  console.log('❌ Not in browser environment');
}

console.log('🧪 Auth test script loaded. Check console for results.');
