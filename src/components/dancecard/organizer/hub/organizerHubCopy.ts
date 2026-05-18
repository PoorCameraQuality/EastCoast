import type { OrganizerHubEventWithStats } from '@/lib/dancecard/organizerHubStats'

export type HubNextStep = {
  headline: string
  detail: string
  href: string
  actionLabel: string
}

export function humanRole(role: string): string {
  switch (role) {
    case 'owner':
      return 'You own this event'
    case 'admin':
      return 'Site admin access'
    case 'editor':
      return 'You can edit program & people'
    case 'safety':
      return 'Safety & vetting lead'
    case 'viewer':
      return 'View only'
    default:
      return role
  }
}

export function programSummary(ev: OrganizerHubEventWithStats): string {
  const { programSlotCount: total, publishedSlotCount: pub } = ev
  if (total === 0) {
    return 'You have not added any activities yet.'
  }
  if (pub === 0) {
    return `You have ${total} activit${total === 1 ? 'y' : 'ies'} in the grid, but none are on the public schedule yet.`
  }
  if (pub === total) {
    return `Your program has ${total} activit${total === 1 ? 'y' : 'ies'}, and attendees can see all of them.`
  }
  return `Your program has ${total} activities; ${pub} are visible on the public schedule right now.`
}

export function hubNextStep(ev: OrganizerHubEventWithStats): HubNextStep {
  const base = `/organizer/dancecard/${encodeURIComponent(ev.slug)}`
  if (ev.status !== 'published') {
    return {
      headline: 'Not visible to attendees yet',
      detail:
        'This event is still in draft. When you are ready, switch it to Published in settings so people can open your Dancecard link.',
      href: `${base}?tab=settings`,
      actionLabel: 'Open event settings',
    }
  }
  if (ev.programSlotCount === 0) {
    return {
      headline: 'Build your schedule',
      detail: 'Import a spreadsheet or add activities on the program grid. That is what powers the public schedule and attendee picks.',
      href: `${base}?tab=program`,
      actionLabel: 'Work on program',
    }
  }
  if (ev.publishedSlotCount === 0) {
    return {
      headline: 'Publish activities for attendees',
      detail: 'Activities in the grid are only visible after you publish them. Review the grid and turn on what should appear publicly.',
      href: `${base}?tab=program`,
      actionLabel: 'Review program grid',
    }
  }
  return {
    headline: 'You are in good shape',
    detail: 'Share the attendee link with your community, or spot-check the dashboard before doors open.',
    href: `${base}?tab=dashboard`,
    actionLabel: 'Go to Home',
  }
}
