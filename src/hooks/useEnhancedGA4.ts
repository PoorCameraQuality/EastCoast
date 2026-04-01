'use client'

import { useCallback } from 'react'
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
  const trackPageView = useCallback((page_path?: string, page_title?: string, additionalParams?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: page_path || pathname,
        page_title: page_title || document.title,
        page_location: window.location.href,
        timestamp: Date.now(),
        ...additionalParams
      })
    }
  }, [pathname])

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

  // Track time on page with reading speed analysis
  const trackTimeOnPage = (timeData: {
    page_path: string
    time_spent_seconds: number
    content_length?: number
    reading_speed_wpm?: number
    engagement_level: 'low' | 'medium' | 'high'
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'time_on_page', {
        page_path: timeData.page_path,
        time_spent_seconds: timeData.time_spent_seconds,
        content_length: timeData.content_length,
        reading_speed_wpm: timeData.reading_speed_wpm,
        engagement_level: timeData.engagement_level,
        timestamp: Date.now()
      })
    }
  }

  // Track scroll depth and content consumption patterns
  const trackScrollDepth = (scrollData: {
    page_path: string
    scroll_depth_percentage: number
    sections_viewed: string[]
    content_skipped: string[]
    time_to_scroll: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'scroll_depth', {
        page_path: scrollData.page_path,
        scroll_depth_percentage: scrollData.scroll_depth_percentage,
        sections_viewed: scrollData.sections_viewed,
        content_skipped: scrollData.content_skipped,
        time_to_scroll: scrollData.time_to_scroll,
        timestamp: Date.now()
      })
    }
  }

  // Track button and form interactions (simplified from mouse tracking)
  const trackButtonInteraction = (interactionData: {
    page_path: string
    interaction_type: 'button_click' | 'form_submit' | 'form_field_focus'
    element_type: string
    element_content?: string
    click_position?: { x: number, y: number }
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'button_interaction', {
        page_path: interactionData.page_path,
        interaction_type: interactionData.interaction_type,
        element_type: interactionData.element_type,
        element_content: interactionData.element_content,
        click_position: interactionData.click_position,
        timestamp: Date.now()
      })
    }
  }

  // Track form field interactions
  const trackFormInteraction = (formData: {
    form_id: string
    field_name: string
    interaction_type: 'focus' | 'blur' | 'input' | 'submit' | 'abandon'
    time_spent_field?: number
    field_completion_rate?: number
    form_abandonment_point?: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_interaction', {
        form_id: formData.form_id,
        field_name: formData.field_name,
        interaction_type: formData.interaction_type,
        time_spent_field: formData.time_spent_field,
        field_completion_rate: formData.field_completion_rate,
        form_abandonment_point: formData.form_abandonment_point,
        timestamp: Date.now()
      })
    }
  }

  // Track return visits and user loyalty
  const trackReturnVisit = (visitData: {
    page_path: string
    visit_number: number
    days_since_last_visit: number
    returning_content_id?: string
    loyalty_tier: 'new' | 'returning' | 'frequent' | 'loyal'
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'return_visit', {
        page_path: visitData.page_path,
        visit_number: visitData.visit_number,
        days_since_last_visit: visitData.days_since_last_visit,
        returning_content_id: visitData.returning_content_id,
        loyalty_tier: visitData.loyalty_tier,
        timestamp: Date.now()
      })
    }
  }

  // Track content affinity and preferences
  const trackContentAffinity = (affinityData: {
    content_type: 'event' | 'dungeon' | 'article'
    content_category: string
    content_location: string
    affinity_score: number
    preference_strength: 'weak' | 'moderate' | 'strong'
    topic_cluster: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'content_affinity', {
        content_type: affinityData.content_type,
        content_category: affinityData.content_category,
        content_location: affinityData.content_location,
        affinity_score: affinityData.affinity_score,
        preference_strength: affinityData.preference_strength,
        topic_cluster: affinityData.topic_cluster,
        timestamp: Date.now()
      })
    }
  }

  // Track engagement velocity (how quickly users navigate)
  const trackEngagementVelocity = (velocityData: {
    page_path: string
    navigation_speed: 'slow' | 'medium' | 'fast'
    time_between_clicks: number
    pages_per_session: number
    velocity_score: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'engagement_velocity', {
        page_path: velocityData.page_path,
        navigation_speed: velocityData.navigation_speed,
        time_between_clicks: velocityData.time_between_clicks,
        pages_per_session: velocityData.pages_per_session,
        velocity_score: velocityData.velocity_score,
        timestamp: Date.now()
      })
    }
  }

  // Track errors and broken interactions
  const trackError = (errorData: {
    error_type: '404' | 'broken_link' | 'form_error' | 'api_error' | 'javascript_error'
    error_url?: string
    error_message?: string
    user_action: string
    page_context: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error_occurred', {
        error_type: errorData.error_type,
        error_url: errorData.error_url,
        error_message: errorData.error_message,
        user_action: errorData.user_action,
        page_context: errorData.page_context,
        timestamp: Date.now()
      })
    }
  }

  // Track device and browser information
  const trackDeviceInfo = (deviceData: {
    device_type: 'mobile' | 'tablet' | 'desktop'
    screen_resolution: string
    browser_type: string
    browser_version: string
    operating_system: string
    viewport_size: string
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'device_info', {
        device_type: deviceData.device_type,
        screen_resolution: deviceData.screen_resolution,
        browser_type: deviceData.browser_type,
        browser_version: deviceData.browser_version,
        operating_system: deviceData.operating_system,
        viewport_size: deviceData.viewport_size,
        timestamp: Date.now()
      })
    }
  }

  // Track traffic source attribution
  const trackTrafficSource = (sourceData: {
    traffic_source: 'direct' | 'organic' | 'social' | 'referral' | 'email' | 'paid'
    source_medium?: string
    source_campaign?: string
    referring_domain?: string
    utm_parameters?: Record<string, string>
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'traffic_source', {
        traffic_source: sourceData.traffic_source,
        source_medium: sourceData.source_medium,
        source_campaign: sourceData.source_campaign,
        referring_domain: sourceData.referring_domain,
        utm_parameters: sourceData.utm_parameters,
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

  // Page views: rely on `GoogleAnalytics.tsx` gtag('config', …, { page_path }) after consent
  // to avoid double-counting the same navigation in GA4.

  return {
    trackPageView,
    trackInternalLinkClick,
    trackSearch,
    trackContentEngagement,
    trackUserInteraction,
    trackNavigation,
    trackSessionEvent,
    trackTimeOnPage,
    trackScrollDepth,
    trackButtonInteraction,
    trackFormInteraction,
    trackReturnVisit,
    trackContentAffinity,
    trackEngagementVelocity,
    trackError,
    trackDeviceInfo,
    trackTrafficSource,
    trackCustomEvent
  }
}
