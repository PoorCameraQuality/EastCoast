'use client'

import type { ReactNode } from 'react'

export type SessionCardProps = {
  title: string
  timeLabel: string
  room?: string | null
  trackRailClassName?: string
  active?: boolean
  chip?: ReactNode
  onClick?: () => void
  className?: string
}

export function SessionCard({
  title,
  timeLabel,
  room,
  trackRailClassName = 'bg-dc-accent',
  active = false,
  chip,
  onClick,
  className = '',
}: SessionCardProps) {
  const shared =
    'group relative w-full overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated/90 p-4 text-left dc-transition-tab'
  const interactive = onClick
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dc-accent'
    : ''
  const activeClass = active ? 'ring-2 ring-dc-accent-border shadow-lg' : ''
  const classes = `${shared} ${interactive} ${activeClass} ${className}`.trim()

  const body = (
    <>
      <span className={`absolute inset-y-3 left-3 w-1 rounded-full ${trackRailClassName}`} aria-hidden />
      <div className="pl-4">
        <div className="flex flex-wrap items-center gap-2">
          {chip}
          <span className="font-tabular text-xs font-medium text-dc-muted">{timeLabel}</span>
        </div>
        <h3 className="dc-session-title mt-2 text-base font-semibold text-dc-text">{title}</h3>
        {room ? <p className="mt-1 text-sm text-dc-muted">{room}</p> : null}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {body}
      </button>
    )
  }

  return <div className={classes}>{body}</div>
}
