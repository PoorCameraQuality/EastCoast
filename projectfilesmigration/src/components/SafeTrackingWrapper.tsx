'use client'

import useSafeTracking from '@/hooks/useSafeTracking'

interface SafeTrackingWrapperProps {
  children: React.ReactNode
}

export default function SafeTrackingWrapper({ children }: SafeTrackingWrapperProps) {
  // Initialize only lightweight, safe tracking
  useSafeTracking()

  return <>{children}</>
}
