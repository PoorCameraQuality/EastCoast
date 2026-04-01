export default function Loading() {
  return (
    <div
      className="min-h-[40vh] flex flex-col items-center justify-center gap-4 bg-brand-void px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 rounded-full border-2 border-primary-500/30 border-t-primary-400 animate-spin"
        aria-hidden
      />
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  )
}
