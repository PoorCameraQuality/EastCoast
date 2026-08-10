'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { suppressSupportBanner } from '@/lib/dancecard/shellRoutes'

/**
 * Auto bottom-sheet support prompt.
 * Kept off for now — embedding the full sponsor card made it cover most of the
 * viewport on first navigation. Re-enable only as a slim strip (no hero card).
 */
const SUPPORT_BANNER_ENABLED = false

const DISMISS_KEY = 'ecke_support_banner_dismissed_at'
const SHOW_AFTER_MS = 45000
const COOLDOWN_DAYS = 14
const SCROLL_TRIGGER_PX = 900

function nowMs() {
  return Date.now()
}

function parseIntSafe(v: string | null) {
  if (!v) return null
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

export default function SupportBanner() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)

  const isSuppressedRoute = useMemo(() => {
    if (!pathname) return true
    if (pathname === '/support') return true
    if (pathname.startsWith('/admin')) return true
    if (suppressSupportBanner(pathname)) return true
    if (pathname === '/login') return true
    return false
  }, [pathname])

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!SUPPORT_BANNER_ENABLED) return
    if (!ready) return
    if (isSuppressedRoute) return

    const dismissedAt = parseIntSafe(window.localStorage.getItem(DISMISS_KEY))
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000
    if (dismissedAt && nowMs() - dismissedAt < cooldownMs) return

    let shown = false
    const show = () => {
      if (shown) return
      shown = true
      setVisible(true)
      cleanup()
    }

    const onScroll = () => {
      if (window.scrollY > SCROLL_TRIGGER_PX) show()
    }

    const t = window.setTimeout(show, SHOW_AFTER_MS)
    window.addEventListener('scroll', onScroll, { passive: true })

    const cleanup = () => {
      window.clearTimeout(t)
      window.removeEventListener('scroll', onScroll)
    }

    return cleanup
  }, [ready, isSuppressedRoute])

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(nowMs()))
    } catch {
      // If storage is blocked, still allow dismiss for this session.
    }
    setVisible(false)
  }

  if (!SUPPORT_BANNER_ENABLED || !visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl border border-white/10 bg-black/90 px-3 py-2.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <p className="min-w-0 flex-1 text-xs leading-snug text-gray-200">
            <span className="font-semibold text-white">Community funded.</span>{' '}
            Help keep the calendar and education library online.
          </p>
          <div className="flex flex-shrink-0 gap-1.5">
            <Link
              href="/support"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/20 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-white/5"
              aria-label="Learn how to support this site"
            >
              Support
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex min-h-9 items-center justify-center rounded-lg px-2.5 py-1.5 text-[11px] text-gray-400 hover:text-white"
              aria-label="Dismiss support message"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
