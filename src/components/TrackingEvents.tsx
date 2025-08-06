'use client'

import { useGoogleAnalytics } from './GoogleAnalytics'

// Component for tracking event clicks
export function TrackEventClick({ eventName, eventSlug }: { eventName: string; eventSlug: string }) {
  const { trackEvent } = useGoogleAnalytics()

  const handleClick = () => {
    trackEvent('click', 'event', eventName, 1)
  }

  return (
    <div onClick={handleClick}>
      {/* This will be used as a wrapper around event links */}
    </div>
  )
}

// Component for tracking dungeon clicks
export function TrackDungeonClick({ dungeonName, dungeonSlug }: { dungeonName: string; dungeonSlug: string }) {
  const { trackEvent } = useGoogleAnalytics()

  const handleClick = () => {
    trackEvent('click', 'dungeon', dungeonName, 1)
  }

  return (
    <div onClick={handleClick}>
      {/* This will be used as a wrapper around dungeon links */}
    </div>
  )
}

// Component for tracking Discord clicks
export function TrackDiscordClick() {
  const { trackEvent } = useGoogleAnalytics()

  const handleClick = () => {
    trackEvent('click', 'social', 'discord', 1)
  }

  return (
    <div onClick={handleClick}>
      {/* This will be used as a wrapper around Discord links */}
    </div>
  )
}

// Component for tracking contact form submissions
export function TrackContactSubmission({ formType }: { formType: string }) {
  const { trackEvent } = useGoogleAnalytics()

  const handleSubmit = () => {
    trackEvent('submit', 'contact_form', formType, 1)
  }

  return (
    <div onClick={handleSubmit}>
      {/* This will be used as a wrapper around contact forms */}
    </div>
  )
}

// Hook for tracking page views
export function usePageTracking() {
  const { trackPageView } = useGoogleAnalytics()

  const trackPage = (path: string) => {
    trackPageView(path)
  }

  return { trackPage }
}
