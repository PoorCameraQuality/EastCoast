import type { Metadata } from 'next'
import { ContactPageStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'
import { BASE_URL } from '@/lib/seo'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us - East Coast Kink Events',
  description: 'Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.',
  keywords: 'contact, add event, add dungeon, feedback, kink events, BDSM events, east coast',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
  openGraph: {
    title: 'Contact Us - East Coast Kink Events',
    description: 'Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/contact',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Contact East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us - East Coast Kink Events',
    description: 'Get in touch with East Coast Kink Events.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function ContactPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Contact', current: true }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      <ContactPageStructuredData />
      <div className="container-custom py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 relative">
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent">
                Contact Us
              </span>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary-400 to-blue-400 rounded-full"></div>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Get in touch with us. We&apos;re here to help with any questions, suggestions, or support you might need.
            </p>
          </div>

          {/* Contact Form */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <ContactForm aria-label="Contact form for East Coast Kink Events" />
          </div>
        </div>
      </div>
    </main>
  )
}
