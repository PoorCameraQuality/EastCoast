'use client'

import Link from 'next/link'
import { useGoogleAnalytics } from '@/components/GoogleAnalytics'

export default function Hero() {
  const { trackEvent } = useGoogleAnalytics()
  return (
    <section className="bg-gradient-dark border-b border-dark-700" role="banner" aria-label="Hero section">
      <div className="container-custom section-padding">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
            Discover Kink Events
            <br />
            <span className="text-primary-400">Across the East Coast</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-subtle max-w-3xl mx-auto leading-relaxed">
            Connect with your community. Find events near you. Build meaningful relationships in a safe, inclusive environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/events" className="btn-primary min-w-[200px]">
              Browse Events
            </Link>
            <Link href="/contact" className="btn-outline min-w-[200px]">
              Submit Your Event/Dungeon
            </Link>
            <Link 
              href="https://discord.gg/xcnGGyGsmT" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary min-w-[200px] discord-glow"
              onClick={() => trackEvent('click', 'social', 'discord', 1)}
            >
              Join Discord Community
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
} 
