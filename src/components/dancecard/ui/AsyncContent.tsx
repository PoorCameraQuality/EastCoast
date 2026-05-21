'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  /** When true, shows loading UI instead of children. */
  loading?: boolean
  /** When set (and not loading), shows empty UI instead of children. */
  empty?: boolean
  loadingFallback?: ReactNode
  emptyFallback?: ReactNode
  children: ReactNode
  className?: string
  /** Fade in when content becomes ready. */
  animateIn?: boolean
}

export function AsyncContent({
  loading = false,
  empty = false,
  loadingFallback,
  emptyFallback,
  children,
  className,
  animateIn = true,
}: Props) {
  if (loading) {
    return <div className={className}>{loadingFallback ?? null}</div>
  }
  if (empty) {
    return <div className={className}>{emptyFallback ?? null}</div>
  }
  return (
    <div className={cn(className, animateIn && 'dc-tab-content-enter')}>
      {children}
    </div>
  )
}
