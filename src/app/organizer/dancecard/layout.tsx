import type { Metadata } from 'next'
import { OrganizerDancecardChrome } from '@/components/dancecard/organizer/OrganizerDancecardChrome'
import { dancecardFontClassName } from '@/lib/dancecard/dancecardFonts'
import { assertProductionNoOrganizerBypass } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: 'Organizer console',
    template: '%s | Dancecard Organizer',
  },
  description: 'Dancecard organizer console for program, registration, staff, and event operations.',
  openGraph: { siteName: 'Dancecard Organizer' },
}

export default async function OrganizerDancecardLayout({ children }: { children: React.ReactNode }) {
  assertProductionNoOrganizerBypass()
  return <OrganizerDancecardChrome className={dancecardFontClassName}>{children}</OrganizerDancecardChrome>
}
