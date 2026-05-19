'use client'

import { useEffect, useState } from 'react'
import { dancecardFetch, formatDancecardApiMessage } from '@/components/dancecard/api-client'
import { formatRange, toDatetimeLocalValue } from '@/components/dancecard/time'

export type RescheduleReservationRow = {
  id: string
  status: string
  startsAt: string
  endsAt: string
  note?: string | null
  role: string
  host: { id: string; displayName: string }
  guest: { id: string; displayName: string }
}

function partnerAccountId(row: RescheduleReservationRow): string | null {
  const id = row.role === 'host' ? row.guest.id : row.host.id
  if (!id || id.startsWith('guest:')) return null
  return id
}

function partnerDisplayName(row: RescheduleReservationRow): string {
  return row.role === 'host' ? row.guest.displayName : row.host.displayName
}

const overlayClass =
  'fixed inset-0 z-[120] flex items-end justify-center bg-dc-surface/80 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:items-center sm:py-8'

const panelClass =
  'dc-panel w-full max-w-lg rounded-2xl border border-dc-border bg-dc-elevated/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:p-6'

const fieldLabelClass = 'mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-dc-muted'

const fieldInputClass =
  'dc-field-input dc-datetime-local-input w-full rounded-2xl border border-dc-border px-4 py-3 text-sm text-dc-text'

const ghostBtnClass =
  'rounded-2xl border border-dc-border bg-dc-elevated-muted/80 px-4 py-2.5 text-sm font-medium text-dc-accent-foreground transition hover:border-dc-accent-border hover:bg-dc-accent-muted/40 disabled:opacity-50'

const primaryBtnClass =
  'dc-btn-primary rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-2.5 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)] transition hover:brightness-105 disabled:opacity-50'

export function RescheduleReservationModal(props: {
  open: boolean
  slug: string
  tz: string
  row: RescheduleReservationRow | null
  onClose: () => void
  onSent?: () => void
}) {
  const { open, slug, tz, row, onClose, onSent } = props
  const [startLocal, setStartLocal] = useState('')
  const [endLocal, setEndLocal] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState<null | { kind: 'success' } | { kind: 'error'; message: string }>(null)

  useEffect(() => {
    if (!open || !row) return
    setStartLocal(toDatetimeLocalValue(new Date(row.startsAt)))
    setEndLocal(toDatetimeLocalValue(new Date(row.endsAt)))
    setNote('')
    setBanner(null)
    setBusy(false)
  }, [open, row])

  if (!open || !row) return null

  const recipientId = partnerAccountId(row)
  const partner = partnerDisplayName(row)

  async function submit() {
    const reservation = row
    if (!reservation) return
    if (!recipientId) {
      setBanner({
        kind: 'error',
        message: 'This reservation was claimed without a dancecard account — reschedule is not available.',
      })
      return
    }
    const sMs = new Date(startLocal).getTime()
    const eMs = new Date(endLocal).getTime()
    if (!Number.isFinite(sMs) || !Number.isFinite(eMs) || eMs <= sMs) {
      setBanner({ kind: 'error', message: 'End time must be after start time.' })
      return
    }
    setBusy(true)
    setBanner(null)
    try {
      await dancecardFetch(slug, '/reschedule-requests', {
        method: 'POST',
        body: JSON.stringify({
          recipientAccountId: recipientId,
          reservationId: reservation.id,
          proposedStartsAt: new Date(startLocal).toISOString(),
          proposedEndsAt: new Date(endLocal).toISOString(),
          note: note.trim() || undefined,
        }),
      })
      setBanner({ kind: 'success' })
      onSent?.()
    } catch (e) {
      setBanner({ kind: 'error', message: formatDancecardApiMessage(e) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={overlayClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
      onClick={onClose}
    >
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-dc-accent">Reschedule</p>
            <h3 id="reschedule-modal-title" className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">
              Propose new time
            </h3>
          </div>
          <button
            type="button"
            className={`${ghostBtnClass} shrink-0 rounded-full px-3 py-1`}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-dc-muted">
          Ask <span className="font-medium text-dc-text">{partner}</span> to move this scene. The existing reservation
          stays until they respond. Current time:{' '}
          <span className="text-dc-text">{formatRange(row.startsAt, row.endsAt, tz)}</span>.
        </p>

        {banner?.kind === 'success' ? (
          <div className="mt-5 rounded-2xl border border-dc-accent-border bg-dc-accent-muted/50 p-4">
            <p className="font-serif text-xl font-semibold text-dc-text">Reschedule request sent</p>
            <p className="mt-2 text-sm text-dc-muted">{partner} will see your proposed time in their dancecard.</p>
            <button type="button" className={`${primaryBtnClass} mt-4`} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            {banner?.kind === 'error' ? (
              <p className="mt-4 rounded-2xl border border-dc-danger-border bg-dc-danger-muted p-3 text-sm text-dc-danger">
                {banner.message}
              </p>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Proposed start</label>
                <input
                  type="datetime-local"
                  className={fieldInputClass}
                  value={startLocal}
                  onChange={(e) => {
                    setStartLocal(e.target.value)
                    setBanner(null)
                  }}
                />
              </div>
              <div>
                <label className={fieldLabelClass}>Proposed end</label>
                <input
                  type="datetime-local"
                  className={fieldInputClass}
                  value={endLocal}
                  onChange={(e) => {
                    setEndLocal(e.target.value)
                    setBanner(null)
                  }}
                />
              </div>
            </div>
            <label className={`mt-4 ${fieldLabelClass}`}>Message (optional)</label>
            <textarea
              className={`${fieldInputClass} mt-2`}
              rows={2}
              maxLength={1000}
              value={note}
              placeholder="Why the change, where to meet…"
              onChange={(e) => {
                setNote(e.target.value)
                setBanner(null)
              }}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !recipientId}
                className={primaryBtnClass}
                onClick={() => void submit()}
              >
                {busy ? 'Sending…' : 'Send reschedule request'}
              </button>
              <button
                type="button"
                className={ghostBtnClass}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
