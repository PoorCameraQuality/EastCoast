import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost:
    'rounded-lg bg-transparent text-gray-200 hover:bg-white/10 border-2 border-transparent hover:border-white/10 font-medium transition-all duration-300',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm min-h-[44px]',
  md: 'py-3 px-6 text-base min-h-[44px]',
  lg: 'py-3.5 px-8 text-base min-h-[48px]',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  className?: string
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(variantClass[variant], sizeClass[size], 'inline-flex items-center justify-center', className)}
      {...props}
    >
      {children}
    </button>
  )
}
