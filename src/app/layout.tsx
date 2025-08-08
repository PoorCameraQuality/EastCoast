import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AgeVerification from '@/components/AgeVerification'
import BackToTop from '@/components/BackToTop'
import { AuthProvider } from "@/contexts/AuthProvider";
import { WebsiteStructuredData, OrganizationStructuredData } from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import VercelFeedbackBlocker from '@/components/VercelFeedbackBlocker'

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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://eastcoastkinkevents.com',
    siteName: 'East Coast Kink Events',
    title: 'East Coast Kink Events - Discover BDSM Events & Dungeons',
    description: 'Find kink events, BDSM dungeons, and educational resources across the East Coast. Connect with workshops, conferences, and community events in a safe, inclusive environment.',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
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
    images: ['https://eastcoastkinkevents.com/og-image.png'],
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
    google: 'your-google-verification-code',
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
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="color-scheme" content="dark light" />
        <link rel="preconnect" href="https://www.google-analytics.com"/>
        <link rel="preconnect" href="https://www.googletagmanager.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
      </head>
      <body className={inter.className}>
        {/* Skip to content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2"
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
          <AgeVerification />
          <Header />
          <main id="main-content" role="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <BackToTop />
        </AuthProvider>
      </body>
    </html>
  );
} 
