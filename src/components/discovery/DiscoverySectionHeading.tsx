import type { ReactNode } from 'react'

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  accent?: string
  subtitle?: ReactNode
  align?: 'left' | 'center'
  tone?: 'primary' | 'muted'
  className?: string
}

export default function DiscoverySectionHeading({
  id,
  eyebrow,
  title,
  accent,
  subtitle,
  align = 'left',
  tone = 'primary',
  className = '',
}: Props) {
  const alignClass = align === 'center' ? 'text-center' : 'text-center md:text-left'
  const gradientClass =
    tone === 'muted'
      ? 'bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400'
      : 'bg-gradient-to-r from-primary-300 via-primary-400 to-cyan-400'

  return (
    <div className={`mb-5 md:mb-6 ${alignClass} ${className}`}>
      {eyebrow ? (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-400/80">{eyebrow}</p>
      ) : null}
      <h2 id={id} className="font-serif text-2xl font-bold text-white sm:text-3xl md:text-4xl">
        {accent ? (
          <>
            {title ? <span className="text-white">{title} </span> : null}
            <span className={`bg-clip-text text-transparent ${gradientClass}`}>{accent}</span>
          </>
        ) : title ? (
          <span className={`bg-clip-text text-transparent ${gradientClass}`}>{title}</span>
        ) : null}
      </h2>
      {subtitle ? <div className="mx-auto mt-2 max-w-2xl text-gray-400 md:mx-0">{subtitle}</div> : null}
    </div>
  )
}
