'use client'

import { useState } from 'react'
import EckeLink from '@/components/EckeLink'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

export default function OrgSignupForm() {
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return new URLSearchParams(window.location.search).get('error')
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/org/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName,
          email,
          website: website.trim() || undefined,
          username,
          password,
        }),
      })
      const data = (await response.json()) as { error?: string; issues?: Array<{ message?: string }> }
      if (!response.ok) {
        throw new Error(data.error || data.issues?.[0]?.message || 'Could not create organization')
      }
      window.location.assign('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create organization')
      setLoading(false)
    }
  }

  return (
    <form action="/api/auth/org/signup" method="post" onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      <label className="block text-sm text-sf-body">
        Organization name
        <input name="organizationName" className={fieldClass} value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
      </label>
      <label className="block text-sm text-sf-body">
        Contact email
        <input name="email" className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="block text-sm text-sf-body">
        Website <span className="text-sf-muted">(optional)</span>
        <input
          className={fieldClass}
          type="text"
          inputMode="url"
          placeholder="yourgroup.com"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>
      <label className="block text-sm text-sf-body">
        Username
        <input
          className={fieldClass}
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          pattern="[A-Za-z0-9][A-Za-z0-9_-]*"
          title="Letters, numbers, underscores, and hyphens"
          autoComplete="username"
        />
      </label>
      <label className="block text-sm text-sf-body">
        Password
        <input name="password" className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
      </label>
      <label className="block text-sm text-sf-body">
        Confirm password
        <input name="confirm" className={fieldClass} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
      </label>
      <button type="submit" className="sf-btn-primary min-h-11 w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create organization'}
      </button>
      <p className="text-center text-sm text-sf-muted">
        Already have a login?{' '}
        <EckeLink href="/auth/org/login" className="text-sf-strong underline">
          Sign in
        </EckeLink>
      </p>
    </form>
  )
}
