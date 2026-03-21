'use client'

import Link from 'next/link'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'
import DynamicStats from '@/components/DynamicStats'
import { CONTACT_US_LABEL } from '@/lib/submissionContact'

export default function Hero() {
  const { trackEvent } = useGoogleAnalytics()
  
  // Note: Data fetching is now handled by DynamicStats component

  return (
    <section className="relative bg-gradient-to-br from-black via-dark-900 to-black overflow-hidden" role="banner" aria-label="Hero section">
      {/* Subtle background elements with blue spectrum */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-40 h-40 bg-gradient-to-r from-primary-300 to-blue-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-gradient-to-r from-blue-400 to-primary-500 rounded-full blur-xl animate-pulse delay-1500"></div>
      </div>

      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
      
      {/* Additional glassy elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-primary-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container-custom">
        <div className="max-w-6xl mx-auto text-center px-4 pt-16 pb-14 md:pt-24 md:pb-20">
          {/* Main title with animated text */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight">
              <span className="inline-block animate-fade-in-up">
                Discover Kink Events
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-primary-300 via-blue-400 to-primary-500 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_200%]">
                Across the East Coast
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            Connect with your community. Find events, dungeons, educational resources, and vendors—built for privacy, discretion, and inclusion.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link 
              href="/events" 
              className="group relative inline-flex items-center justify-center min-h-touch px-6 md:px-8 py-3 md:py-4 backdrop-blur-xl bg-gradient-to-r from-primary-600/80 to-blue-600/80 text-white font-semibold rounded-full shadow-2xl hover:shadow-primary-500/25 transition-all duration-300 md:hover:scale-105 motion-reduce:hover:scale-100 min-w-[180px] md:min-w-[200px] overflow-hidden border border-white/20 hover:border-white/40"
            >
              <span className="relative z-10 flex items-center gap-2">
                Browse Events
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700/80 to-blue-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link 
              href="https://discord.gg/xcnGGyGsmT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center min-h-touch px-6 md:px-8 py-3 md:py-4 backdrop-blur-xl bg-gradient-to-r from-blue-600/80 to-primary-600/80 text-white font-semibold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 md:hover:scale-105 motion-reduce:hover:scale-100 min-w-[180px] md:min-w-[200px] overflow-hidden border border-white/20 hover:border-white/40"
              onClick={() => trackEvent('click', 'social', 'discord', 1)}
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join Discord
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/80 to-blue-700/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          <div className="animate-fade-in-up mb-8" style={{ animationDelay: '0.55s' }}>
            <Link
              href="/contact"
              className="inline-flex min-h-touch items-center justify-center text-gray-300 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
              aria-label="Contact us"
            >
              {CONTACT_US_LABEL}
            </Link>
          </div>

          {/* Dynamic Stats - Enhanced with recent content */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <DynamicStats />
          </div>
        </div>
      </div>
    </section>
  )
} 
