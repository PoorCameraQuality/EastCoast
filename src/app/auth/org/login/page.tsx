import type { Metadata } from 'next'
import OrgLoginForm from '@/components/auth/OrgLoginForm'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to manage your East Coast Kink Events events and shop.',
  robots: { index: false, follow: false },
  alternates: { canonical: `${BASE_URL}/auth/org/login` },
}

export default function OrgLoginPage() {
  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-sf-card/60 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-sf-strong">Sign in</h1>
        <p className="mt-2 text-sm text-sf-muted">
          Same login for events and your shop. Use the username or email from signup.
        </p>
        <div className="mt-6">
          <OrgLoginForm />
        </div>
      </div>
    </main>
  )
}
