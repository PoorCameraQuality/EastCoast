'use client'

import type { ReactNode } from 'react'
import SupportCTAInline from '@/components/SupportCTAInline'

type Props = {
  contextLabel: string
  children: ReactNode
}

/**
 * Hero title block (left) + sponsor / support CTA (right) from `lg` up.
 * Stacks on small screens with sponsor below the hero.
 *
 * LCP on hub routes is typically the page heading (text) plus shell fonts from root layout
 * (`next/font`); there is no large hero image in this wrapper—below-the-fold cards may use logos with default lazy loading.
 */
export default function HeroSponsorLayout({ contextLabel, children }: Props) {
  return (
    <div className="mb-ecke-8 md:mb-ecke-10 grid grid-cols-1 gap-ecke-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start lg:gap-ecke-8 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <div className="min-w-0">{children}</div>
      <SupportCTAInline contextLabel={contextLabel} variant="heroAside" />
    </div>
  )
}
