import type { HTMLAttributes } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  hours: string[]
}

export function TimeRail({ hours, className = '', ...rest }: Props) {
  return (
    <div
      className={`sticky left-0 z-10 flex flex-col gap-0 border-r border-dc-border bg-dc-surface/95 pr-2 font-tabular text-dc-micro text-dc-muted ${className}`.trim()}
      {...rest}
    >
      {hours.map((h) => (
        <div key={h} className="flex h-12 items-start justify-end pt-1">
          {h}
        </div>
      ))}
    </div>
  )
}
