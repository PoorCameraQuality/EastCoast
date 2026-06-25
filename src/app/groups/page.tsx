import type { Metadata } from 'next'
import Link from 'next/link'
import { fetchPublishedListingsIndex } from '@/lib/unifiedExtendedListings'
import { BASE_URL } from '@/lib/seo'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Groups',
  description: 'Kink community groups published from kink.social.',
  alternates: { canonical: `${BASE_URL}/groups` },
}

export default async function GroupsIndexPage() {
  const rows = await fetchPublishedListingsIndex('group')

  return (
    <main className="min-h-screen bg-black section-padding">
      <div className="container-custom max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-white">Groups</h1>
        <p className="mt-3 text-gray-400">Public group listings synced from kink.social.</p>
        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li key={row.slug}>
              <Link
                href={`/groups/${row.slug}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-4 hover:border-teal-500/40 transition"
              >
                <span className="font-medium text-white">{row.name}</span>
              </Link>
            </li>
          ))}
          {!rows.length ? <li className="text-gray-500 text-sm">No published group listings yet.</li> : null}
        </ul>
      </div>
    </main>
  )
}
