import type { Metadata } from 'next'
import { ContactPageStructuredData } from '@/components/StructuredData'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us - East Coast Kink Events',
  description: 'Get in touch with East Coast Kink Events. Add your event or dungeon, provide feedback, or contact site administration.',
  keywords: 'contact, add event, add dungeon, feedback, kink events, BDSM events, east coast',
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
    <div className="min-h-screen bg-black">
      <ContactPageStructuredData />
      <div className="container-custom py-16">
        <Breadcrumb items={breadcrumbItems} />
        <ContactForm />
      </div>
    </div>
  )
}
