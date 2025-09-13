'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useGA4 } from '@/contexts/GA4Provider'

export default function useComprehensiveTracking() {
  const pathname = usePathname()
  const ga4 = useGA4()
  
  // Time tracking
  const [pageStartTime] = useState(Date.now())
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now())
  const [scrollStartTime, setScrollStartTime] = useState(Date.now())
  
  // Scroll tracking
  const [maxScrollDepth, setMaxScrollDepth] = useState(0)
  const [sectionsViewed, setSectionsViewed] = useState<Set<string>>(new Set())
  const [contentSkipped, setContentSkipped] = useState<Set<string>>(new Set())
  
  // Mouse tracking removed - not necessary for core analytics
  
  // Form tracking
  const [formInteractions, setFormInteractions] = useState<Map<string, any>>(new Map())
  
  // Session tracking
  const [visitCount, setVisitCount] = useState(1)
  const [pagesVisited, setPagesVisited] = useState<Set<string>>(new Set())
  
  // Device info
  const deviceInfo = useRef<any>(null)

  // Initialize device tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      const screen = window.screen
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      }

      // Detect device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isTablet = /iPad|Android/i.test(userAgent) && !isMobile
      const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

      // Detect browser
      let browserType = 'unknown'
      if (userAgent.includes('Chrome')) browserType = 'Chrome'
      else if (userAgent.includes('Firefox')) browserType = 'Firefox'
      else if (userAgent.includes('Safari')) browserType = 'Safari'
      else if (userAgent.includes('Edge')) browserType = 'Edge'

      // Detect OS
      let operatingSystem = 'unknown'
      if (userAgent.includes('Windows')) operatingSystem = 'Windows'
      else if (userAgent.includes('Mac')) operatingSystem = 'macOS'
      else if (userAgent.includes('Linux')) operatingSystem = 'Linux'
      else if (userAgent.includes('Android')) operatingSystem = 'Android'
      else if (userAgent.includes('iOS')) operatingSystem = 'iOS'

      deviceInfo.current = {
        device_type: deviceType,
        screen_resolution: `${screen.width}x${screen.height}`,
        browser_type: browserType,
        browser_version: userAgent.split(browserType)[1]?.split(' ')[0] || 'unknown',
        operating_system: operatingSystem,
        viewport_size: `${viewport.width}x${viewport.height}`
      }

      // Track device info
      ga4.trackDeviceInfo(deviceInfo.current)
    }
  }, [ga4])

  // Track traffic source
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const referrer = document.referrer
      
      let trafficSource = 'direct'
      let sourceMedium = undefined
      let referringDomain = undefined
      
      // Check UTM parameters
      if (urlParams.get('utm_source')) {
        trafficSource = urlParams.get('utm_source') || 'unknown'
        sourceMedium = urlParams.get('utm_medium') || undefined
      }
      // Check referrer
      else if (referrer) {
        const domain = new URL(referrer).hostname
        referringDomain = domain
        
        if (domain.includes('google')) {
          trafficSource = 'organic'
        } else if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('instagram')) {
          trafficSource = 'social'
        } else {
          trafficSource = 'referral'
        }
      }

      const utmParams: Record<string, string> = {}
      urlParams.forEach((value, key) => {
        if (key.startsWith('utm_')) {
          utmParams[key] = value
        }
      })

      ga4.trackTrafficSource({
        traffic_source: trafficSource as any,
        source_medium: sourceMedium,
        source_campaign: urlParams.get('utm_campaign') || undefined,
        referring_domain: referringDomain,
        utm_parameters: Object.keys(utmParams).length > 0 ? utmParams : undefined
      })
    }
  }, [ga4])

  // Track visit patterns
  useEffect(() => {
    const storedPages = localStorage.getItem('pagesVisited')
    const storedVisitCount = localStorage.getItem('visitCount')
    
    if (storedPages) {
      const pages = JSON.parse(storedPages)
      setPagesVisited(new Set(pages))
    }
    
    if (storedVisitCount) {
      const count = parseInt(storedVisitCount) + 1
      setVisitCount(count)
      localStorage.setItem('visitCount', count.toString())
    } else {
      localStorage.setItem('visitCount', '1')
    }

    // Add current page
    const newPages = new Set(Array.from(pagesVisited).concat(pathname))
    setPagesVisited(newPages)
    localStorage.setItem('pagesVisited', JSON.stringify(Array.from(newPages)))

    // Determine loyalty tier
    let loyaltyTier: 'new' | 'returning' | 'frequent' | 'loyal' = 'new'
    if (visitCount > 10) loyaltyTier = 'loyal'
    else if (visitCount > 5) loyaltyTier = 'frequent'
    else if (visitCount > 1) loyaltyTier = 'returning'

    ga4.trackReturnVisit({
      page_path: pathname,
      visit_number: visitCount,
      days_since_last_visit: 0, // Could be enhanced with date tracking
      loyalty_tier: loyaltyTier
    })
  }, [pathname, ga4, visitCount, pagesVisited])

  // Scroll depth tracking
  const trackScroll = useCallback(() => {
    if (typeof window === 'undefined') return

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100)

    if (scrollPercent > maxScrollDepth) {
      setMaxScrollDepth(scrollPercent)
      
      // Track sections viewed (simplified - could be enhanced with actual section detection)
      const sections = ['header', 'hero', 'content', 'footer']
      const viewedSections = sections.slice(0, Math.ceil(scrollPercent / 25))
      setSectionsViewed(new Set(viewedSections))

      // Track content consumption patterns
      ga4.trackScrollDepth({
        page_path: pathname,
        scroll_depth_percentage: scrollPercent,
        sections_viewed: Array.from(sectionsViewed),
        content_skipped: Array.from(contentSkipped),
        time_to_scroll: Date.now() - scrollStartTime
      })
    }
  }, [maxScrollDepth, pathname, ga4, sectionsViewed, contentSkipped, scrollStartTime])

  // Mouse tracking removed - keeping only essential click tracking for engagement
  const trackClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    
    // Only track meaningful interactions, not navigation
    if (target.tagName === 'A' || target.closest('a')) {
      // Let links work normally, don't track them here
      return
    }
    
    // Only track clicks on buttons, forms, or interactive elements
    if (target.tagName === 'BUTTON' || target.closest('button') || 
        target.closest('form') || target.closest('[role="button"]')) {
      
      const elementType = target.tagName.toLowerCase()
      const elementContent = target.textContent?.slice(0, 50) || ''
      
      setLastInteractionTime(Date.now())

      ga4.trackButtonInteraction({
        page_path: pathname,
        interaction_type: 'button_click',
        element_type: elementType,
        element_content: elementContent,
        click_position: { x: e.clientX, y: e.clientY }
      })
    }
  }, [pathname, ga4])

  // Form interaction tracking
  const trackFormField = useCallback((formId: string, fieldName: string, interactionType: 'focus' | 'blur' | 'input' | 'submit' | 'abandon') => {
    const now = Date.now()
    const fieldKey = `${formId}-${fieldName}`
    
    setFormInteractions(prev => {
      const updated = new Map(prev)
      const existing = updated.get(fieldKey)
      
      if (existing && interactionType === 'blur') {
        const timeSpent = now - existing.focusTime
        
        ga4.trackFormInteraction({
          form_id: formId,
          field_name: fieldName,
          interaction_type: interactionType,
          time_spent_field: Math.round(timeSpent / 1000),
          field_completion_rate: existing.inputCount > 0 ? 100 : 0
        })
      } else if (interactionType === 'focus') {
        updated.set(fieldKey, { focusTime: now, inputCount: 0 })
      } else if (interactionType === 'input') {
        const existing = updated.get(fieldKey)
        if (existing) {
          updated.set(fieldKey, { ...existing, inputCount: existing.inputCount + 1 })
        }
      }
      
      return updated
    })
  }, [ga4])

  // Content affinity tracking
  const trackContentAffinity = useCallback((contentType: 'event' | 'dungeon' | 'article', category: string, location: string) => {
    // Calculate affinity score based on user behavior
    const affinityScore = Math.min(100, (visitCount * 10) + (pagesVisited.size * 5))
    let preferenceStrength: 'weak' | 'moderate' | 'strong' = 'weak'
    
    if (affinityScore > 70) preferenceStrength = 'strong'
    else if (affinityScore > 40) preferenceStrength = 'moderate'

    ga4.trackContentAffinity({
      content_type: contentType,
      content_category: category,
      content_location: location,
      affinity_score: affinityScore,
      preference_strength: preferenceStrength,
      topic_cluster: `${category}-${location}`
    })
  }, [ga4, visitCount, pagesVisited.size])

  // Engagement velocity tracking
  const trackEngagementVelocity = useCallback(() => {
    const now = Date.now()
    const timeBetweenClicks = now - lastInteractionTime
    const pagesPerSession = pagesVisited.size
    
    let navigationSpeed: 'slow' | 'medium' | 'fast' = 'medium'
    if (timeBetweenClicks < 2000) navigationSpeed = 'fast'
    else if (timeBetweenClicks > 10000) navigationSpeed = 'slow'

    const velocityScore = Math.max(0, 100 - (timeBetweenClicks / 100))

    ga4.trackEngagementVelocity({
      page_path: pathname,
      navigation_speed: navigationSpeed,
      time_between_clicks: Math.round(timeBetweenClicks / 1000),
      pages_per_session: pagesPerSession,
      velocity_score: Math.round(velocityScore)
    })
  }, [pathname, ga4, lastInteractionTime, pagesVisited.size])

  // Error tracking
  const trackError = useCallback((errorType: '404' | 'broken_link' | 'form_error' | 'api_error' | 'javascript_error', errorUrl?: string, errorMessage?: string) => {
    ga4.trackError({
      error_type: errorType,
      error_url: errorUrl,
      user_action: 'page_load',
      page_context: pathname,
      error_message: errorMessage
    })
  }, [pathname, ga4])

  // Time on page tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - pageStartTime) / 1000)
      const contentLength = document.body.textContent?.length || 0
      const readingSpeedWpm = contentLength > 0 ? Math.round((contentLength / 5) / (timeSpent / 60)) : 0
      
      let engagementLevel: 'low' | 'medium' | 'high' = 'low'
      if (timeSpent > 120) engagementLevel = 'high'
      else if (timeSpent > 30) engagementLevel = 'medium'

      ga4.trackTimeOnPage({
        page_path: pathname,
        time_spent_seconds: timeSpent,
        content_length: contentLength,
        reading_speed_wpm: readingSpeedWpm,
        engagement_level: engagementLevel
      })

      // Track engagement velocity
      trackEngagementVelocity()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [pathname, ga4, pageStartTime, trackEngagementVelocity])

  // Set up event listeners - only essential tracking
  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('scroll', trackScroll, { passive: true })
    window.addEventListener('click', trackClick, { passive: true })

    return () => {
      window.removeEventListener('scroll', trackScroll)
      window.removeEventListener('click', trackClick)
    }
  }, [trackScroll, trackClick])

  return {
    trackFormField,
    trackContentAffinity,
    trackError,
    deviceInfo: deviceInfo.current
  }
}
