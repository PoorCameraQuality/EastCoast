import { DancecardAttendeeShellSkeleton } from '@/components/dancecard/organizer/ui'

export default function DancecardEventLoading() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-dc-surface text-dc-text">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,167,94,0.12),transparent_36%)]" />
      <DancecardAttendeeShellSkeleton />
    </div>
  )
}
