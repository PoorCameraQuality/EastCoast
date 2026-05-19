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
          : 'sticky top-0 z-dc-chrome border-b border-dc-border bg-dc-surface-muted/95 shadow-[0_8px_24px_rgba(45,38,28,0.08)] backdrop-blur-md'
      }
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-2 px-3 sm:h-14 sm:gap-3 sm:px-6 lg:px-8">
        <Link href={`/dancecard/${slug}`} className="flex min-w-0 flex-1 items-center gap-2 text-dc-text transition hover:text-dc-text sm:gap-2.5 sm:flex-none">
          <span
            className={
              luxury
                ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-dc-accent-hover via-[#b8893a] to-dc-accent font-serif text-xs font-semibold text-dc-accent-foreground shadow-md sm:h-9 sm:w-9'
                : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-dc-accent-hover via-[#b8893a] to-dc-accent font-serif text-xs font-semibold text-dc-accent-foreground shadow-md sm:h-9 sm:w-9'
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
        <nav
          className="flex max-w-[min(52vw,14rem)] shrink-0 items-center gap-2.5 overflow-x-auto overscroll-x-contain whitespace-nowrap text-[11px] font-semibold tracking-wide [-ms-overflow-style:none] [scrollbar-width:none] sm:max-w-none sm:gap-4 sm:text-sm [&::-webkit-scrollbar]:hidden"
          aria-label="Event sections"
        >
          <a href="#dc-sign-in" className="shrink-0 text-dc-accent hover:text-dc-text hover:underline">
            Sign in
          </a>
          <Link
            href={`/dancecard/${slug}#program`}
            className={
              luxury
                ? 'shrink-0 text-[var(--lux-champagne)] hover:text-[var(--lux-cream)] hover:underline'
                : 'shrink-0 text-dc-accent hover:text-dc-text hover:underline'
            }
          >
            Activities
          </Link>
          <Link href={`/dancecard/${slug}/map`} className="shrink-0 text-dc-muted hover:text-dc-text hover:underline">
            Map
          </Link>
          <Link href={`/dancecard/${slug}/policies`} className="shrink-0 text-dc-muted hover:text-dc-text hover:underline">
            Policies
          </Link>
        </nav>
      </div>
    </header>
  )
}
