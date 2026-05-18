import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { dancecardFontClassName } from '@/lib/dancecard/dancecardFonts'

export const metadata: Metadata = {
  title: {
    default: 'Dancecard — event planning & organizer ops',
    template: '%s | Dancecard',
  },
  description:
    'Dancecard helps attendees plan their weekend and gives organizers a stage-manager console for program, staff, registration, and safety workflows.',
  openGraph: {
    siteName: 'Dancecard',
    title: 'Dancecard — event planning & organizer ops',
    description:
      'Plan your schedule, compare availability, and run your event ops — built for kink conferences on East Coast Kink Events.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dancecard on East Coast Kink Events',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dancecard',
    description: 'Event planning and organizer operations for kink conferences.',
    images: ['/og-image.png'],
  },
}

export default function DancecardSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`dc-gold-chrome min-h-screen bg-dc-surface text-dc-text ${dancecardFontClassName}`} data-dc-theme="event">
      {children}
    </div>
  )
}
