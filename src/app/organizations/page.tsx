import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Organizations',
  description: 'Kink-friendly organizations published from kink.social on East Coast Kink Events.',
  alternates: { canonical: `${BASE_URL}/organizations` },
}

export default async function OrganizationsIndexPage() {
  const rows = await fetchPublishedListingsIndex('organization')

  return (
    <main className="min-h-screen bg-black section-padding">
      <div className="container-custom max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-white">Organizations</h1>
        <p className="mt-3 text-gray-400">Public organization listings synced from kink.social.</p>
        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li key={row.slug}>
              <Link
                href={`/organizations/${row.slug}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-teal-500/40 transition"
              >
                <span className="font-medium text-white">{row.name}</span>
                {row.publicLocationSummary ?
                  <span className="mt-1 block text-sm text-gray-400">{row.publicLocationSummary}</span>
                : null}
              </Link>
            </li>
          ))}
          {!rows.length ?
            <li className="text-gray-500 text-sm">No published organization listings yet.</li>
          : null}
        </ul>
      </div>
    </main>
  )
}
