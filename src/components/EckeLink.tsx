import type { AnchorHTMLAttributes } from 'react'

export type EckeLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
}

/**
 * Native in-app links for ECKE routes. Uses plain anchors so navigation works
 * even when the Next.js client router fails to transition (external kink.social
 * CTAs already use native <a target="_blank"> and keep working).
 */
export default function EckeLink({ href, ...rest }: EckeLinkProps) {
  return <a href={href} {...rest} />
}
