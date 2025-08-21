import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Terms of Service - East Coast Kink Events',
  description: 'Read our terms of service and understand the rules and guidelines for using East Coast Kink Events.',
  keywords: 'terms of service, user agreement, website terms, kink events, BDSM events',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://eastcoastkinkevents.com/terms',
  },
  openGraph: {
    title: 'Terms of Service - East Coast Kink Events',
    description: 'Read our terms of service and understand the rules and guidelines for using our platform.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/terms',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Terms of Service - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service - East Coast Kink Events',
    description: 'Read our terms of service and understand the rules and guidelines.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function TermsPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Terms', current: true }
  ]

  // Server-generated date to avoid hydration mismatch
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              Please read these terms carefully before using our services.
            </p>
          </div>

          {/* Content */}
          <article className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-subtle leading-relaxed">
                
                <section>
                  <h2 id="acceptance-of-terms" className="text-2xl font-serif font-semibold text-white mb-4">
                    Acceptance of Terms
                  </h2>
                  <p className="mb-4">
                    By accessing and using East Coast Kink Events, you accept and agree to be bound by 
                    the terms and provision of this agreement.
                  </p>
                  <p>
                    If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 id="use-license" className="text-2xl font-serif font-semibold text-white mb-4">
                    Use License
                  </h2>
                  <p className="mb-4">
                    Permission is granted to temporarily download one copy of the materials on East Coast 
                    Kink Events for personal, non-commercial transitory viewing only.
                  </p>
                  <p className="mb-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person</li>
                  </ul>
                </section>

                <section>
                  <h2 id="user-conduct" className="text-2xl font-serif font-semibold text-white mb-4">
                    User Conduct
                  </h2>
                  <p className="mb-4">
                    Users must not:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Submit false or misleading information</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Infringe on the rights of others</li>
                    <li>Use the service for any illegal or unauthorized purpose</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                  </ul>
                </section>

                <section>
                  <h2 id="content-submission" className="text-2xl font-serif font-semibold text-white mb-4">
                    Content Submission
                  </h2>
                  <p className="mb-4">
                    When submitting events, dungeons, or other content:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>You must have the right to submit the content</li>
                    <li>Content must be accurate and truthful</li>
                    <li>You grant us a license to display and distribute your content</li>
                    <li>We reserve the right to review and remove inappropriate content</li>
                  </ul>
                </section>

                <section>
                  <h2 id="disclaimer" className="text-2xl font-serif font-semibold text-white mb-4">
                    Disclaimer
                  </h2>
                  <p className="mb-4">
                    The materials on East Coast Kink Events are provided on an 'as is' basis. We make no 
                    warranties, expressed or implied, and hereby disclaim and negate all other warranties 
                    including without limitation, implied warranties or conditions of merchantability, fitness 
                    for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                </section>

                <section>
                  <h2 id="limitations" className="text-2xl font-serif font-semibold text-white mb-4">
                    Limitations
                  </h2>
                  <p className="mb-4">
                    In no event shall East Coast Kink Events or its suppliers be liable for any damages 
                    (including, without limitation, damages for loss of data or profit, or due to business 
                    interruption) arising out of the use or inability to use the materials on our website.
                  </p>
                </section>

                <section>
                  <h2 id="revisions-and-errata" className="text-2xl font-serif font-semibold text-white mb-4">
                    Revisions and Errata
                  </h2>
                  <p>
                    The materials appearing on East Coast Kink Events could include technical, typographical, 
                    or photographic errors. We do not warrant that any of the materials on our website are 
                    accurate, complete, or current.
                  </p>
                </section>

                <section>
                  <h2 id="links" className="text-2xl font-serif font-semibold text-white mb-4">
                    Links
                  </h2>
                  <p>
                    East Coast Kink Events has not reviewed all of the sites linked to its website and is 
                    not responsible for the contents of any such linked site. The inclusion of any link does 
                    not imply endorsement by East Coast Kink Events of the site.
                  </p>
                </section>

                <section>
                  <h2 id="modifications" className="text-2xl font-serif font-semibold text-white mb-4">
                    Modifications
                  </h2>
                  <p>
                    We may revise these terms of service at any time without notice. By using this website, 
                    you are agreeing to be bound by the then current version of these Terms of Service.
                  </p>
                </section>

                <section>
                  <h2 id="contact-information" className="text-2xl font-serif font-semibold text-white mb-4">
                    Contact Information
                  </h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us through 
                    our contact form.
                  </p>
                </section>

                <div className="border-t border-dark-600 pt-8 mt-12">
                  <p className="text-sm text-gray-400">
                    <strong>Last updated:</strong> {lastUpdated} (Terms updated for 2025)
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
