'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './auth/UserMenu'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'
import { suppressEckeHeader } from '@/lib/dancecard/shellRoutes'
import {
  getKinkSocialJoinUrl,
} from '@/lib/kinkSocialMarketing'

const PRIMARY_NAV = [
  { href: '/events', label: 'Events' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/states', label: 'States' },
  { href: '/dungeons', label: 'Dungeons & clubs' },
  { href: '/vendors', label: 'Vendors' },
] as const

type MoreNavItem = { href: string; label: string; external?: boolean }

const MORE_NAV: MoreNavItem[] = [
  { href: getKinkSocialJoinUrl('header_nav'), label: 'kink.social', external: true },
  { href: '/dancecard/organizers', label: 'For organizers' },
  { href: '/dancecard', label: 'Dancecard' },
  { href: '/education', label: 'Education' },
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
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setIsMenuOpen(false)
    setIsMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsMenuOpen(false)
        setIsMoreOpen(false)
        mobileMenuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMenuOpen])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (suppressEckeHeader(pathname)) {
    return null
  }

  const moreActive = MORE_NAV.some((l) => !l.external && isNavCurrent(pathname, l.href))

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl'
          : 'bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-md'
      }`}
    >
      <div className="container-custom">
        <div className="flex justify-between items-center py-3 lg:py-4">
          <Link href="/" className="flex items-center space-x-3 group min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-serif font-bold text-xl">EC</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-serif font-semibold text-white group-hover:text-primary-300 transition-colors duration-300 truncate">
                East Coast Kink Events
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 font-medium tracking-wide">
                Community · Events · Directory
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1" aria-label="Primary">
            <ul className="flex items-center space-x-1 list-none m-0 p-0" role="list">
              {PRIMARY_NAV.map((link) => {
                const isCurrent = isNavCurrent(pathname, link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 inline-flex ${
                        isCurrent
                          ? 'text-primary-300 bg-primary-600/20 border border-primary-600/30'
                          : 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                      }`}
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  aria-expanded={isMoreOpen}
                  aria-haspopup="true"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 inline-flex min-h-touch items-center gap-1 ${
                    moreActive || isMoreOpen
                      ? 'text-primary-300 bg-primary-600/20 border border-primary-600/30'
                      : 'text-gray-300 hover:text-white hover:bg-dark-800/50 border border-transparent'
                  }`}
                >
                  More
                  <svg className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMoreOpen ? (
                  <ul
                    className="absolute right-0 top-full mt-1 min-w-[12rem] rounded-xl border border-dark-700 bg-black/95 py-2 shadow-xl list-none m-0 p-0 z-50"
                    role="list"
                  >
                    {MORE_NAV.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-800/50 hover:text-white min-h-touch"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-800/50 hover:text-white min-h-touch"
                            onClick={() => setIsMoreOpen(false)}
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            </ul>

            <div className="mx-2 w-px h-6 bg-dark-600" aria-hidden="true" />

            <Link
              href="/contact"
              className="btn-outline text-sm px-4 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>

            <div className="ml-2">
              <UserMenu />
            </div>
          </nav>

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="ecke-mobile-nav"
            className="lg:hidden relative p-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-800/50 transition-all duration-300"
          >
            <div className={`w-6 h-6 flex flex-col justify-center items-center transition-all duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`} />
            </div>
          </button>
        </div>

        <div
          id="ecke-mobile-nav"
          aria-hidden={!isMenuOpen}
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[min(85vh,32rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="py-4 border-t border-dark-700/50 bg-black/80 backdrop-blur-md max-h-[min(80vh,30rem)] overflow-y-auto overscroll-contain">
            <nav aria-label="Mobile">
              <ul className="flex flex-col gap-1 list-none m-0 p-0" role="list">
                {PRIMARY_NAV.map((link) => {
                  const isCurrent = isNavCurrent(pathname, link.href)
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex min-h-touch items-center px-4 py-3 rounded-lg transition-all duration-300 ${
                          isCurrent
                            ? 'bg-primary-600/20 border border-primary-600/30 text-primary-300'
                            : 'text-gray-300 hover:text-white hover:bg-dark-800/50 border border-transparent'
                        }`}
                        aria-current={isCurrent ? 'page' : undefined}
                      >
                        <span className="text-sm font-medium">{link.label}</span>
                      </Link>
                    </li>
                  )
                })}
                <li>
                  <button
                    type="button"
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    aria-expanded={isMoreOpen}
                    className={`flex w-full min-h-touch items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      moreActive ? 'text-primary-300 bg-primary-600/10' : 'text-gray-300 hover:bg-dark-800/50'
                    }`}
                  >
                    More
                    <svg className={`w-4 h-4 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMoreOpen ? (
                    <ul className="mt-1 ml-2 flex flex-col gap-1 border-l border-dark-700 pl-3 list-none" role="list">
                      {MORE_NAV.map((link) => {
                        const isCurrent = !link.external && isNavCurrent(pathname, link.href)
                        return (
                          <li key={link.href}>
                            {link.external ? (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-touch items-center py-2.5 text-sm text-gray-400 hover:text-white"
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                className={`flex min-h-touch items-center py-2.5 text-sm ${
                                  isCurrent ? 'text-primary-300' : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </li>
              </ul>
            </nav>

            <div className="mt-4 pt-4 border-t border-dark-700/50 px-4">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
