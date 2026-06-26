'use client'

import type { StorefrontEvent } from '@/lib/homepageStorefrontData'
import AdaptiveEventCard from '@/components/storefront/AdaptiveEventCard'

type Props = {
  event: StorefrontEvent
}

export default function FeaturedEventShowcase({ event }: Props) {
  return (
    <div aria-label="Featured upcoming event">
      <AdaptiveEventCard event={event} size="showcase" itemListName="home_hero_showcase" priority />
    </div>
  )
}
