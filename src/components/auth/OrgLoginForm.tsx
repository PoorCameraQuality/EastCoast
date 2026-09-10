'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'
import { safeOrgNextPath } from '@/lib/eckeOrgSessionLimit'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

export default function OrgLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await fetch('/api/auth/org/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })
      const data = (await response.json()) as { error?: string }
      if (!response.ok) {
        throw new Error(data.error || 'Could not sign in')
      }
      window.location.assign(safeOrgNextPath(new URLSearchParams(window.location.search).get('next')))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in')
      setLoading(false)
    }
  }

  return (
    <form action="/api/auth/org/login" method="post" onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      <label className="block text-sm text-sf-body">
        Username or email
        <input name="username" className={fieldClass} value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
      </label>
      <label className="block text-sm text-sf-body">
        Password
        <input name="password" className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      </label>
      <button type="submit" className="sf-btn-primary min-h-11 w-full" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-sf-muted">
        Need an account?{' '}
        <EckeLink href="/auth/org/signup" className="text-sf-strong underline">
          Create an account
        </EckeLink>
      </p>
    </form>
  )
}
