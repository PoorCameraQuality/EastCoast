import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - East Coast Kink Events',
  description: 'Learn about how we collect, use, and protect your information on East Coast Kink Events.',
  keywords: 'privacy policy, data protection, information security, kink events, BDSM privacy',
  openGraph: {
    title: 'Privacy Policy - East Coast Kink Events',
    description: 'Learn about how we collect, use, and protect your information on East Coast Kink Events.',
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
    description: 'Learn about how we collect, use, and protect your information.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-subtle max-w-3xl mx-auto">
              How we collect, use, and protect your information.
            </p>
          </div>

          {/* Content */}
          <div className="card-elegant">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8 text-subtle leading-relaxed">
                
                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    1. Information We Collect
                  </h2>
                  <p className="mb-4">
                    We collect information you provide directly to us, such as when you submit 
                    an event, contact us through our contact form, or interact with our website.
                  </p>
                  <p>
                    This may include your name, email address, event information, and any other 
                    information you choose to provide.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    2. Google Analytics and Website Analytics
                  </h2>
                  
                  <h3 className="text-xl font-serif font-semibold text-white mb-3">
                    What We Track and Why
                  </h3>
                  <p className="mb-4">
                    We use Google Analytics to understand how our community uses our website. 
                    <strong className="text-white">This is NOT for tracking individuals</strong> - it's purely to understand 
                    which features and content are most valuable to our community so we can better serve you.
                  </p>

                  <h4 className="text-lg font-serif font-semibold text-white mb-2">
                    What We Track:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">Page Views:</strong> Which pages are visited most often</li>
                    <li><strong className="text-white">Feature Usage:</strong> Which buttons, links, and forms are clicked most</li>
                    <li><strong className="text-white">Event Interactions:</strong> How users interact with event listings and dungeon pages</li>
                    <li><strong className="text-white">Contact Form Submissions:</strong> To understand community needs</li>
                    <li><strong className="text-white">Discord Community Clicks:</strong> To measure community engagement</li>
                  </ul>

                  <h4 className="text-lg font-serif font-semibold text-white mb-2">
                    What We Do NOT Track:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">Personal Identities:</strong> We cannot and do not identify individual users</li>
                    <li><strong className="text-white">Personal Information:</strong> Names, emails, or any personal data</li>
                    <li><strong className="text-white">Individual Behavior:</strong> We look at aggregate patterns, not individual actions</li>
                  </ul>

                  <h4 className="text-lg font-serif font-semibold text-white mb-2">
                    Google Analytics Configuration
                  </h4>
                  <p className="mb-4">
                    We have configured Google Analytics with privacy-focused settings:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">IP Anonymization:</strong> Enabled - your IP address is anonymized</li>
                    <li><strong className="text-white">Data Retention:</strong> Limited to 26 months maximum</li>
                    <li><strong className="text-white">Data Sharing:</strong> Disabled - Google cannot use our data for their own purposes</li>
                    <li><strong className="text-white">User ID Tracking:</strong> Disabled - we do not track individual users</li>
                    <li><strong className="text-white">Demographics:</strong> Disabled - we do not collect demographic information</li>
                  </ul>

                  <h4 className="text-lg font-serif font-semibold text-white mb-2">
                    Analytics Data Usage
                  </h4>
                  <p className="mb-4">
                    The analytics data we collect is used exclusively to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">Improve Website Features:</strong> Understand which pages and features are most useful</li>
                    <li><strong className="text-white">Content Optimization:</strong> See which events and dungeons get the most interest</li>
                    <li><strong className="text-white">Community Service:</strong> Better understand how to serve our community</li>
                    <li><strong className="text-white">Technical Improvements:</strong> Identify and fix website issues</li>
                  </ul>

                  <p className="mb-4">
                    <strong className="text-white">We do not use this data for:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-6">
                    <li>Marketing to individuals</li>
                    <li>Selling to third parties</li>
                    <li>Personal profiling</li>
                    <li>Any commercial purposes outside of website improvement</li>
                  </ul>

                  <h4 className="text-lg font-serif font-semibold text-white mb-2">
                    How to Disable Analytics
                  </h4>
                  <p className="mb-4">
                    You have several options to disable analytics tracking:
                  </p>

                  <h5 className="text-md font-serif font-semibold text-white mb-2">
                    Option 1: Browser Settings (Recommended)
                  </h5>
                  <p className="mb-4">
                    You can disable analytics tracking in your browser:
                  </p>

                  <div className="bg-dark-800 p-4 border-l-4 border-primary-500 mb-4">
                    <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Chrome:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-4">
                      <li>Go to Settings &gt; Privacy and Security</li>
                      <li>Click "Cookies and other site data"</li>
                      <li>Turn on "Block third-party cookies"</li>
                      <li>Add <code className="bg-dark-700 px-1">google-analytics.com</code> and <code className="bg-dark-700 px-1">googletagmanager.com</code> to blocked sites</li>
                    </ol>
                  </div>

                  <div className="bg-dark-800 p-4 border-l-4 border-primary-500 mb-4">
                    <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Firefox:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-4">
                      <li>Go to Options &gt; Privacy &amp; Security</li>
                      <li>Under "Cookies and Site Data" click "Manage Data"</li>
                      <li>Remove any Google Analytics cookies</li>
                      <li>Enable "Block third-party cookies"</li>
                    </ol>
                  </div>

                  <div className="bg-dark-800 p-4 border-l-4 border-primary-500 mb-4">
                    <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Safari:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-4">
                      <li>Go to Preferences &gt; Privacy</li>
                      <li>Check "Block all cookies" or "Block third-party cookies"</li>
                      <li>Go to "Manage Website Data" and remove Google Analytics entries</li>
                    </ol>
                  </div>

                  <div className="bg-dark-800 p-4 border-l-4 border-primary-500 mb-4">
                    <p className="text-sm text-gray-300 mb-2"><strong className="text-white">Edge:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300 ml-4">
                      <li>Go to Settings &gt; Cookies and site permissions</li>
                      <li>Click "Cookies and site data"</li>
                      <li>Turn on "Block third-party cookies"</li>
                      <li>Add Google Analytics domains to blocked sites</li>
                    </ol>
                  </div>

                  <h5 className="text-md font-serif font-semibold text-white mb-2">
                    Option 2: Browser Extensions
                  </h5>
                  <p className="mb-4">
                    Install privacy extensions like:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">uBlock Origin:</strong> Blocks tracking scripts</li>
                    <li><strong className="text-white">Privacy Badger:</strong> Automatically blocks trackers</li>
                    <li><strong className="text-white">Ghostery:</strong> Blocks analytics and tracking</li>
                  </ul>

                  <h5 className="text-md font-serif font-semibold text-white mb-2">
                    Option 3: Incognito/Private Mode
                  </h5>
                  <p className="mb-4">
                    Browse in incognito/private mode to prevent tracking across sessions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    3. How We Use Your Information
                  </h2>
                  <p className="mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Display and manage event listings on our website</li>
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Improve our website and services</li>
                    <li>Send you important updates about our services</li>
                    <li>Ensure compliance with our Terms of Service</li>
                    <li>Analyze website usage to better serve our community</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    4. Information Sharing
                  </h2>
                  <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to 
                    third parties without your consent, except as described in this policy.
                  </p>
                  <p>
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>With your explicit consent</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>With service providers who assist in our operations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    5. Data Security
                  </h2>
                  <p className="mb-4">
                    We implement appropriate security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <p>
                    However, no method of transmission over the internet or electronic storage 
                    is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    6. Cookies and Tracking
                  </h2>
                  <p className="mb-4">
                    Our website uses cookies and similar technologies to enhance your browsing 
                    experience and analyze website usage.
                  </p>
                  <p className="mb-4">
                    <strong className="text-white">Types of cookies we use:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                    <li><strong className="text-white">Essential Cookies:</strong> Required for basic website functionality</li>
                    <li><strong className="text-white">Analytics Cookies:</strong> Help us understand how our website is used (Google Analytics)</li>
                    <li><strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p>
                    You can control cookie settings through your browser preferences, though 
                    disabling cookies may affect website functionality.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    7. Third-Party Links
                  </h2>
                  <p className="mb-4">
                    Our website may contain links to third-party websites. We are not responsible 
                    for the privacy practices of these external sites.
                  </p>
                  <p>
                    We encourage you to review the privacy policies of any third-party websites 
                    you visit.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    8. Your Rights
                  </h2>
                  <p className="mb-4">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate information</li>
                    <li>Request deletion of your personal information</li>
                    <li>Opt out of certain communications</li>
                    <li>Lodge a complaint with relevant authorities</li>
                    <li><strong className="text-white">Analytics Opt-out:</strong> Disable analytics tracking as described above</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    9. Children's Privacy
                  </h2>
                  <p className="mb-4">
                    Our website is not intended for children under 18 years of age. We do not 
                    knowingly collect personal information from children under 18.
                  </p>
                  <p>
                    If you believe we have collected information from a child under 18, please 
                    contact us immediately.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    10. Changes to This Policy
                  </h2>
                  <p className="mb-4">
                    We may update this Privacy Policy from time to time. We will notify you 
                    of any material changes by posting the new policy on this page.
                  </p>
                  <p>
                    Your continued use of our website after any changes constitutes acceptance 
                    of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-serif font-semibold text-white mb-4">
                    11. Contact Us
                  </h2>
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy, our data practices, 
                    or want to opt out of analytics tracking, please contact us:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-white">Contact Form:</strong> Use our contact form on the website</li>
                    <li><strong className="text-white">Discord:</strong> Join our community Discord for support</li>
                    <li><strong className="text-white">Website:</strong> Visit our contact page for inquiries</li>
                  </ul>
                </section>

                <div className="border-t border-dark-600 pt-8 mt-12">
                  <p className="text-sm text-gray-400">
                    <strong>Last updated:</strong> {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    By using our website, you acknowledge that you have read and understood 
                    this Privacy Policy. Our analytics are purely for community service and 
                    website improvement - we respect your privacy and provide clear options for opting out.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
