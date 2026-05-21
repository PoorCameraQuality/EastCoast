'use client'

import type { ReactNode } from 'react'
import { DancecardAppearanceProvider } from '@/components/dancecard/DancecardAppearanceContext'

type Props = {
  children: ReactNode
  chromeClassName?: string
}

/** Client shell for `/dancecard` segment — applies saved appearance + dc-gold-chrome. */
export default function DancecardAppearanceRoot({ children, chromeClassName = '' }: Props) {
  return <DancecardAppearanceProvider chromeClassName={chromeClassName}>{children}</DancecardAppearanceProvider>
}
