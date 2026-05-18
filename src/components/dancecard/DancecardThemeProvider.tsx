'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import type { DancecardThemeConfig, PublicThemeDto } from '@/lib/dancecard/theme'
import { parseThemeConfig, themeConfigToCssVars } from '@/lib/dancecard/theme'

type HallwayContextValue = {
  hallway: boolean
  setHallway: (on: boolean) => void
  eventSlug: string | null
}

const HallwayContext = createContext<HallwayContextValue | null>(null)

export function useDancecardHallwayMode() {
  const ctx = useContext(HallwayContext)
  return ctx
}

function hallwayStorageKey(slug: string) {
  return `dc-hallway-mode-${slug}`
}

type Props = {
  eventSlug?: string
  theme?: DancecardThemeConfig | PublicThemeDto | null
  children: ReactNode
  className?: string
}

export function DancecardThemeProvider({ eventSlug, theme: themeProp, children, className = '' }: Props) {
  const [theme, setTheme] = useState<DancecardThemeConfig>(() => parseThemeConfig(themeProp))
  const [hallway, setHallwayState] = useState(false)

  useEffect(() => {
    if (themeProp != null) {
      setTheme(parseThemeConfig(themeProp))
    }
  }, [themeProp])

  useEffect(() => {
    if (themeProp != null || !eventSlug) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/dancecard/${encodeURIComponent(eventSlug)}/theme`)
        if (!res.ok) return
        const j = (await res.json()) as { theme?: PublicThemeDto }
        if (!cancelled) setTheme(parseThemeConfig(j.theme))
      } catch {
        /* defaults */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [eventSlug, themeProp])

  useEffect(() => {
    if (!eventSlug) return
    try {
      setHallwayState(localStorage.getItem(hallwayStorageKey(eventSlug)) === '1')
    } catch {
      setHallwayState(false)
    }
  }, [eventSlug])

  const setHallway = useCallback(
    (on: boolean) => {
      setHallwayState(on)
      if (!eventSlug) return
      try {
        localStorage.setItem(hallwayStorageKey(eventSlug), on ? '1' : '0')
      } catch {
        /* ignore */
      }
    },
    [eventSlug],
  )

  const cssVars = useMemo(() => themeConfigToCssVars(theme), [theme])
  const style = cssVars as CSSProperties

  const hallwayValue = useMemo(
    () => ({ hallway, setHallway, eventSlug: eventSlug ?? null }),
    [hallway, setHallway, eventSlug],
  )

  return (
    <HallwayContext.Provider value={hallwayValue}>
      <div
        data-dc-theme="event"
        data-dc-hallway={hallway ? 'true' : 'false'}
        style={style}
        className={`min-h-screen bg-dc-surface text-dc-text antialiased ${className}`.trim()}
      >
        {children}
      </div>
    </HallwayContext.Provider>
  )
}
