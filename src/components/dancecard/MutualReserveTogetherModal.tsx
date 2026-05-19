'use client'

type ReserveBanner = null | { kind: 'success' } | { kind: 'error'; message: string }

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
  'dc-btn-primary rounded-2xl bg-gradient-to-br from-dc-accent-hover via-dc-accent to-dc-accent px-4 py-3 text-sm font-semibold text-dc-accent-foreground shadow-[0_18px_50px_rgba(198,167,94,0.28)] transition hover:brightness-105 disabled:opacity-50'

export function MutualReserveTogetherModal(props: {
  open: boolean
  onDismiss: () => void
  hostDisplayName: string
  reserveMutualStart: string
  setReserveMutualStart: (v: string) => void
  reserveMutualEnd: string
  setReserveMutualEnd: (v: string) => void
  reserveMutualNote: string
  setReserveMutualNote: (v: string) => void
  reserveMutualBanner: ReserveBanner
  setReserveMutualBanner: (v: ReserveBanner) => void
  reserveMutualPreview: boolean | null
  setReserveMutualPreview: (v: boolean | null) => void
  reserveMutualBusy: boolean
  runMutualReservePreview: () => void | Promise<void>
  submitMutualReserve: () => void | Promise<void>
  openMutualReserveInGoogleCalendar: () => void
  copyMutualReservationSummary: () => void | Promise<void>
  onSuccessGoReservations?: () => void
  onSuccessStayOnCompare?: () => void
  stayAfterSuccessLabel?: string
}) {
  const {
    open,
    onDismiss,
    hostDisplayName,
    reserveMutualStart,
    setReserveMutualStart,
    reserveMutualEnd,
    setReserveMutualEnd,
    reserveMutualNote,
    setReserveMutualNote,
    reserveMutualBanner,
    setReserveMutualBanner,
    reserveMutualPreview,
    setReserveMutualPreview,
    reserveMutualBusy,
    runMutualReservePreview,
    submitMutualReserve,
    openMutualReserveInGoogleCalendar,
    copyMutualReservationSummary,
    onSuccessGoReservations,
    onSuccessStayOnCompare,
    stayAfterSuccessLabel = 'Stay on Compare',
  } = props

  if (!open) return null

  function dismiss() {
    onDismiss()
    setReserveMutualPreview(null)
    setReserveMutualBanner(null)
  }

  return (
    <div
      className={overlayClass}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mutual-reserve-title"
      onClick={dismiss}
    >
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-dc-accent">Mutual time</p>
            <h3 id="mutual-reserve-title" className="mt-2 font-serif text-2xl text-dc-text sm:text-3xl">
              Reserve together
            </h3>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-dc-border bg-dc-elevated-muted/60 px-3 py-1 text-sm text-dc-muted transition hover:border-dc-accent-border hover:text-dc-text"
            onClick={dismiss}
          >
            Close
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-dc-muted">
          With <span className="font-medium text-dc-text">{hostDisplayName}</span>. Times use your browser’s local
          fields; stored in UTC. Extend the window if you need more than 30 minutes.
        </p>

        {reserveMutualBanner?.kind === 'success' ? (
          <div className="mt-5 rounded-2xl border border-dc-accent-border bg-dc-accent-muted/50 p-4">
            <p className="font-serif text-xl font-semibold text-dc-text">Reservation sent</p>
            <p className="mt-2 text-sm leading-relaxed text-dc-muted">
              It is on both dancecards.
              {onSuccessGoReservations
                ? ' Open the Reservations tab anytime to see it together with other holds.'
                : ' You can close this window — your dancecard is updated.'}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-dc-subtle">
              Add it to your calendar (.ics includes 15-minute reminders for saved program sessions when enabled in Profile) or paste a summary into Signal or Discord — the web app does not send push
              reminders for you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={ghostBtnClass} onClick={() => openMutualReserveInGoogleCalendar()}>
                Add to Google Calendar
              </button>
              <button type="button" className={ghostBtnClass} onClick={() => void copyMutualReservationSummary()}>
                Copy text summary
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-dc-subtle">
              To download <span className="text-dc-text">.ics</span> for Apple Calendar or get{' '}
              <span className="text-dc-text">Google Calendar</span> import steps for your full dancecard, use{' '}
              <span className="text-dc-text">Share link / export</span> on your availability screen (after this window
              closes).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {onSuccessGoReservations ? (
                <button
                  type="button"
                  className={primaryBtnClass}
                  onClick={() => {
                    setReserveMutualBanner(null)
                    onSuccessGoReservations()
                  }}
                >
                  View reservations
                </button>
              ) : null}
              <button
                type="button"
                className={ghostBtnClass}
                onClick={() => {
                  setReserveMutualBanner(null)
                  if (onSuccessStayOnCompare) onSuccessStayOnCompare()
                  else dismiss()
                }}
              >
                {onSuccessGoReservations ? stayAfterSuccessLabel : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {reserveMutualBanner?.kind === 'error' ? (
              <div className="mt-4 rounded-2xl border border-dc-danger-border bg-dc-danger-muted p-4 text-sm text-dc-danger">
                {reserveMutualBanner.message}
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabelClass}>Start</label>
                <input
                  type="datetime-local"
                  className={fieldInputClass}
                  value={reserveMutualStart}
                  onChange={(e) => {
                    setReserveMutualStart(e.target.value)
                    setReserveMutualPreview(null)
                    setReserveMutualBanner(null)
                  }}
                />
              </div>
              <div>
                <label className={fieldLabelClass}>End</label>
                <input
                  type="datetime-local"
                  className={fieldInputClass}
                  value={reserveMutualEnd}
                  onChange={(e) => {
                    setReserveMutualEnd(e.target.value)
                    setReserveMutualPreview(null)
                    setReserveMutualBanner(null)
                  }}
                />
              </div>
            </div>
            <label className={`mt-4 ${fieldLabelClass}`}>Note (optional)</label>
            <input
              className={`${fieldInputClass} mt-2`}
              value={reserveMutualNote}
              maxLength={500}
              placeholder="Where to meet, scene type…"
              onChange={(e) => {
                setReserveMutualNote(e.target.value)
                setReserveMutualPreview(null)
                setReserveMutualBanner(null)
              }}
            />
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={reserveMutualBusy}
                className={`${ghostBtnClass} flex-1 sm:flex-none`}
                onClick={() => void runMutualReservePreview()}
              >
                Check slot
              </button>
              <button
                type="button"
                disabled={reserveMutualBusy}
                className={`${primaryBtnClass} flex-1 sm:flex-none`}
                onClick={() => void submitMutualReserve()}
              >
                {reserveMutualBusy ? 'Sending…' : 'Send reservation'}
              </button>
            </div>
            {reserveMutualPreview !== null ? (
              <p
                className={`mt-3 text-sm ${reserveMutualPreview ? 'text-dc-success' : 'text-dc-danger'}`}
              >
                {reserveMutualPreview
                  ? 'This window is still mutually free with your current availability.'
                  : 'Not mutually free with your current availability — adjust times or unavailable entries.'}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
