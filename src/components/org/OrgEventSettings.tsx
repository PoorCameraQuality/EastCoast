'use client'

import { useState } from 'react'
import { EVENT_APPLICATION_KINDS } from '@/lib/eckeOrgEventAssets'

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-sf-strong'

type ApplicationValues = {
  staffApplicationUrl: string
  vendorApplicationUrl: string
  presenterApplicationUrl: string
  photographerApplicationUrl: string
  staffApplicationsOpen: boolean
  vendorApplicationsOpen: boolean
  presenterApplicationsOpen: boolean
  photographerApplicationsOpen: boolean
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
    >
      <span className="text-sm font-medium text-sf-strong">{label}</span>
      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          checked ? 'bg-emerald-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white transition ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  )
}

export default function OrgEventSettings({
  slug,
  status,
  applications,
}: {
  slug: string
  status: string
  applications?: Partial<ApplicationValues>
}) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [links, setLinks] = useState<ApplicationValues>({
    staffApplicationUrl: applications?.staffApplicationUrl || '',
    vendorApplicationUrl: applications?.vendorApplicationUrl || '',
    presenterApplicationUrl: applications?.presenterApplicationUrl || '',
    photographerApplicationUrl: applications?.photographerApplicationUrl || '',
    staffApplicationsOpen: Boolean(applications?.staffApplicationsOpen),
    vendorApplicationsOpen: Boolean(applications?.vendorApplicationsOpen),
    presenterApplicationsOpen: Boolean(applications?.presenterApplicationsOpen),
    photographerApplicationsOpen: Boolean(applications?.photographerApplicationsOpen),
  })

  async function setStatus(action: 'publish' | 'unpublish' | 'archive' | 'restore') {
    setBusy(true)
    setError(null)
    const response = await fetch(`/api/org/events/${slug}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) {
      setError(data.error || 'Could not update status')
      setBusy(false)
      return
    }
    window.location.assign(`/events/${slug}/manage`)
  }

  async function destroy() {
    if (!window.confirm('Delete this event permanently? Archive is safer for SEO.')) return
    setBusy(true)
    const response = await fetch(`/api/org/events/${slug}`, { method: 'DELETE' })
    if (!response.ok) {
      setError('Could not delete event')
      setBusy(false)
      return
    }
    window.location.assign('/events/my-events')
  }

  async function saveApplications(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setSaved(false)
    const response = await fetch(`/api/org/events/${slug}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    })
    const data = (await response.json()) as { error?: string }
    if (!response.ok) setError(data.error || 'Could not save applications')
    else setSaved(true)
    setBusy(false)
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-lg border border-rose-500/30 bg-rose-950/40 px-3 py-2 text-sm text-rose-100">{error}</p>
      ) : null}

      <form onSubmit={saveApplications} className="space-y-4 rounded-xl border border-white/10 p-5">
        <h2 className="text-lg font-semibold text-sf-strong">Applications</h2>
        <p className="text-sm text-sf-muted">
          Keep the form link saved. Use the toggle to show or hide the “open” pip on the public event page.
        </p>
        {EVENT_APPLICATION_KINDS.map((item) => {
          const urlKey = `${item.id}ApplicationUrl` as keyof ApplicationValues
          const openKey = `${item.id}ApplicationsOpen` as keyof ApplicationValues
          const isOpen = Boolean(links[openKey])
          return (
            <div key={item.id} className="space-y-2 rounded-lg border border-white/10 p-3">
              <Toggle
                checked={isOpen}
                label={`${item.label} applications ${isOpen ? 'open' : 'closed'}`}
                onChange={(value) => setLinks((current) => ({ ...current, [openKey]: value }))}
              />
              <label className="block text-sm text-sf-body">
                Form link
                <input
                  className={fieldClass}
                  value={String(links[urlKey] || '')}
                  onChange={(e) => setLinks((current) => ({ ...current, [urlKey]: e.target.value }))}
                  placeholder="https://forms.google.com/..."
                />
              </label>
            </div>
          )
        })}
        <button type="submit" className="sf-btn-primary min-h-11 px-4" disabled={busy}>
          {busy ? 'Saving…' : 'Save applications'}
        </button>
        {saved ? <p className="text-sm text-sf-muted">Saved.</p> : null}
      </form>
      <div className="flex flex-wrap gap-2">
        {status !== 'published' ? (
          <button type="button" className="sf-btn-primary min-h-11 px-4" disabled={busy} onClick={() => setStatus('publish')}>
            Publish
          </button>
        ) : (
          <button type="button" className="sf-btn-ghost min-h-11 px-4" disabled={busy} onClick={() => setStatus('unpublish')}>
            Unpublish
          </button>
        )}
        {status !== 'archived' ? (
          <button type="button" className="sf-btn-ghost min-h-11 px-4" disabled={busy} onClick={() => setStatus('archive')}>
            Archive event
          </button>
        ) : (
          <button type="button" className="sf-btn-ghost min-h-11 px-4" disabled={busy} onClick={() => setStatus('restore')}>
            Restore
          </button>
        )}
      </div>
      <div className="rounded-xl border border-rose-500/20 p-4">
        <p className="text-sm text-sf-body">Delete permanently only if you are sure. Prefer archive so the URL can keep SEO value.</p>
        <button type="button" className="mt-3 text-sm text-rose-200 underline" disabled={busy} onClick={destroy}>
          Delete permanently
        </button>
      </div>
    </div>
  )
}
