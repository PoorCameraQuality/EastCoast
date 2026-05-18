'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Panel } from '@/components/dancecard/ui/Panel'
import { ORGANIZER_PUBLISHED_AS_HINT, ORGANIZER_PUBLISHED_AS_LABEL } from '@/lib/dancecard/organizerCopy'
import { cn } from '@/lib/cn'

const inputClass =
  'mt-1 w-full rounded-xl border border-dc-border bg-dc-surface-muted px-3 py-2.5 text-sm text-dc-text placeholder:text-dc-muted focus:border-dc-accent-border focus:outline-none focus:ring-1 focus:ring-dc-accent-border'

const labelClass = 'block text-sm font-medium text-dc-text'

type Props = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function OrganizerHubClient({ open: openProp, defaultOpen = false, onOpenChange }: Props) {
  const router = useRouter()
  const [openUncontrolled, setOpenUncontrolled] = useState(defaultOpen)
  const open = openProp ?? openUncontrolled
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (openProp === undefined) setOpenUncontrolled(next)
  }

  const [mode, setMode] = useState<'create' | 'clone'>('create')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [cSlug, setCSlug] = useState('')
  const [cProduct, setCProduct] = useState('East Coast Kink Events · Dancecard')
  const [cTitle, setCTitle] = useState('')
  const [cTz, setCTz] = useState('America/New_York')
  const [cStart, setCStart] = useState('')
  const [cEnd, setCEnd] = useState('')

  const [srcSlug, setSrcSlug] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [anchorSrc, setAnchorSrc] = useState('')
  const [anchorTgt, setAnchorTgt] = useState('')
  const [dSettings, setDSettings] = useState(true)
  const [dLoc, setDLoc] = useState(true)
  const [dTracks, setDTracks] = useState(true)
  const [dProgram, setDProgram] = useState(false)
  const [dStaff, setDStaff] = useState(false)
  const [dDm, setDDm] = useState(false)
  const [dMsg, setDMsg] = useState(false)
  const [dPol, setDPol] = useState(false)

  useEffect(() => {
    if (defaultOpen && openProp === undefined) setOpenUncontrolled(true)
  }, [defaultOpen, openProp])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  async function submitCreate() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/organizer/dancecard/events', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: cSlug.trim().toLowerCase(),
          productTitle: cProduct.trim(),
          eventTitle: cTitle.trim(),
          timezone: cTz.trim(),
          windowStartsAt: cStart,
          windowEndsAt: cEnd,
        }),
      })
      const j = (await res.json()) as { error?: string; slug?: string }
      if (!res.ok) throw new Error(j.error || 'Create failed')
      setOpen(false)
      router.push(`/organizer/dancecard/${encodeURIComponent(j.slug!)}`)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setBusy(false)
    }
  }

  async function submitClone() {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/organizer/dancecard/events/clone', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSlug: srcSlug.trim().toLowerCase(),
          newSlug: newSlug.trim().toLowerCase(),
          newEventTitle: newTitle.trim(),
          anchorSourceStartsAt: anchorSrc,
          anchorTargetStartsAt: anchorTgt,
          domains: {
            settings: dSettings,
            locations: dLoc,
            tracksTags: dTracks,
            program: dProgram,
            staffShifts: dStaff,
            dmRequirements: dDm,
            messageTemplates: dMsg,
            policyDocuments: dPol,
          },
        }),
      })
      const j = (await res.json()) as { error?: string; slug?: string }
      if (!res.ok) throw new Error(j.error || 'Clone failed')
      setOpen(false)
      router.push(`/organizer/dancecard/${encodeURIComponent(j.slug!)}`)
      router.refresh()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Clone failed')
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hub-create-heading"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-10 flex max-h-[min(92vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-dc-border bg-dc-elevated shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-dc-border px-5 py-4">
          <div>
            <h2 id="hub-create-heading" className="font-serif text-xl text-dc-text">
              Create a new event
            </h2>
            <p className="mt-1 text-sm text-dc-muted">
              Fill in the basics. We open the event workspace when you save.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-dc-border px-2.5 py-1 text-sm text-dc-muted hover:text-dc-text"
            onClick={() => setOpen(false)}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <Panel variant="muted" className="!p-4">
            <div className="flex gap-1 rounded-xl border border-dc-border bg-dc-surface-muted p-1">
              <button
                type="button"
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                  mode === 'create' ? 'bg-dc-elevated text-dc-text shadow-sm' : 'text-dc-muted hover:text-dc-text',
                )}
                onClick={() => setMode('create')}
              >
                Blank event
              </button>
              <button
                type="button"
                className={cn(
                  'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition',
                  mode === 'clone' ? 'bg-dc-elevated text-dc-text shadow-sm' : 'text-dc-muted hover:text-dc-text',
                )}
                onClick={() => setMode('clone')}
              >
                Copy from last year
              </button>
            </div>

            {err ? <p className="mt-4 text-sm text-dc-danger">{err}</p> : null}

            {mode === 'create' ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  URL slug
                  <input
                    className={inputClass}
                    value={cSlug}
                    onChange={(e) => setCSlug(e.target.value)}
                    placeholder="my-con-2027"
                  />
                  <span className="mt-1 block text-xs text-dc-muted">Used in /dancecard/your-slug</span>
                </label>
                <label className={labelClass}>
                  {ORGANIZER_PUBLISHED_AS_LABEL}
                  <input className={inputClass} value={cProduct} onChange={(e) => setCProduct(e.target.value)} />
                  <span className="mt-1 block text-xs text-dc-muted">{ORGANIZER_PUBLISHED_AS_HINT}</span>
                </label>
                <label className={cn(labelClass, 'sm:col-span-2')}>
                  Event name
                  <input
                    className={inputClass}
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="My Convention 2027"
                  />
                </label>
                <label className={labelClass}>
                  Timezone
                  <input className={inputClass} value={cTz} onChange={(e) => setCTz(e.target.value)} />
                </label>
                <label className={labelClass}>
                  Starts
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={cStart}
                    onChange={(e) => setCStart(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Ends
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={cEnd}
                    onChange={(e) => setCEnd(e.target.value)}
                  />
                </label>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="button"
                    disabled={busy || !cSlug.trim() || !cTitle.trim()}
                    className="rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
                    onClick={() => void submitCreate()}
                  >
                    {busy ? 'Creating…' : 'Create and open'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Copy from (slug)
                  <input
                    className={inputClass}
                    value={srcSlug}
                    onChange={(e) => setSrcSlug(e.target.value)}
                    placeholder="paf26"
                  />
                </label>
                <label className={labelClass}>
                  New slug
                  <input
                    className={inputClass}
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="paf27"
                  />
                </label>
                <label className={cn(labelClass, 'sm:col-span-2')}>
                  New event name
                  <input className={inputClass} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </label>
                <label className={labelClass}>
                  Anchor on source
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={anchorSrc}
                    onChange={(e) => setAnchorSrc(e.target.value)}
                  />
                </label>
                <label className={labelClass}>
                  Same moment on new event
                  <input
                    type="datetime-local"
                    className={inputClass}
                    value={anchorTgt}
                    onChange={(e) => setAnchorTgt(e.target.value)}
                  />
                </label>
                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-medium text-dc-text">Include in copy</legend>
                  <div className="mt-2 grid gap-2 text-sm text-dc-muted sm:grid-cols-2">
                    {[
                      [dSettings, setDSettings, 'Settings & registration form'],
                      [dLoc, setDLoc, 'Locations & maps'],
                      [dTracks, setDTracks, 'Tracks & tags'],
                      [dProgram, setDProgram, 'Program sessions'],
                      [dStaff, setDStaff, 'Staff shifts'],
                      [dDm, setDDm, 'DM requirements'],
                      [dMsg, setDMsg, 'Message templates'],
                      [dPol, setDPol, 'Policy documents'],
                    ].map(([checked, setChecked, text]) => (
                      <label key={String(text)} className="flex cursor-pointer gap-2">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={checked as boolean}
                          onChange={(e) => (setChecked as (v: boolean) => void)(e.target.checked)}
                        />
                        {text as string}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex flex-wrap gap-3 sm:col-span-2">
                  <button
                    type="button"
                    disabled={busy || !srcSlug.trim() || !newSlug.trim()}
                    className="rounded-xl bg-dc-accent px-5 py-2.5 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover disabled:opacity-50"
                    onClick={() => void submitClone()}
                  >
                    {busy ? 'Copying…' : 'Copy and open'}
                  </button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
