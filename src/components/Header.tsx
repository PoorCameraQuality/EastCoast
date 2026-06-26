'use client'

import { useState, useEffect, useRef } from 'react'
import EckeLink from '@/components/EckeLink'
import { usePathname } from 'next/navigation'
import UserMenu from './auth/UserMenu'
import KinkSocialCtaLink from '@/components/kink-social/KinkSocialCtaLink'
import { suppressEckeHeader } from '@/lib/dancecard/shellRoutes'
import {
  getKinkSocialJoinUrl,
  getKinkSocialOrgUrl,
  KINK_SOCIAL_LABELS,
} from '@/lib/kinkSocialMarketing'

const PRIMARY_NAV = [
  { href: '/events', label: 'Events' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/dungeons', label: 'Places' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/education', label: 'Education' },
  { href: '/states', label: 'States' },
] as const

type SecondaryNavItem = { href: string; label: string; external?: boolean }

const SECONDARY_NAV: SecondaryNavItem[] = [
  { href: '/groups', label: 'Groups' },
  { href: '/organizations', label: 'Organizations' },
  { href: '/conventions', label: 'Conventions' },
  { href: '/presenters', label: 'Presenters' },
  { href: '/venues', label: 'Venues' },
  { href: '/dancecard', label: 'Dancecard' },
  { href: '/support', label: 'Support' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

function isNavCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsMenuOpen(false)
        mobileMenuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (suppressEckeHeader(pathname)) {
    return null
  }

  const navLinkClass = (active: boolean) =>
    `relative px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 inline-flex ${
      active
        ? 'text-sf-violet bg-sf-violet/10'
        : 'text-sf-body hover:text-sf-strong hover:bg-white/5'
    }`

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg shadow-black/20' : ''}`}
    >
      <div className="sf-header-bar">
        <div className="container-custom">
          <div className="flex items-center justify-between gap-3 py-2 lg:py-2.5">
            <EckeLink href="/" className="group flex min-w-0 shrink items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sf-violet/15 text-xs font-bold text-sf-violet">
                EC
              </div>
              <div className="min-w-0 leading-tight">
                <span className="block truncate font-sans text-sm font-semibold text-sf-strong sm:text-base">
                  East Coast Kink Events
                </span>
                <span className="hidden text-[11px] text-sf-muted sm:block">by kink.social</span>
              </div>
            </EckeLink>

            <nav className="hidden lg:flex lg:flex-1 lg:justify-center" aria-label="Primary">
              <ul className="flex items-center gap-0.5" role="list">
                {PRIMARY_NAV.map((link) => {
                  const isCurrent = isNavCurrent(pathname, link.href)
                  return (
                    <li key={link.href}>
                      <EckeLink
                        href={link.href}
                        className={navLinkClass(isCurrent)}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        {link.label}
                      </EckeLink>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <KinkSocialCtaLink
                href={getKinkSocialOrgUrl('header_nav')}
                label={KINK_SOCIAL_LABELS.listEvent}
                variant="organizer"
                surface="header_nav"
                className="sf-btn-ghost whitespace-nowrap px-4 py-2 text-sm"
                external
              />
              <KinkSocialCtaLink
                href={getKinkSocialJoinUrl('header_nav')}
                label="Join kink.social"
                variant="home"
                surface="header_nav"
                className="sf-btn-rose whitespace-nowrap px-4 py-2 text-sm"
                external
              />
              <UserMenu />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <EckeLink href="/events" className="sf-btn-ghost px-3 py-2 text-xs">
                Browse
              </EckeLink>
              <KinkSocialCtaLink
                href={getKinkSocialJoinUrl('header_nav')}
                label="Join"
                variant="home"
                surface="header_nav_mobile"
                className="sf-btn-rose px-3 py-2 text-xs"
                external
              />
              <button
                ref={mobileMenuButtonRef}
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="ecke-mobile-nav"
                className="rounded-lg p-2.5 text-sf-body hover:bg-sf-card/60 hover:text-sf-strong"
              >
                <span className="sr-only">Menu</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        id="ecke-mobile-nav"
        aria-hidden={!isMenuOpen}
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-[min(85vh,36rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="border-b border-sf-header-border bg-sf-bg/95 backdrop-blur-lg">
          <div className="container-custom max-h-[min(80vh,34rem)] overflow-y-auto py-4">
            <nav aria-label="Mobile primary">
              <ul className="flex flex-col gap-1" role="list">
                {PRIMARY_NAV.map((link) => {
                  const isCurrent = isNavCurrent(pathname, link.href)
                  return (
                    <li key={link.href}>
                      <EckeLink
                        href={link.href}
                        className={`flex min-h-touch items-center rounded-lg px-4 py-3 text-sm font-medium ${
                          isCurrent ? 'bg-sf-violet/10 text-sf-violet' : 'text-sf-body hover:bg-white/5'
                        }`}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        {link.label}
                      </EckeLink>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <p className="mt-4 px-4 text-[10px] font-semibold uppercase tracking-wider text-sf-muted">More</p>
            <ul className="mt-2 flex flex-col gap-1" role="list">
              {SECONDARY_NAV.map((link) => (
                <li key={link.href}>
                  <EckeLink
                    href={link.href}
                    className="flex min-h-touch items-center px-4 py-2.5 text-sm text-sf-muted hover:text-sf-strong"
                  >
                    {link.label}
                  </EckeLink>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-white/10 px-4 pt-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
