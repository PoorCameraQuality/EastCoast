'use client'

import type { ReactNode } from 'react'
import { OrganizerToastProvider } from '@/components/dancecard/organizer/ui'

export function OrganizerDancecardShell({ children }: { children: ReactNode }) {
  return <OrganizerToastProvider>{children}</OrganizerToastProvider>
}
