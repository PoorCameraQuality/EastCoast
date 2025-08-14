import type { Metadata } from 'next'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import FAQ from '@/components/FAQ'

export const metadata: Metadata = {
  title: 'About - East Coast Kink Events',
  description: 'Learn about East Coast Kink Events, our mission to connect the kink community with vetted events and foster transparency in the BDSM community.',
  keywords: 'about, mission, kink community, BDSM events, transparency, safety',
  openGraph: {
    title: 'About - East Coast Kink Events',
    description: 'Learn about East Coast Kink Events, our mission to connect the kink community with vetted events and foster transparency in the BDSM community.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/about',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'About East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - East Coast Kink Events',
    description: 'Learn about East Coast Kink Events and our mission.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function AboutPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'About', current: true }
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About East Coast Kink Events",
    "description": "Learn more about East Coast Kink Events and our mission to connect the BDSM and kink community.",
    "publisher": {
      "@type": "Organization",
      "name": "East Coast Kink Events",
      "url": "https://eastcoastkinkevents.com"
    }
  }

  const faqItems = [
    {
      question: "What is East Coast Kink Events?",
      answer: "East Coast Kink Events is an independent, community-driven platform dedicated to connecting kink enthusiasts with local BDSM events, dungeons, and inclusive play spaces across the Northeast. We provide transparent, uncensored event listings and foster honest discussions within the community."
    },
    {
      question: "How do you ensure event safety?",
      answer: "We carefully curate each event listing to ensure quality and safety standards. We promote informed decision-making through comprehensive event information, community feedback, and clear safety guidelines for all participants."
    },
    {
      question: "Can I add my event or dungeon to the site?",
      answer: "Yes! We welcome submissions for new events and dungeons. You can use our contact form to submit your event or dungeon details, and we'll review and add them to our directory."
    },
    {
      question: "Is the site free to use?",
      answer: "Yes, East Coast Kink Events is completely free to use. We believe in providing accessible information to the kink community without any barriers."
    },
    {
      question: "How can I get involved with the community?",
      answer: "Join our Discord community for honest discussions, event reviews, and building trust within the community. You can also attend events listed on our site to connect with fellow kinksters."
    }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden" aria-label="About East Coast Kink Events">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <div className="container-custom py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 relative">
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                About East Coast Kink Events
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Connecting the kink community through transparency, safety, and authentic experiences
            </p>
          </div>

          {/* Enhanced Mission Statement */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-12 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Our Mission
            </h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              We&apos;re dedicated to fostering a safe, inclusive, and vibrant kink community across the East Coast. 
              Our platform serves as a central hub for discovering events, connecting with like-minded individuals, 
              and building meaningful relationships within the lifestyle community.
            </p>
          </div>

          {/* Enhanced Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Event Discovery
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Discover BDSM events, workshops, and parties across the East Coast. Find events that match your interests and experience level.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                Dungeon Directory
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Discover BDSM dungeons and kink spaces across the East Coast. Find private sessions, workshops, and community events in safe, inclusive environments.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                Educational Resources
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Access educational content, safety guidelines, and community resources. Learn from experts and share your knowledge with the community.
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:shadow-primary-500/25 transition-all duration-300 hover:scale-[1.02]">
              <h3 className="text-2xl font-serif font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                Community Building
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Join our Discord community for honest discussions, event reviews, and building trust within the community. Connect with like-minded individuals.
              </p>
            </div>
          </div>

          {/* Enhanced Values */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 mb-12 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">Transparency</h3>
                <p className="text-gray-300">We believe in open, honest communication and transparent event listings free from censorship.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">Safety</h3>
                <p className="text-gray-300">We prioritize the safety and well-being of our community members above all else.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">Community</h3>
                <p className="text-gray-300">We foster a supportive, inclusive environment where everyone feels welcome and respected.</p>
              </div>
            </div>
          </div>

          {/* Enhanced FAQ */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold text-white mb-8 text-center">
              <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <FAQ items={faqItems} />
          </div>
        </div>
      </div>
    </main>
  )
}
