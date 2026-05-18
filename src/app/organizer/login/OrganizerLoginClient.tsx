'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'
import { C2kFromBanner } from '@/components/dancecard/organizer/C2kFromBanner'
import { Panel } from '@/components/dancecard/ui/Panel'
import { cn } from '@/lib/cn'

type AuthView = 'login' | 'signup' | 'recovery' | 'recovery-sent' | 'new-password'

function viewFromParam(raw: string | null): AuthView | null {
  if (raw === 'signup' || raw === 'login' || raw === 'recovery' || raw === 'new-password') return raw
  if (raw === 'forgot') return 'recovery'
  return null
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-dc-border bg-dc-surface-muted px-4 py-3 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent-border focus:outline-none focus:ring-1 focus:ring-dc-accent-border'

const labelClass = 'block text-sm font-medium text-dc-text'

function safeNextUrl(raw: string | null): string {
  if (raw && raw.startsWith('/') && !raw.startsWith('//') && raw.startsWith('/organizer/')) {
    return raw
  }
  return '/organizer/dancecard'
}

function MessageBanner({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-3 text-sm leading-relaxed',
        tone === 'error' && 'border-dc-danger-border bg-dc-danger-muted text-dc-danger',
        tone === 'success' && 'border-dc-success/35 bg-dc-success-muted text-dc-success',
        tone === 'info' && 'border-dc-accent-border/40 bg-dc-accent-muted/30 text-dc-text',
      )}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

export function OrganizerLoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = safeNextUrl(searchParams.get('next'))

  const [view, setView] = useState<AuthView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const setViewWithUrl = useCallback(
    (next: AuthView) => {
      setView(next)
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      if (next === 'login') params.delete('view')
      else if (next === 'recovery') params.set('view', 'forgot')
      else if (next !== 'recovery-sent') params.set('view', next)
      const qs = params.toString()
      const path = window.location.pathname
      window.history.replaceState(null, '', qs ? `${path}?${qs}` : path)
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    },
    [],
  )

  const detectRecoveryFromHash = useCallback(() => {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash
    return hash.includes('type=recovery') || hash.includes('type=magiclink')
  }, [])

  useEffect(() => {
    const mode = searchParams.get('mode')
    const viewParam = viewFromParam(searchParams.get('view'))
    if (mode === 'forgot' || mode === 'new-password') setView(mode === 'new-password' ? 'new-password' : 'recovery')
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
  }, [searchParams, detectRecoveryFromHash])

  function clearFeedback() {
    setError(null)
    setMessage(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Sign-in is not configured on this server.')
      setLoading(false)
      return
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signErr) {
      setError(signErr.message || 'Could not sign in. Check your email and password.')
      setLoading(false)
      return
    }
    router.replace(nextUrl)
    router.refresh()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Sign-up is not configured on this server.')
      setLoading(false)
      return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error: signErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/organizer/login?next=${encodeURIComponent(nextUrl)}`,
      },
    })
    if (signErr) {
      setError(signErr.message || 'Could not create account.')
      setLoading(false)
      return
    }
    setMessage(
      'Account created. Check your email for a confirmation link, then sign in. Your team lead must still add you as an organizer on each event.',
    )
    setView('login')
    setPassword('')
    setPasswordConfirm('')
    setLoading(false)
  }

  async function handleRecovery(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Password recovery is not configured on this server.')
      setLoading(false)
      return
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/organizer/login?mode=new-password&next=${encodeURIComponent(nextUrl)}`,
    })
    if (resetErr) {
      setError(resetErr.message || 'Could not send reset email.')
      setLoading(false)
      return
    }
    setView('recovery-sent')
    setLoading(false)
  }

  async function handleNewPassword(e: React.FormEvent) {
    e.preventDefault()
    clearFeedback()
    if (password.length < 8) {
      setError('Use at least 8 characters for your new password.')
      return
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const supabase = getSupabaseClient()
    if (!supabase) {
      setError('Password update is not configured on this server.')
      setLoading(false)
      return
    }
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    if (updateErr) {
      setError(updateErr.message || 'Could not update password. Try the reset link again.')
      setLoading(false)
      return
    }
    setMessage('Password updated. Taking you to the event console…')
    router.replace(nextUrl)
    router.refresh()
  }

  const showTabs = view === 'login' || view === 'signup'

  return (
    <div className="relative mx-auto max-w-md px-4 py-12 sm:py-16">
      <Link
        href="/organizer/dancecard"
        className="text-sm font-medium text-dc-accent hover:text-dc-accent-hover"
      >
        ← Event console
      </Link>

      <C2kFromBanner />

      <header className="mt-6">
        <p className="text-sm font-medium text-dc-accent">Dancecard organizer</p>
        <h1 className="mt-2 font-serif text-3xl text-dc-text sm:text-4xl">
          {view === 'new-password'
            ? 'Choose a new password'
            : view === 'recovery' || view === 'recovery-sent'
              ? 'Reset your password'
              : view === 'signup'
                ? 'Create your account'
                : 'Sign in'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-dc-muted">
          {view === 'new-password'
            ? 'You arrived from a reset link. Pick a new password, then we send you to the organizer console.'
            : view === 'recovery-sent'
              ? 'If an account exists for that email, you will receive a link shortly.'
              : view === 'recovery'
                ? 'Enter the email on your East Coast Kink Events account. We send a link to choose a new password.'
                : view === 'signup'
                  ? 'One account works across East Coast Kink Events and Dancecard. After you confirm your email, an event owner must invite you as an organizer.'
                  : 'Use the same email and password as your East Coast Kink Events account. You must be invited as an organizer on each event you manage.'}
        </p>
      </header>

      <Panel ref={panelRef} className="relative mt-8">
        {showTabs ? (
          <div className="mb-6 flex gap-1 rounded-xl border border-dc-border bg-dc-surface-muted p-1">
            <button
              type="button"
              className={cn(
                'flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                view === 'login' ? 'bg-dc-elevated text-dc-text shadow-sm' : 'text-dc-muted hover:text-dc-text',
              )}
              onClick={() => {
                clearFeedback()
                setViewWithUrl('login')
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={cn(
                'flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                view === 'signup' ? 'bg-dc-elevated text-dc-text shadow-sm' : 'text-dc-muted hover:text-dc-text',
              )}
              onClick={() => {
                clearFeedback()
                setViewWithUrl('signup')
              }}
            >
              Create account
            </button>
          </div>
        ) : null}

        {error ? (
          <div className={showTabs ? 'mt-4' : ''}>
            <MessageBanner tone="error">{error}</MessageBanner>
          </div>
        ) : null}
        {message && view !== 'recovery-sent' ? (
          <div className={showTabs || error ? 'mt-4' : ''}>
            <MessageBanner tone="success">{message}</MessageBanner>
          </div>
        ) : null}

        {view === 'recovery-sent' ? (
          <div className="space-y-4">
            <MessageBanner tone="success">
              Check your inbox for <strong className="font-medium">{email}</strong>. The link expires after a short
              time. Check spam if you do not see it within a few minutes.
            </MessageBanner>
            <button
              type="button"
              className="text-sm font-medium text-dc-accent hover:underline"
              onClick={() => {
                clearFeedback()
                setViewWithUrl('login')
              }}
            >
              Back to sign in
            </button>
          </div>
        ) : null}

        {view === 'login' ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => void handleLogin(e)}>
            <label className={labelClass}>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className={labelClass}>
              <span className="flex items-center justify-between gap-2">
                Password
                <button
                  type="button"
                  className="text-xs font-normal text-dc-accent hover:underline"
                  onClick={() => {
                    clearFeedback()
                    setViewWithUrl('recovery')
                  }}
                >
                  Forgot password?
                </button>
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 rounded-xl bg-dc-accent py-3 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : null}

        {view === 'signup' ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => void handleSignUp(e)}>
            <label className={labelClass}>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="mt-1 block text-xs text-dc-muted">At least 8 characters</span>
            </label>
            <label className={labelClass}>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                required
                className={inputClass}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 rounded-xl bg-dc-accent py-3 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        ) : null}

        {view === 'recovery' ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => void handleRecovery(e)}>
            <label className={labelClass}>
              Email on your account
              <input
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 rounded-xl bg-dc-accent py-3 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <button
              type="button"
              className="w-full text-sm text-dc-muted hover:text-dc-text"
              onClick={() => {
                clearFeedback()
                setViewWithUrl('login')
              }}
            >
              Back to sign in
            </button>
          </form>
        ) : null}

        {view === 'new-password' ? (
          <form className="mt-6 flex flex-col gap-4" onSubmit={(e) => void handleNewPassword(e)}>
            <label className={labelClass}>
              New password
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className={labelClass}>
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                required
                className={inputClass}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 rounded-xl bg-dc-accent py-3 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save password and continue'}
            </button>
          </form>
        ) : null}
      </Panel>

      <p className="mt-8 text-center text-sm text-dc-muted">
        <Link href="/dancecard/organizers" className="text-dc-accent hover:underline">
          What is Dancecard?
        </Link>
        <span className="mx-2 text-dc-border">·</span>
        <Link href="/" className="hover:text-dc-text">
          East Coast home
        </Link>
      </p>
    </div>
  )
}
