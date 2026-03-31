'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './auth/UserMenu'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'

const NAV_LINKS = [
  { href: '/events', label: 'Events' },
  { href: '/dungeons', label: 'Dungeons' },
  { href: '/education', label: 'Education' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/states', label: 'States' },
  { href: '/support', label: 'Support' },
  { href: '/about', label: 'About' },
] as const

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null)

  // Auto-close mobile menu when route changes
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

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-black/95 backdrop-blur-xl border-b border-dark-700/50 shadow-2xl' 
        : 'bg-gradient-to-b from-black/90 to-black/70 backdrop-blur-md'
    }`}>
      <div className="container-custom">
        <div className="flex justify-between items-center py-3 lg:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-serif font-bold text-xl">EC</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-semibold text-white group-hover:text-primary-300 transition-colors duration-300">
                East Coast Kink Events
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Community • Events • Education
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" role="navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  pathname === link.href
                    ? 'text-primary-300 bg-primary-600/20 border border-primary-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-400 rounded-full"></div>
                )}
              </Link>
            ))}
            
            <div className="mx-2 w-px h-6 bg-dark-600"></div>

            <Link
              href="/contact"
              className="btn-outline text-sm px-5 py-2 whitespace-nowrap min-h-touch inline-flex items-center justify-center"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
            
            <div className="ml-2">
              <UserMenu />
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="ecke-mobile-nav"
            className="lg:hidden relative p-3 rounded-lg text-gray-300 hover:text-white hover:bg-dark-800/50 transition-all duration-300 group"
          >
            <div className={`w-6 h-6 flex flex-col justify-center items-center transition-all duration-300 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
              }`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          id="ecke-mobile-nav"
          aria-hidden={!isMenuOpen}
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[min(85vh,28rem)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="py-4 border-t border-dark-700/50 bg-black/80 backdrop-blur-md max-h-[min(80vh,26rem)] overflow-y-auto overscroll-contain">
            <nav className="grid grid-cols-2 gap-3 sm:gap-4" role="navigation">
              {[...NAV_LINKS, { href: '/contact', label: 'Contact' }].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex min-h-touch items-center justify-center px-3 py-3 rounded-xl text-center transition-all duration-300 ${
                    pathname === link.href
                      ? 'bg-primary-600/20 border border-primary-600/30 text-primary-300'
                      : 'text-gray-300 hover:text-white hover:bg-dark-800/50 border border-transparent'
                  }`}
                >
                  <span className="text-sm font-medium leading-tight">{link.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-4 pt-4 border-t border-dark-700/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <Link
                  href="/contact"
                  className="btn-outline flex-1 text-center justify-center min-h-touch inline-flex items-center"
                  aria-label="Contact us"
                >
                  {CONTACT_US_LABEL}
                </Link>
                <div className="flex-1 min-w-0 flex justify-center sm:justify-stretch [&>*]:w-full sm:[&>*]:max-w-none">
                  <UserMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 
