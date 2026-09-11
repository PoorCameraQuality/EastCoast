'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import EckeLink from '@/components/EckeLink'
import { safeOrgNextPath } from '@/lib/eckeOrgSessionLimit'
import { getSupabaseClient } from '@/lib/supabase'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

type AuthView = 'login' | 'recovery' | 'recovery-sent' | 'new-password'

function viewFromParam(raw: string | null): AuthView | null {
  if (raw === 'login' || raw === 'recovery' || raw === 'new-password') return raw
  if (raw === 'forgot') return 'recovery'
  return null
}

export default function OrgLoginForm() {
  const searchParams = useSearchParams()
  const [view, setView] = useState<AuthView>('login')
  const [username, setUsername] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const detectRecoveryFromHash = useCallback(() => {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash
    return hash.includes('type=recovery') || hash.includes('type=magiclink')
  }, [])

  const setViewWithUrl = useCallback((next: AuthView) => {
    setView(next)
    setError(null)
    setMessage(null)
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (next === 'login') {
      params.delete('view')
      params.delete('mode')
    } else if (next === 'recovery') {
      params.set('view', 'forgot')
      params.delete('mode')
    } else if (next === 'new-password') {
      params.set('mode', 'new-password')
    } else if (next === 'recovery-sent') {
      params.set('view', 'forgot')
    }
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname)
  }, [])

  useEffect(() => {
    const mode = searchParams.get('mode')
    const viewParam = viewFromParam(searchParams.get('view'))
    if (mode === 'forgot') setView('recovery')
    else if (mode === 'new-password') setView('new-password')
    else if (viewParam) setView(viewParam)
    if (detectRecoveryFromHash()) setView('new-password')

    const supabase = getSupabaseClient()
    if (!supabase) return

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setView('new-password')
    })

    void supabase.auth.getSession().then(() => {
      if (detectRecoveryFromHash()) setView('new-password')
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [detectRecoveryFromHash, searchParams])

  async function onLogin(e: React.FormEvent) {
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

  async function onRecover(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const response = await fetch('/api/auth/org/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
      const data = (await response.json()) as { message?: string; error?: string }
      if (!response.ok) {
        throw new Error(data.error || 'Could not send reset email')
      }
      setMessage(data.message || 'If that account exists, reset instructions were sent.')
      setViewWithUrl('recovery-sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  async function onNewPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error('Auth is unavailable right now')
      const { error: updateErr } = await supabase.auth.updateUser({ password })
      if (updateErr) {
        throw new Error(updateErr.message || 'Could not update password. Try the reset link again.')
      }
      setMessage('Password updated. Sign in with your new password.')
      setPassword('')
      setPasswordConfirm('')
      setViewWithUrl('login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update password')
    } finally {
      setLoading(false)
    }
  }

  const title =
    view === 'new-password'
      ? 'Choose a new password'
      : view === 'recovery' || view === 'recovery-sent'
        ? 'Reset your password'
        : 'Sign in'

  const lede =
    view === 'new-password'
      ? 'You arrived from a reset link. Pick a new password, then sign in.'
      : view === 'recovery-sent'
        ? 'Check the inbox for that account. The link expires after a short time.'
        : view === 'recovery'
          ? 'Enter your username or the email on the account. We send a reset link if it matches.'
          : 'Same login for events and your shop. Use the username or email from signup.'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-sf-strong">{title}</h1>
        <p className="mt-2 text-sm text-sf-muted">{lede}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100" role="status">
          {message}
        </p>
      ) : null}

      {view === 'login' ? (
        <form action="/api/auth/org/login" method="post" onSubmit={onLogin} className="space-y-4">
          <label className="block text-sm text-sf-body">
            Username or email
            <input
              name="username"
              className={fieldClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="block text-sm text-sf-body">
            Password
            <input
              name="password"
              className={fieldClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-sf-muted underline hover:text-sf-strong"
              onClick={() => {
                setIdentifier(username)
                setViewWithUrl('recovery')
              }}
            >
              Forgot password?
            </button>
          </div>
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
      ) : null}

      {view === 'recovery' ? (
        <form onSubmit={onRecover} className="space-y-4">
          <label className="block text-sm text-sf-body">
            Username or email
            <input
              className={fieldClass}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <p className="text-xs text-sf-muted">
            Reset mail goes to the email on the account. If you still use an @eastcoastkinkevents.com login
            address, sign in first and set a real recovery email on the dashboard.
          </p>
          <button type="submit" className="sf-btn-primary min-h-11 w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <button
            type="button"
            className="min-h-11 w-full text-sm text-sf-muted underline"
            onClick={() => setViewWithUrl('login')}
          >
            Back to sign in
          </button>
        </form>
      ) : null}

      {view === 'recovery-sent' ? (
        <div className="space-y-4">
          <button type="button" className="sf-btn-primary min-h-11 w-full" onClick={() => setViewWithUrl('login')}>
            Back to sign in
          </button>
          <button
            type="button"
            className="min-h-11 w-full text-sm text-sf-muted underline"
            onClick={() => setViewWithUrl('recovery')}
          >
            Try a different username or email
          </button>
        </div>
      ) : null}

      {view === 'new-password' ? (
        <form onSubmit={onNewPassword} className="space-y-4">
          <label className="block text-sm text-sf-body">
            New password
            <input
              className={fieldClass}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label className="block text-sm text-sf-body">
            Confirm new password
            <input
              className={fieldClass}
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="sf-btn-primary min-h-11 w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Save password'}
          </button>
          <button
            type="button"
            className="min-h-11 w-full text-sm text-sf-muted underline"
            onClick={() => setViewWithUrl('login')}
          >
            Back to sign in
          </button>
        </form>
      ) : null}
    </div>
  )
}
