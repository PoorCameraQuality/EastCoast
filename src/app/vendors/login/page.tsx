import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import OrgLoginForm from '@/components/auth/OrgLoginForm'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { BASE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Vendor login',
  description: 'Sign in to manage your ECKE shop.',
  robots: { index: false, follow: false },
  alternates: { canonical: `${BASE_URL}/vendors/login` },
}

export default async function VendorLoginPage() {
  const session = await requireOrgSession()
  if (session) redirect('/dashboard')

  return (
    <main className="container-custom py-12 md:py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-sf-card/60 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-sf-muted">Vendors</p>
        <h1 className="mt-2 text-2xl font-semibold text-sf-strong">Vendor login</h1>
        <p className="mt-2 text-sm text-sf-muted">
          Same organization login. After you sign in you land on your dashboard to manage the shop and events.
        </p>
        <div className="mt-6">
          <OrgLoginForm />
        </div>
      </div>
    </main>
  )
}
