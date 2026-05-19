'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { dancecardFetch } from '@/components/dancecard/api-client'
import { cn } from '@/lib/cn'

type IsoTitle = { id: string; title: string }

type Props = {
  eventSlug: string
  enabled: boolean
  onOpenBoard?: () => void
  className?: string
}

export function IsoMarquee({ eventSlug, enabled, onOpenBoard, className }: Props) {
  const [titles, setTitles] = useState<IsoTitle[]>([])

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      const d = await dancecardFetch<{ posts: { id: string; title: string }[] }>(eventSlug, '/iso')
      const list = (d.posts ?? []).map((p) => ({ id: p.id, title: p.title.trim() })).filter((p) => p.title)
      setTitles(list)
    } catch {
      setTitles([])
    }
  }, [eventSlug, enabled])

  useEffect(() => {
    void load()
  }, [load])

  const shuffled = useMemo(() => {
    if (titles.length <= 1) return titles
    const copy = [...titles]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }, [titles])

  if (!enabled || shuffled.length === 0) return null

  const loop = [...shuffled, ...shuffled]
  const durationSec = Math.max(12, shuffled.length * 4)

  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-hidden rounded-xl border border-dc-border/50 bg-dc-elevated-muted/50 px-2 py-1',
        className,
      )}
      aria-label="Recent ISO posts"
    >
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-dc-accent">ISO</span>
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden">
        <ul className="dc-iso-marquee-scroll flex flex-col will-change-transform" style={{ animationDuration: `${durationSec}s` }}>
          {loop.map((t, i) => (
            <li key={`${t.id}-${i}`} className="h-5 shrink-0 truncate py-0.5 text-xs leading-5 text-dc-muted">
              {onOpenBoard ? (
                <button type="button" className="max-w-full truncate text-left hover:text-dc-accent" onClick={onOpenBoard}>
                  {t.title}
                </button>
              ) : (
                t.title
              )}
            </li>
          ))}
        </ul>
      </div>
      {onOpenBoard ? (
        <button type="button" className="shrink-0 text-[10px] font-semibold text-dc-accent" onClick={onOpenBoard}>
          Board
        </button>
      ) : null}
    </div>
  )
}
