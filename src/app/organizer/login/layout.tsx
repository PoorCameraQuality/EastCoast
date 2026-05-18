import type { Metadata } from 'next'
import { OrganizerAuthShell } from '@/components/dancecard/organizer/OrganizerAuthShell'

export const metadata: Metadata = {
  title: 'Organizer sign in',
  description: 'Sign in to the Dancecard organizer console.',
}

export default function OrganizerLoginLayout({ children }: { children: React.ReactNode }) {
  return <OrganizerAuthShell>{children}</OrganizerAuthShell>
}
