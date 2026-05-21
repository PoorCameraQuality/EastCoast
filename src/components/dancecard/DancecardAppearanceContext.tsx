'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DANCECARD_APPEARANCE_PRESETS,
  DEFAULT_DANCECARD_APPEARANCE,
  getAppearancePreset,
  appearanceVarsToStyle,
  type DancecardAppearanceId,
  type DancecardAppearancePreset,
} from '@/lib/dancecard/appearancePresets'
import {
  readStoredAppearance,
  writeStoredAppearance,
} from '@/lib/dancecard/appearancePreference'

type DancecardAppearanceContextValue = {
  appearanceId: DancecardAppearanceId
  preset: DancecardAppearancePreset
  presets: readonly DancecardAppearancePreset[]
  setAppearanceId: (id: DancecardAppearanceId) => void
  appearanceStyle: Record<string, string>
  isDark: boolean
  /** True after localStorage preference is read (client). */
  appearanceReady: boolean
}

const DancecardAppearanceContext = createContext<DancecardAppearanceContextValue | null>(null)

export function useDancecardAppearance(): DancecardAppearanceContextValue {
  const ctx = useContext(DancecardAppearanceContext)
  if (!ctx) {
    const preset = getAppearancePreset(DEFAULT_DANCECARD_APPEARANCE)
    return {
      appearanceId: DEFAULT_DANCECARD_APPEARANCE,
      preset,
      presets: DANCECARD_APPEARANCE_PRESETS,
      setAppearanceId: () => {},
      appearanceStyle: appearanceVarsToStyle(preset.vars),
      isDark: preset.mode === 'dark',
      appearanceReady: false,
    }
  }
  return ctx
}

type ProviderProps = {
  children: ReactNode
  className?: string
  /** Extra classes on chrome root (e.g. dancecard font). */
  chromeClassName?: string
  /** When false, only provides context (organizer chrome supplies the shell div). */
  wrapChrome?: boolean
}

export function DancecardAppearanceProvider({
  children,
  className = '',
  chromeClassName = '',
  wrapChrome = true,
}: ProviderProps) {
  const [appearanceId, setAppearanceIdState] = useState<DancecardAppearanceId>(DEFAULT_DANCECARD_APPEARANCE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setAppearanceIdState(readStoredAppearance())
    setHydrated(true)
  }, [])

  const setAppearanceId = useCallback((id: DancecardAppearanceId) => {
    setAppearanceIdState(id)
    writeStoredAppearance(id)
  }, [])

  const preset = useMemo(() => getAppearancePreset(appearanceId), [appearanceId])
  const appearanceStyle = useMemo(() => appearanceVarsToStyle(preset.vars), [preset])

  const value = useMemo<DancecardAppearanceContextValue>(
    () => ({
      appearanceId,
      preset,
      presets: DANCECARD_APPEARANCE_PRESETS,
      setAppearanceId,
      appearanceStyle,
      isDark: preset.mode === 'dark',
      appearanceReady: hydrated,
    }),
    [appearanceId, preset, setAppearanceId, appearanceStyle, hydrated],
  )

  const chromeProps = {
    className: `dc-gold-chrome min-h-screen bg-dc-surface text-dc-text ${chromeClassName} ${className}`.trim(),
    'data-dc-theme': 'event' as const,
    'data-dc-appearance': appearanceId,
    style: hydrated ? appearanceStyle : undefined,
    suppressHydrationWarning: true as const,
  }

  return (
    <DancecardAppearanceContext.Provider value={value}>
      {wrapChrome ? <div {...chromeProps}>{children}</div> : children}
    </DancecardAppearanceContext.Provider>
  )
}
