import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type CardVariant = 'glass' | 'solid'

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
}

export function Card({
  variant = 'glass',
  as: Tag = 'div',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        variant === 'glass' &&
          'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6',
        variant === 'solid' && 'card-elegant',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
