import Link from 'next/link'
import {
  getDancecardLinkForEckeSlug,
  getDancecardPathForEckeSlug,
  getOrganizerDancecardPathForEckeSlug,
} from '@/lib/dancecard/directoryRegistry'

const BETA_LABEL = 'Free while in beta'

const ATTENDEE_BULLETS = [
  'Browse the live program on your phone',
  'Compare mutual free time & reserve plans',
  'Your personal dancecard for the whole weekend',
] as const

const ORGANIZER_BULLETS = [
  'Program, rooms & conflict checks in one console',
  'Registration, staff shifts & door check-in',
  'One link attendees use all weekend',
] as const

type Props = {
  /** ECKE event slug — enables live-event CTAs when Dancecard is enabled */
  eckeSlug?: string
  /** Dungeon / venue pages — emphasize organizer signup */
  organizerLean?: boolean
  /** Sidebar / inline — tighter layout */
  compact?: boolean
  className?: string
}

export function DancecardShowcase({ eckeSlug, organizerLean = false, compact = false, className = '' }: Props) {
  const live = eckeSlug ? getDancecardLinkForEckeSlug(eckeSlug) : null
  const attendeePath = eckeSlug ? getDancecardPathForEckeSlug(eckeSlug) : null
  const organizerPath = eckeSlug ? getOrganizerDancecardPathForEckeSlug(eckeSlug) : null

  const isLive = Boolean(live && attendeePath && organizerPath)
  const bullets = organizerLean && !isLive ? ORGANIZER_BULLETS : ATTENDEE_BULLETS

  const promoHref = organizerLean ? '/dancecard/organizers' : '/dancecard'
  const promoPrimaryLabel = isLive ? 'Open schedule & dancecard' : organizerLean ? 'Dancecard for organizers' : 'Explore Dancecard'
  const promoSecondaryLabel = isLive ? 'Organizer console' : organizerLean ? 'Attendee overview' : 'For organizers'
  const promoSecondaryHref = isLive
    ? organizerPath!
    : organizerLean
      ? '/dancecard'
      : '/dancecard/organizers'

  const primaryHref = isLive ? attendeePath! : '/dancecard'
  const title = isLive ? 'Dancecard is live' : 'Dancecard'
  const lead = isLive
    ? 'Program, availability, and your personal dancecard — ready for this event.'
    : organizerLean
      ? 'Run program, staff, and attendee scheduling from one console built for kink weekends.'
      : 'The planning layer for kink events — attendees get a dancecard; organizers get a stage-manager console.'

  return (
    <aside
      className={`dancecard-showcase relative overflow-hidden rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-950/40 via-[#0c1018] to-black/80 shadow-[0_0_40px_rgba(245,158,11,0.12)] ${compact ? 'p-4' : 'p-5 sm:p-6'} ${className}`}
      aria-labelledby={eckeSlug ? `dancecard-showcase-${eckeSlug}` : 'dancecard-showcase-global'}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary-500/15 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">
        <div className={`flex flex-wrap items-center gap-2 ${compact ? 'mb-3' : 'mb-4'}`}>
          <span className="rounded-full border border-amber-400/50 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-100">
            {BETA_LABEL}
          </span>
          {isLive ? (
            <span className="rounded-full border border-primary-400/40 bg-primary-600/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-100">
              Live on this event
            </span>
          ) : null}
        </div>

        <h2
          id={eckeSlug ? `dancecard-showcase-${eckeSlug}` : 'dancecard-showcase-global'}
          className={`font-serif font-bold text-white ${compact ? 'text-lg' : 'text-xl sm:text-2xl'}`}
        >
          {title}
        </h2>
        <p className={`mt-2 leading-relaxed text-amber-100/90 ${compact ? 'text-sm' : 'text-base'}`}>{lead}</p>

        <ul className={`mt-4 space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-2 text-gray-300">
              <span className="mt-0.5 shrink-0 font-bold text-amber-400" aria-hidden>
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className={`mt-5 flex flex-col gap-2 ${compact ? '' : 'sm:flex-row sm:flex-wrap'}`}>
          <Link
            href={primaryHref}
            className={`inline-flex min-h-touch items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 px-5 font-bold text-black shadow-lg transition hover:from-amber-400 hover:to-amber-500 ${compact ? 'py-2.5 text-sm' : 'py-3 text-sm sm:text-base'}`}
          >
            {promoPrimaryLabel}
          </Link>
          <Link
            href={promoSecondaryHref}
            className={`inline-flex min-h-touch items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 font-semibold text-gray-100 transition hover:border-amber-400/40 hover:bg-white/10 ${compact ? 'py-2.5 text-sm' : 'py-3 text-sm'}`}
          >
            {promoSecondaryLabel}
          </Link>
        </div>
      </div>
    </aside>
  )
}
