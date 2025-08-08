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
    <div className="min-h-screen bg-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-serif font-bold text-white mb-6">
              About East Coast Kink Events
            </h1>
            <p className="text-xl text-subtle max-w-3xl mx-auto">
              Connecting the kink community through transparency, safety, and authentic experiences
            </p>
          </div>

          {/* Mission Statement */}
          <div className="card-elegant mb-12">
            <h2 className="text-3xl font-serif font-semibold text-white mb-6">
              Our Mission
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                East Coast Kink Events is an independent, community-driven platform dedicated to connecting kink enthusiasts with local BDSM events, dungeons, and inclusive play spaces across the Northeast. We believe in empowering the fetish community through transparent, uncensored event listings and fostering honest discussions—free from organizer influence.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Our goal is to create a safer, more interconnected kink ecosystem where enthusiasts can discover vetted gatherings, share authentic feedback, and build trust within the community. We provide a neutral space built for transparency, not censorship.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="card-elegant">
              <h3 className="text-2xl font-serif font-semibold text-white mb-4">
                Event Directory
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Comprehensive listings of BDSM events, conferences, workshops, and play parties across the Northeast. Each event is carefully curated to ensure quality and safety standards.
              </p>
            </div>
            
            <div className="card-elegant">
              <h3 className="text-2xl font-serif font-semibold text-white mb-4">
                Community Hub
              </h3>
              <p className="text-gray-300 leading-relaxed">
                A neutral platform for honest discussions, event reviews, and community building. We facilitate connections while maintaining transparency and trust.
              </p>
            </div>
            
            <div className="card-elegant">
              <h3 className="text-2xl font-serif font-semibold text-white mb-4">
                Safety First
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Promoting informed decision-making through comprehensive event information, community feedback, and clear safety guidelines for all participants.
              </p>
            </div>
            
            <div className="card-elegant">
              <h3 className="text-2xl font-serif font-semibold text-white mb-4">
                Transparency
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Unbiased event listings and honest community discussions. We believe in full disclosure and authentic experiences over promotional content.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="card-elegant mb-12">
            <h2 className="text-3xl font-serif font-semibold text-white mb-8">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Safety</h3>
                <p className="text-gray-400">Promoting informed choices and community safety</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Community</h3>
                <p className="text-gray-400">Building connections and fostering trust</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-none flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Transparency</h3>
                <p className="text-gray-400">Honest information and authentic experiences</p>
              </div>
            </div>
          </div>

          {/* Join Us */}
          <div className="card-elegant text-center">
            <h2 className="text-3xl font-serif font-semibold text-white mb-6">
              Join Our Community
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Connect with fellow kinksters in our Discord community—a neutral space for honest discussions, event reviews, and building trust within the community.
            </p>
            <Link 
              href="https://discord.gg/xcnGGyGsmT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary px-8 py-4 text-lg discord-glow"
            >
              Join Our Discord
            </Link>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <FAQ items={faqItems} title="Frequently Asked Questions" />
          </div>
        </div>
      </div>
    </div>
  )
}
