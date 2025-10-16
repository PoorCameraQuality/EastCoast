import { Metadata } from 'next'
import Link from 'next/link'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Accessibility | East Coast Kink Events',
  description: 'Accessibility statement for East Coast Kink Events. We are committed to ensuring digital accessibility for people of all abilities.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${BASE_URL}/accessibility`,
  },
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            Accessibility Statement
          </h1>
          
          <div className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 mb-6">
                East Coast Kink Events is committed to ensuring digital accessibility for people of all abilities. 
                We are continually improving the user experience for everyone and applying the relevant accessibility standards.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Our Commitment</h2>
              <p className="text-gray-300 mb-4">
                We strive to conform to Level AA of the Web Content Accessibility Guidelines (WCAG) 2.1. 
                These guidelines explain how to make web content more accessible for people with disabilities.
              </p>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Measures We Take</h2>
              <ul className="list-disc pl-6 text-gray-300 space-y-2 mb-6">
                <li>Semantic HTML structure for screen reader compatibility</li>
                <li>Keyboard navigation support throughout the site</li>
                <li>Color contrast ratios that meet WCAG AA standards</li>
                <li>Alt text for all meaningful images</li>
                <li>Skip-to-content links for keyboard users</li>
                <li>Responsive design for various devices and screen sizes</li>
              </ul>

              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Feedback and Contact</h2>
              <p className="text-gray-300 mb-4">
                We welcome your feedback on the accessibility of East Coast Kink Events. 
                If you encounter any accessibility barriers, please let us know.
              </p>

              <div className="mt-8 p-6 bg-gradient-to-br from-primary-900/20 to-blue-900/20 border border-primary-500/30 rounded-lg">
                <p className="text-white font-medium mb-4">
                  For accessibility concerns or to request assistance:
                </p>
                <Link 
                  href="/contact"
                  className="inline-block bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-primary-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
                >
                  Contact Us
                </Link>
              </div>

              <p className="text-sm text-gray-400 mt-8">
                <strong>Note:</strong> Comprehensive accessibility documentation is being developed. 
                This page will be updated with detailed information about our accessibility features and conformance status.
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

