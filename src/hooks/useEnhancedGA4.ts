'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void
  }
}

interface GA4Event {
  event_name: string
  parameters: Record<string, any>
}

export default function useEnhancedGA4() {
  const pathname = usePathname()

  // Track page views with enhanced parameters
  const trackPageView = (page_path?: string, page_title?: string, additionalParams?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: page_path || pathname,
        page_title: page_title || document.title,
        page_location: window.location.href,
        timestamp: Date.now(),
        ...additionalParams
      })
    }
  }

  // Track internal link clicks
  const trackInternalLinkClick = (linkData: {
    from_page: string
    to_page: string
    link_text: string
    link_type: 'event' | 'dungeon' | 'article' | 'navigation' | 'search' | 'related'
    link_position?: 'header' | 'footer' | 'sidebar' | 'content' | 'search_results'
    content_category?: string
    content_location?: string
    content_date?: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'internal_link_click', {
        from_page: linkData.from_page,
        to_page: linkData.to_page,
        link_text: linkData.link_text,
        link_type: linkData.link_type,
        link_position: linkData.link_position || 'unknown',
        content_category: linkData.content_category,
        content_location: linkData.content_location,
        content_date: linkData.content_date,
        timestamp: Date.now()
      })
    }
  }

  // Track search interactions
  const trackSearch = (searchData: {
    search_term: string
    results_count: number
    search_type: 'site_search' | 'smart_suggestions'
    clicked_result?: boolean
    result_position?: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: searchData.search_term,
        results_count: searchData.results_count,
        search_type: searchData.search_type,
        clicked_result: searchData.clicked_result || false,
        result_position: searchData.result_position,
        timestamp: Date.now()
      })
    }
  }

  // Track content engagement
  const trackContentEngagement = (engagementData: {
    content_type: 'event' | 'dungeon' | 'article'
    content_id: string
    content_title: string
    content_category: string
    engagement_type: 'view' | 'time_spent' | 'scroll_depth' | 'share' | 'bookmark'
    engagement_value?: number
    time_spent?: number
    scroll_depth?: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'content_engagement', {
        content_type: engagementData.content_type,
        content_id: engagementData.content_id,
        content_title: engagementData.content_title,
        content_category: engagementData.content_category,
        engagement_type: engagementData.engagement_type,
        engagement_value: engagementData.engagement_value,
        time_spent: engagementData.time_spent,
        scroll_depth: engagementData.scroll_depth,
        timestamp: Date.now()
      })
    }
  }

  // Track user interactions
  const trackUserInteraction = (interactionData: {
    interaction_type: 'click' | 'hover' | 'focus' | 'submit' | 'download'
    element_type: 'button' | 'link' | 'form' | 'image' | 'video'
    element_id?: string
    element_class?: string
    element_text?: string
    interaction_value?: string | number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_interaction', {
        interaction_type: interactionData.interaction_type,
        element_type: interactionData.element_type,
        element_id: interactionData.element_id,
        element_class: interactionData.element_class,
        element_text: interactionData.element_text,
        interaction_value: interactionData.interaction_value,
        timestamp: Date.now()
      })
    }
  }

  // Track navigation patterns
  const trackNavigation = (navData: {
    navigation_type: 'main_nav' | 'breadcrumb' | 'pagination' | 'back_button' | 'forward_button'
    from_page: string
    to_page: string
    navigation_method: 'click' | 'keyboard' | 'touch'
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'navigation', {
        navigation_type: navData.navigation_type,
        from_page: navData.from_page,
        to_page: navData.to_page,
        navigation_method: navData.navigation_method,
        timestamp: Date.now()
      })
    }
  }

  // Track session events
  const trackSessionEvent = (sessionData: {
    session_event: 'session_start' | 'session_end' | 'page_focus' | 'page_blur' | 'idle_timeout'
    session_duration?: number
    page_views?: number
    interactions_count?: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'session_event', {
        session_event: sessionData.session_event,
        session_duration: sessionData.session_duration,
        page_views: sessionData.page_views,
        interactions_count: sessionData.interactions_count,
        timestamp: Date.now()
      })
    }
  }

  // Track custom events
  const trackCustomEvent = (eventName: string, parameters: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        timestamp: Date.now()
      })
    }
  }

  // Auto-track page views on route changes
  useEffect(() => {
    trackPageView()
  }, [pathname])

  return {
    trackPageView,
    trackInternalLinkClick,
    trackSearch,
    trackContentEngagement,
    trackUserInteraction,
    trackNavigation,
    trackSessionEvent,
    trackCustomEvent
  }
}
