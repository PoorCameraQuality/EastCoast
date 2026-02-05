'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DISMISS_KEY = 'ecke_support_banner_dismissed_at'
const SHOW_AFTER_MS = 12000
const COOLDOWN_DAYS = 14
const SCROLL_TRIGGER_PX = 300

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
    if (pathname === '/login') return true
    return false
  }, [pathname])

  useEffect(() => {
    // Wait until mounted (localStorage available)
    setReady(true)
  }, [])

  useEffect(() => {
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

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl">
        <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              Help keep East Coast Kink Events self-funded.
            </p>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">
              Supporter tier ($25/mo) gets sticky placement while people browse. Sponsorships available via Discord: <span className="text-gray-200 font-semibold">Brax117</span>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href="/support" className="btn-primary text-center" aria-label="Learn how to support this site">
              Learn more
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="btn-outline text-center"
              aria-label="Dismiss support message"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

