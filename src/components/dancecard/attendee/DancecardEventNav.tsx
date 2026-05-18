'use client'

import Link from 'next/link'

export function DancecardEventNav({
  eventSlug,
  eventTitle,
  variant = 'default',
}: {
  eventSlug: string
  eventTitle?: string | null
  variant?: 'default' | 'luxury'
}) {
  const slug = eventSlug.toLowerCase()
  const luxury = variant === 'luxury'
  return (
    <header
      data-dc-nav={luxury ? 'luxury' : undefined}
      className={
        luxury
          ? 'sticky top-0 z-dc-chrome border-b backdrop-blur-md'
          : 'sticky top-0 z-dc-chrome border-b border-white/[0.06] bg-dc-surface-muted/90 shadow-[0_12px_40px_rgba(2,6,23,0.4)] backdrop-blur-md'
      }
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 sm:h-14 sm:px-6 lg:px-8">
        <Link href={`/dancecard/${slug}`} className="flex min-w-0 items-center gap-2.5 text-dc-text transition hover:text-white">
          <span
            className={
              luxury
                ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8a7348] via-[#e8d5a8] to-[#c6a75e] font-serif text-xs font-semibold text-[#1a1510] shadow-md sm:h-9 sm:w-9'
                : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#8a7348] via-dc-accent-hover to-dc-accent font-serif text-xs font-semibold text-dc-accent-foreground shadow-md sm:h-9 sm:w-9'
            }
          >
            DC
          </span>
          <span
            className={
              luxury
                ? 'truncate font-serif text-base font-medium tracking-tight text-[var(--lux-cream)] sm:text-lg'
                : 'truncate font-serif text-base font-medium tracking-tight sm:text-lg'
            }
          >
            {eventTitle?.trim() || 'Dancecard'}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 text-xs font-semibold tracking-wide sm:text-sm">
          <a href="#dc-sign-in" className="text-dc-accent hover:text-white hover:underline">
            Sign in
          </a>
          <Link
            href={`/dancecard/${slug}#program`}
            className={luxury ? 'text-[var(--lux-champagne)] hover:text-[var(--lux-cream)] hover:underline' : 'text-dc-accent hover:text-white hover:underline'}
          >
            Activities
          </Link>
          <Link href={`/dancecard/${slug}/map`} className="text-dc-muted hover:text-white hover:underline">
            Map
          </Link>
          <Link href={`/dancecard/${slug}/policies`} className="text-dc-muted hover:text-white hover:underline">
            Policies
          </Link>
        </nav>
      </div>
    </header>
  )
}
