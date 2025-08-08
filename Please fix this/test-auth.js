// Simple authentication test script
// Run this in the browser console to test auth functionality

console.log('🧪 Testing Authentication System...');

// Test 1: Check if AuthProvider is loaded
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Test 2: Check for auth context
  setTimeout(() => {
    console.log('🔍 Checking auth context...');
    
    // Look for auth-related console logs
    const originalLog = console.log;
    let authLogs = [];
    
    console.log = function(...args) {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('AUTH')) {
        authLogs.push(args.join(' '));
      }
      originalLog.apply(console, args);
    };
    
    // Wait a bit for auth to initialize
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
