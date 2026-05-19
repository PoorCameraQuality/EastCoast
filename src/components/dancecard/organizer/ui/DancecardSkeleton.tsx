'use client'

function Bone({ className }: { className?: string }) {
  return <div className={`dc-skeleton-bone animate-pulse rounded-lg motion-reduce:animate-none ${className ?? ''}`} />
}

export function DancecardPanelSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-dc-border bg-dc-elevated-muted p-5">
      <Bone className="h-4 w-32" />
      <Bone className="h-8 w-2/3 max-w-xs" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} className="h-3 w-full" />
      ))}
    </div>
  )
}

export function DancecardGridSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Bone className="mb-3 h-8 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Bone key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function DancecardNavSkeleton() {
  return (
    <div className="flex gap-2">
      <Bone className="h-9 w-24" />
      <Bone className="h-9 w-20" />
      <Bone className="h-9 w-28" />
    </div>
  )
}

export function DancecardAttendeeShellSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
      <DancecardNavSkeleton />
      <DancecardPanelSkeleton lines={6} />
      <DancecardGridSkeleton rows={4} />
    </div>
  )
}
