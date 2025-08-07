import { Metadata } from 'next'
import LoginPageClient from './LoginPageClient'

export const metadata: Metadata = {
  title: 'Admin Login - East Coast Kink Events',
  description: 'Admin login portal for East Coast Kink Events management.',
  robots: { index: false, follow: false },
  keywords: 'admin login, website management, kink events admin',
  openGraph: {
    title: 'Admin Login - East Coast Kink Events',
    description: 'Admin login portal for East Coast Kink Events management.',
    type: 'website',
    url: 'https://eastcoastkinkevents.com/login',
    images: [
      {
        url: 'https://eastcoastkinkevents.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Admin Login - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Login - East Coast Kink Events',
    description: 'Admin login portal for East Coast Kink Events management.',
    images: ['https://eastcoastkinkevents.com/og-image.png'],
  },
}

export default function LoginPage() {
  return <LoginPageClient />
}
