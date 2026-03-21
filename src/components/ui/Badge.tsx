import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning'

const toneClass: Record<BadgeTone, string> = {
  neutral: 'border-white/10 bg-white/10 text-gray-200',
  primary: 'border-primary-500/30 bg-primary-500/15 text-primary-200',
  success: 'border-green-500/30 bg-green-500/15 text-green-200',
  warning: 'border-amber-400/35 bg-amber-500/10 text-amber-100',
}

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClass[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
