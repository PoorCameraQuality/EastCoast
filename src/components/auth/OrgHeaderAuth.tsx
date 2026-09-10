'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'

export default function OrgHeaderAuth({
  signedIn,
  variant = 'desktop',
}: {
  signedIn: boolean
  variant?: 'desktop' | 'mobile'
}) {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/api/auth/org/logout', { method: 'POST', credentials: 'include' })
    } catch (error) {
      console.error('ORG HEADER: logout failed', error)
    }
    window.location.assign('/')
  }

  const linkClass =
    variant === 'mobile'
      ? 'sf-btn-ghost inline-flex min-h-11 w-full items-center justify-center text-sm'
      : 'sf-btn-ghost whitespace-nowrap px-4 py-2 text-sm'
  const logoutClass =
    variant === 'mobile'
      ? 'inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/15 px-4 text-sm text-sf-body hover:bg-white/5'
      : 'whitespace-nowrap rounded-full border border-white/15 px-4 py-2 text-sm text-sf-body hover:bg-white/5'

  return (
    <div className={variant === 'mobile' ? 'flex flex-col gap-2' : 'flex items-center gap-2'}>
      {signedIn ? (
        <>
          <EckeLink href="/dashboard" className={linkClass}>
            Dashboard
          </EckeLink>
          <button type="button" onClick={handleLogout} disabled={loggingOut} className={logoutClass}>
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </>
      ) : (
        <>
          <EckeLink href="/auth/org/login" className={linkClass}>
            Sign in
          </EckeLink>
          <EckeLink href="/auth/org/signup" className={linkClass}>
            List an event
          </EckeLink>
        </>
      )}
    </div>
  )
}
