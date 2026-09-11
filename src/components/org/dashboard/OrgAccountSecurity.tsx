'use client'

import { useState } from 'react'

const fieldClass =
  'mt-1.5 w-full max-w-md rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong placeholder:text-sf-muted focus:border-sf-violet/50 focus:outline-none focus:ring-2 focus:ring-ecke-focus'

type Props = {
  currentEmail: string
  username: string | null
}

export default function OrgAccountSecurity({ currentEmail, username }: Props) {
  const [email, setEmail] = useState(currentEmail)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailMessage, setEmailMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const looksSynthetic = /@eastcoastkinkevents\.com$/i.test(currentEmail)

  async function onUpdateEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(null)
    setEmailMessage(null)
    setEmailLoading(true)
    try {
      const response = await fetch('/api/auth/org/update-contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })
      const data = (await response.json()) as { error?: string; message?: string; email?: string }
      if (!response.ok) throw new Error(data.error || 'Could not update email')
      setEmailMessage(data.message || 'Recovery email updated')
      if (data.email) setEmail(data.email)
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Could not update email')
    } finally {
      setEmailLoading(false)
    }
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    setPasswordLoading(true)
    try {
      const response = await fetch('/api/auth/org/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) throw new Error(data.error || 'Could not change password')
      setPasswordMessage(data.message || 'Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <section className="org-dashboard-section" aria-labelledby="org-account-security-title">
      <div className="org-dashboard-section-head">
        <div>
          <h2 id="org-account-security-title" className="org-dashboard-section-title">
            Account &amp; password
          </h2>
          <p className="org-dashboard-section-note">
            {username ? (
              <>
                Username <strong>{username}</strong>. Change your password anytime. Set a real email so
                forgot-password works.
              </>
            ) : (
              <>Change your password anytime. Set a real email so forgot-password works.</>
            )}
          </p>
        </div>
      </div>

      <div className="org-account-security-grid">
        <form onSubmit={onUpdateEmail} className="org-account-security-card space-y-3">
          <h3 className="text-sm font-semibold text-sf-strong">Recovery email</h3>
          {looksSynthetic ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
              This account still uses an ECKE placeholder email. Replace it with an inbox you control before
              using forgot password.
            </p>
          ) : null}
          {emailError ? (
            <p className="text-sm text-rose-200" role="alert">
              {emailError}
            </p>
          ) : null}
          {emailMessage ? (
            <p className="text-sm text-emerald-200" role="status">
              {emailMessage}
            </p>
          ) : null}
          <label className="block text-sm text-sf-body">
            Email
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <button type="submit" className="sf-btn-primary min-h-11" disabled={emailLoading}>
            {emailLoading ? 'Saving…' : 'Save recovery email'}
          </button>
        </form>

        <form onSubmit={onChangePassword} className="org-account-security-card space-y-3">
          <h3 className="text-sm font-semibold text-sf-strong">Change password</h3>
          {passwordError ? (
            <p className="text-sm text-rose-200" role="alert">
              {passwordError}
            </p>
          ) : null}
          {passwordMessage ? (
            <p className="text-sm text-emerald-200" role="status">
              {passwordMessage}
            </p>
          ) : null}
          <label className="block text-sm text-sf-body">
            Current password
            <input
              className={fieldClass}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <label className="block text-sm text-sf-body">
            New password
            <input
              className={fieldClass}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="sf-btn-primary min-h-11" disabled={passwordLoading}>
            {passwordLoading ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </section>
  )
}
