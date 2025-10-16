import { Metadata } from 'next'
import Link from 'next/link'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Report a Problem | East Coast Kink Events',
  description: 'Report technical issues, content concerns, or community conduct violations. Help us maintain a safe and functional platform.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${BASE_URL}/report`,
  },
}

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            Report a Problem
          </h1>
          
          <div className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-6">
                Your feedback helps us maintain a safe, accurate, and functional platform for the kink community. 
                Please report any issues you encounter.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">What You Can Report</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🚨 Safety Concerns</h3>
                  <p className="text-gray-300 text-sm">
                    Community conduct violations, harassment, or safety issues
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">⚠️ Content Issues</h3>
                  <p className="text-gray-300 text-sm">
                    Inaccurate event information, outdated listings, or inappropriate content
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">🔧 Technical Problems</h3>
                  <p className="text-gray-300 text-sm">
                    Broken links, display issues, or functionality bugs
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-900/20 to-purple-800/20 border border-purple-500/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">📝 Content Errors</h3>
                  <p className="text-gray-300 text-sm">
                    Spelling mistakes, broken formatting, or missing information
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">How to Report</h2>
              <p className="text-gray-300 mb-4">
                Please use our contact form to submit your report. Include as much detail as possible:
              </p>
              
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
                <li>Page URL or event name where the issue occurs</li>
                <li>Description of the problem</li>
                <li>Screenshots if applicable (for technical issues)</li>
                <li>Your contact information (optional, but helpful for follow-up)</li>
              </ul>

              <div className="mt-8 p-6 bg-gradient-to-br from-primary-900/20 to-blue-900/20 border border-primary-500/30 rounded-lg">
                <p className="text-white font-medium mb-2">
                  Submit Your Report
                </p>
                <p className="text-gray-300 text-sm mb-4">
                  Use our contact form to report issues. Select "Report a Problem" as the subject.
                </p>
                <Link 
                  href="/contact?subject=Report%20a%20Problem"
                  className="inline-block bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                >
                  Contact Us
                </Link>
              </div>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Response Time</h2>
              <p className="text-gray-300 mb-4">
                We review all reports as quickly as possible. Safety concerns are prioritized and typically 
                addressed within 24-48 hours. Technical issues and content updates may take longer depending 
                on complexity.
              </p>

              <p className="text-sm text-gray-400 mt-8">
                <strong>Note:</strong> For immediate safety concerns or emergencies, please contact local authorities. 
                This form is for platform-related issues only.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link 
              href="/"
              className="text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

