import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type FieldProps = {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  children: ReactNode
  className?: string
  labelClassName?: string
}

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
  labelClassName,
}: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className={cn('block text-sm font-medium text-white', labelClassName)}>
        {label}
        {required ? <span className="text-primary-300"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-gray-400">{hint}</p> : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string
}

/** Use when the field is a single control with a visible label (mirrors GOV.UK-style label + control pairing). */
export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-white', className)} {...props}>
      {children}
    </label>
  )
}
