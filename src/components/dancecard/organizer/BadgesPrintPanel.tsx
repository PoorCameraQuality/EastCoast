'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchAllOrganizerRegistrants, organizerDancecardFetch } from '@/components/dancecard/organizer/organizerApi'

type Reg = {
  id: string
  sceneDisplayName: string
  pronouns: string | null
  categoryName: string | null
  status: string
}

export function BadgesPrintPanel({ eventSlug, readOnly }: { eventSlug: string; readOnly: boolean }) {
  const [eventTitle, setEventTitle] = useState('')
  const [layout, setLayout] = useState<Record<string, unknown>>({})
  const [regs, setRegs] = useState<Reg[]>([])
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setErr(null)
    try {
      const ev = await organizerDancecardFetch<{ event: { eventTitle: string; badgeLayoutJson?: Record<string, unknown> } }>(
        eventSlug,
        '/event',
      )
      setEventTitle(ev.event.eventTitle)
      setLayout((ev.event.badgeLayoutJson as Record<string, unknown>) ?? {})
      const regs = await fetchAllOrganizerRegistrants<Reg>(eventSlug, { status: 'checked_in' })
      setRegs(regs)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load')
    }
  }, [eventSlug])

  useEffect(() => {
    void load()
  }, [load])

  const stripe = String(layout.roleStripeField ?? 'categoryName')
  const subtitle = String(layout.subtitle ?? 'Checked in')

  async function saveLayout(patch: Record<string, unknown>) {
    if (readOnly) return
    const next = { ...layout, ...patch }
    setLayout(next)
    try {
      await organizerDancecardFetch(eventSlug, '/event', {
        method: 'PATCH',
        body: JSON.stringify({ badgeLayoutJson: next }),
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not save layout')
    }
  }

  return (
    <div className="space-y-4">
      {err ? <p className="text-sm text-rose-300">{err}</p> : null}
      <div className="space-y-2 text-sm text-slate-400">
        <p>
          Print checked-in badges from a simple layout editor. For custom art, many events use open-source badge tools
          such as{' '}
          <a
            href="https://github.com/topics/badge-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dc-accent hover:underline"
          >
            community badge generators
          </a>{' '}
          to design layouts, then export for label printers.
        </p>
        <p className="text-xs text-slate-500">
          Direct label-printer integration is not wired up yet; use Print / Save as PDF here, or export your roster and
          print through your preferred badge app.
        </p>
      </div>
      {!readOnly ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Stripe field
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white"
              value={stripe}
              onChange={(e) => void saveLayout({ roleStripeField: e.target.value })}
            >
              <option value="categoryName">categoryName</option>
              <option value="pronouns">pronouns</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Subtitle
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-white"
              value={subtitle}
              onChange={(e) => void saveLayout({ subtitle: e.target.value })}
            />
          </label>
        </div>
      ) : null}
      <div className="rounded-xl border border-dashed border-white/20 p-4">
        <p className="text-[10px] uppercase text-violet-300">{subtitle}</p>
        <p className="font-serif text-xl text-white">Sample Name</p>
        <p className="text-xs text-slate-400">Preview card</p>
      </div>
      {readOnly ? (
        <p className="text-xs text-amber-200/90">Read-only: you can still print the roster.</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
          onClick={() => void load()}
        >
          Refresh
        </button>
        <button
          type="button"
          className="rounded-full bg-dc-accent px-4 py-2 text-sm font-semibold text-dc-accent-foreground hover:bg-dc-accent-hover"
          onClick={() => window.print()}
        >
          Print / Save as PDF
        </button>
      </div>

      <div id="dc-badge-print-root" className="print:block">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #dc-badge-print-root, #dc-badge-print-root * { visibility: visible; }
            #dc-badge-print-root { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
        <div className="mb-6 text-center print:mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{subtitle}</p>
          <h2 className="font-serif text-2xl text-white">{eventTitle}</h2>
          <p className="text-xs text-slate-500">{regs.length} badge(s)</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
          {regs.map((r) => {
            const stripeVal =
              stripe === 'categoryName'
                ? r.categoryName ?? '—'
                : stripe === 'pronouns'
                  ? r.pronouns ?? '—'
                  : (r as unknown as Record<string, string>)[stripe] ?? '—'
            return (
              <div
                key={r.id}
                className="flex h-36 flex-col justify-between rounded-xl border-2 border-white/20 bg-gradient-to-br from-slate-900 to-black p-4 text-left print:break-inside-avoid"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-violet-300">{stripeVal}</p>
                  <p className="mt-1 font-serif text-xl text-white">{r.sceneDisplayName}</p>
                  {r.pronouns ? <p className="text-xs text-slate-400">{r.pronouns}</p> : null}
                </div>
                <p className="text-[10px] text-slate-600">{r.id}</p>
              </div>
            )
          })}
        </div>
        {!regs.length ? <p className="py-8 text-center text-slate-500">No checked-in registrants yet.</p> : null}
      </div>
    </div>
  )
}
