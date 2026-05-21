import type { ReactNode } from 'react'

type Accent = 'primary' | 'violet' | 'teal'

const accentOrbs: Record<Accent, { primary: string; secondary: string }> = {
  primary: {
    primary: 'bg-primary-600/25',
    secondary: 'bg-cyan-600/20',
  },
  violet: {
    primary: 'bg-violet-600/25',
    secondary: 'bg-primary-600/20',
  },
  teal: {
    primary: 'bg-primary-500/25',
    secondary: 'bg-teal-600/20',
  },
}

type Props = {
  children: ReactNode
  accent?: Accent
}

export default function DiscoveryPageShell({ children, accent = 'primary' }: Props) {
  const orbs = accentOrbs[accent]

  return (
    <div className="discovery-page relative min-h-screen overflow-hidden">
      <div
        className={`home-ambient -right-16 top-20 h-72 w-72 opacity-60 ${orbs.primary}`}
        aria-hidden
      />
      <div
        className={`home-ambient bottom-32 left-0 h-64 w-64 opacity-50 ${orbs.secondary}`}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
