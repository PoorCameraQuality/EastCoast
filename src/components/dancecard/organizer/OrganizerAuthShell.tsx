'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function OrganizerAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="dc-gold-chrome min-h-[100dvh] bg-dc-surface text-dc-text" data-dc-theme="event">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-56 bg-gradient-to-b from-dc-accent/10 to-transparent"
        aria-hidden
      />
      <header className="relative z-10 border-b border-dc-border bg-dc-surface-muted/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-dc-accent hover:text-dc-accent-hover">
            East Coast Kink Events
          </Link>
          <span className="text-xs text-dc-muted">Organizer</span>
        </div>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
