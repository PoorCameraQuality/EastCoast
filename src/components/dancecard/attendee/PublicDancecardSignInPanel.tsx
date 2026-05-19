'use client'

import { cn } from '@/lib/cn'

type AuthNotice = { kind: 'success' | 'error'; text: string }

type Props = {
  authMode: 'login' | 'register'
  setAuthMode: (mode: 'login' | 'register') => void
  username: string
  setUsername: (v: string) => void
  password: string
  setPassword: (v: string) => void
  passwordConfirm: string
  setPasswordConfirm: (v: string) => void
  showPassword: boolean
  setShowPassword: (v: boolean | ((prev: boolean) => boolean)) => void
  displayName: string
  setDisplayName: (v: string) => void
  compCode: string
  setCompCode: (v: string) => void
  authNotice: AuthNotice | null
  setAuthNotice: (v: AuthNotice | null) => void
  onSubmit: () => void
  compact?: boolean
}

export function PublicDancecardSignInPanel({
  authMode,
  setAuthMode,
  username,
  setUsername,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  showPassword,
  setShowPassword,
  displayName,
  setDisplayName,
  compCode,
  setCompCode,
  authNotice,
  setAuthNotice,
  onSubmit,
  compact = false,
}: Props) {
  const fieldPad = compact ? 'px-3 py-2' : 'px-4 py-3'
  const formGap = compact ? 'space-y-3' : 'space-y-4'
  const formMt = compact ? 'mt-4' : 'mt-6'

  return (
    <>
      <div className="inline-flex rounded-full border border-dc-border bg-dc-surface-muted p-1">
        {(['login', 'register'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition',
              authMode === mode
                ? 'bg-dc-accent text-dc-accent-foreground shadow-md'
                : 'text-dc-muted hover:text-dc-text',
            )}
            onClick={() => {
              setAuthMode(mode)
              setPasswordConfirm('')
              setCompCode('')
              setShowPassword(false)
              setAuthNotice(null)
            }}
          >
            {mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      <form
        className={`${formMt} ${formGap}`}
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted">Username</label>
          <input
            className={`w-full rounded-xl border border-dc-border bg-dc-surface-muted text-sm text-dc-text placeholder:text-dc-muted ${fieldPad}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="rope-dreamer"
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted">Password</label>
            <button
              type="button"
              className="text-[11px] font-medium text-dc-accent hover:text-dc-text"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`w-full rounded-xl border border-dc-border bg-dc-surface-muted text-sm text-dc-text placeholder:text-dc-muted ${fieldPad}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={authMode === 'register' ? 'new-password' : 'current-password'}
            placeholder="Enter your password"
          />
        </div>
        {authMode === 'register' ? (
          <>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted">
                  Confirm password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-medium text-dc-accent hover:text-dc-text"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full rounded-xl border border-dc-border bg-dc-surface-muted text-sm text-dc-text placeholder:text-dc-muted ${fieldPad}`}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
                placeholder="Re-enter your password"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted">
                Display name
              </label>
              <input
                className={`w-full rounded-xl border border-dc-border bg-dc-surface-muted text-sm text-dc-text placeholder:text-dc-muted ${fieldPad}`}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How friends see you"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-dc-muted">
                Registration code{' '}
                <span className="font-normal normal-case tracking-normal text-dc-muted">(optional)</span>
              </label>
              <input
                className={`w-full rounded-xl border border-dc-border bg-dc-surface-muted font-mono text-sm text-dc-text placeholder:text-dc-muted ${fieldPad}`}
                value={compCode}
                onChange={(e) => setCompCode(e.target.value)}
                autoComplete="off"
                placeholder="Staff / volunteer / comp code from organizers"
              />
              <p className="mt-2 text-[11px] leading-snug text-dc-muted">
                Leave blank for general attendee registration. Your code sets your ticket type (staff, volunteer, comp,
                etc.).
              </p>
            </div>
            <div className="rounded-xl border border-dc-warning/40 bg-dc-warning-muted p-4 text-sm leading-6 text-dc-text">
              <p className="font-semibold text-dc-warning">There is no password reset.</p>
              <p className="mt-2 text-dc-muted">
                If you forget this password you will need to create a brand new account and re-enter your availability.
                Write it down or save it in a password manager before you continue.
              </p>
            </div>
          </>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_12px_32px_rgba(198,167,94,0.22)] transition hover:bg-dc-accent-hover"
        >
          {authMode === 'register' ? 'Create your dancecard' : 'Sign in to your dancecard'}
        </button>
      </form>
      {authNotice ? (
        <p className={`mt-4 text-sm ${authNotice.kind === 'success' ? 'text-dc-success' : 'text-dc-danger'}`}>
          {authNotice.text}
        </p>
      ) : null}
    </>
  )
}
