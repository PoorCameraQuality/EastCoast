import type { Metadata } from 'next'
import AddContentPageClient from './AddContentPageClient'

export const metadata: Metadata = {
  title: 'Add Content - Admin | East Coast Kink Events',
  description: 'Add new event or dungeon content to East Coast Kink Events',
  robots: 'noindex, nofollow'
}

export default function Page() {
  return <AddContentPageClient />
}


