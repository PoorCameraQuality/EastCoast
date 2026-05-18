'use client'

import type { AttendeeContactLink, AttendeePublicProfile } from '@/lib/dancecard/attendeeProfile'
import { cn } from '@/lib/cn'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ContactIcon({ kind, compact }: { kind: AttendeeContactLink['kind']; compact?: boolean }) {
  const common = compact ? 'h-3 w-3 shrink-0' : 'h-4 w-4 shrink-0'
  switch (kind) {
    case 'fetlife':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8v-2h3V9h2v4h3v2h-3v4h-2z" />
        </svg>
      )
    case 'discord':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.3 4.4A17.6 17.6 0 0 0 15.9 3a12 12 0 0 0-.6 1.2 16.2 16.2 0 0 0-4.6 0A11.5 11.5 0 0 0 10.1 3 17.4 17.4 0 0 0 5.7 4.4 18.5 18.5 0 0 0 2 17.7a17.7 17.7 0 0 0 5.4 2.7 13 13 0 0 0 1.1-1.8 8.4 8.4 0 0 1-1.7-.8l.4-.3a11.8 11.8 0 0 0 10 0l.4.3a8.2 8.2 0 0 1-1.7.8c.3.7.7 1.3 1.1 1.8A17.6 17.6 0 0 0 22 17.7c-.2-3.6-1.5-6.9-3.7-9.3zM8.7 15.1c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M11.9 16.2 11.5 20l3.2-2.9 5.9 4.3 1.7-14.6L4.1 10.5l4.8 1.7 9.9-6.2-4.3 10.2z" />
        </svg>
      )
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      )
  }
}

export function AttendeeProfileCard({
  profile,
  variant = 'host',
  compact,
  className,
}: {
  profile: AttendeePublicProfile
  variant?: 'host' | 'self'
  compact?: boolean
  className?: string
}) {
  const ring =
    variant === 'host'
      ? compact
        ? 'ring-[1.5px] ring-dc-accent/50 shadow-[0_0_20px_rgba(198,167,94,0.12)]'
        : 'ring-2 ring-dc-accent/55 shadow-[0_0_32px_rgba(198,167,94,0.18)]'
      : compact
        ? 'ring-[1.5px] ring-dc-success/35 shadow-[0_0_16px_rgba(156,184,138,0.08)]'
        : 'ring-2 ring-dc-success/40 shadow-[0_0_24px_rgba(156,184,138,0.12)]'

  const avatarClass = compact ? 'h-[3.25rem] w-[3.25rem] text-base' : 'h-24 w-24 text-2xl'

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border border-dc-accent-border/50 bg-gradient-to-br from-dc-elevated-solid via-dc-surface-muted to-dc-surface',
        compact ? 'p-2.5 sm:p-3' : 'p-4 sm:p-5',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute rounded-full blur-2xl',
          compact ? '-right-6 -top-6 h-20 w-20 bg-dc-accent/8' : '-right-8 -top-8 h-32 w-32 bg-dc-accent/10'
        )}
        aria-hidden
      />
      <div className={cn('relative flex sm:items-start', compact ? 'flex-row gap-2.5' : 'flex-col gap-4 sm:flex-row')}>
        <div className={cn('relative shrink-0 rounded-full', ring, !compact && 'mx-auto sm:mx-0')}>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className={cn('rounded-full object-cover', avatarClass)} />
          ) : (
            <div
              className={cn(
                'flex items-center justify-center rounded-full bg-gradient-to-br from-dc-accent/35 to-dc-accent-border/20 font-semibold text-dc-accent-hover',
                avatarClass
              )}
              aria-hidden
            >
              {initials(profile.displayName)}
            </div>
          )}
        </div>
        <div className={cn('min-w-0 flex-1', compact ? 'text-left' : 'text-center sm:text-left')}>
          <p
            className={cn(
              'font-semibold uppercase text-dc-muted',
              compact ? 'text-[9px] tracking-[0.2em]' : 'text-[10px] tracking-[0.24em]'
            )}
          >
            {variant === 'host' ? 'Comparing with' : 'Your dancecard'}
          </p>
          <h2 className={cn('font-serif text-dc-text', compact ? 'mt-0 text-lg leading-tight' : 'mt-0.5 text-2xl')}>
            {profile.displayName}
          </h2>
          <p className={cn('text-dc-muted', compact ? 'mt-0 text-[11px]' : 'mt-0.5 text-sm')}>
            @{profile.loginName}
            {profile.pronouns ? <span className="text-dc-text/80"> · {profile.pronouns}</span> : null}
          </p>
          {profile.bio ? (
            <p
              className={cn(
                'text-dc-text/90',
                compact ? 'mt-1.5 line-clamp-2 text-[11px] leading-snug' : 'mt-3 text-sm leading-relaxed'
              )}
            >
              {profile.bio}
            </p>
          ) : null}
          {profile.contacts.length > 0 ? (
            <ul
              className={cn(
                'flex flex-wrap gap-1.5',
                compact ? 'mt-2 justify-start' : 'mt-4 justify-center sm:justify-start'
              )}
              aria-label="Contact links"
            >
              {profile.contacts.map((c) => (
                <li key={`${c.kind}-${c.value}`}>
                  <ContactPill contact={c} compact={compact} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function ContactPill({ contact, compact }: { contact: AttendeeContactLink; compact?: boolean }) {
  const inner = (
    <>
      <ContactIcon kind={contact.kind} compact={compact} />
      <span className="font-medium text-dc-text">{contact.label}</span>
      <span className={cn('text-dc-muted', compact && 'max-w-[6.5rem] truncate sm:max-w-none')}>{contact.value}</span>
    </>
  )
  const className = compact
    ? 'inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full border border-dc-border bg-dc-surface/80 px-2 py-1 text-[10px] transition hover:border-dc-accent-border hover:bg-dc-accent-muted'
    : 'inline-flex min-h-10 items-center gap-2 rounded-full border border-dc-border bg-dc-surface/80 px-3 py-2 text-xs transition hover:border-dc-accent-border hover:bg-dc-accent-muted'

  if (contact.href) {
    return (
      <a href={contact.href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    )
  }
  return <span className={className}>{inner}</span>
}
