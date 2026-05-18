import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OrganizerDancecardChrome } from '@/components/dancecard/organizer/OrganizerDancecardChrome'
import { dancecardFontClassName } from '@/lib/dancecard/dancecardFonts'
import {
  assertProductionNoOrganizerBypass,
  getAuthedUserId,
  organizerDevBypassEnabled,
} from '@/lib/dancecard/organizerAuth'

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
  const bypass = organizerDevBypassEnabled()
  if (!bypass) {
    const userId = await getAuthedUserId()
    if (!userId) {
      redirect(`/organizer/login?next=${encodeURIComponent('/organizer/dancecard')}`)
    }
  }
  return <OrganizerDancecardChrome className={dancecardFontClassName}>{children}</OrganizerDancecardChrome>
}
