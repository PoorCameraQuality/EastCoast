'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserMenu from './auth/UserMenu'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

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
        <div className="flex justify-between items-center py-4 lg:py-6">
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
            {[
              { href: '/events', label: 'Events' },
              { href: '/dungeons', label: 'Dungeons' },
              { href: '/education', label: 'Education' },
              { href: '/calendar', label: 'Calendar' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' }
            ].map((link) => (
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
            
            <Link href="/events" className="btn-outline text-sm px-5 py-2" role="button" aria-label="Add your event for listing">
              Add Event
            </Link>
            
            <div className="ml-2">
              <UserMenu />
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile navigation menu"
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
        <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-6 border-t border-dark-700/50 bg-black/50 backdrop-blur-sm">
            <nav className="grid grid-cols-2 gap-4" role="navigation">
              {[
                { href: '/events', label: 'Events', icon: '🎪' },
                { href: '/dungeons', label: 'Dungeons', icon: '🏰' },
                { href: '/education', label: 'Education', icon: '📚' },
                { href: '/calendar', label: 'Calendar', icon: '📅' },
                { href: '/about', label: 'About', icon: 'ℹ️' },
                { href: '/contact', label: 'Contact', icon: '📧' }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all duration-300 ${
                    pathname === link.href
                      ? 'bg-primary-600/20 border border-primary-600/30 text-primary-300'
                      : 'text-gray-300 hover:text-white hover:bg-dark-800/50'
                  }`}
                >
                  <span className="text-2xl mb-2">{link.icon}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
            
            <div className="mt-6 pt-6 border-t border-dark-700/50">
              <div className="flex justify-center space-x-4">
                <Link href="/events" className="btn-outline w-full text-center" role="button" aria-label="Add your event for listing">
                  Add Event
                </Link>
                <div className="w-32">
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
