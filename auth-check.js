// 🔍 COMPREHENSIVE AUTHENTICATION CHECK SCRIPT
// Run this in your browser console at http://localhost:3001/admin/test-auth

console.log('🔍 COMPREHENSIVE AUTHENTICATION CHECK');
console.log('=====================================');

// 1. Check Environment Variables
console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK');
console.log('----------------------------------');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not Set');

// 2. Check localStorage
console.log('\n💾 2. LOCAL STORAGE CHECK');
console.log('--------------------------');
if (typeof localStorage !== 'undefined') {
  console.log('✅ localStorage is available');
  
  const supabaseToken = localStorage.getItem('supabase.auth.token');
  if (supabaseToken) {
    console.log('✅ Supabase token found in localStorage');
    try {
      const tokenData = JSON.parse(supabaseToken);
      console.log('Token data:', tokenData);
    } catch (e) {
      console.log('❌ Error parsing token data');
    }
  } else {
    console.log('❌ No Supabase token found in localStorage');
  }
} else {
  console.log('❌ localStorage not available');
}

// 3. Check AuthProvider Context
console.log('\n🔐 3. AUTH PROVIDER CONTEXT CHECK');
console.log('-----------------------------------');
if (window.authProvider) {
  console.log('✅ AuthProvider context is available');
} else {
  console.log('❌ AuthProvider context not found');
}

// 4. Check Supabase Client
console.log('\n🔧 4. SUPABASE CLIENT CHECK');
console.log('----------------------------');
if (window.supabase) {
  console.log('✅ Supabase client is available');
} else {
  console.log('❌ Supabase client not found');
}

// 5. Check Current User State
console.log('\n👤 5. CURRENT USER STATE CHECK');
console.log('-------------------------------');
const userElement = document.querySelector('[data-testid="user-email"]') || 
                   document.querySelector('p:contains("Email:")') ||
                   document.querySelector('.text-gray-300 p:contains("Email:")');

if (userElement) {
  const userText = userElement.textContent;
  console.log('User info from DOM:', userText);
} else {
  console.log('❌ Could not find user info in DOM');
}

// 6. Check Admin Status
console.log('\n👑 6. ADMIN STATUS CHECK');
console.log('------------------------');
const adminElement = document.querySelector('[data-testid="is-admin"]') ||
                    document.querySelector('p:contains("Is Admin:")') ||
                    document.querySelector('.text-gray-300 p:contains("Is Admin:")');

if (adminElement) {
  const adminText = adminElement.textContent;
  console.log('Admin status from DOM:', adminText);
} else {
  console.log('❌ Could not find admin status in DOM');
}

// 7. Check Session Status
console.log('\n🔑 7. SESSION STATUS CHECK');
console.log('----------------------------');
const sessionElement = document.querySelector('[data-testid="session-status"]') ||
                      document.querySelector('p:contains("Session:")') ||
                      document.querySelector('.text-gray-300 p:contains("Session:")');

if (sessionElement) {
  const sessionText = sessionElement.textContent;
  console.log('Session status from DOM:', sessionText);
} else {
  console.log('❌ Could not find session status in DOM');
}

// 8. Check Loading State
console.log('\n⏳ 8. LOADING STATE CHECK');
console.log('--------------------------');
const loadingElement = document.querySelector('[data-testid="loading-state"]') ||
                       document.querySelector('p:contains("Loading:")') ||
                       document.querySelector('.text-gray-300 p:contains("Loading:")');

if (loadingElement) {
  const loadingText = loadingElement.textContent;
  console.log('Loading state from DOM:', loadingText);
} else {
  console.log('❌ Could not find loading state in DOM');
}

// 9. Test Authentication Functions
console.log('\n🧪 9. AUTHENTICATION FUNCTION TESTS');
console.log('------------------------------------');

// Test if we can access Supabase functions
if (window.supabase) {
  console.log('✅ Supabase client available for testing');
  
  // Test getSession
  try {
    const { data, error } = await window.supabase.auth.getSession();
    if (error) {
      console.log('❌ getSession error:', error);
    } else if (data.session) {
      console.log('✅ getSession successful, user:', data.session.user.email);
    } else {
      console.log('❌ getSession: No session found');
    }
  } catch (e) {
    console.log('❌ getSession exception:', e);
  }
} else {
  console.log('❌ Cannot test Supabase functions - client not available');
}

// 10. Check for Auth Errors in Console
console.log('\n🚨 10. AUTH ERROR CHECK');
console.log('------------------------');
console.log('Check the console above for any authentication errors');
console.log('Common errors to look for:');
console.log('- "Auth session missing"');
console.log('- "Missing Supabase environment variables"');
console.log('- "Profile error"');
console.log('- "No valid session for admin route"');

// 11. Summary
console.log('\n📊 11. AUTHENTICATION SUMMARY');
console.log('-----------------------------');
console.log('If you see "❌" items above, those need to be fixed.');
console.log('If you see "✅" items, those are working correctly.');
console.log('');
console.log('To fix authentication issues:');
console.log('1. Set environment variables in .env.local');
console.log('2. Ensure Supabase project is configured');
console.log('3. Create admin user in Supabase profiles table');
console.log('4. Check RLS policies in Supabase');
console.log('5. Verify login flow works');

console.log('\n🔍 AUTHENTICATION CHECK COMPLETE');
console.log('================================');
