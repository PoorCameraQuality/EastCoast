'use client'

import useComprehensiveTracking from '@/hooks/useComprehensiveTracking'

interface ComprehensiveTrackingWrapperProps {
  children: React.ReactNode
}

export default function ComprehensiveTrackingWrapper({ children }: ComprehensiveTrackingWrapperProps) {
  // Initialize comprehensive tracking
  useComprehensiveTracking()

  return <>{children}</>
}
