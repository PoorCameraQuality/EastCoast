import type { Metadata } from 'next'
import OrgSignupForm from '@/components/auth/OrgSignupForm'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Create an organization',
  description: 'Sign up to list events on East Coast Kink Events.',
  robots: { index: false, follow: false },
  alternates: { canonical: `${BASE_URL}/auth/org/signup` },
}

export default function OrgSignupPage() {
  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-sf-card/60 p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-sf-strong">Create an organization</h1>
        <p className="mt-2 text-sm text-sf-muted">
          One login per organization. After you sign up you can publish events and a shop to the public catalog.
        </p>
        <div className="mt-6">
          <OrgSignupForm />
        </div>
      </div>
    </main>
  )
}
