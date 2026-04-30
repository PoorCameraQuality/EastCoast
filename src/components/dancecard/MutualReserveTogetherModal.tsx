'use client'

type ReserveBanner = null | { kind: 'success' } | { kind: 'error'; message: string }

const glassModalClass =
  'rounded-2xl border border-stone-700/50 bg-[#0c1424]/96 shadow-[0_16px_48px_rgba(2,6,23,0.38)] backdrop-blur-sm transition-[box-shadow,border-color] duration-200 motion-reduce:transition-none'

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
  /** Classic layout: go to Reservations tab after a successful send. */
  onSuccessGoReservations?: () => void
  /** Classic layout: dismiss success and return to Compare tab. */
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

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-md sm:items-center">
      <div className={`w-full max-w-lg p-4 sm:p-6 ${glassModalClass}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/90">Mutual time</p>
            <h3 className="mt-2 font-serif text-2xl text-white sm:text-3xl">Reserve together</h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300"
            onClick={() => {
              onDismiss()
              setReserveMutualPreview(null)
              setReserveMutualBanner(null)
            }}
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          With <span className="text-white">{hostDisplayName}</span>. Times use your browser’s local fields; stored in UTC.
          Extend the window if you need more than 30 minutes.
        </p>
        {reserveMutualBanner?.kind === 'success' ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/45 p-4 text-emerald-50">
            <p className="font-serif text-xl font-semibold text-white">Reservation sent</p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/95">
              It is on both dancecards.
              {onSuccessGoReservations
                ? ' Open the Reservations tab anytime to see it together with other holds.'
                : ' You can close this window — your dancecard is updated.'}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-emerald-100/80">
              Add it to your calendar or paste a plain-text summary into Signal or Discord — web apps cannot send push
              reminders for you.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-2xl border border-sky-400/40 bg-sky-500/20 px-4 py-2.5 text-sm font-semibold text-sky-50 transition hover:bg-sky-500/30"
                onClick={() => openMutualReserveInGoogleCalendar()}
              >
                Add to Google Calendar
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/20 bg-white/[0.08] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
                onClick={() => void copyMutualReservationSummary()}
              >
                Copy text summary
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-emerald-100/75">
              To download <span className="text-white/95">.ics</span> for Apple Calendar or get{' '}
              <span className="text-white/95">Google Calendar</span> import steps for your full dancecard, use{' '}
              <span className="text-white/95">Share link / export</span> on your availability screen (after this window
              closes).
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {onSuccessGoReservations ? (
                <button
                  type="button"
                  className="rounded-2xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
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
                className="rounded-2xl border border-white/15 px-4 py-2.5 text-sm text-white transition hover:bg-white/10"
                onClick={() => {
                  setReserveMutualBanner(null)
                  if (onSuccessStayOnCompare) onSuccessStayOnCompare()
                  else onDismiss()
                }}
              >
                {onSuccessGoReservations ? stayAfterSuccessLabel : 'Done'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {reserveMutualBanner?.kind === 'error' ? (
              <div className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-sm text-rose-100">
                {reserveMutualBanner.message}
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">Start</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                  value={reserveMutualStart}
                  onChange={(e) => {
                    setReserveMutualStart(e.target.value)
                    setReserveMutualPreview(null)
                    setReserveMutualBanner(null)
                  }}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-slate-400">End</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
                  value={reserveMutualEnd}
                  onChange={(e) => {
                    setReserveMutualEnd(e.target.value)
                    setReserveMutualPreview(null)
                    setReserveMutualBanner(null)
                  }}
                />
              </div>
            </div>
            <label className="mt-4 block text-xs uppercase tracking-[0.25em] text-slate-400">Note (optional)</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white"
              value={reserveMutualNote}
              maxLength={500}
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
                className="flex-1 rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white transition hover:bg-white/10 disabled:opacity-50 sm:flex-none"
                onClick={() => void runMutualReservePreview()}
              >
                Check slot
              </button>
              <button
                type="button"
                disabled={reserveMutualBusy}
                className="flex-1 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50 sm:flex-none"
                onClick={() => void submitMutualReserve()}
              >
                Send reservation
              </button>
            </div>
            {reserveMutualPreview !== null ? (
              <p className={`mt-3 text-sm ${reserveMutualPreview ? 'text-emerald-300' : 'text-rose-300'}`}>
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
