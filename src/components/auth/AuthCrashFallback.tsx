'use client'

import { useEffect, useState } from 'react'
import OrgLoginForm from '@/components/auth/OrgLoginForm'
import OrgLogoutButton from '@/components/auth/OrgLogoutButton'
import OrgSignupForm from '@/components/auth/OrgSignupForm'

function cardClass() {
  return 'mx-auto max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 sm:p-8'
}

export default function AuthCrashFallback() {
  const [pathname, setPathname] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.pathname,
  )

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  if (pathname.startsWith('/auth/org/signup')) {
    return (
      <div className={cardClass()}>
        <h1 className="text-2xl font-semibold text-white">Create an organization</h1>
        <p className="mt-2 text-sm text-gray-300">One login per organization. After you sign up you can publish events.</p>
        <div className="mt-6">
          <OrgSignupForm />
        </div>
      </div>
    )
  }

  if (pathname.startsWith('/auth/org/login')) {
    return (
      <div className={cardClass()}>
        <h1 className="text-2xl font-semibold text-white">Organization login</h1>
        <p className="mt-2 text-sm text-gray-300">Use the username or email and password created at signup.</p>
        <div className="mt-6">
          <OrgLoginForm />
        </div>
      </div>
    )
  }

  if (pathname.startsWith('/dashboard')) {
    return <CrashDashboard />
  }

  return null
}

function CrashDashboard() {
  const [name, setName] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/org/session')
      .then(async (response) => {
        if (!response.ok) {
          window.location.assign('/auth/org/login')
          return
        }
        const data = (await response.json()) as { organizationName?: string; username?: string | null; email?: string }
        if (cancelled) return
        setName(data.organizationName || 'Organization')
        setUsername(data.username || data.email || null)
      })
      .catch(() => {
        if (!cancelled) setMissing(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (missing) {
    return (
      <div className={cardClass()}>
        <p className="text-sm text-gray-300">Could not load your session.</p>
        <a href="/auth/org/login" className="mt-4 inline-block text-white underline">
          Sign in
        </a>
      </div>
    )
  }

  if (!name) {
    return <p className="text-center text-sm text-gray-300">Loading dashboard…</p>
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Organization</p>
      <h1 className="mt-2 text-3xl font-semibold text-white">{name}</h1>
      {username ? <p className="mt-2 text-sm text-gray-300">Signed in as {username}</p> : null}
      <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-5">
        <h2 className="text-lg font-semibold text-white">My events</h2>
        <p className="mt-2 text-sm text-gray-300">Manage listings, posts, and event information.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/events/my-events" className="inline-flex min-h-11 items-center rounded-md bg-white/15 px-4 text-sm text-white">
            Open my events
          </a>
          <a href="/events/create" className="inline-flex min-h-11 items-center rounded-md border border-white/20 px-4 text-sm text-white">
            Create event
          </a>
          <OrgLogoutButton />
        </div>
      </div>
    </div>
  )
}
