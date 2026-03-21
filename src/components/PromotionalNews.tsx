'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabaseClient'
import type { PromotionalNews } from '@/types/promotional'

// Map event slugs to logo filenames
const EVENT_LOGOS: Record<string, string> = {
  'primal-arts': '/images/primalarts.png',
  'dark-odyssey': '/images/darkodyssey.png',
  'frolicon': '/images/frolicon.png',
  'camp-crucible': '/images/campcrucible.png',
  'beyond-leather': '/images/beyond-leather-logo.png',
  'charmed': '/images/charmed.png',
  'coastal-carolina': '/images/CoastalCarolina.PNG',
  'dungeons-geekdoms': '/images/dungeonsgeekdoms.png',
  'fet-camp': '/images/fetcamp.png',
  'fornucopia': '/images/fornucopia.png',
  'kinky-kollege': '/images/kinkykollege.png',
  'naughty-gras': '/images/naughtygras.png',
  'naughty-nawlins': '/images/naughtynawlins.png',
  'naughty-noel': '/images/naughtynoel.jpg',
  'ohio-smart': '/images/ohiosmart.png',
  'tesfest': '/images/tesfest.png',
  'tethered-together': '/images/tethered.png',
  'twisted-tryst': '/images/twistedtyrst.png',
}

export default function PromotionalNews() {
  const [items, setItems] = useState<PromotionalNews[]>([])
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load dismissed items from sessionStorage (resets on new browser session)
    const dismissed = sessionStorage.getItem('dismissed-promos')
    if (dismissed) {
      setDismissedIds(new Set(JSON.parse(dismissed)))
    }

    // Fetch promotional items
    fetchPromotionalNews()
  }, [])

  const fetchPromotionalNews = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // If Supabase client is not available (e.g., during build), skip gracefully
      if (!supabase) {
        setLoading(false)
        return
      }
      
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('promotional_news')
        .select('*')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error

      setItems(data || [])
    } catch (error) {
      console.error('Error fetching promotional news:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissItem = (id: string) => {
    const newDismissed = new Set(dismissedIds)
    newDismissed.add(id)
    setDismissedIds(newDismissed)
    // Use sessionStorage so dismissals reset on new browser session (new visit)
    sessionStorage.setItem('dismissed-promos', JSON.stringify(Array.from(newDismissed)))
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const visibleItems = items.filter(item => !dismissedIds.has(item.id))

  if (loading || visibleItems.length === 0) {
    return null
  }

  return (
    <>
      {/* Desktop: Fixed sidebar on right */}
      <div className="hidden lg:block fixed right-6 top-24 z-40 w-80 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4" style={{ minHeight: '200px' }}>
        {visibleItems.map((item, index) => (
          <PromotionalCard
            key={item.id}
            item={item}
            index={index}
            onDismiss={() => dismissItem(item.id)}
            isExpanded={expandedIds.has(item.id)}
            onToggleExpand={() => toggleExpand(item.id)}
          />
        ))}
      </div>

      {/* Mobile: compact strip below header — lower z than modals/drawers; scrollable so chrome stays short */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-lg">
        <div className="container-custom py-2 space-y-2 max-h-[min(40vh,14rem)] overflow-y-auto overscroll-contain">
          {visibleItems.map((item, index) => (
            <PromotionalCard
              key={item.id}
              item={item}
              index={index}
              onDismiss={() => dismissItem(item.id)}
              isExpanded={expandedIds.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              isMobile
            />
          ))}
        </div>
      </div>
    </>
  )
}

interface PromotionalCardProps {
  item: PromotionalNews
  index: number
  onDismiss: () => void
  isExpanded: boolean
  onToggleExpand: () => void
  isMobile?: boolean
}

function PromotionalCard({ 
  item, 
  index, 
  onDismiss, 
  isExpanded, 
  onToggleExpand,
  isMobile = false 
}: PromotionalCardProps) {
  // Gradient colors that match the Hero section
  const gradients = [
    'from-primary-600/90 to-blue-600/90',
    'from-blue-600/90 to-primary-600/90',
    'from-primary-500/90 to-blue-500/90',
  ]
  
  const gradient = gradients[index % gradients.length]

  // Icons for different priority levels
  const getIcon = (priority: number) => {
    if (priority >= 8) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      )
    } else if (priority >= 5) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    )
  }

  // Truncate description if not expanded
  const shouldTruncate = item.description.length > 200
  const displayDescription = isExpanded || !shouldTruncate 
    ? item.description 
    : item.description.substring(0, 200) + '...'

  return (
    <div 
      className={`relative backdrop-blur-xl bg-gradient-to-br ${gradient} rounded-2xl p-4 border border-white/30 shadow-2xl animate-slide-in-right`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors min-h-touch min-w-touch inline-flex items-center justify-center hover:bg-white/10 rounded-full"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-3 pr-6">
        <div className="text-white/90 flex-shrink-0 mt-1" aria-hidden>
          {getIcon(item.priority)}
        </div>
        <h3 className="text-lg font-bold text-white leading-tight">
          {item.title}
        </h3>
      </div>

      {/* Image if available - auto-detect event logo or use custom image */}
      {(() => {
        const imageUrl = item.event_slug && EVENT_LOGOS[item.event_slug] 
          ? EVENT_LOGOS[item.event_slug] 
          : item.image_url
        
        if (!imageUrl) return null
        
        return (
          <div className="mb-3 rounded-lg overflow-hidden relative h-20 bg-white/10 flex items-center justify-center p-2">
            <Image 
              src={imageUrl} 
              alt={item.title}
              fill
              className="object-contain"
              sizes="320px"
            />
          </div>
        )
      })()}

      {/* Description */}
      <div className="text-sm text-white/90 leading-relaxed mb-3 whitespace-pre-wrap">
        {displayDescription}
      </div>

      {/* Read more/less toggle */}
      {shouldTruncate && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-xs text-white/80 hover:text-white underline mb-3 font-medium min-h-touch py-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* CTA button */}
      {item.link_url && (
        <a
          href={item.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center min-h-touch px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full transition-colors duration-300 border border-white/30 text-sm w-full"
        >
          {item.link_text || 'Learn More'}
          <svg className="w-4 h-4 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
    </div>
  )
}

