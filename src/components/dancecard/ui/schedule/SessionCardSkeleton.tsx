export function SessionCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-dc-border bg-dc-elevated-muted/60 p-4 ${className}`.trim()}
      aria-hidden
    >
      <div className="h-3 w-16 rounded bg-dc-border" />
      <div className="mt-3 h-4 w-3/4 max-w-[12rem] rounded bg-dc-border" />
      <div className="mt-2 h-3 w-24 rounded bg-dc-border/80" />
    </div>
  )
}
