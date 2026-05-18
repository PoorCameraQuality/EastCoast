import { redirect } from 'next/navigation'
import { listOrganizerHubEvents, organizerDevBypassEnabled, getAuthedUserId } from '@/lib/dancecard/organizerAuth'
import { getDancecardAdmin } from '@/lib/dancecard/routeCommon'
import { enrichHubEventsWithProgramStats } from '@/lib/dancecard/organizerHubStats'
import { OrganizerHubPageClient } from '@/components/dancecard/organizer/hub/OrganizerHubPageClient'

export const dynamic = 'force-dynamic'

export default async function OrganizerDancecardHubPage() {
  const bypass = organizerDevBypassEnabled()
  if (!bypass) {
    const authed = await getAuthedUserId()
    if (!authed) {
      redirect(`/organizer/login?next=${encodeURIComponent('/organizer/dancecard')}`)
    }
  }
  const userId = bypass ? null : await getAuthedUserId()
  const events = await listOrganizerHubEvents(userId)
  const eventsWithStats = await enrichHubEventsWithProgramStats(getDancecardAdmin(), events)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <OrganizerHubPageClient events={eventsWithStats} />
    </div>
  )
}
