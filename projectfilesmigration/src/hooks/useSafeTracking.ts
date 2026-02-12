'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useGA4 } from '@/contexts/GA4Provider'

export default function useSafeTracking() {
  const pathname = usePathname()
  const ga4 = useGA4()
  
  // Only track essential metrics without heavy initialization
  const [pageStartTime] = useState(Date.now())
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)

  // Lightweight scroll tracking (passive only)
  const trackScroll = useCallback(() => {
    if (typeof window === 'undefined') return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100)

    if (scrollPercent > maxScrollDepth) {
      setMaxScrollDepth(scrollPercent)
      
      // Only track major scroll milestones to reduce noise
      if (scrollPercent % 25 === 0 || scrollPercent === 100) {
        ga4.trackScrollDepth({
          page_path: pathname,
          scroll_depth_percentage: scrollPercent,
          sections_viewed: ['content'], // Simplified
          content_skipped: [],
          time_to_scroll: Date.now() - pageStartTime
        })
      }
    }
  }, [maxScrollDepth, pathname, ga4, pageStartTime])

  // Lightweight time tracking (no beforeunload listener)
  const trackTimeOnPage = useCallback(() => {
    const timeSpent = Math.round((Date.now() - pageStartTime) / 1000)
    
    // Only track if user spent meaningful time
    if (timeSpent > 10) {
      let engagementLevel: 'low' | 'medium' | 'high' = 'low'
      if (timeSpent > 120) engagementLevel = 'high'
      else if (timeSpent > 30) engagementLevel = 'medium'

      ga4.trackTimeOnPage({
        page_path: pathname,
        time_spent_seconds: timeSpent,
        engagement_level: engagementLevel
      })
    }
  }, [pathname, ga4, pageStartTime])

  // Track basic device info (lightweight)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const deviceType = isMobile ? 'mobile' : 'desktop'

      ga4.trackDeviceInfo({
        device_type: deviceType,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        browser_type: userAgent.includes('Chrome') ? 'Chrome' : 'Other',
        browser_version: 'unknown',
        operating_system: 'unknown',
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      })
    }
  }, [ga4])

  // Set up only scroll tracking (most lightweight)
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Use passive listener for scroll only
    window.addEventListener('scroll', trackScroll, { passive: true })

    // Track time on page when component unmounts (safer than beforeunload)
    return () => {
      window.removeEventListener('scroll', trackScroll)
      trackTimeOnPage()
    }
  }, [trackScroll, trackTimeOnPage])

  return {
    // Return minimal interface
    trackError: ga4.trackError,
    deviceInfo: null
  }
}
