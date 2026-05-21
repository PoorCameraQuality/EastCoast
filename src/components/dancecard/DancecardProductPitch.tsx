import { DancecardShowcase } from '@/components/dancecard/DancecardShowcase'

type Props = {
  eckeSlug?: string
  organizerLean?: boolean
  className?: string
  compact?: boolean
}

/** Prominent Dancecard promo — use on event, dungeon, and directory pages. */
export function DancecardProductPitch({ eckeSlug, organizerLean = false, className = '', compact = false }: Props) {
  return (
    <DancecardShowcase
      eckeSlug={eckeSlug}
      organizerLean={organizerLean}
      compact={compact}
      className={className}
    />
  )
}
