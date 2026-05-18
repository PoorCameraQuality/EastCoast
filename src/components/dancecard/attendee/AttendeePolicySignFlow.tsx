'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

type Policy = { id: string; title: string; kind: string; version: number }

type StatusPayload = {
  loggedIn: boolean
  displayName: string | null
  registrantMatched: boolean
  agreementsMode: string
  requiredPolicyDocumentIds: string[]
  acceptedPolicyDocumentIds: string[]
  agreementsComplete: boolean
}

function applySignBundle(
  st: StatusPayload,
  policyRows: Policy[],
  setStatus: (s: StatusPayload) => void,
  setPolicies: (p: Policy[]) => void,
  setSelected: (s: Set<string>) => void,
  setRegistrationName: (fn: (prev: string) => string) => void,
) {
  setStatus(st)
  setRegistrationName((prev) => prev || st.displayName || '')
  setPolicies(policyRows)
  const required = new Set(st.requiredPolicyDocumentIds ?? [])
  const accepted = new Set(st.acceptedPolicyDocumentIds ?? [])
  const missing = Array.from(required).filter((id) => !accepted.has(id))
  setSelected(new Set(missing))
}

export function AttendeePolicySignFlow({
  eventSlug,
  prefetched,
  onSigned,
}: {
  eventSlug: string
  prefetched?: { signStatus: StatusPayload; policies: Policy[] }
  onSigned?: () => void
}) {
  const slug = eventSlug.toLowerCase()
  const [status, setStatus] = useState<StatusPayload | null>(prefetched?.signStatus ?? null)
  const [policies, setPolicies] = useState<Policy[]>(prefetched?.policies ?? [])
  const [legalName, setLegalName] = useState('')
  const [registrationName, setRegistrationName] = useState(prefetched?.signStatus.displayName ?? '')
  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!prefetched) return new Set()
    const required = new Set(prefetched.signStatus.requiredPolicyDocumentIds ?? [])
    const accepted = new Set(prefetched.signStatus.acceptedPolicyDocumentIds ?? [])
    return new Set(Array.from(required).filter((id) => !accepted.has(id)))
  })
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(!prefetched)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/policies-page`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const j = (await res.json()) as {
        policies?: Policy[]
        signStatus?: StatusPayload
        error?: string
      }
      if (!res.ok) throw new Error(j.error ?? 'Could not load policy status')
      const st = j.signStatus
      if (!st) throw new Error('Could not load policy status')
      applySignBundle(st, j.policies ?? [], setStatus, setPolicies, setSelected, setRegistrationName)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (prefetched) return
    void load()
  }, [load, prefetched])

  const mode = status?.agreementsMode ?? 'ecke'
  const usesEcke = mode === 'ecke' || mode === 'hybrid'

  if (loading) {
    return (
      <PanelPlaceholder>
        <p className="text-sm text-dc-muted">Loading signing status…</p>
      </PanelPlaceholder>
    )
  }

  if (err && !status) {
    return (
      <PanelPlaceholder>
        <p className="text-sm text-dc-danger">{err}</p>
      </PanelPlaceholder>
    )
  }

  if (!usesEcke) {
    return (
      <PanelPlaceholder>
        <h2 className="font-serif text-xl text-dc-text">Policy signatures</h2>
        <p className="mt-2 text-sm text-dc-muted">
          This event collects signatures through RabbitSign, not in-app ECKE Sign. Check your email or the link from
          registration.
        </p>
      </PanelPlaceholder>
    )
  }

  const required = new Set(status?.requiredPolicyDocumentIds ?? [])
  const accepted = new Set(status?.acceptedPolicyDocumentIds ?? [])
  const requiredDocs = policies.filter((p) => required.has(p.id))
  const missingEcke = requiredDocs.some((p) => !accepted.has(p.id))

  if (!requiredDocs.length) {
    return (
      <PanelPlaceholder>
        <h2 className="font-serif text-xl text-dc-text">ECKE Sign</h2>
        <p className="mt-2 text-sm text-dc-muted">
          No required policy documents are published yet. Organizers can publish policies under Settings → Policies &
          agreements.
        </p>
      </PanelPlaceholder>
    )
  }

  if (status?.agreementsComplete) {
    return (
      <PanelPlaceholder>
        <h2 className="font-serif text-xl text-dc-text">ECKE Sign</h2>
        <p className="mt-2 text-sm text-dc-success">All required policies are signed. You are set for check-in.</p>
      </PanelPlaceholder>
    )
  }

  if (!status?.loggedIn) {
    return (
      <PanelPlaceholder>
        <h2 className="font-serif text-xl text-dc-text">Sign required policies (ECKE Sign)</h2>
        <p className="mt-2 text-sm text-dc-muted">
          Sign in to your dancecard first so we can match your registration and record your signatures.
        </p>
        <Link
          href={`/dancecard/${slug}?returnTo=${encodeURIComponent(`/dancecard/${slug}/policies`)}`}
          className="mt-4 inline-flex min-h-touch items-center justify-center rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground"
        >
          Sign in to dancecard
        </Link>
        <p className="mt-3 text-dc-micro text-dc-muted">
          Signing in creates your dancecard account. Policy signatures are saved to your event registration automatically.
        </p>
      </PanelPlaceholder>
    )
  }

  const toSign = Array.from(selected).filter((id) => required.has(id) && !accepted.has(id))

  async function submit() {
    if (!legalName.trim()) {
      setMsg('Legal name is required.')
      return
    }
    const regName = registrationName.trim() || status?.displayName?.trim() || ''
    if (!regName) {
      setMsg('Enter the name on your registration.')
      return
    }
    if (!toSign.length) {
      setMsg('Select at least one policy to acknowledge.')
      return
    }
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      const res = await fetch(`/api/dancecard/${encodeURIComponent(slug)}/policy-acceptances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          policyDocumentIds: toSign,
          legalName: legalName.trim(),
          registrationName: regName,
        }),
      })
      const j = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(j.error ?? 'Could not save')
      setMsg('Recorded. Thank you.')
      await load()
      onSigned?.()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-dc-accent-border bg-dc-accent-muted/20 p-4 sm:p-5">
      <h2 className="font-serif text-xl text-dc-text">Sign required policies (ECKE Sign)</h2>
      <p className="mt-2 text-sm text-dc-muted">
        Signed in as <strong className="text-dc-text">{status.displayName}</strong>. Enter your legal name below to
        acknowledge the selected policies.
      </p>
      <label className="mt-4 block text-sm text-dc-muted">
        Name on registration
        <input
          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2 text-dc-text"
          value={registrationName}
          onChange={(e) => setRegistrationName(e.target.value)}
          placeholder="Usually the same as your dancecard name"
          autoComplete="name"
        />
      </label>
      <label className="mt-3 block text-sm text-dc-muted">
        Legal name (signature)
        <input
          className="mt-1 w-full rounded-lg border border-dc-border bg-dc-surface px-3 py-2 text-dc-text"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
          autoComplete="name"
        />
      </label>
      <p className="mt-2 text-dc-micro text-dc-muted">
        <Link href={`/dancecard/${slug}`} className="text-dc-accent hover:underline">
          Open dancecard
        </Link>{' '}
        to change your display name under profile settings.
      </p>
      <ul className="mt-4 space-y-2">
        {requiredDocs.map((p) => {
          const done = accepted.has(p.id)
          return (
            <li key={p.id} className="flex items-start gap-2 text-sm">
              {done ? (
                <span className="text-dc-success">✓</span>
              ) : (
                <input
                  type="checkbox"
                  className="mt-1 accent-dc-accent"
                  checked={selected.has(p.id)}
                  disabled={busy}
                  onChange={(e) => {
                    setSelected((prev) => {
                      const n = new Set(prev)
                      if (e.target.checked) n.add(p.id)
                      else n.delete(p.id)
                      return n
                    })
                  }}
                />
              )}
              <span className={done ? 'text-dc-muted line-through' : 'text-dc-text'}>
                {p.title}{' '}
                <span className="text-dc-micro text-dc-muted">
                  ({p.kind} v{p.version})
                </span>
              </span>
            </li>
          )
        })}
      </ul>
      {err ? <p className="mt-3 text-sm text-dc-danger">{err}</p> : null}
      {msg ? <p className="mt-3 text-sm text-dc-success">{msg}</p> : null}
      {missingEcke ? (
        <button
          type="button"
          disabled={busy}
          className="mt-4 inline-flex min-h-touch items-center justify-center rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground disabled:opacity-50"
          onClick={() => void submit()}
        >
          {busy ? 'Saving…' : 'Sign selected policies'}
        </button>
      ) : null}
    </div>
  )
}

function PanelPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-xl border border-dc-border bg-dc-surface-muted/40 p-4 sm:p-5">{children}</div>
  )
}
