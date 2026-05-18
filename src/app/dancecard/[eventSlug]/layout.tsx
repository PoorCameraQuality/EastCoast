import type { ReactNode } from 'react'
import { DancecardThemeProvider } from '@/components/dancecard/DancecardThemeProvider'
import { dancecardFontClassName } from '@/lib/dancecard/dancecardFonts'

export default function DancecardEventLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { eventSlug: string }
}) {
  return (
    <DancecardThemeProvider eventSlug={params.eventSlug} className={dancecardFontClassName}>
      {children}
    </DancecardThemeProvider>
  )
}
