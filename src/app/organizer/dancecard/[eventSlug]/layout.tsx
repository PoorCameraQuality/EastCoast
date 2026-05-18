import { redirect } from 'next/navigation'
import {
  assertProductionNoOrganizerBypass,
  getAuthedUserId,
  isUserOrganizerForSlug,
  organizerDevBypassEnabled,
} from '@/lib/dancecard/organizerAuth'

export default async function OrganizerDancecardEventLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { eventSlug: string }
}) {
  assertProductionNoOrganizerBypass()
  const bypass = organizerDevBypassEnabled()
  if (!bypass) {
    const userId = await getAuthedUserId()
    if (!userId) {
      redirect(`/organizer/login?next=${encodeURIComponent(`/organizer/dancecard/${params.eventSlug}`)}`)
    }
    const ok = await isUserOrganizerForSlug(userId, params.eventSlug)
    if (!ok) {
      redirect('/unauthorized')
    }
  }

  return (
    <>
      {bypass ? (
        <div className="border-b border-amber-500/40 bg-amber-950/50 px-4 py-2 text-center text-sm text-amber-100">
          Local dev preview: <strong>DANCECARD_ORGANIZER_DEV_BYPASS=1</strong> — organizer auth is off. Do not set in
          production.
        </div>
      ) : null}
      {children}
    </>
  )
}
