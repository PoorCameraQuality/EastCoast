'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserMenu from './auth/UserMenu'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-black border-b border-dark-700 sticky top-0 z-50 backdrop-blur-sm bg-black/95">
      <div className="container-custom">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-none flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">EC</span>
            </div>
            <span className="text-xl font-serif font-semibold text-white">East Coast Kink Events</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              Events
            </Link>
            <Link href="/dungeons" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              Dungeons
            </Link>
            <Link href="/education" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              Kink Education
            </Link>
            <Link href="/calendar" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              Calendar
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
              Contact
            </Link>
            <Link href="/contact" className="btn-outline">
              Submit
            </Link>
            <UserMenu />
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-none text-gray-300 hover:text-primary-400 hover:bg-dark-800 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-dark-700 bg-black">
            <nav className="flex flex-col space-y-4">
              <Link href="/events" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                Events
              </Link>
              <Link href="/dungeons" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                Dungeons
              </Link>
              <Link href="/education" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                Kink Education
              </Link>
              <Link href="/calendar" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                Calendar
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium">
                Contact
              </Link>
              <Link href="/contact" className="btn-outline inline-block text-center">
                Submit
              </Link>
              <div className="pt-4 border-t border-dark-700">
                <UserMenu />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 