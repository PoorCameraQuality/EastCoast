import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Debug - East Coast Kink Events',
  description: 'Debug information for development',
  robots: 'noindex, nofollow'
}

export default function DebugPage() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    NODE_ENV: process.env.NODE_ENV,
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="bg-dark-800 p-4 rounded">
              <pre className="text-sm">
                {JSON.stringify(envVars, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Build Information</h2>
            <div className="bg-dark-800 p-4 rounded">
              <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_BASE_URL || 'Not set'}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Data Loading Test</h2>
            <div className="bg-dark-800 p-4 rounded">
              <p>This page should load without errors if the environment is properly configured.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

