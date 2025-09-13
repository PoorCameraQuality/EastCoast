'use client'

import { useEffect } from 'react'
import useComprehensiveTracking from '@/hooks/useComprehensiveTracking'

interface ContentAffinityTrackerProps {
  contentType: 'event' | 'dungeon' | 'article'
  category: string
  location?: string
  contentId?: string
  children: React.ReactNode
}

export default function ContentAffinityTracker({ 
  contentType, 
  category, 
  location = 'unknown', 
  contentId,
  children 
}: ContentAffinityTrackerProps) {
  const { trackContentAffinity } = useComprehensiveTracking()

  useEffect(() => {
    // Track content affinity when component mounts
    trackContentAffinity(contentType, category, location)
  }, [contentType, category, location, trackContentAffinity])

  return <>{children}</>
}
