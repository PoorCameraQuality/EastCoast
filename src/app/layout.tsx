import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AgeVerification from '@/components/AgeVerification'
import BackToTop from '@/components/BackToTop'
import { AuthProvider } from "@/contexts/AuthProvider";
import { GA4Provider } from "@/contexts/GA4Provider";
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import VercelFeedbackBlocker from '@/components/VercelFeedbackBlocker'
import ErrorTracker from '@/components/ErrorTracker'
import ComprehensiveTrackingWrapper from '@/components/ComprehensiveTrackingWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'East Coast Kink Events - Discover BDSM Events & Dungeons',
    template: '%s | East Coast Kink Events'
  },
  description: 'Find kink events, BDSM dungeons, and educational resources across the East Coast. Connect with workshops, conferences, and community events in a safe, inclusive environment.',
  keywords: [
    'kink events',
    'BDSM events', 
    'east coast',
    'fetish events',
    'lifestyle events',
    'BDSM dungeons',
    'kink community',
    'workshops',
    'conferences',
    'educational resources',
    'safe space',
    'inclusive community'
  ],
  authors: [{ name: 'East Coast Kink Events' }],
  creator: 'East Coast Kink Events',
  publisher: 'East Coast Kink Events',
  metadataBase: new URL('https://eastcoastkinkevents.com'),
  alternates: {
    canonical: 'https://eastcoastkinkevents.com',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eastcoastkinkevents.com',
    siteName: 'East Coast Kink Events',
    title: 'East Coast Kink Events - Discover BDSM Events & Dungeons',
    description: 'Find kink events, BDSM dungeons, and educational resources across the East Coast. Connect with workshops, conferences, and community events in a safe, inclusive environment.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'East Coast Kink Events - BDSM Community Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'East Coast Kink Events - Discover BDSM Events & Dungeons',
    description: 'Find kink events, BDSM dungeons, and educational resources across the East Coast.',
    images: ['/og-image.png'],
    creator: '@eastcoastkinkevents',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // TODO: Replace with actual code from Google Search Console
    yandex: 'd38c7affece1bb23',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black text-white">
      <body className="antialiased">
        {/* Skip to content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-black"
        >
          Skip to main content
        </a>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <WebsiteStructuredData />
        <OrganizationStructuredData />
        {/* Vercel Feedback Blocker - prevents interference with authentication */}
        <VercelFeedbackBlocker />
        {/* AuthProvider at root so it never unmounts */}
        <AuthProvider>
          <GA4Provider>
            <ErrorTracker />
            {/* <ComprehensiveTrackingWrapper> */}
              <AgeVerification />
              <Header />
              <main id="main-content" role="main" tabIndex={-1}>
                {children}
              </main>
              <Footer />
              <BackToTop />
            {/* </ComprehensiveTrackingWrapper> */}
          </GA4Provider>
        </AuthProvider>
      </body>
    </html>
  );
} 
