import { Metadata } from 'next'
import LoginPageClient from './LoginPageClient'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Admin login portal for East Coast Kink Events management.',
  robots: { index: false, follow: false },
  keywords: 'admin login, website management, kink events admin',
  alternates: { canonical: `${BASE_URL}/login` },
  openGraph: {
    title: 'Admin Login | East Coast Kink Events',
    description: 'Admin login portal for East Coast Kink Events management.',
    type: 'website',
    url: `${BASE_URL}/login`,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Admin Login - East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Login | East Coast Kink Events',
    description: 'Admin login portal for East Coast Kink Events management.',
    images: [`${BASE_URL}/og-image.png`],
  },
}

export default function LoginPage() {
  return (
    <>
      <h1 className="sr-only">Admin Login - East Coast Kink Events</h1>
      <LoginPageClient />
    </>
  )
}
