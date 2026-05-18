'use client'

export function InlineSuccessBanner({
  message,
  onDismiss,
}: {
  message: string
  onDismiss?: () => void
}) {
  return (
    <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-50">
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        {onDismiss ? (
          <button type="button" className="shrink-0 text-xs text-emerald-200/80 hover:text-white" onClick={onDismiss}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  )
}
