import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

type PanelVariant = 'default' | 'muted' | 'inset'

const variantClass: Record<PanelVariant, string> = {
  default: 'border-dc-border bg-dc-elevated/90',
  muted: 'border-dc-border bg-dc-elevated-muted/90',
  inset: 'border-dc-border/80 bg-dc-surface-muted/80',
}

type Props = HTMLAttributes<HTMLDivElement> & {
  variant?: PanelVariant
  children: ReactNode
}

export const Panel = forwardRef<HTMLDivElement, Props>(function Panel(
  { variant = 'default', className = '', children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl border p-4 sm:p-5 ${variantClass[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  )
})
