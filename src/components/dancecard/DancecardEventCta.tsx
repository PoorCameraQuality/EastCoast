import { DancecardShowcase } from '@/components/dancecard/DancecardShowcase'
import { getDancecardLinkForEckeSlug } from '@/lib/dancecard/directoryRegistry'

type Props = {
  eckeSlug: string
  accentClassName?: string
  compact?: boolean
  className?: string
}

/** Live-event Dancecard block — delegates to {@link DancecardShowcase}. */
export function DancecardEventCta({ eckeSlug, compact = false, className = '' }: Props) {
  if (!getDancecardLinkForEckeSlug(eckeSlug)) return null
  return <DancecardShowcase eckeSlug={eckeSlug} compact={compact} className={className} />
}
