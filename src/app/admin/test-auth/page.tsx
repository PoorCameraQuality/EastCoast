'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { supabase, forceSessionRefresh } from '@/lib/supabase'

export default function TestAuthPage() {
  const { user, loading, isAdmin } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toISOString()}: ${result}`])
  }

  const runTests = async () => {
    setTestResults([])
    addTestResult('Starting authentication tests...')

    try {
      // Test 1: Check if Supabase is configured
      if (!supabase) {
        addTestResult('❌ Supabase not configured')
        return
      }
      addTestResult('✅ Supabase configured')

      // Test 2: Check localStorage
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('supabase.auth.token')
        if (storedSession) {
          addTestResult('✅ Found session in localStorage')
          try {
            const sessionData = JSON.parse(storedSession)
            addTestResult(`✅ Session data: access_token=${!!sessionData.access_token}, refresh_token=${!!sessionData.refresh_token}`)
          } catch (e) {
            addTestResult('❌ Failed to parse session data')
          }
        } else {
          addTestResult('❌ No session in localStorage')
        }
      }

      // Test 3: Check cookies
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => 
        cookie.trim().startsWith('sb-') && cookie.includes('-auth-token')
      )
      if (authCookie) {
        addTestResult('✅ Found auth cookie')
        addTestResult(`Cookie: ${authCookie.split('=')[0].trim()}`)
      } else {
        addTestResult('❌ No auth cookie found')
      }

      // Test 4: Get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        addTestResult(`❌ Session error: ${error.message}`)
      } else if (session) {
        addTestResult(`✅ Session found for user: ${session.user.email}`)
        addTestResult(`Session expires: ${new Date(session.expires_at! * 1000).toISOString()}`)
      } else {
        addTestResult('❌ No session from Supabase')
      }

      // Test 5: Force session refresh
      addTestResult('🔄 Force refreshing session...')
      await forceSessionRefresh()
      addTestResult('✅ Session refresh completed')

      // Test 6: Check auth context
      if (user) {
        addTestResult(`✅ Auth context user: ${user.email} (${user.role})`)
        addTestResult(`Is admin: ${isAdmin}`)
      } else {
        addTestResult('❌ No user in auth context')
      }

      // Test 7: Test admin route access
      try {
        const response = await fetch('/admin/dashboard', { 
          method: 'HEAD',
          credentials: 'include'
        })
        if (response.ok) {
          addTestResult('✅ Admin route accessible')
        } else {
          addTestResult(`❌ Admin route not accessible: ${response.status}`)
        }
      } catch (error) {
        addTestResult(`❌ Error testing admin route: ${error}`)
      }

    } catch (error) {
      addTestResult(`❌ Test error: ${error}`)
    }
  }

  useEffect(() => {
    // Collect debug info
    const info = {
      userAgent: navigator.userAgent,
      cookies: document.cookie,
      localStorage: typeof window !== 'undefined' ? {
        hasSession: !!localStorage.getItem('supabase.auth.token'),
        sessionLength: localStorage.getItem('supabase.auth.token')?.length || 0
      } : null,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <button
                onClick={runTests}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Run Authentication Tests
              </button>
              
              <button
                onClick={async () => {
                  addTestResult('🔄 Force refreshing session...')
                  await forceSessionRefresh()
                  addTestResult('✅ Session refresh completed')
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Force Session Refresh
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-2">Current Auth State</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>User: {user ? user.email : 'None'}</div>
                <div>Role: {user?.role || 'None'}</div>
                <div>Is Admin: {isAdmin ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
            <pre className="text-xs text-gray-300 overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-8 bg-dark-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                <span className="text-gray-400">{result}</span>
              </div>
            ))}
            {testResults.length === 0 && (
              <div className="text-gray-400 text-sm">No test results yet. Click "Run Authentication Tests" to start.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
