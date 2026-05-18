import Link from 'next/link'
import {
  getDancecardLinkForEckeSlug,
  getDancecardPathForEckeSlug,
  getOrganizerDancecardPathForEckeSlug,
} from '@/lib/dancecard/directoryRegistry'

type Props = {
  eckeSlug: string
  accentClassName?: string
}

export function DancecardEventCta({ eckeSlug, accentClassName = 'from-dc-accent via-[#e8d5a8] to-[#a8894a]' }: Props) {
  const link = getDancecardLinkForEckeSlug(eckeSlug)
  if (!link) return null

  const attendeePath = getDancecardPathForEckeSlug(eckeSlug)!
  const organizerPath = getOrganizerDancecardPathForEckeSlug(eckeSlug)!

  return (
    <div
      className="rounded-2xl border border-dc-accent-border bg-gradient-to-br from-dc-surface-muted/90 to-dc-elevated-solid/80 p-4 sm:p-5"
      aria-labelledby={`dancecard-cta-${eckeSlug}`}
    >
      <h2 id={`dancecard-cta-${eckeSlug}`} className="text-lg font-serif font-bold text-dc-text">
        Schedule &amp; dancecard
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-dc-muted">
        Plan your weekend with the live program, mutual availability, and your personal dancecard — powered by
        Dancecard (beta).
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={attendeePath}
          className={`inline-flex min-h-touch items-center justify-center rounded-full bg-gradient-to-r ${accentClassName} px-5 py-2.5 text-sm font-bold text-dc-accent-foreground shadow-lg transition hover:opacity-95`}
        >
          Open schedule &amp; dancecard
        </Link>
        <Link
          href={organizerPath}
          className="inline-flex min-h-touch items-center justify-center rounded-full border border-dc-border bg-dc-elevated-muted px-5 py-2.5 text-sm font-semibold text-dc-text transition hover:border-dc-accent-border hover:text-dc-accent-hover"
        >
          Organizer console
        </Link>
      </div>
    </div>
  )
}
