import type { Metadata } from 'next'
import { ContactPageStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import { BASE_URL } from '@/lib/seo'
import { CONTACT_DISCORD_SENTENCE } from '@/lib/submissionContact'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us - East Coast Kink Events',
  description: 'Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.',
  keywords: 'contact, add event, add dungeon, feedback, kink events, BDSM events, east coast',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
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
    { label: 'Contact', href: '/contact', current: true }
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-dark-900 to-black relative overflow-hidden">
      <ContactPageStructuredData />
      <div className="container-custom py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={breadcrumbItems} />

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center shadow-dark">
            <p className="text-lg text-gray-200">{CONTACT_DISCORD_SENTENCE}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
