import { TrustedRoleApplyClient } from '@/components/dancecard/attendee/TrustedRoleApplyClient'

export default function TrustedRoleApplyPage({
  params,
}: {
  params: { eventSlug: string; applySlug: string }
}) {
  return (
    <main className="min-h-screen bg-dc-bg">
      <TrustedRoleApplyClient eventSlug={params.eventSlug} applySlug={params.applySlug} />
    </main>
  )
}
