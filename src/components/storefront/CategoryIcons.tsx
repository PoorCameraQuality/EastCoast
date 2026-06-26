import type { ReactNode } from 'react'

type IconProps = { className?: string }

function IconFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`sf-category-icon ${className}`}
      aria-hidden
    >
      {children}
    </span>
  )
}

export function IconEvents({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="20" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 13h20" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 5v4M21 5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="19" r="2.5" fill="currentColor" opacity="0.85" />
      </svg>
    </IconFrame>
  )
}

export function IconConventions({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 26V12l8-5 8 5v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="12" y="18" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </IconFrame>
  )
}

export function IconPlaces({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 27s8-7.5 8-14a8 8 0 10-16 0c0 6.5 8 14 8 14z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <rect x="13" y="11" width="6" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="16" cy="15" r="1.25" fill="currentColor" />
      </svg>
    </IconFrame>
  )
}

export function IconVendors({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 12l8-5 8 5v12H8V12z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 24v-6h8v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 14h4M14 17h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </IconFrame>
  )
}

export function IconEducation({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 10l8-4 8 4-8 4-8-4z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M24 14v6l-8 4-8-4v-6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M26 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </IconFrame>
  )
}

export function IconStates({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 14h20M6 20h20M14 8v16M20 8v16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      </svg>
    </IconFrame>
  )
}
