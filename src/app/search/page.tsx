import type { Metadata } from 'next'
import SearchPageClient from '@/components/search/SearchPageClient'

export const metadata: Metadata = {
  title: 'Search — events, places, vendors, guides',
  description:
    'Search East Coast Kink Events for parties, conventions, venues, vendors, education guides, and state scene hubs.',
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return <SearchPageClient />
}
