'use client'

import { DancecardEventNav } from '@/components/dancecard/attendee/DancecardEventNav'
import { cn } from '@/lib/cn'

type Props = {
  eventSlug: string
  label: string
  maxWidth?: '2xl' | '4xl'
  className?: string
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-dc-surface-muted/80', className)} aria-hidden />
}

/** Full-page loading shell for standalone attendee routes (map, policies, news). */
export function AttendeeSubpageLoader({ eventSlug, label, maxWidth = '4xl', className = '' }: Props) {
  const max = maxWidth === '2xl' ? 'max-w-2xl' : 'max-w-4xl'
  return (
    <>
      <DancecardEventNav eventSlug={eventSlug} />
      <div className={cn('mx-auto px-4 py-8 text-dc-text', max, className)}>
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-9 w-56" />
        <Skeleton className="mt-4 h-4 w-full max-w-md" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <span
            className="inline-block h-10 w-10 rounded-full border-2 border-dc-accent-border border-t-dc-accent animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          <p className="text-sm text-dc-muted">{label}</p>
        </div>
        <Skeleton className="mt-10 aspect-[16/10] w-full rounded-xl" />
      </div>
    </>
  )
}
