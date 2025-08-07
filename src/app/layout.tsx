import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AgeVerification from '@/components/AgeVerification'
import BackToTop from '@/components/BackToTop'
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'East Coast Kink Events',
  description: 'Discover and connect with kink events across the East Coast',
  keywords: 'kink events, east coast, BDSM, fetish, lifestyle events',
  authors: [{ name: 'East Coast Kink Events' }],
  metadataBase: new URL('https://eastcoastkinkevents.com'),
  openGraph: {
    title: 'East Coast Kink Events',
    description: 'Discover and connect with kink events across the East Coast',
    url: 'https://eastcoastkinkevents.com',
    siteName: 'East Coast Kink Events',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'East Coast Kink Events',
    description: 'Discover and connect with kink events across the East Coast',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-black">
          <WebsiteStructuredData />
          <OrganizationStructuredData />
          {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
          )}
          <Header />
          <main>
            {children}
          </main>
          <Footer />
          <AgeVerification />
          <BackToTop />
        </div>
      </body>
    </html>
  )
} 