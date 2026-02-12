'use client'

import { useEffect } from 'react'
import useComprehensiveTracking from '@/hooks/useComprehensiveTracking'

export default function ErrorTracker() {
  const { trackError } = useComprehensiveTracking()

  useEffect(() => {
    // Track JavaScript errors
    const handleError = (event: ErrorEvent) => {
      trackError('javascript_error', undefined, event.message)
    }

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError('javascript_error', undefined, event.reason?.toString() || 'Unhandled promise rejection')
    }

    // Track form errors (only on form submission failures)
    const handleFormError = (event: Event) => {
      const target = event.target as HTMLFormElement
      if (target.tagName === 'FORM') {
        trackError('form_error', undefined, 'Form submission failed')
      }
    }

    // Add event listeners - removed global click listener that was interfering with navigation
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('submit', handleFormError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('submit', handleFormError)
    }
  }, [trackError])

  return null // This component doesn't render anything
}
