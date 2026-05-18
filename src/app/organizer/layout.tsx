import type { ReactNode } from 'react'

/** Shared organizer segment: dancecard surface tokens on all /organizer/* routes. */
export default function OrganizerSegmentLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-dc-surface text-dc-text">{children}</div>
}
