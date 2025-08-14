import type { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Privacy Policy - East Coast Kink Events',
  description: 'Learn about how we collect, use, and protect your personal information on East Coast Kink Events.',
  keywords: 'privacy policy, data protection, personal information, kink events, BDSM events',
  openGraph: {
    title: 'Privacy Policy - East Coast Kink Events',
    description: 'Learn about how we collect, use, and protect your personal information.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/privacy',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - East Coast Kink Events',
    description: 'Learn about how we collect, use, and protect your personal information.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function PrivacyPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Privacy', current: true }
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
              Privacy Policy
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              How we collect, use, and protect your personal information.
            </p>
          </div>

          {/* Content */}
          <article className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-subtle leading-relaxed">
                
                <section>
                  <h2 id="information-we-collect" className="text-2xl font-serif font-semibold text-white mb-4">
                    Information We Collect
                  </h2>
                  <p className="mb-4">
                    We collect information you provide directly to us, such as when you submit an event, 
                    contact us, or interact with our services.
                  </p>
                  <p>
                    This may include your name, email address, and any other information you choose to provide.
                  </p>
                </section>

                <section>
                  <h2 id="how-we-use-your-information" className="text-2xl font-serif font-semibold text-white mb-4">
                    How We Use Your Information
                  </h2>
                  <p className="mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Provide and maintain our services</li>
                    <li>Process event submissions</li>
                    <li>Respond to your inquiries</li>
                    <li>Send you important updates about our services</li>
                    <li>Improve our website and user experience</li>
                  </ul>
                </section>

                <section>
                  <h2 id="information-sharing" className="text-2xl font-serif font-semibold text-white mb-4">
                    Information Sharing
                  </h2>
                  <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except as described in this policy.
                  </p>
                  <p>
                    We may share information when required by law or to protect our rights and safety.
                  </p>
                </section>

                <section>
                  <h2 id="data-security" className="text-2xl font-serif font-semibold text-white mb-4">
                    Data Security
                  </h2>
                  <p className="mb-4">
                    We implement appropriate security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <p>
                    However, no method of transmission over the internet is 100% secure, and we cannot 
                    guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 id="your-rights" className="text-2xl font-serif font-semibold text-white mb-4">
                    Your Rights
                  </h2>
                  <p className="mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your information</li>
                    <li>Opt out of certain communications</li>
                    <li>Lodge a complaint with supervisory authorities</li>
                  </ul>
                </section>

                <section>
                  <h2 id="contact-us" className="text-2xl font-serif font-semibold text-white mb-4">
                    Contact Us
                  </h2>
                  <p>
                    If you have any questions about this Privacy Policy or our data practices, 
                    please contact us through our contact form.
                  </p>
                </section>

                <section>
                  <h2 id="updates-to-this-policy" className="text-2xl font-serif font-semibold text-white mb-4">
                    Updates to This Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. We will notify you of any 
                    changes by posting the new policy on this page and updating the "Last Updated" date.
                  </p>
                  <p className="mt-4 text-sm text-gray-500">
                    Last Updated: {lastUpdated}
                  </p>
                </section>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}
