'use client'

import { useState } from 'react'

type Variant = 'default' | 'footer' | 'compact'

export default function NewsletterSignup({ variant = 'default' }: { variant?: Variant }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage(null)

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }

      if (res.ok && data.ok) {
        setStatus('success')
        setEmail('')
        setMessage("You're in! Check your email to confirm.")
        return
      }

      setStatus('error')
      setMessage(data.error || 'Something went wrong.')
    } catch {
      setStatus('error')
      setMessage('Network error. Try again.')
    }
  }

  const formClass =
    variant === 'footer'
      ? 'flex flex-col gap-2 sm:flex-row sm:items-end'
      : variant === 'compact'
        ? 'flex flex-col sm:flex-row gap-2 sm:items-center'
        : 'flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap'

  const title =
    variant === 'footer' ? (
      <p className="text-sm font-semibold text-white">Monthly digest</p>
    ) : (
      <h3 className="text-lg font-serif font-semibold text-white">Stay in the loop</h3>
    )

  return (
    <div
      className={
        variant === 'footer'
          ? 'mt-6 rounded-xl border border-white/10 bg-white/5 p-4'
          : variant === 'compact'
            ? 'rounded-xl border border-white/10 bg-white/5 p-4'
            : 'rounded-2xl border border-white/10 bg-white/5 p-6'
      }
    >
      {title}
      {variant !== 'footer' && (
        <p className="text-sm text-gray-400 mt-1 mb-3">
          Upcoming events, spaces, and community news. Unsubscribe anytime.
        </p>
      )}
      {variant === 'footer' && (
        <p className="text-xs text-gray-500 mt-1 mb-3">Events &amp; updates. No spam.</p>
      )}

      {status === 'success' ? (
        <p className="text-sm text-primary-300">{message}</p>
      ) : (
        <form onSubmit={onSubmit} className={formClass}>
          <label className="sr-only" htmlFor={`newsletter-email-${variant}`}>
            Email address
          </label>
          <input
            id={`newsletter-email-${variant}`}
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
            autoComplete="email"
            className="min-h-touch flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email.trim()}
            className="min-h-touch shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && message && (
        <p className="text-sm text-red-400 mt-2" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
