import type { Metadata } from 'next'
import { OrganizersLanding } from '@/components/dancecard/marketing/OrganizersLanding'

export const metadata: Metadata = {
  title: 'Dancecard for organizers',
  description:
    'Run your camp or kink event from one console: map and schedule, import spreadsheets, check people in at the door, staff your shifts, and give attendees one dancecard link for the whole weekend.',
  alternates: { canonical: '/dancecard/organizers' },
}

export default function DancecardOrganizersPage() {
  return <OrganizersLanding />
}
