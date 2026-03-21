import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const inputPrimitiveClass =
  'w-full min-h-touch rounded-lg border border-dark-600 bg-dark-700 px-4 py-3 text-white placeholder:text-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', ...props },
  ref
) {
  return <input ref={ref} type={type} className={cn(inputPrimitiveClass, className)} {...props} />
})
