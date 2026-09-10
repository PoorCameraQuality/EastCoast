import { redirect } from 'next/navigation'
import { requireEventCapability, type EventCapability, type ManagedEventRow } from '@/lib/eckeOrgEvents'
import { requireOrgSession } from '@/lib/eckeOrgAuth'
import { publicEventLifecycle } from '@/lib/eckeOrgEvents'

export async function requireManagePage(slug: string, capability: EventCapability = 'view') {
  const session = await requireOrgSession()
  if (!session) redirect('/auth/org/login')
  const gated = await requireEventCapability(slug, capability)
  if (gated.error || !gated.event) redirect('/events/my-events')
  return { session, event: gated.event, role: gated.role }
}

export function manageHeader(event: ManagedEventRow) {
  const life = publicEventLifecycle(event)
  const where = event.is_online ? 'Online' : `${event.city}, ${event.state}`
  return {
    life,
    where,
    date: event.start_date,
  }
}
