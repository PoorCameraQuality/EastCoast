'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import VendorImage from '@/components/vendors/VendorImage'
import { getSiteSponsorVendor } from '@/data/vendors'
import { suppressSupportBanner } from '@/lib/dancecard/shellRoutes'

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
  const sponsorVendor = getSiteSponsorVendor()

  const isSuppressedRoute = useMemo(() => {
    if (!pathname) return true
    if (pathname === '/support') return true
    if (pathname.startsWith('/admin')) return true
    if (suppressSupportBanner(pathname)) return true
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
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-2xl">
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Help keep East Coast Kink Events community funded.
              </p>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                Supporter tier ($25/mo) gets sticky placement while people browse. Sponsorships available via Discord: <span className="text-gray-200 font-semibold">Brax117</span>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 flex-shrink-0 text-xs">
              <Link href="/support" className="btn-outline px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center" aria-label="Learn how to support this site">
                Learn more
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="btn-outline px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center"
                aria-label="Dismiss support message"
              >
                Not now
              </button>
            </div>
          </div>

          {sponsorVendor ? (
            <div className="relative overflow-visible rounded-2xl border border-amber-300/40 bg-black/70 p-4 vendor-sponsor-glitter">
              <span className="sponsor-spotlight-label">
                Keep this site community funded
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <VendorImage
                  src={sponsorVendor.logo125Url}
                  alt={`${sponsorVendor.name} logo`}
                  size={48}
                  className="flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200/90">
                    Sponsor spotlight
                  </p>
                  <p className="text-base font-serif font-semibold text-white mt-1">
                    <Link href={`/vendors/${sponsorVendor.slug}`} className="underline underline-offset-4 decoration-amber-200/40 hover:decoration-amber-200/80">
                      {sponsorVendor.name}
                    </Link>
                  </p>
                  <p className="text-xs text-gray-200 mt-1">
                    Featured site sponsor. Reach out to Brax if you would like to support the site for a month.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/vendors/${sponsorVendor.slug}`} className="btn-primary px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center">
                    View Sponsor
                  </Link>
                  {sponsorVendor.websiteUrl ? (
                    <a
                      href={sponsorVendor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline px-3 py-2 text-xs min-h-touch inline-flex items-center justify-center"
                    >
                      Visit Shop
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

