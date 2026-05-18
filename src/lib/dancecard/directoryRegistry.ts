import { getAllEvents } from '@/data/events'
import { normalizeEventSlug } from '@/lib/dancecard/slug'

export type EckeEventDancecardLink = {
  eckeSlug: string
  dancecardSlug: string
  dancecardEnabled: boolean
}

export function getDancecardLinkForEckeSlug(eckeSlug: string): EckeEventDancecardLink | null {
  const slug = eckeSlug.trim().toLowerCase()
  const event = getAllEvents().find((e) => e.slug === slug)
  if (!event) return null
  const dancecardSlug = (event as { dancecardSlug?: string }).dancecardSlug
  const dancecardEnabled = Boolean((event as { dancecardEnabled?: boolean }).dancecardEnabled && dancecardSlug)
  if (!dancecardEnabled || !dancecardSlug) return null
  return {
    eckeSlug: slug,
    dancecardSlug: normalizeEventSlug(dancecardSlug),
    dancecardEnabled: true,
  }
}

export function getDancecardPathForEckeSlug(eckeSlug: string): string | null {
  const link = getDancecardLinkForEckeSlug(eckeSlug)
  return link ? `/dancecard/${encodeURIComponent(link.dancecardSlug)}` : null
}

export function getOrganizerDancecardPathForEckeSlug(eckeSlug: string): string | null {
  const link = getDancecardLinkForEckeSlug(eckeSlug)
  if (!link) return null
  const next = `/organizer/dancecard/${encodeURIComponent(link.dancecardSlug)}`
  return `/organizer/login?next=${encodeURIComponent(next)}`
}
