import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Palette lab',
  robots: { index: false, follow: false },
}

/** Skip dc-gold-chrome wrapper from parent — lab page sets its own chrome. */
export default function PaletteLabLayout({ children }: { children: ReactNode }) {
  return <div className="!bg-[#0a0908]">{children}</div>
}
