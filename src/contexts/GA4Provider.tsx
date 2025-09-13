'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import useEnhancedGA4 from '@/hooks/useEnhancedGA4'

interface GA4ContextType {
  trackPageView: (page_path?: string, page_title?: string, additionalParams?: Record<string, any>) => void
  trackInternalLinkClick: (linkData: any) => void
  trackSearch: (searchData: any) => void
  trackContentEngagement: (engagementData: any) => void
  trackUserInteraction: (interactionData: any) => void
  trackNavigation: (navData: any) => void
  trackSessionEvent: (sessionData: any) => void
  trackTimeOnPage: (timeData: any) => void
  trackScrollDepth: (scrollData: any) => void
  trackMouseMovement: (mouseData: any) => void
  trackFormInteraction: (formData: any) => void
  trackReturnVisit: (visitData: any) => void
  trackContentAffinity: (affinityData: any) => void
  trackEngagementVelocity: (velocityData: any) => void
  trackError: (errorData: any) => void
  trackDeviceInfo: (deviceData: any) => void
  trackTrafficSource: (sourceData: any) => void
  trackCustomEvent: (eventName: string, parameters: Record<string, any>) => void
}

const GA4Context = createContext<GA4ContextType | null>(null)

export function GA4Provider({ children }: { children: React.ReactNode }) {
  const ga4 = useEnhancedGA4()
  const pathname = usePathname()
  const [sessionStart, setSessionStart] = useState<number>(Date.now())
  const [pageViews, setPageViews] = useState<number>(0)
  const [interactions, setInteractions] = useState<number>(0)

  // Track session start
  useEffect(() => {
    ga4.trackSessionEvent({
      session_event: 'session_start',
      session_duration: 0,
      page_views: 0,
      interactions_count: 0
    })
  }, [])

  // Track page focus/blur for engagement
  useEffect(() => {
    const handleFocus = () => {
      ga4.trackSessionEvent({
        session_event: 'page_focus'
      })
    }

    const handleBlur = () => {
      ga4.trackSessionEvent({
        session_event: 'page_blur'
      })
    }

    const handleBeforeUnload = () => {
      const sessionDuration = Date.now() - sessionStart
      ga4.trackSessionEvent({
        session_event: 'session_end',
        session_duration: Math.floor(sessionDuration / 1000),
        page_views: pageViews,
        interactions_count: interactions
      })
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessionStart, pageViews, interactions, ga4])

  // Track page views
  useEffect(() => {
    setPageViews(prev => prev + 1)
  }, [pathname])

  // Enhanced tracking functions that also update counters
  const enhancedTrackPageView = (page_path?: string, page_title?: string, additionalParams?: Record<string, any>) => {
    ga4.trackPageView(page_path, page_title, additionalParams)
  }

  const enhancedTrackUserInteraction = (interactionData: any) => {
    setInteractions(prev => prev + 1)
    ga4.trackUserInteraction(interactionData)
  }

  const enhancedTrackInternalLinkClick = (linkData: any) => {
    setInteractions(prev => prev + 1)
    ga4.trackInternalLinkClick(linkData)
  }

  const enhancedTrackSearch = (searchData: any) => {
    setInteractions(prev => prev + 1)
    ga4.trackSearch(searchData)
  }

  const enhancedTrackContentEngagement = (engagementData: any) => {
    ga4.trackContentEngagement(engagementData)
  }

  const enhancedTrackNavigation = (navData: any) => {
    setInteractions(prev => prev + 1)
    ga4.trackNavigation(navData)
  }

  const enhancedTrackSessionEvent = (sessionData: any) => {
    ga4.trackSessionEvent(sessionData)
  }

  const enhancedTrackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
    setInteractions(prev => prev + 1)
    ga4.trackCustomEvent(eventName, parameters)
  }

  const value: GA4ContextType = {
    trackPageView: enhancedTrackPageView,
    trackInternalLinkClick: enhancedTrackInternalLinkClick,
    trackSearch: enhancedTrackSearch,
    trackContentEngagement: enhancedTrackContentEngagement,
    trackUserInteraction: enhancedTrackUserInteraction,
    trackNavigation: enhancedTrackNavigation,
    trackSessionEvent: enhancedTrackSessionEvent,
    trackTimeOnPage: ga4.trackTimeOnPage,
    trackScrollDepth: ga4.trackScrollDepth,
    trackMouseMovement: ga4.trackMouseMovement,
    trackFormInteraction: ga4.trackFormInteraction,
    trackReturnVisit: ga4.trackReturnVisit,
    trackContentAffinity: ga4.trackContentAffinity,
    trackEngagementVelocity: ga4.trackEngagementVelocity,
    trackError: ga4.trackError,
    trackDeviceInfo: ga4.trackDeviceInfo,
    trackTrafficSource: ga4.trackTrafficSource,
    trackCustomEvent: enhancedTrackCustomEvent
  }

  return (
    <GA4Context.Provider value={value}>
      {children}
    </GA4Context.Provider>
  )
}

export function useGA4() {
  const context = useContext(GA4Context)
  if (!context) {
    throw new Error('useGA4 must be used within a GA4Provider')
  }
  return context
}
