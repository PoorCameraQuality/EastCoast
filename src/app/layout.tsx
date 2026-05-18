import '@/styles/dancecard-tokens.css'
import '@/styles/dancecard-gold-theme.css'
import '@/styles/dancecard-motion.css'
import './globals.css'
import type { Metadata } from "next";
import { Inter, Playfair_Display } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import SupportBanner from '@/components/SupportBanner'
import { AuthProvider } from "@/contexts/AuthProvider";
import { GA4Provider } from "@/contexts/GA4Provider";
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import VercelFeedbackBlocker from '@/components/VercelFeedbackBlocker'
import ErrorTracker from '@/components/ErrorTracker'
import SafeTrackingWrapper from '@/components/SafeTrackingWrapper'
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ecke-sans',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ecke-serif',
  // Avoid duplicate link rel=preload for serif: body/nav use Inter first; Chrome often warns
  // "preloaded but not used" when both families are preloaded. Serif still loads normally for headings.
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: 'East Coast Kink Events - Discover BDSM Events & Dungeons',
    template: '%s | East Coast Kink Events'
  },
  description: 'Find kink events, BDSM dungeons, and educational resources across the East Coast. Connect with workshops, conferences, and community events in a safe, inclusive environment.',
  authors: [{ name: 'East Coast Kink Events' }],
  creator: 'East Coast Kink Events',
  publisher: 'East Coast Kink Events',
  metadataBase: new URL('https://www.eastcoastkinkevents.com'),
  alternates: {
    canonical: 'https://www.eastcoastkinkevents.com',
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
    url: 'https://www.eastcoastkinkevents.com',
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
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }
      : {}),
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
    <html lang="en" className={`bg-brand-void text-white ${inter.variable} ${playfair.variable}`}>
      <head>
        <WebsiteStructuredData />
        <OrganizationStructuredData />
      </head>
      <body className="antialiased font-sans">
        {/* Skip to content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:outline-none focus:ring-2 focus:ring-ecke-focus focus:ring-offset-2 focus:ring-offset-brand-void"
        >
          Skip to main content
        </a>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {/* Vercel Feedback Blocker - prevents interference with authentication */}
        <VercelFeedbackBlocker />
        {/* AuthProvider at root so it never unmounts */}
        <AuthProvider>
          {/* Step 2 FIXED: Using safer tracking wrapper */}
          <GA4Provider>
            {/* ErrorTracker still disabled - had problematic click listeners */}
            {/* <ErrorTracker /> */}
            <SafeTrackingWrapper>
              <Header />
              <SupportBanner />
              <main
                id="main-content"
                role="main"
                tabIndex={-1}
                className="pb-[env(safe-area-inset-bottom)] outline-none"
              >
                {children}
              </main>
              <Footer />
              <BackToTop />
            </SafeTrackingWrapper>
            <Analytics />
            <SpeedInsights />
          </GA4Provider>
        </AuthProvider>
      </body>
    </html>
  );
} 
